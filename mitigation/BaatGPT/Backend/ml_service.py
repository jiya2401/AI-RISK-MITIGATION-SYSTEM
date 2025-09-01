from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import pandas as pd
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel, BertModel, BertTokenizer
from torch.utils.data import Dataset, DataLoader
from pathlib import Path

class RiskDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, item):
        text = str(self.texts[item])
        label = self.labels[item]
        
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt',
        )
        
        return {
            'text': text,
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

class RiskClassifier(nn.Module):
    def __init__(self, n_classes, pre_trained_model):
        super(RiskClassifier, self).__init__()
        self.bert = pre_trained_model
        self.drop = nn.Dropout(p=0.3)
        self.out = nn.Linear(self.bert.config.hidden_size, n_classes)

    def forward(self, input_ids, attention_mask):
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        output = self.drop(output.last_hidden_state[:, 0, :])
        return self.out(output)

def read_file_contents(filepath):
    """Helper function to read and validate file contents"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            print(f"\nFirst 100 characters of {os.path.basename(filepath)}:")
            print(content[:100])
            return content
    except Exception as e:
        print(f"Error reading {filepath}: {str(e)}")
        return None

def load_trained_model(model_dir="../saved_medbert_model"):
    """Load the trained model from the saved directory"""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    print(f"Loading model from {model_dir}...")
    print(f"Using device: {device}")
    
    # Check what files are available in the model directory
    if os.path.exists(model_dir):
        print("\nAvailable files in model directory:")
        for file in os.listdir(model_dir):
            print(f"- {file}")
    else:
        print(f"\nWarning: Model directory {model_dir} does not exist")
    
    # Initialize default configuration
    default_config = {
        'label_mapping': {'Low Risk': 0, 'Medium Risk': 1, 'High Risk': 2},
        'num_classes': 3,
        'model_config': {'max_len': 512}
    }
    
    # Try to load the model configuration from tokenizer config
    tokenizer_config_path = os.path.join(model_dir, "tokenizer_config.json")
    config_path = os.path.join(model_dir, "config.json")
    
    # Check contents of config files
    for config_file in [tokenizer_config_path, config_path]:
        content = read_file_contents(config_file)
        if content:
            print(f"\nFile exists and has content")
        else:
            print(f"\nFile is empty or invalid")
    
    try:
        print(f"\nLoading tokenizer config from: {tokenizer_config_path}")
        with open(tokenizer_config_path, 'r', encoding='utf-8') as f:
            tokenizer_config = json.load(f)
            print("Tokenizer config loaded successfully")
    except Exception as e:
        print(f"Warning: Could not load tokenizer config: {str(e)}")
        tokenizer_config = {}
    
    try:
        print(f"Loading model config from: {config_path}")
        with open(config_path, 'r', encoding='utf-8') as f:
            model_config = json.load(f)
            print("Model config loaded successfully")
    except Exception as e:
        print(f"Warning: Could not load model config: {str(e)}")
        model_config = {}
    
    # Merge configs with defaults
    model_config = {
        **default_config['model_config'],
        **model_config
    }
    
    # Use the default label mapping and number of classes
    checkpoint = default_config
    
    # Extract configuration
    label_mapping = checkpoint['label_mapping']
    num_classes = checkpoint['num_classes']
    model_config = checkpoint['model_config']
    
    print(f"Number of classes: {num_classes}")
    print(f"Labels: {list(label_mapping.keys())}")
    
    try:
        # Initialize base BERT model and tokenizer
        print("Initializing base BERT model and tokenizer...")
        tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        bert_model = BertModel.from_pretrained('bert-base-uncased')
        
        # Create the classifier
        print("Creating classifier...")
        model = RiskClassifier(n_classes=num_classes, pre_trained_model=bert_model)
        
        # Load the trained weights
        print("Loading classifier weights...")
        weights_path = os.path.join(model_dir, "classifier_weights.pth")
        if os.path.exists(weights_path):
            try:
                print(f"Attempting to load weights from: {weights_path}")
                state_dict = torch.load(weights_path, map_location=device, weights_only=False)
                if isinstance(state_dict, dict) and 'model_state_dict' in state_dict:
                    model.load_state_dict(state_dict['model_state_dict'])
                else:
                    model.load_state_dict(state_dict)
                print("Classifier weights loaded successfully")
            except Exception as e:
                print(f"Error loading weights: {str(e)}")
                # Try alternative loading method
                print("Trying alternative loading method...")
                with open(weights_path, 'rb') as f:
                    state_dict = torch.load(f, map_location=device, weights_only=False)
                    if isinstance(state_dict, dict) and 'model_state_dict' in state_dict:
                        model.load_state_dict(state_dict['model_state_dict'])
                    else:
                        model.load_state_dict(state_dict)
                print("Classifier weights loaded successfully using alternative method")
        else:
            print(f"Warning: No weights file found at {weights_path}")
            
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        raise
    
    # Model is already loaded with weights from safetensors
    model = model.to(device)
    model.eval()
    
    print("✅ Model loaded successfully!")
    
    return model, tokenizer, label_mapping, model_config, device

def predict_single(model, tokenizer, text, label_mapping, max_len, device):
    """Make a prediction on a single text input"""
    model.eval()
    reverse_label_mapping = {v: k for k, v in label_mapping.items()}
    
    # Prepare the input
    encoding = tokenizer.encode_plus(
        text,
        add_special_tokens=True,
        max_length=max_len,
        return_token_type_ids=False,
        padding='max_length',
        truncation=True,
        return_attention_mask=True,
        return_tensors='pt',
    )
    
    input_ids = encoding['input_ids'].to(device)
    attention_mask = encoding['attention_mask'].to(device)
    
    # Make prediction
    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        probabilities = torch.softmax(outputs, dim=1)
        _, prediction = torch.max(outputs, dim=1)
        confidence = probabilities[0][prediction].item()
    
    predicted_label = reverse_label_mapping.get(prediction.item(), "Unknown")
    
    return predicted_label, confidence, probabilities[0].cpu().numpy()

def predict_batch(model, tokenizer, texts, label_mapping, max_len, device, batch_size=16):
    """Make predictions on a batch of texts"""
    model.eval()
    reverse_label_mapping = {v: k for k, v in label_mapping.items()}
    
    # Create dataset and dataloader
    dummy_labels = [0] * len(texts)  # Dummy labels for prediction
    dataset = RiskDataset(texts, dummy_labels, tokenizer, max_len)
    dataloader = DataLoader(dataset, batch_size=batch_size)
    
    predictions = []
    confidences = []
    
    with torch.no_grad():
        for batch in dataloader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            probabilities = torch.softmax(outputs, dim=1)
            _, batch_predictions = torch.max(outputs, dim=1)
            
            for i, pred in enumerate(batch_predictions):
                predicted_label = reverse_label_mapping.get(pred.item(), "Unknown")
                confidence = probabilities[i][pred].item()
                predictions.append(predicted_label)
                confidences.append(confidence)
    
    return predictions, confidences

# Flask app setup
app = Flask(__name__)
CORS(app)

# Load model once when service starts
print("🚀 Loading MedBERT model...")
try:
    model, tokenizer, label_mapping, config, device = load_trained_model("../../../saved_medbert_model")
    print("✅ MedBERT model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit(1)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'device': str(device),
        'classes': list(label_mapping.keys())
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        predicted_label, confidence, probabilities = predict_single(
            model, tokenizer, text, label_mapping, config['max_len'], device
        )
        
        reverse_mapping = {v: k for k, v in label_mapping.items()}
        prob_dict = {reverse_mapping[i]: float(prob) for i, prob in enumerate(probabilities)}
        
        return jsonify({
            'success': True,
            'prediction': predicted_label,
            'confidence': float(confidence),
            'probabilities': prob_dict,
            'text': text,
            'timestamp': pd.Timestamp.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch_endpoint():
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts or not isinstance(texts, list):
            return jsonify({'error': 'No texts array provided'}), 400
        
        if len(texts) > 100:
            return jsonify({'error': 'Batch size too large (max 100)'}), 400
        
        predictions, confidences = predict_batch(
            model, tokenizer, texts, label_mapping, config['max_len'], device
        )
        
        results = []
        for i, (text, pred, conf) in enumerate(zip(texts, predictions, confidences)):
            results.append({
                'id': i,
                'text': text,
                'prediction': pred,
                'confidence': float(conf)
            })
        
        return jsonify({
            'success': True,
            'results': results,
            'total_processed': len(texts)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print(f"🚀 Starting ML Service on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
