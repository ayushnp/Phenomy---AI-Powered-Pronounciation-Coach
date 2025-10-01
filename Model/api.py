from flask import Flask, request, jsonify
import os
import uuid
import torch
from model import MultiDomainPronunciationTrainer
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes

# Your routes


# --- MODEL LOADING (PRODUCTION WORKFLOW) ---
print("🚀 Initializing model for production...")

# 1. Initialize the trainer. At this point, trainer.model is still None.
trainer = MultiDomainPronunciationTrainer()

# 2. Load the base pre-trained model architecture from Hugging Face.
#    This is the crucial step that creates the actual model object.
trainer.load_and_initialize_model()

# 3. NOW that the model exists, load your custom fine-tuned weights from the .pth file.
#    This step overwrites the base weights with your specialized ones.
try:
    print("✅ Base model loaded. Attempting to load fine-tuned state from 'model_state.pth'...")
    trainer.model.load_state_dict(torch.load('model_state.pth'))
    print("✅ Successfully loaded fine-tuned weights. The model is now specialized.")
except FileNotFoundError:
    print("⚠️  'model_state.pth' not found. The API will run using the standard pre-trained model.")
except Exception as e:
    print(f"❌ Error loading 'model_state.pth': {e}. The API will run using the standard pre-trained model.")

print("✅ Model is fully loaded and ready to serve requests.")
# --------------------------------------------------

# Create a temporary folder for audio uploads
UPLOAD_FOLDER = 'temp_audio'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route('/analyze', methods=['POST'])
def analyze_audio():
    """
    API endpoint for pronunciation analysis. Expects a multipart form with:
    - 'audio_file': The .wav audio file.
    - 'domain': The practice domain (e.g., 'SOCIAL').
    - 'paragraph_number': The paragraph number (e.g., 1).
    """
    # --- This variable needs to be defined to be accessible in the finally block ---
    temp_filename = None
    try:
        # --- Input Validation ---
        if 'audio_file' not in request.files:
            return jsonify({"error": "No audio file part in the request", "success": False}), 400

        audio_file = request.files['audio_file']
        domain = request.form.get('domain')
        paragraph_number_str = request.form.get('paragraph_number')

        if not audio_file or audio_file.filename == '':
            return jsonify({"error": "No selected audio file", "success": False}), 400
        if not domain or not paragraph_number_str:
            return jsonify({"error": "Both 'domain' and 'paragraph_number' are required fields", "success": False}), 400

        try:
            paragraph_number = int(paragraph_number_str)
        except (ValueError, TypeError):
            return jsonify({"error": "'paragraph_number' must be a valid integer", "success": False}), 400

        # --- File Handling ---
        temp_filename = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.wav")
        audio_file.save(temp_filename)

        # --- Analysis ---
        print(f"🎤 Analyzing audio for domain: {domain}, paragraph: {paragraph_number}")
        # This method handles loading the audio, resampling, and calling analyze_pronunciation.
        result = trainer.analyze_from_audio_file(temp_filename, domain, paragraph_number)

        # --- Response ---
        if result.get('success'):
            return jsonify(result)
        else:
            return jsonify(result), 500

    except Exception as e:
        print(f"An unexpected error occurred in the API endpoint: {e}")
        return jsonify({"error": "An internal server error occurred.", "success": False, "details": str(e)}), 500

    finally:
        # --- Cleanup ---
        # This 'finally' block ensures the temporary file is deleted even if an error occurs.
        if temp_filename and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
                print(f"✅ Successfully cleaned up temporary file: {temp_filename}")
            except OSError as e:
                # Log the error but don't prevent the response from being sent
                print(f"⚠️ Error deleting temporary file {temp_filename}: {e.strerror}")

# To run this in production (e.g., on Windows), use a WSGI server from your terminal:
# waitress-serve --host=0.0.0.0 --port=5000 api:app