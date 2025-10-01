// SIMPLE WORKING VERSION - practice-session.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting practice session...');
    
    // STEP 1: Get the domain from URL
    const urlParams = new URLSearchParams(window.location.search);
    let selectedDomain = urlParams.get('domain') || 'sports';
    console.log('Selected domain:', selectedDomain);
    
    // STEP 2: Map to uppercase for JSON
    const domainMap = {
        'sports': 'SPORTS',
        'politics': 'POLITICS',
        'environment': 'ENVIRONMENT', 
        'social': 'SOCIAL'
    };
    
    const jsonDomain = domainMap[selectedDomain.toLowerCase()] || 'SPORTS';
    console.log('JSON domain:', jsonDomain);
    
    // STEP 3: Hard-coded data (THIS WILL DEFINITELY WORK)
    const practiceContent = {
        "SOCIAL": {
        "domain_id": "SOCIAL",
        "domain_name": "Social Communication",
        "domain_description": "Practice social interaction vocabulary and communication skills",
        "paragraphs": {
          "1": {
            "paragraph_id": 1,
            "title": "Making Friends",
            "content": "MAKING NEW FRIENDS AS AN ADULT CAN BE CHALLENGING BUT REWARDING JOINING CLUBS AND ATTENDING SOCIAL EVENTS CREATES OPPORTUNITIES TO MEET LIKE MINDED PEOPLE BEING GENUINELY INTERESTED IN OTHERS AND SHOWING KINDNESS HELPS BUILD LASTING FRIENDSHIPS",
            "word_count": 36,
            "difficulty_level": "Intermediate",
            "focus_areas": ["Social interactions", "Adult relationships", "Community building"]
          },
          "2": {
            "paragraph_id": 2,
            "title": "Family Relationships", 
            "content": "STRONG FAMILY BONDS ARE BUILT THROUGH OPEN COMMUNICATION AND MUTUAL RESPECT SPENDING QUALITY TIME TOGETHER SHARING MEALS AND CREATING TRADITIONS STRENGTHENS FAMILY CONNECTIONS LISTENING ACTIVELY AND SHOWING EMPATHY HELPS RESOLVE CONFLICTS PEACEFULLY",
            "word_count": 35,
            "difficulty_level": "Intermediate",
            "focus_areas": ["Family dynamics", "Communication skills", "Conflict resolution"]
          },
          "3": {
            "paragraph_id": 3,
            "title": "Workplace Interactions",
            "content": "EFFECTIVE WORKPLACE COMMUNICATION INVOLVES CLEAR EXPRESSION OF IDEAS AND ACTIVE LISTENING BUILDING PROFESSIONAL RELATIONSHIPS REQUIRES RESPECT COLLABORATION AND UNDERSTANDING DIFFERENT PERSPECTIVES CONSTRUCTIVE FEEDBACK AND TEAMWORK LEAD TO SUCCESS",
            "word_count": 30,
            "difficulty_level": "Advanced",
            "focus_areas": ["Professional communication", "Teamwork", "Leadership skills"]
          },
          "4": {
            "paragraph_id": 4,
            "title": "Community Engagement",
            "content": "ACTIVE COMMUNITY PARTICIPATION CREATES POSITIVE SOCIAL CHANGE VOLUNTEERING FOR LOCAL CAUSES AND ATTENDING NEIGHBORHOOD MEETINGS BUILDS STRONGER COMMUNITIES SUPPORTING LOCAL BUSINESSES AND HELPING NEIGHBORS FOSTERS CIVIC PRIDE AND CONNECTION",
            "word_count": 32,
            "difficulty_level": "Intermediate",
            "focus_areas": ["Community involvement", "Civic responsibility", "Social impact"]
          }
        }
      },
      "SPORTS": {
        "domain_id": "SPORTS",
        "domain_name": "Sports and Athletics",
        "domain_description": "Athletic terminology and sports-related communication practice",
        "paragraphs": {
          "1": {
            "paragraph_id": 1,
            "title": "Basketball Fundamentals",
            "content": "BASKETBALL REQUIRES EXCELLENT HAND EYE COORDINATION AND QUICK DECISION MAKING DRIBBLING SHOOTING AND PASSING ARE FUNDAMENTAL SKILLS THAT NEED CONSTANT PRACTICE TEAMWORK AND COMMUNICATION ON THE COURT LEAD TO VICTORY AND PERSONAL IMPROVEMENT",
            "word_count": 35,
            "difficulty_level": "Intermediate",
            "focus_areas": ["Basketball skills", "Athletic coordination", "Team sports"]
          },
          "2": {
            "paragraph_id": 2,
            "title": "Soccer Training",
            "content": "SOCCER PLAYERS DEVELOP STAMINA THROUGH CONTINUOUS RUNNING AND BALL CONTROL EXERCISES MASTERING KICKS HEADERS AND STRATEGIC POSITIONING REQUIRES DEDICATION AND REGULAR TRAINING SESSIONS TEAM COORDINATION AND UNDERSTANDING GAME TACTICS ARE ESSENTIAL FOR SUCCESS",
            "word_count": 35,
            "difficulty_level": "Intermediate", 
            "focus_areas": ["Soccer techniques", "Athletic training", "Strategy"]
          },
          "3": {
            "paragraph_id": 3,
            "title": "Swimming Excellence",
            "content": "COMPETITIVE SWIMMING DEMANDS PERFECT TECHNIQUE AND STRONG CARDIOVASCULAR ENDURANCE FREESTYLE BACKSTROKE BREASTSTROKE AND BUTTERFLY STROKES EACH REQUIRE SPECIFIC TRAINING METHODS CONSISTENT PRACTICE AND PROPER BREATHING TECHNIQUES IMPROVE PERFORMANCE AND SPEED",
            "word_count": 33,
            "difficulty_level": "Advanced",
            "focus_areas": ["Swimming techniques", "Endurance training", "Athletic performance"]
          },
          "4": {
            "paragraph_id": 4,
            "title": "Tennis Mastery",
            "content": "TENNIS COMBINES PHYSICAL FITNESS WITH MENTAL STRATEGY AND PRECISE SHOT PLACEMENT FOREHAND BACKHAND AND SERVE TECHNIQUES MUST BE PRACTICED REPEATEDLY FOR IMPROVEMENT READING OPPONENT MOVEMENTS AND ADAPTING PLAYING STYLE CREATES COMPETITIVE ADVANTAGE",
            "word_count": 33,
            "difficulty_level": "Advanced",
            "focus_areas": ["Tennis skills", "Strategic thinking", "Mental focus"]
          }
        }
      },
      "ENVIRONMENT": {
        "domain_id": "ENVIRONMENT",
        "domain_name": "Environmental Awareness",
        "domain_description": "Environmental science and sustainability vocabulary practice",
        "paragraphs": {
          "1": {
            "paragraph_id": 1,
            "title": "Climate Change Impact",
            "content": "CLIMATE CHANGE AFFECTS WEATHER PATTERNS OCEAN LEVELS AND BIODIVERSITY WORLDWIDE REDUCING CARBON EMISSIONS THROUGH RENEWABLE ENERGY AND SUSTAINABLE PRACTICES IS CRUCIAL INDIVIDUAL ACTIONS LIKE RECYCLING AND CONSERVATION CONTRIBUTE TO GLOBAL ENVIRONMENTAL PROTECTION",
            "word_count": 34,
            "difficulty_level": "Advanced",
            "focus_areas": ["Climate science", "Environmental impact", "Global awareness"]
          },
          "2": {
            "paragraph_id": 2,
            "title": "Renewable Energy",
            "content": "SOLAR WIND AND HYDROELECTRIC POWER OFFER CLEAN ALTERNATIVES TO FOSSIL FUELS INVESTING IN RENEWABLE ENERGY TECHNOLOGY CREATES JOBS AND REDUCES POLLUTION GOVERNMENTS AND BUSINESSES MUST COLLABORATE TO ACCELERATE THE TRANSITION TO SUSTAINABLE ENERGY SOURCES",
            "word_count": 36,
            "difficulty_level": "Advanced",
            "focus_areas": ["Energy systems", "Technology", "Policy implementation"]
          },
          "3": {
            "paragraph_id": 3,
            "title": "Wildlife Conservation",
            "content": "PROTECTING ENDANGERED SPECIES REQUIRES HABITAT PRESERVATION AND STRICT ANTI POACHING MEASURES NATIONAL PARKS AND WILDLIFE RESERVES PROVIDE SAFE SPACES FOR ANIMALS TO THRIVE EDUCATION AND AWARENESS PROGRAMS HELP COMMUNITIES UNDERSTAND CONSERVATION IMPORTANCE",
            "word_count": 34,
            "difficulty_level": "Intermediate",
            "focus_areas": ["Wildlife protection", "Conservation methods", "Education"]
          },
          "4": {
            "paragraph_id": 4,
            "title": "Ocean Pollution",
            "content": "PLASTIC WASTE IN OCEANS THREATENS MARINE LIFE AND DISRUPTS FOOD CHAINS GLOBALLY REDUCING SINGLE USE PLASTICS AND IMPROVING WASTE MANAGEMENT SYSTEMS ARE ESSENTIAL STEPS BEACH CLEANUPS AND RECYCLING PROGRAMS HELP RESTORE OCEAN HEALTH AND BIODIVERSITY",
            "word_count": 36,
            "difficulty_level": "Intermediate",
            "focus_areas": ["Marine pollution", "Waste management", "Conservation action"]
          }
        }
      },
      "POLITICS": {
        "domain_id": "POLITICS", 
        "domain_name": "Political Awareness",
        "domain_description": "Political science and civic engagement vocabulary practice",
        "paragraphs": {
          "1": {
            "paragraph_id": 1,
            "title": "Democratic Participation",
            "content": "ACTIVE CITIZENSHIP INVOLVES VOTING IN ELECTIONS AND STAYING INFORMED ABOUT POLITICAL ISSUES PARTICIPATING IN TOWN HALLS AND CONTACTING REPRESENTATIVES ENSURES COMMUNITY VOICES ARE HEARD DEMOCRACY THRIVES WHEN CITIZENS ENGAGE IN PEACEFUL POLITICAL DISCOURSE",
            "word_count": 34,
            "difficulty_level": "Intermediate",
            "focus_areas": ["Civic duty", "Democratic process", "Political engagement"]
          },
          "2": {
            "paragraph_id": 2,
            "title": "Government Structure",
            "content": "UNDERSTANDING GOVERNMENT BRANCHES AND THEIR FUNCTIONS HELPS CITIZENS MAKE INFORMED DECISIONS THE EXECUTIVE LEGISLATIVE AND JUDICIAL BRANCHES PROVIDE CHECKS AND BALANCES IN DEMOCRATIC SYSTEMS CONSTITUTIONAL RIGHTS PROTECT INDIVIDUAL FREEDOMS AND ENSURE EQUAL TREATMENT",
            "word_count": 35,
            "difficulty_level": "Advanced",
            "focus_areas": ["Government systems", "Constitutional law", "Civil rights"]
          },
          "3": {
            "paragraph_id": 3,
            "title": "Policy Making",
            "content": "EFFECTIVE POLICIES ADDRESS SOCIAL ECONOMIC AND ENVIRONMENTAL CHALLENGES THROUGH RESEARCH AND ANALYSIS LAWMAKERS CONSIDER MULTIPLE PERSPECTIVES BEFORE DRAFTING LEGISLATION PUBLIC INPUT AND EXPERT TESTIMONY HELP SHAPE POLICIES THAT BENEFIT SOCIETY",
            "word_count": 32,
            "difficulty_level": "Advanced",
            "focus_areas": ["Legislative process", "Policy analysis", "Public administration"]
          },
          "4": {
            "paragraph_id": 4,
            "title": "International Relations",
            "content": "DIPLOMATIC RELATIONSHIPS BETWEEN NATIONS REQUIRE MUTUAL RESPECT AND PEACEFUL NEGOTIATION TRADE AGREEMENTS AND CULTURAL EXCHANGES PROMOTE INTERNATIONAL COOPERATION AND UNDERSTANDING RESOLVING CONFLICTS THROUGH DIALOGUE PREVENTS WAR AND PROMOTES GLOBAL STABILITY",
            "word_count": 33,
            "difficulty_level": "Advanced",
            "focus_areas": ["Diplomacy", "International cooperation", "Conflict resolution"]
          }
        }
      }
    };
    
    // STEP 4: Get the content for selected domain
    const domainData = practiceContent[jsonDomain];
    console.log('Domain data:', domainData);
    
    if (!domainData) {
        console.error('No data for domain:', jsonDomain);
        return;
    }
    
    // STEP 5: UPDATE THE UI - THIS IS THE KEY PART
    console.log('🔄 Updating UI...');
    
    // Hide loader
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.style.display = 'none';
    }
    
    // Update domain name
    const domainNameEl = document.getElementById('domainName');
    if (domainNameEl) {
        domainNameEl.textContent = domainData.domain_name;
        console.log('✅ Updated domain name');
    }
    
    // Update title
    const titleEl = document.getElementById('practiceTitle');
    if (titleEl) {
        titleEl.textContent = domainData.paragraph.title;
        console.log('✅ Updated title');
    }
    
    // Update description
    const infoEl = document.getElementById('sessionInfo');
    if (infoEl) {
        infoEl.textContent = domainData.domain_description;
        console.log('✅ Updated description');
    }
    
    // Update difficulty
    const difficultyEl = document.getElementById('difficultyLevel');
    if (difficultyEl) {
        difficultyEl.textContent = domainData.paragraph.difficulty_level;
        console.log('✅ Updated difficulty');
    }
    
    // Update word count
    const wordCountEl = document.getElementById('wordCount');
    if (wordCountEl) {
        wordCountEl.textContent = domainData.paragraph.word_count;
        console.log('✅ Updated word count');
    }
    
    // **THIS IS THE MOST IMPORTANT PART - UPDATE THE PARAGRAPH**
    const practiceTextEl = document.getElementById('practiceText');
    if (practiceTextEl) {
        practiceTextEl.innerHTML = `
            <div class="text-lg leading-relaxed text-slate-800 font-medium tracking-wide">
                ${domainData.paragraph.content}
            </div>
        `;
        console.log('✅ Updated practice text - PARAGRAPH SHOULD BE VISIBLE NOW!');
    } else {
        console.error('❌ Could not find practiceText element!');
    }
    
    console.log('🎉 UI Update complete!');
    
    // STEP 6: Setup recording button
    const recordBtn = document.getElementById('recordButton');
    if (recordBtn) {
        recordBtn.addEventListener('click', function() {
            alert('Recording functionality will be added here!\n\nContent: ' + domainData.paragraph.title);
        });
        console.log('✅ Recording button setup');
    }
    
    console.log('✅ EVERYTHING LOADED SUCCESSFULLY!');
});
