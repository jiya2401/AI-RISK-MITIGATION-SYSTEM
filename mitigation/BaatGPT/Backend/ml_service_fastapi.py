"""
AI Risk Mitigation ML Service
FastAPI service for analyzing AI-generated text for various risk factors
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
from transformers import BertModel, BertTokenizer
import re
import logging
from typing import Optional
import time
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Request/Response Models
class AnalyzeRequest(BaseModel):
    """Request model for /analyze endpoint"""
    text: str

class AnalyzeResponse(BaseModel):
    """Response model for /analyze endpoint"""
    hallucination_risk: str  # LOW/MEDIUM/HIGH
    bias_risk: str  # LOW/MEDIUM/HIGH
    toxicity_risk: str  # LOW/MEDIUM/HIGH
    pii_leak: bool
    fraud_risk: str  # LOW/MEDIUM/HIGH
    confidence_score: float  # 0-1
    ml_prediction: str
    processing_time_ms: float

# PII Detection Patterns
PII_PATTERNS = {
    'email': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
    'phone': re.compile(r'\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b'),
    'ssn': re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),
    'credit_card': re.compile(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'),
    'address': re.compile(r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b', re.IGNORECASE),
}

# Risk keywords for heuristic analysis
BIAS_KEYWORDS = ['always', 'never', 'all', 'none', 'everyone', 'no one', 'must', 'only', 'absolutely']
TOXICITY_KEYWORDS = ['hate', 'stupid', 'idiot', 'terrible', 'worst', 'awful', 'horrible']
FRAUD_KEYWORDS = ['guaranteed', 'free money', 'limited time', 'act now', 'no risk', 'secret', 'urgent']

class RiskClassifier(nn.Module):
    """MedBERT-based risk classifier"""
    def __init__(self, n_classes, pre_trained_model):
        super(RiskClassifier, self).__init__()
        self.bert = pre_trained_model
        self.drop = nn.Dropout(p=0.3)
        self.out = nn.Linear(self.bert.config.hidden_size, n_classes)

    def forward(self, input_ids, attention_mask):
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        output = self.drop(output.last_hidden_state[:, 0, :])
        return self.out(output)

def detect_pii(text: str) -> bool:
    """Detect PII in text using regex patterns"""
    for pattern_name, pattern in PII_PATTERNS.items():
        if pattern.search(text):
            logger.info(f"PII detected: {pattern_name}")
            return True
    return False

def analyze_bias(text: str) -> str:
    """Analyze bias risk using keyword heuristics"""
    text_lower = text.lower()
    bias_count = sum(1 for keyword in BIAS_KEYWORDS if keyword in text_lower)
    
    if bias_count >= 3:
        return "HIGH"
    elif bias_count >= 1:
        return "MEDIUM"
    return "LOW"

def analyze_toxicity(text: str) -> str:
    """Analyze toxicity risk using keyword heuristics"""
    text_lower = text.lower()
    toxicity_count = sum(1 for keyword in TOXICITY_KEYWORDS if keyword in text_lower)
    
    if toxicity_count >= 2:
        return "HIGH"
    elif toxicity_count >= 1:
        return "MEDIUM"
    return "LOW"

def analyze_fraud(text: str) -> str:
    """Analyze fraud risk using keyword heuristics"""
    text_lower = text.lower()
    fraud_count = sum(1 for keyword in FRAUD_KEYWORDS if keyword in text_lower)
    
    if fraud_count >= 2:
        return "HIGH"
    elif fraud_count >= 1:
        return "MEDIUM"
    return "LOW"

def load_trained_model(model_dir="../../../saved_medbert_model"):
    """Load the trained MedBERT model from saved directory"""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    logger.info(f"Loading model from {model_dir}...")
    logger.info(f"Using device: {device}")
    
    # Initialize default configuration
    default_config = {
        'label_mapping': {'low risk': 0, 'medium risk': 1, 'high risk': 2},
        'num_classes': 3,
        'max_len': 512
    }
    
    try:
        # Load tokenizer and BERT model
        logger.info("Loading BERT tokenizer and model...")
        tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        bert_model = BertModel.from_pretrained('bert-base-uncased')
        
        # Create classifier
        model = RiskClassifier(
            n_classes=default_config['num_classes'], 
            pre_trained_model=bert_model
        )
        
        # Try to load trained weights if available
        weights_path = os.path.join(model_dir, "classifier_weights.pth")
        if os.path.exists(weights_path):
            try:
                logger.info(f"Loading classifier weights from {weights_path}...")
                checkpoint = torch.load(weights_path, map_location=device, weights_only=False)
                if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                    model.load_state_dict(checkpoint['model_state_dict'])
                    logger.info("Classifier weights loaded successfully")
                else:
                    logger.warning("Weights file format unexpected, using untrained model")
            except Exception as e:
                logger.warning(f"Could not load weights: {e}, using untrained model")
        else:
            logger.warning(f"No weights file found at {weights_path}, using untrained model")
        
        model = model.to(device)
        model.eval()
        
        logger.info("✅ Model loaded successfully!")
        return model, tokenizer, default_config['label_mapping'], default_config['max_len'], device
        
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise

def predict_risk(model, tokenizer, text, label_mapping, max_len, device):
    """Make a risk prediction on text"""
    model.eval()
    reverse_label_mapping = {v: k for k, v in label_mapping.items()}
    
    # Prepare input
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
    
    predicted_label = reverse_label_mapping.get(prediction.item(), "unknown")
    return predicted_label, confidence

# Initialize FastAPI app
app = FastAPI(
    title="AI Risk Mitigation Service",
    description="ML-powered risk analysis for AI-generated text",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
model = None
tokenizer = None
label_mapping = None
max_len = None
device = None

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    global model, tokenizer, label_mapping, max_len, device
    try:
        logger.info("🚀 Starting ML Service...")
        model, tokenizer, label_mapping, max_len, device = load_trained_model()
        logger.info("✅ ML Service ready!")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Risk Mitigation ML Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(device),
        "timestamp": time.time()
    }

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Analyze AI-generated text for various risk factors
    Returns: hallucination_risk, bias_risk, toxicity_risk, pii_leak, fraud_risk, confidence_score
    """
    start_time = time.time()
    
    try:
        text = request.text.strip()
        if not text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        logger.info(f"Analyzing text (length: {len(text)} chars)")
        
        # Run ML model prediction
        ml_prediction, ml_confidence = predict_risk(
            model, tokenizer, text, label_mapping, max_len, device
        )
        
        # Map ML prediction to hallucination risk
        # The model predicts risk level, we use it as hallucination indicator
        hallucination_risk = ml_prediction.upper().replace(" ", "_")
        if hallucination_risk not in ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"]:
            hallucination_risk = "MEDIUM"
        else:
            hallucination_risk = hallucination_risk.replace("_RISK", "")
        
        # Run heuristic analyses
        pii_detected = detect_pii(text)
        bias_risk = analyze_bias(text)
        toxicity_risk = analyze_toxicity(text)
        fraud_risk = analyze_fraud(text)
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000
        
        result = AnalyzeResponse(
            hallucination_risk=hallucination_risk,
            bias_risk=bias_risk,
            toxicity_risk=toxicity_risk,
            pii_leak=pii_detected,
            fraud_risk=fraud_risk,
            confidence_score=ml_confidence,
            ml_prediction=ml_prediction,
            processing_time_ms=round(processing_time, 2)
        )
        
        logger.info(f"Analysis complete in {processing_time:.2f}ms - Hallucination: {hallucination_risk}, PII: {pii_detected}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting FastAPI ML Service on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
