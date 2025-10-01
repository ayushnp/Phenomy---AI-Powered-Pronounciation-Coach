import torch
import torchaudio
import numpy as np
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import warnings
import difflib
import re
from typing import List, Dict, Tuple
import json
import os
from datetime import datetime
import logging

# Suppress all warnings including transformers warnings
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)
os.environ["TRANSFORMERS_VERBOSITY"] = "error"


class MultiDomainPronunciationTrainer:
    """
    Multi-Domain Advanced pronunciation trainer with word-level analysis and JSON output
    Supports Social, Sports, Environment, and Politics domains with 4 paragraphs each
    """

    def __init__(self):
        self.processor = None
        self.model = None
        self.is_trained = False
        self.domains = self._initialize_domains()
        self.phonetic_dict = self._load_comprehensive_phonetic_dictionary()

    def _initialize_domains(self):
        """Initialize all domains with their practice paragraphs"""
        return {
            "SOCIAL": {
                "name": "Social Communication",
                "paragraphs": {
                    1: {
                        "title": "Making Friends",
                        "text": "MAKING NEW FRIENDS AS AN ADULT CAN BE CHALLENGING BUT REWARDING JOINING CLUBS AND ATTENDING SOCIAL EVENTS CREATES OPPORTUNITIES TO MEET LIKE MINDED PEOPLE BEING GENUINELY INTERESTED IN OTHERS AND SHOWING KINDNESS HELPS BUILD LASTING FRIENDSHIPS"
                    },
                    2: {
                        "title": "Family Relationships",
                        "text": "STRONG FAMILY BONDS ARE BUILT THROUGH OPEN COMMUNICATION AND MUTUAL RESPECT SPENDING QUALITY TIME TOGETHER SHARING MEALS AND CREATING TRADITIONS STRENGTHENS FAMILY CONNECTIONS LISTENING ACTIVELY AND SHOWING EMPATHY HELPS RESOLVE CONFLICTS PEACEFULLY"
                    },
                    3: {
                        "title": "Workplace Interactions",
                        "text": "EFFECTIVE WORKPLACE COMMUNICATION INVOLVES CLEAR EXPRESSION OF IDEAS AND ACTIVE LISTENING BUILDING PROFESSIONAL RELATIONSHIPS REQUIRES RESPECT COLLABORATION AND UNDERSTANDING DIFFERENT PERSPECTIVES CONSTRUCTIVE FEEDBACK AND TEAMWORK LEAD TO SUCCESS"
                    },
                    4: {
                        "title": "Community Engagement",
                        "text": "ACTIVE COMMUNITY PARTICIPATION CREATES POSITIVE SOCIAL CHANGE VOLUNTEERING FOR LOCAL CAUSES AND ATTENDING NEIGHBORHOOD MEETINGS BUILDS STRONGER COMMUNITIES SUPPORTING LOCAL BUSINESSES AND HELPING NEIGHBORS FOSTERS CIVIC PRIDE AND CONNECTION"
                    }
                }
            },
            "SPORTS": {
                "name": "Sports and Athletics",
                "paragraphs": {
                    1: {
                        "title": "Basketball Fundamentals",
                        "text": "BASKETBALL REQUIRES EXCELLENT HAND EYE COORDINATION AND QUICK DECISION MAKING DRIBBLING SHOOTING AND PASSING ARE FUNDAMENTAL SKILLS THAT NEED CONSTANT PRACTICE TEAMWORK AND COMMUNICATION ON THE COURT LEAD TO VICTORY AND PERSONAL IMPROVEMENT"
                    },
                    2: {
                        "title": "Soccer Training",
                        "text": "SOCCER PLAYERS DEVELOP STAMINA THROUGH CONTINUOUS RUNNING AND BALL CONTROL EXERCISES MASTERING KICKS HEADERS AND STRATEGIC POSITIONING REQUIRES DEDICATION AND REGULAR TRAINING SESSIONS TEAM COORDINATION AND UNDERSTANDING GAME TACTICS ARE ESSENTIAL FOR SUCCESS"
                    },
                    3: {
                        "title": "Swimming Excellence",
                        "text": "COMPETITIVE SWIMMING DEMANDS PERFECT TECHNIQUE AND STRONG CARDIOVASCULAR ENDURANCE FREESTYLE BACKSTROKE BREASTSTROKE AND BUTTERFLY STROKES EACH REQUIRE SPECIFIC TRAINING METHODS CONSISTENT PRACTICE AND PROPER BREATHING TECHNIQUES IMPROVE PERFORMANCE AND SPEED"
                    },
                    4: {
                        "title": "Tennis Mastery",
                        "text": "TENNIS COMBINES PHYSICAL FITNESS WITH MENTAL STRATEGY AND PRECISE SHOT PLACEMENT FOREHAND BACKHAND AND SERVE TECHNIQUES MUST BE PRACTICED REPEATEDLY FOR IMPROVEMENT READING OPPONENT MOVEMENTS AND ADAPTING PLAYING STYLE CREATES COMPETITIVE ADVANTAGE"
                    }
                }
            },
            "ENVIRONMENT": {
                "name": "Environmental Awareness",
                "paragraphs": {
                    1: {
                        "title": "Climate Change Impact",
                        "text": "CLIMATE CHANGE AFFECTS WEATHER PATTERNS OCEAN LEVELS AND BIODIVERSITY WORLDWIDE REDUCING CARBON EMISSIONS THROUGH RENEWABLE ENERGY AND SUSTAINABLE PRACTICES IS CRUCIAL INDIVIDUAL ACTIONS LIKE RECYCLING AND CONSERVATION CONTRIBUTE TO GLOBAL ENVIRONMENTAL PROTECTION"
                    },
                    2: {
                        "title": "Renewable Energy",
                        "text": "SOLAR WIND AND HYDROELECTRIC POWER OFFER CLEAN ALTERNATIVES TO FOSSIL FUELS INVESTING IN RENEWABLE ENERGY TECHNOLOGY CREATES JOBS AND REDUCES POLLUTION GOVERNMENTS AND BUSINESSES MUST COLLABORATE TO ACCELERATE THE TRANSITION TO SUSTAINABLE ENERGY SOURCES"
                    },
                    3: {
                        "title": "Wildlife Conservation",
                        "text": "PROTECTING ENDANGERED SPECIES REQUIRES HABITAT PRESERVATION AND STRICT ANTI POACHING MEASURES NATIONAL PARKS AND WILDLIFE RESERVES PROVIDE SAFE SPACES FOR ANIMALS TO THRIVE EDUCATION AND AWARENESS PROGRAMS HELP COMMUNITIES UNDERSTAND CONSERVATION IMPORTANCE"
                    },
                    4: {
                        "title": "Ocean Pollution",
                        "text": "PLASTIC WASTE IN OCEANS THREATENS MARINE LIFE AND DISRUPTS FOOD CHAINS GLOBALLY REDUCING SINGLE USE PLASTICS AND IMPROVING WASTE MANAGEMENT SYSTEMS ARE ESSENTIAL STEPS BEACH CLEANUPS AND RECYCLING PROGRAMS HELP RESTORE OCEAN HEALTH AND BIODIVERSITY"
                    }
                }
            },
            "POLITICS": {
                "name": "Political Awareness",
                "paragraphs": {
                    1: {
                        "title": "Democratic Participation",
                        "text": "ACTIVE CITIZENSHIP INVOLVES VOTING IN ELECTIONS AND STAYING INFORMED ABOUT POLITICAL ISSUES PARTICIPATING IN TOWN HALLS AND CONTACTING REPRESENTATIVES ENSURES COMMUNITY VOICES ARE HEARD DEMOCRACY THRIVES WHEN CITIZENS ENGAGE IN PEACEFUL POLITICAL DISCOURSE"
                    },
                    2: {
                        "title": "Government Structure",
                        "text": "UNDERSTANDING GOVERNMENT BRANCHES AND THEIR FUNCTIONS HELPS CITIZENS MAKE INFORMED DECISIONS THE EXECUTIVE LEGISLATIVE AND JUDICIAL BRANCHES PROVIDE CHECKS AND BALANCES IN DEMOCRATIC SYSTEMS CONSTITUTIONAL RIGHTS PROTECT INDIVIDUAL FREEDOMS AND ENSURE EQUAL TREATMENT"
                    },
                    3: {
                        "title": "Policy Making",
                        "text": "EFFECTIVE POLICIES ADDRESS SOCIAL ECONOMIC AND ENVIRONMENTAL CHALLENGES THROUGH RESEARCH AND ANALYSIS LAWMAKERS CONSIDER MULTIPLE PERSPECTIVES BEFORE DRAFTING LEGISLATION PUBLIC INPUT AND EXPERT TESTIMONY HELP SHAPE POLICIES THAT BENEFIT SOCIETY"
                    },
                    4: {
                        "title": "International Relations",
                        "text": "DIPLOMATIC RELATIONSHIPS BETWEEN NATIONS REQUIRE MUTUAL RESPECT AND PEACEFUL NEGOTIATION TRADE AGREEMENTS AND CULTURAL EXCHANGES PROMOTE INTERNATIONAL COOPERATION AND UNDERSTANDING RESOLVING CONFLICTS THROUGH DIALOGUE PREVENTS WAR AND PROMOTES GLOBAL STABILITY"
                    }
                }
            }
        }

    def _load_comprehensive_phonetic_dictionary(self):
        """Load comprehensive phonetic dictionary for all domains"""
        return {
            # Social Domain Words
            "MAKING": "/ˈmeɪkɪŋ/", "NEW": "/nu/", "FRIENDS": "/frɛndz/", "ADULT": "/əˈdʌlt/",
            "CHALLENGING": "/ˈʧælɪnʤɪŋ/", "REWARDING": "/rɪˈwɔrdɪŋ/", "JOINING": "/ˈʤɔɪnɪŋ/",
            "CLUBS": "/klʌbz/", "ATTENDING": "/əˈtɛndɪŋ/", "SOCIAL": "/ˈsoʊʃəl/",
            "EVENTS": "/ɪˈvɛnts/", "CREATES": "/kriˈeɪts/", "OPPORTUNITIES": "/ˌɑpərˈtunətiz/",
            "MEET": "/mit/", "LIKE": "/laɪk/", "MINDED": "/ˈmaɪndɪd/", "PEOPLE": "/ˈpipəl/",
            "BEING": "/ˈbiɪŋ/", "GENUINELY": "/ˈʤɛnjuənli/", "INTERESTED": "/ˈɪntrəstəd/",
            "OTHERS": "/ˈʌðərz/", "SHOWING": "/ˈʃoʊɪŋ/", "KINDNESS": "/ˈkaɪndnəs/",
            "HELPS": "/hɛlps/", "BUILD": "/bɪld/", "LASTING": "/ˈlæstɪŋ/",
            "FRIENDSHIPS": "/ˈfrɛndʃɪps/", "STRONG": "/strɔŋ/", "FAMILY": "/ˈfæməli/",
            "BONDS": "/bɑndz/", "BUILT": "/bɪlt/", "THROUGH": "/θru/", "OPEN": "/ˈoʊpən/",
            "COMMUNICATION": "/kəˌmjunəˈkeɪʃən/", "MUTUAL": "/ˈmjuʧuəl/",
            "RESPECT": "/rɪˈspɛkt/", "SPENDING": "/ˈspɛndɪŋ/", "QUALITY": "/ˈkwɑləti/",
            "TIME": "/taɪm/", "TOGETHER": "/təˈgɛðər/", "SHARING": "/ˈʃɛrɪŋ/",
            "MEALS": "/milz/", "CREATING": "/kriˈeɪtɪŋ/", "TRADITIONS": "/trəˈdɪʃənz/",
            "STRENGTHENS": "/ˈstrɛŋθənz/", "CONNECTIONS": "/kəˈnɛkʃənz/",
            "LISTENING": "/ˈlɪsənɪŋ/", "ACTIVELY": "/ˈæktɪvli/", "EMPATHY": "/ˈɛmpəθi/",
            "RESOLVE": "/rɪˈzɑlv/", "CONFLICTS": "/ˈkɑnflɪkts/", "PEACEFULLY": "/ˈpisfəli/",

            # Sports Domain Words
            "BASKETBALL": "/ˈbæskətbɔl/", "REQUIRES": "/rɪˈkwaɪərz/", "EXCELLENT": "/ˈɛksələnt/",
            "HAND": "/hænd/", "EYE": "/aɪ/", "COORDINATION": "/koʊˌɔrdənˈeɪʃən/",
            "QUICK": "/kwɪk/", "DECISION": "/dɪˈsɪʒən/", "MAKING": "/ˈmeɪkɪŋ/",
            "DRIBBLING": "/ˈdrɪbəlɪŋ/", "SHOOTING": "/ˈʃutɪŋ/", "PASSING": "/ˈpæsɪŋ/",
            "FUNDAMENTAL": "/ˌfʌndəˈmɛntəl/", "SKILLS": "/skɪlz/", "NEED": "/nid/",
            "CONSTANT": "/ˈkɑnstənt/", "PRACTICE": "/ˈpræktəs/", "TEAMWORK": "/ˈtimwɜrk/",
            "COURT": "/kɔrt/", "LEAD": "/lid/", "VICTORY": "/ˈvɪktəri/",
            "PERSONAL": "/ˈpɜrsənəl/", "IMPROVEMENT": "/ɪmˈpruvmənt/",
            "SOCCER": "/ˈsɑkər/", "PLAYERS": "/ˈpleɪərz/", "DEVELOP": "/dɪˈvɛləp/",
            "STAMINA": "/ˈstæmənə/", "CONTINUOUS": "/kənˈtɪnjuəs/", "RUNNING": "/ˈrʌnɪŋ/",
            "BALL": "/bɔl/", "CONTROL": "/kənˈtroʊl/", "EXERCISES": "/ˈɛksərˌsaɪzəz/",

            # Environment Domain Words
            "CLIMATE": "/ˈklaɪmət/", "CHANGE": "/ʧeɪnʤ/", "AFFECTS": "/əˈfɛkts/",
            "WEATHER": "/ˈwɛðər/", "PATTERNS": "/ˈpætərnz/", "OCEAN": "/ˈoʊʃən/",
            "LEVELS": "/ˈlɛvəlz/", "BIODIVERSITY": "/ˌbaɪoʊdaɪˈvɜrsəti/",
            "WORLDWIDE": "/ˈwɜrldˌwaɪd/", "REDUCING": "/rɪˈdusɪŋ/", "CARBON": "/ˈkɑrbən/",
            "EMISSIONS": "/ɪˈmɪʃənz/", "RENEWABLE": "/rɪˈnuəbəl/", "ENERGY": "/ˈɛnərʤi/",
            "SUSTAINABLE": "/səˈsteɪnəbəl/", "PRACTICES": "/ˈpræktəsəz/",
            "CRUCIAL": "/ˈkruʃəl/", "INDIVIDUAL": "/ˌɪndəˈvɪʤuəl/", "ACTIONS": "/ˈækʃənz/",
            "RECYCLING": "/riˈsaɪkəlɪŋ/", "CONSERVATION": "/ˌkɑnsərˈveɪʃən/",
            "CONTRIBUTE": "/kənˈtrɪbjut/", "GLOBAL": "/ˈgloʊbəl/", "ENVIRONMENTAL": "/ɪnˌvaɪrənˈmɛntəl/",
            "PROTECTION": "/prəˈtɛkʃən/", "SOLAR": "/ˈsoʊlər/", "WIND": "/wɪnd/",
            "HYDROELECTRIC": "/ˌhaɪdroʊɪˈlɛktrɪk/", "POWER": "/ˈpaʊər/",

            # Politics Domain Words
            "ACTIVE": "/ˈæktɪv/", "CITIZENSHIP": "/ˈsɪtəzənˌʃɪp/", "INVOLVES": "/ɪnˈvɑlvz/",
            "VOTING": "/ˈvoʊtɪŋ/", "ELECTIONS": "/ɪˈlɛkʃənz/", "STAYING": "/ˈsteɪɪŋ/",
            "INFORMED": "/ɪnˈfɔrmd/", "ABOUT": "/əˈbaʊt/", "POLITICAL": "/pəˈlɪtəkəl/",
            "ISSUES": "/ˈɪʃuz/", "PARTICIPATING": "/pɑrˈtɪsəˌpeɪtɪŋ/", "TOWN": "/taʊn/",
            "HALLS": "/hɔlz/", "CONTACTING": "/ˈkɑnˌtæktɪŋ/", "REPRESENTATIVES": "/ˌrɛprɪˈzɛntətɪvz/",
            "ENSURES": "/ɪnˈʃʊrz/", "COMMUNITY": "/kəˈmjunəti/", "VOICES": "/ˈvɔɪsəz/",
            "HEARD": "/hɜrd/", "DEMOCRACY": "/dɪˈmɑkrəsi/", "THRIVES": "/θraɪvz/",
            "CITIZENS": "/ˈsɪtəzənz/", "ENGAGE": "/ɪnˈgeɪʤ/", "PEACEFUL": "/ˈpisfəl/",
            "DISCOURSE": "/ˈdɪskɔrs/", "GOVERNMENT": "/ˈgʌvərmənt/",
            "UNDERSTANDING": "/ˌʌndərˈstændɪŋ/", "BRANCHES": "/ˈbræntʃəz/",

            # Common words
            "THE": "/ðə/ or /ði/", "AND": "/ænd/", "TO": "/tu/", "OF": "/ʌv/",
            "A": "/ə/ or /eɪ/", "IN": "/ɪn/", "IS": "/ɪz/", "FOR": "/fɔr/",
            "WITH": "/wɪθ/", "ARE": "/ɑr/", "AS": "/æz/", "BE": "/bi/",
            "OR": "/ɔr/", "AN": "/æn/", "WILL": "/wɪl/", "CAN": "/kæn/"
        }

    def get_paragraph_text(self, domain, paragraph_number):
        """Get specific paragraph text"""
        domain = domain.upper()
        if domain not in self.domains:
            return None, f"Domain '{domain}' not found"

        if paragraph_number not in self.domains[domain]['paragraphs']:
            return None, f"Paragraph {paragraph_number} not found in {domain} domain"

        para_info = self.domains[domain]['paragraphs'][paragraph_number]
        return para_info['text'], para_info['title']

    def load_and_initialize_model(self):
        """Load and properly initialize the model without warnings"""
        print("🚀 Loading Multi-Domain Advanced Pronunciation Training System...")

        # Temporarily redirect stdout/stderr to suppress warnings
        import sys
        from contextlib import redirect_stderr, redirect_stdout
        from io import StringIO

        with redirect_stdout(StringIO()), redirect_stderr(StringIO()):
            # Load processor and model silently
            self.processor = Wav2Vec2Processor.from_pretrained("facebook/wav2Vec2-base-960h")
            self.model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2Vec2-base-960h")

        # Set model to evaluation mode
        self.model.eval()

        # Perform comprehensive initialization to eliminate all warnings
        self._comprehensive_model_initialization()

        self.is_trained = True
        print("✅ Advanced pronunciation model loaded and ready!")
        print("📚 Multi-domain phonetic dictionary loaded")

    def _comprehensive_model_initialization(self):
        """Comprehensive model initialization to eliminate all warnings"""
        print("🔧 Performing comprehensive model initialization...")

        # Multiple initialization passes with different input sizes
        initialization_inputs = [
            torch.randn(1, 8000),  # 0.5 seconds
            torch.randn(1, 16000),  # 1 second
            torch.randn(1, 32000),  # 2 seconds
        ]

        for i, dummy_input in enumerate(initialization_inputs):
            try:
                inputs = self.processor(
                    dummy_input.squeeze().numpy(),
                    sampling_rate=16000,
                    return_tensors="pt"
                )

                with torch.no_grad():
                    # Forward pass to initialize weights
                    logits = self.model(inputs.input_values).logits

                    # Additional operations to ensure full initialization
                    _ = torch.softmax(logits, dim=-1)
                    _ = torch.argmax(logits, dim=-1)

            except Exception:
                continue

        # Force initialize any remaining uninitialized parameters
        for name, param in self.model.named_parameters():
            if 'masked_spec_embed' in name and param.requires_grad:
                with torch.no_grad():
                    param.normal_(0, 0.1)

        print("✅ All model components fully initialized")
        print("✅ Model ready for inference without warnings")

    def analyze_pronunciation(self, audio_array, sample_rate, reference_text, domain, paragraph_number,
                              paragraph_title):
        """Comprehensive pronunciation analysis with word-level feedback for specific paragraph"""
        if not self.is_trained:
            raise RuntimeError("Model not loaded! Call load_and_initialize_model() first.")

        try:
            # Get basic transcription
            basic_result = self._get_basic_transcription(audio_array, sample_rate, reference_text)

            if not basic_result['success']:
                return basic_result

            # Perform word-level analysis
            word_analysis = self._analyze_word_level(reference_text, basic_result['predicted_text'])

            # Create comprehensive JSON result
            json_result = self._create_json_result(basic_result, word_analysis, reference_text,
                                                   domain, paragraph_number, paragraph_title)

            return json_result

        except Exception as e:
            return {"error": str(e), "success": False}

    # --- NEW METHOD ADDED HERE ---
    def analyze_from_audio_file(self, audio_file_path, domain, paragraph_number):
        """
        Processes an audio file from a path and returns the full analysis.
        This is the main entry point for the Flask API to use.
        """
        try:
            # Get the correct paragraph text and title for the analysis
            paragraph_text, paragraph_title = self.get_paragraph_text(domain, paragraph_number)
            if paragraph_text is None:
                # If paragraph/domain is invalid, paragraph_title will contain the error message
                return {"error": paragraph_title, "success": False}

            # Load the audio file using torchaudio
            waveform, sample_rate = torchaudio.load(audio_file_path)

            # --- Audio Preprocessing ---
            # 1. Convert to mono if it's stereo
            if waveform.shape[0] > 1:
                waveform = waveform.mean(dim=0, keepdim=True)

            # 2. Resample to 16000 Hz, which the model requires
            if sample_rate != 16000:
                resampler = torchaudio.transforms.Resample(sample_rate, 16000)
                waveform = resampler(waveform)
                sample_rate = 16000  # Update sample rate after resampling

            # Convert the audio tensor to a NumPy array for the model
            audio_array = waveform.squeeze().numpy()

            # Call the core analysis function
            result = self.analyze_pronunciation(audio_array, sample_rate, paragraph_text, domain, paragraph_number,
                                                paragraph_title)
            return result
        except Exception as e:
            return {"error": f"Could not process audio file: {str(e)}", "success": False}

    # --- END OF NEW METHOD ---

    def _get_basic_transcription(self, audio_array, sample_rate, reference_text):
        """Get basic transcription and scores"""
        inputs = self.processor(audio_array, sampling_rate=sample_rate, return_tensors="pt")

        with torch.no_grad():
            logits = self.model(inputs.input_values).logits
            predicted_ids = torch.argmax(logits, dim=-1)
            probs = torch.softmax(logits, dim=-1)
            confidences = torch.max(probs, dim=-1)[0]
            avg_confidence = confidences.mean().item()

        predicted_text = self.processor.decode(predicted_ids[0])
        similarity_score = self._calculate_similarity(reference_text, predicted_text)
        final_score = (similarity_score * 0.7 + avg_confidence * 100 * 0.3)

        return {
            "overall_score": round(final_score, 2),
            "predicted_text": predicted_text,
            "reference_text": reference_text,
            "similarity_score": round(similarity_score, 2),
            "confidence_score": round(avg_confidence * 100, 2),
            "success": True
        }

    def _analyze_word_level(self, reference_text, predicted_text):
        """Analyze pronunciation at word level"""
        ref_words = reference_text.upper().split()
        pred_words = predicted_text.upper().split() if predicted_text else []

        # Align words using sequence matching
        aligned_words = self._align_words(ref_words, pred_words)

        correctly_pronounced = []
        mispronounced_words = []

        for ref_word, pred_word, similarity in aligned_words:
            word_info = {
                "word": ref_word,
                "detected_as": pred_word if pred_word else "NOT_DETECTED",
                "similarity_score": round(similarity, 3),
                "phonetic_pronunciation": self.phonetic_dict.get(ref_word, "Not available"),
                "pronunciation_tip": self._get_pronunciation_tips(ref_word)
            }

            if pred_word is None:
                word_info["issue_type"] = "MISSING"
                word_info["issue_description"] = "Word not detected in speech"
                mispronounced_words.append(word_info)
            elif similarity > 0.7:  # Good pronunciation threshold
                word_info["issue_type"] = "CORRECT"
                word_info["issue_description"] = "Correctly pronounced"
                correctly_pronounced.append(word_info)
            else:
                word_info["issue_type"] = "MISPRONOUNCED" if similarity > 0.3 else "SEVERELY_MISPRONOUNCED"
                word_info[
                    "issue_description"] = "Pronunciation unclear" if similarity > 0.3 else "Significantly mispronounced"
                mispronounced_words.append(word_info)

        return {
            "total_words": len(ref_words),
            "correctly_pronounced": correctly_pronounced,
            "mispronounced_words": mispronounced_words,
            "word_accuracy_percentage": round((len(correctly_pronounced) / len(ref_words)) * 100, 2) if ref_words else 0
        }

    def _create_json_result(self, basic_result, word_analysis, reference_text, domain, paragraph_number,
                            paragraph_title):
        """Create comprehensive JSON result with domain information"""

        # Extract word lists for JSON
        correct_words = [word["word"] for word in word_analysis["correctly_pronounced"]]
        wrong_words = [word["word"] for word in word_analysis["mispronounced_words"]]

        # Create detailed word analysis
        detailed_word_analysis = {}
        for word_info in word_analysis["correctly_pronounced"] + word_analysis["mispronounced_words"]:
            detailed_word_analysis[word_info["word"]] = {
                "status": "correct" if word_info["issue_type"] == "CORRECT" else "incorrect",
                "detected_as": word_info["detected_as"],
                "similarity_score": word_info["similarity_score"],
                "issue_type": word_info["issue_type"],
                "issue_description": word_info["issue_description"],
                "phonetic_pronunciation": word_info["phonetic_pronunciation"],
                "pronunciation_tip": word_info["pronunciation_tip"]
            }

        # Create improvement suggestions
        improvement_suggestions = self._generate_improvement_suggestions(word_analysis)

        # Comprehensive JSON structure with domain information
        json_result = {
            "analysis_metadata": {
                "timestamp": datetime.now().isoformat(),
                "model_version": "Wav2Vec2-base-960h",
                "analysis_type": "multi_domain_pronunciation_analysis",
                "practice_session": {
                    "domain": domain,
                    "domain_name": self.domains[domain.upper()]['name'],
                    "paragraph_number": paragraph_number,
                    "paragraph_title": paragraph_title
                }
            },
            "overall_performance": {
                "overall_score": basic_result["overall_score"],
                "similarity_score": basic_result["similarity_score"],
                "confidence_score": basic_result["confidence_score"],
                "grade": self._get_performance_grade(basic_result["overall_score"])
            },
            "text_analysis": {
                "reference_text": basic_result["reference_text"],
                "predicted_text": basic_result["predicted_text"],
                "text_similarity_percentage": basic_result["similarity_score"]
            },
            "word_statistics": {
                "total_word_count": word_analysis["total_words"],
                "correct_word_count": len(correct_words),
                "wrong_word_count": len(wrong_words),
                "word_accuracy_percentage": word_analysis["word_accuracy_percentage"]
            },
            "word_lists": {
                "correct_words": correct_words,
                "wrong_words": wrong_words
            },
            "detailed_word_analysis": detailed_word_analysis,
            "pronunciation_guidance": {
                "words_needing_practice": [
                    {
                        "word": word_info["word"],
                        "phonetic": word_info["phonetic_pronunciation"],
                        "tip": word_info["pronunciation_tip"],
                        "current_issue": word_info["issue_description"]
                    }
                    for word_info in word_analysis["mispronounced_words"]
                ],
                "improvement_suggestions": improvement_suggestions,
                "domain_specific_tips": self._get_domain_specific_tips(domain, wrong_words)
            },
            "success": True
        }

        return json_result

    def _get_domain_specific_tips(self, domain, wrong_words):
        """Get domain-specific pronunciation tips"""
        domain_tips = {
            "SOCIAL": [
                "Practice social interaction vocabulary with emphasis on clear articulation",
                "Focus on emotional expression words - they require proper intonation",
                "Communication terms should be pronounced with confidence and clarity"
            ],
            "SPORTS": [
                "Athletic terminology often requires strong consonant pronunciation",
                "Action words should be spoken with energy and precision",
                "Sports terms may have specific stress patterns - practice rhythm"
            ],
            "ENVIRONMENT": [
                "Scientific terms require careful attention to syllable stress",
                "Environmental vocabulary often has Greek/Latin roots - break into parts",
                "Technical terms need precise pronunciation for professional communication"
            ],
            "POLITICS": [
                "Political terms require authoritative and clear pronunciation",
                "Formal vocabulary should be pronounced with proper emphasis",
                "Civic terms need to sound confident and well-articulated"
            ]
        }

        tips = domain_tips.get(domain.upper(), ["Practice pronunciation with focus on clarity and accuracy"])

        if wrong_words:
            tips.append(f"Focus on {len(wrong_words)} words that need improvement in {domain.lower()} context")

        return tips

    def _align_words(self, ref_words, pred_words):
        """Align reference and predicted words"""
        aligned = []

        # Use difflib for sequence matching
        matcher = difflib.SequenceMatcher(None, ref_words, pred_words)

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                # Words match
                for i in range(i2 - i1):
                    ref_word = ref_words[i1 + i]
                    pred_word = pred_words[j1 + i]
                    similarity = self._word_similarity(ref_word, pred_word)
                    aligned.append((ref_word, pred_word, similarity))
            elif tag == 'delete':
                # Words missing from prediction
                for i in range(i2 - i1):
                    aligned.append((ref_words[i1 + i], None, 0.0))
            elif tag == 'insert':
                # Extra words in prediction (ignore for now)
                pass
            elif tag == 'replace':
                # Words substituted
                for i in range(max(i2 - i1, j2 - j1)):
                    ref_idx = i1 + i if i1 + i < i2 else i2 - 1
                    pred_idx = j1 + i if j1 + i < j2 else j2 - 1

                    ref_word = ref_words[ref_idx]
                    pred_word = pred_words[pred_idx] if pred_idx < len(pred_words) else None

                    if pred_word:
                        similarity = self._word_similarity(ref_word, pred_word)
                        aligned.append((ref_word, pred_word, similarity))
                    else:
                        aligned.append((ref_word, None, 0.0))

        return aligned

    def _word_similarity(self, word1, word2):
        """Calculate similarity between two words"""
        if not word1 or not word2:
            return 0.0

        # Character-level similarity
        chars1 = set(word1.lower())
        chars2 = set(word2.lower())

        if len(chars1) == 0:
            return 0.0

        intersection = len(chars1.intersection(chars2))
        union = len(chars1.union(chars2))

        return intersection / union if union > 0 else 0.0

    def _get_pronunciation_tips(self, word):
        """Get specific pronunciation tips for words"""
        # Basic tips for common patterns
        tips = {
            # Social domain specific tips
            "COMMUNICATION": "Break into syllables: com-mu-ni-CA-tion, stress on 4th syllable",
            "GENUINELY": "Three syllables: GEN-u-ine-ly, stress on first syllable",
            "OPPORTUNITIES": "Five syllables: op-por-TU-ni-ties, stress on 3rd syllable",
            "FRIENDSHIPS": "Two syllables: FRIEND-ships, clear 'nd' blend",
            "TRADITIONS": "Three syllables: tra-DI-tions, stress on 2nd syllable",

            # Sports domain specific tips
            "COORDINATION": "Five syllables: co-or-di-NA-tion, stress on 4th syllable",
            "BASKETBALL": "Three syllables: BAS-ket-ball, stress on first syllable",
            "FUNDAMENTAL": "Four syllables: fun-da-MEN-tal, stress on 3rd syllable",
            "IMPROVEMENT": "Three syllables: im-PROVE-ment, stress on 2nd syllable",
            "COMPETITIVE": "Four syllables: com-PET-i-tive, stress on 2nd syllable",

            # Environment domain specific tips
            "BIODIVERSITY": "Five syllables: bi-o-di-VER-si-ty, stress on 4th syllable",
            "ENVIRONMENTAL": "Five syllables: en-vi-ron-MEN-tal, stress on 4th syllable",
            "SUSTAINABLE": "Four syllables: sus-TAIN-a-ble, stress on 2nd syllable",
            "HYDROELECTRIC": "Five syllables: hy-dro-e-LEC-tric, stress on 4th syllable",
            "CONSERVATION": "Four syllables: con-ser-VA-tion, stress on 3rd syllable",

            # Politics domain specific tips
            "CITIZENSHIP": "Three syllables: CIT-i-zen-ship, stress on first syllable",
            "REPRESENTATIVES": "Five syllables: rep-re-SEN-ta-tives, stress on 3rd syllable",
            "PARTICIPATING": "Five syllables: par-TIC-i-pat-ing, stress on 2nd syllable",
            "DEMOCRATIC": "Four syllables: dem-o-CRAT-ic, stress on 3rd syllable",
            "POLITICAL": "Four syllables: po-LIT-i-cal, stress on 2nd syllable"
        }

        return tips.get(word, f"Practice pronouncing '{word}' clearly, breaking it into syllables")

    def _generate_improvement_suggestions(self, word_analysis):
        """Generate personalized improvement suggestions"""
        suggestions = []

        accuracy = word_analysis['word_accuracy_percentage']
        mispronounced = len(word_analysis['mispronounced_words'])

        if accuracy > 80:
            suggestions.append("Excellent pronunciation! Your speech is very clear and accurate.")
        elif accuracy > 60:
            suggestions.append("Good pronunciation overall. Focus on the highlighted words for improvement.")
        else:
            suggestions.append("Keep practicing! Try speaking more slowly and emphasizing each syllable.")

        if mispronounced > 0:
            suggestions.append(f"Practice the {mispronounced} words that need improvement.")
            suggestions.append("Break difficult words into syllables and practice each part separately.")
            suggestions.append("Record yourself saying individual words and compare with correct pronunciation.")
            suggestions.append("Practice in short 10-15 minute sessions for better retention.")

        return suggestions

    def _get_performance_grade(self, score):
        """Convert numerical score to letter grade"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"

    def _calculate_similarity(self, reference, predicted):
        """Calculate overall similarity between texts"""
        ref = reference.upper().strip()
        pred = predicted.upper().strip()

        if not ref or not pred:
            return 0.0

        # Character-level similarity
        ref_chars = set(ref.replace(" ", ""))
        pred_chars = set(pred.replace(" ", ""))

        if len(ref_chars) == 0:
            return 0.0

        common_chars = len(ref_chars.intersection(pred_chars))
        char_similarity = common_chars / len(ref_chars)

        # Word-level similarity
        ref_words = set(ref.split())
        pred_words = set(pred.split())

        if len(ref_words) == 0:
            word_similarity = 0.0
        else:
            common_words = len(ref_words.intersection(pred_words))
            word_similarity = common_words / len(ref_words)

        final_similarity = (char_similarity * 0.4 + word_similarity * 0.6) * 100
        return final_similarity

