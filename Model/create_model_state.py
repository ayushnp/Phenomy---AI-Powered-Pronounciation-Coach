import torch
from model import MultiDomainPronunciationTrainer

print("🚀 Starting the one-time process to save the model's state...")
print("This will download the pre-trained model from Hugging Face and may take several minutes.")

# Step 1: Create an instance of the trainer.
# This action downloads the model architecture and its pre-trained weights.
trainer = MultiDomainPronunciationTrainer()
trainer.load_and_initialize_model()

# Step 2: Extract the 'state dictionary' from the model.
# The state_dict contains all the learned weights and biases—the essential "knowledge" of the model.
model_state_dict = trainer.model.state_dict()

# Step 3: Save only the state dictionary to a file.
# Using .pth (PyTorch) is the standard convention for these files.
save_path = 'model_state.pth'
torch.save(model_state_dict, save_path)

print(f"\n✅ Model state dictionary has been successfully saved to '{save_path}'")
print("Your Flask application will now use this file for fast model loading.")
