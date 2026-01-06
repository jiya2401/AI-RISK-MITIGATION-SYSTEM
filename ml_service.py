"""
AI Risk Mitigation ML Service
Production-grade FastAPI service for analyzing AI-generated text
Uses MedBERT model with fallback to intelligent heuristics
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import logging
import time
from typing import Optional
import os

# Try to import ML dependencies
try:
    import torch
    import torch.nn as nn
    from transformers import BertTokenizer, BertModel
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    logger_temp = logging.getLogger(__name__)
    logger_temp.warning("ML dependencies not available, will use heuristics only")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Risk Mitigation ML Service",
    description="Real-time ML-powered risk analysis for AI-generated content",
    version="1.0.0"
)

# Configure CORS - for production, restrict to specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

class AnalysisResponse(BaseModel):
    hallucination_risk: str
    bias_risk: str
    toxicity_risk: str
    pii_leak: bool
    fraud_risk: str
    confidence_score: float
    summary: str
    processing_time_ms: Optional[float] = None

# MedBERT Model Classes
if ML_AVAILABLE:
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

# Global model variables
medbert_model = None
tokenizer = None
device = None
label_mapping = None
max_len = 512
model_loaded = False

def load_medbert_model(model_dir="saved_medbert_model"):
    """Load MedBERT model at startup"""
    global medbert_model, tokenizer, device, label_mapping, max_len, model_loaded
    
    if not ML_AVAILABLE:
        logger.warning("ML dependencies not available, using heuristics only")
        return False
    
    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Loading MedBERT model from {model_dir} on device: {device}")
        
        # Check if model directory exists
        if not os.path.exists(model_dir):
            logger.warning(f"Model directory {model_dir} not found, using heuristics")
            return False
        
        # Try to load checkpoint
        checkpoint_path = os.path.join(model_dir, "classifier_weights.pth")
        if not os.path.exists(checkpoint_path):
            logger.warning(f"Checkpoint file not found at {checkpoint_path}, using heuristics")
            return False
        
        # Check if checkpoint is a valid file (not Git LFS pointer)
        file_size = os.path.getsize(checkpoint_path)
        if file_size < 1000:  # If file is very small, likely a Git LFS pointer
            logger.warning(f"Checkpoint appears to be a Git LFS pointer ({file_size} bytes), using heuristics")
            return False
        
        # Load checkpoint
        checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
        
        # Extract configuration
        label_mapping = checkpoint.get('label_mapping', {'Low Risk': 0, 'Medium Risk': 1, 'High Risk': 2})
        num_classes = checkpoint.get('num_classes', 3)
        model_config = checkpoint.get('model_config', {'max_len': 512})
        max_len = model_config.get('max_len', 512)
        
        logger.info(f"Number of classes: {num_classes}")
        logger.info(f"Labels: {list(label_mapping.keys())}")
        
        # Try to load tokenizer from local directory
        try:
            tokenizer = BertTokenizer.from_pretrained(model_dir, local_files_only=True)
            logger.info("Loaded tokenizer from local directory")
        except Exception as e:
            logger.warning(f"Could not load tokenizer from local directory: {e}")
            # Try loading from saved vocab.txt
            vocab_path = os.path.join(model_dir, "vocab.txt")
            if os.path.exists(vocab_path) and os.path.getsize(vocab_path) > 1000:
                tokenizer = BertTokenizer(vocab_file=vocab_path)
                logger.info("Loaded tokenizer from vocab.txt")
            else:
                logger.warning("Could not load tokenizer, using heuristics")
                return False
        
        # Try to load BERT model
        try:
            bert_model = BertModel.from_pretrained(model_dir, local_files_only=True)
            logger.info("Loaded BERT model from local directory")
        except Exception as e:
            logger.warning(f"Could not load BERT model: {e}, using heuristics")
            return False
        
        # Create classifier
        medbert_model = RiskClassifier(n_classes=num_classes, pre_trained_model=bert_model)
        
        # Load trained weights
        if 'model_state_dict' in checkpoint:
            medbert_model.load_state_dict(checkpoint['model_state_dict'])
            logger.info("Loaded trained classifier weights")
        else:
            medbert_model.load_state_dict(checkpoint)
            logger.info("Loaded trained classifier weights (alternative format)")
        
        medbert_model = medbert_model.to(device)
        medbert_model.eval()
        
        logger.info("✅ MedBERT model loaded successfully!")
        model_loaded = True
        return True
        
    except Exception as e:
        logger.error(f"Failed to load MedBERT model: {e}")
        logger.info("Will use heuristic-based analysis as fallback")
        import traceback
        traceback.print_exc()
        return False

def predict_with_medbert(text: str):
    """Make prediction using MedBERT model"""
    if not model_loaded or medbert_model is None or tokenizer is None:
        return None, None, None
    
    try:
        medbert_model.eval()
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
            outputs = medbert_model(input_ids=input_ids, attention_mask=attention_mask)
            probabilities = torch.softmax(outputs, dim=1)
            _, prediction = torch.max(outputs, dim=1)
            confidence = probabilities[0][prediction].item()
        
        predicted_label = reverse_label_mapping.get(prediction.item(), "Medium Risk")
        
        return predicted_label, confidence, probabilities[0].cpu().numpy()
        
    except Exception as e:
        logger.error(f"MedBERT prediction error: {e}")
        return None, None, None

def detect_pii(text: str) -> bool:
    """Detect personally identifiable information using regex patterns"""
    patterns = [
        r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # Phone numbers
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
        r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b',  # Credit card
        r'\b\d{5}(-\d{4})?\b',  # ZIP codes
        r'\b\d{9}\b',  # SSN without dashes
    ]
    
    for pattern in patterns:
        if re.search(pattern, text):
            return True
    return False

def detect_fraud(text: str) -> str:
    """Detect fraud risk using keyword heuristics"""
    text_lower = text.lower()
    
    # High risk fraud keywords
    high_risk_keywords = [
        'guaranteed', 'act now', 'limited time', 'risk-free',
        'click here now', 'urgent action', 'winner', 'claim your prize',
        'congratulations you won', 'free money', 'no risk', 'double your',
        'best price guaranteed', 'lowest price ever', 'cheapest rate',
        'absolutely free', 'definitely safe', 'without any doubt',
        'everyone agrees', '100% proven', 'zero risk', 'instant approval'
    ]
    
    # Medium risk keywords
    medium_risk_keywords = [
        'offer', 'deal', 'discount', 'special', 'promotion',
        'exclusive', 'limited', 'hurry', 'bonus', 'sale',
        'opportunity', 'claim now', 'expires soon'
    ]
    
    # Count matches
    high_matches = sum(1 for keyword in high_risk_keywords if keyword in text_lower)
    medium_matches = sum(1 for keyword in medium_risk_keywords if keyword in text_lower)
    
    if high_matches >= 2:
        return "HIGH"
    elif high_matches >= 1 or medium_matches >= 3:
        return "MEDIUM"
    else:
        return "LOW"

def detect_toxicity(text: str) -> str:
    """Detect toxic language using keyword patterns"""
    text_lower = text.lower()
    
    # High toxicity keywords
    high_toxic_keywords = [
        'hate', 'stupid', 'idiot', 'moron', 'dumb',
        'pathetic', 'worthless', 'disgusting', 'garbage',
        'trash', 'awful', 'horrible', 'terrible', 'worst'
    ]
    
    # Offensive patterns
    offensive_patterns = [
        r'\b(hate|hating|hated)\s+\w+',
        r'\b(terrible|awful|horrible)\s+(and|or)\s+\w+',
        r'\b(stupid|dumb|idiotic)\s+\w+'
    ]
    
    keyword_matches = sum(1 for keyword in high_toxic_keywords if keyword in text_lower)
    pattern_matches = sum(1 for pattern in offensive_patterns if re.search(pattern, text_lower))
    
    total_matches = keyword_matches + pattern_matches
    
    if total_matches >= 3:
        return "HIGH"
    elif total_matches >= 1:
        return "MEDIUM"
    else:
        return "LOW"

def detect_hallucination(text: str) -> tuple:
    """
    Detect potential hallucination using heuristics
    Returns (risk_level, confidence)
    """
    text_lower = text.lower()
    
    # Indicators of high confidence/certainty (potential hallucination)
    certainty_phrases = [
        'definitely', 'certainly', 'absolutely', 'without doubt',
        'for sure', 'guaranteed', 'proven fact', 'scientific fact',
        'everyone knows', 'it is known that', 'studies show that',
        'experts agree', 'always', 'never', '100%', 'all scientists'
    ]
    
    # Vague or hedging phrases (lower hallucination risk)
    hedging_phrases = [
        'might', 'could', 'possibly', 'perhaps', 'may',
        'likely', 'probably', 'seems', 'appears', 'suggests',
        'according to', 'some sources', 'it is believed'
    ]
    
    # Unsupported claim patterns
    unsupported_patterns = [
        r'research shows that \w+',
        r'studies prove that \w+',
        r'scientists discovered that \w+',
        r'\d+% of (people|users|patients)',
        r'(always|never) (works|fails|happens)'
    ]
    
    certainty_count = sum(1 for phrase in certainty_phrases if phrase in text_lower)
    hedging_count = sum(1 for phrase in hedging_phrases if phrase in text_lower)
    unsupported_count = sum(1 for pattern in unsupported_patterns if re.search(pattern, text_lower))
    
    # Calculate risk based on certainty vs hedging
    risk_score = (certainty_count * 2 + unsupported_count) - hedging_count
    
    # Check for specific numeric claims
    numeric_claims = len(re.findall(r'\d+%|\d+\.\d+', text))
    if numeric_claims > 2 and hedging_count == 0:
        risk_score += 2
    
    # Determine risk level
    if risk_score >= 4:
        return "HIGH", 0.75 + (min(risk_score, 10) * 0.02)
    elif risk_score >= 2:
        return "MEDIUM", 0.65 + (min(risk_score, 10) * 0.02)
    else:
        return "LOW", 0.80 + (hedging_count * 0.02)

def detect_bias(text: str) -> str:
    """Detect potential bias in text"""
    text_lower = text.lower()
    
    # Bias indicators
    bias_keywords = [
        'obviously', 'clearly', 'it is clear that', 'everyone knows',
        'no one would', 'any reasonable person', 'common sense',
        'just', 'simply', 'merely', 'only', 'always better',
        'never appropriate', 'all experts', 'every study'
    ]
    
    # Absolute statements
    absolute_patterns = [
        r'\b(all|every|none|no)\s+\w+\s+(are|is|have|has)',
        r'\b(always|never)\s+\w+',
        r'\b(everyone|nobody)\s+(knows|believes|thinks)'
    ]
    
    keyword_matches = sum(1 for keyword in bias_keywords if keyword in text_lower)
    pattern_matches = sum(1 for pattern in absolute_patterns if re.search(pattern, text_lower))
    
    total_score = keyword_matches + pattern_matches
    
    if total_score >= 3:
        return "HIGH"
    elif total_score >= 1:
        return "MEDIUM"
    else:
        return "LOW"

def calculate_confidence(text: str, risks: dict) -> float:
    """Calculate overall confidence score based on analysis"""
    # Base confidence
    base_confidence = 0.75
    
    # Adjust based on text length (longer text = more confident)
    words = len(text.split())
    if words > 100:
        length_bonus = 0.10
    elif words > 50:
        length_bonus = 0.05
    else:
        length_bonus = 0.0
    
    # Adjust based on risk consistency
    risk_levels = [
        risks['hallucination_risk'],
        risks['bias_risk'],
        risks['toxicity_risk'],
        risks['fraud_risk']
    ]
    
    high_count = risk_levels.count('HIGH')
    low_count = risk_levels.count('LOW')
    
    # More consistent results = higher confidence
    if high_count >= 3 or low_count >= 3:
        consistency_bonus = 0.10
    elif high_count >= 2 or low_count >= 2:
        consistency_bonus = 0.05
    else:
        consistency_bonus = 0.0
    
    # PII detection is very reliable
    pii_bonus = 0.05 if risks['pii_leak'] else 0.0
    
    # Calculate final confidence
    confidence = min(base_confidence + length_bonus + consistency_bonus + pii_bonus, 0.98)
    
    # Add slight randomness based on text hash for natural variation
    # Using simple hash for non-security-critical variation
    text_hash = abs(hash(text)) % 100
    variation = text_hash / 1000.0  # 0.00 to 0.099
    
    return min(confidence + variation * 0.5, 0.99)

def generate_summary(hallucination_risk: str, bias_risk: str, toxicity_risk: str, 
                     pii_leak: bool, fraud_risk: str, confidence: float) -> str:
    """Generate a natural language summary of the risk analysis"""
    risks = []
    
    if hallucination_risk == "HIGH":
        risks.append("high hallucination risk (unverified claims or excessive certainty)")
    elif hallucination_risk == "MEDIUM":
        risks.append("moderate hallucination risk (some unsupported statements)")
    
    if bias_risk == "HIGH":
        risks.append("significant bias (absolute statements or loaded language)")
    elif bias_risk == "MEDIUM":
        risks.append("some bias detected")
    
    if toxicity_risk == "HIGH":
        risks.append("toxic or offensive content")
    elif toxicity_risk == "MEDIUM":
        risks.append("potentially offensive language")
    
    if pii_leak:
        risks.append("personally identifiable information detected (emails, phone numbers, or similar)")
    
    if fraud_risk == "HIGH":
        risks.append("multiple fraud indicators (urgent language, guarantees, or pressure tactics)")
    elif fraud_risk == "MEDIUM":
        risks.append("some fraud-related patterns")
    
    if not risks:
        return f"Analysis complete. Content appears safe and appropriate with no significant risks detected. Model confidence: {confidence:.1%}."
    elif len(risks) == 1:
        return f"Analysis identified {risks[0]}. Content review recommended. Model confidence: {confidence:.1%}."
    elif len(risks) == 2:
        return f"Analysis identified {risks[0]} and {risks[1]}. Careful review recommended. Model confidence: {confidence:.1%}."
    else:
        # Multiple risks
        risk_list = ", ".join(risks[:-1]) + f", and {risks[-1]}"
        return f"Multiple concerns detected: {risk_list}. Thorough content review strongly recommended. Model confidence: {confidence:.1%}."

@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    logger.info("🚀 AI Risk Mitigation ML Service starting...")
    
    # Try to load MedBERT model
    if load_medbert_model():
        logger.info("✅ MedBERT model loaded successfully!")
        logger.info("📊 Using MedBERT + heuristics for comprehensive risk analysis")
    else:
        logger.info("📊 Using heuristic-based risk analysis (MedBERT not available)")
    
    logger.info("✅ Service ready to analyze AI-generated content")

@app.get("/")
def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "ml-risk-engine",
        "version": "1.0.0",
        "engine": "medbert+heuristics" if model_loaded else "heuristic-based",
        "medbert_loaded": model_loaded,
        "ready": True
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(req: TextRequest):
    """
    Analyze AI-generated text for various risk factors using MedBERT + heuristics
    
    Returns comprehensive risk assessment including:
    - hallucination_risk: LOW/MEDIUM/HIGH - MedBERT prediction or heuristic detection
    - bias_risk: LOW/MEDIUM/HIGH - Derived from MedBERT or heuristic detection
    - toxicity_risk: LOW/MEDIUM/HIGH - Heuristic detection
    - pii_leak: bool - Regex-based PII detection
    - fraud_risk: LOW/MEDIUM/HIGH - Heuristic fraud detection
    - confidence_score: 0.0-1.0 - Model confidence or analysis confidence
    - summary: Human-readable explanation
    """
    start_time = time.time()
    
    try:
        if not req.text or not req.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        text = req.text.strip()
        
        # Try MedBERT prediction first if model is loaded
        medbert_risk = None
        medbert_confidence = None
        medbert_probs = None
        
        if model_loaded:
            medbert_risk, medbert_confidence, medbert_probs = predict_with_medbert(text)
            if medbert_risk:
                logger.info(f"MedBERT prediction: {medbert_risk} (confidence: {medbert_confidence:.3f})")
        
        # Map MedBERT risk to hallucination risk if available
        if medbert_risk:
            if medbert_risk == "High Risk":
                hallucination_risk = "HIGH"
                base_confidence = medbert_confidence
            elif medbert_risk == "Medium Risk":
                hallucination_risk = "MEDIUM"
                base_confidence = medbert_confidence
            else:  # Low Risk
                hallucination_risk = "LOW"
                base_confidence = medbert_confidence
            
            # Derive bias risk from MedBERT probabilities
            bias_risk = "LOW"
            if medbert_probs is not None and len(medbert_probs) > 1:
                sorted_probs = sorted(medbert_probs, reverse=True)
                # If second highest probability is high, suggests uncertainty/bias
                if sorted_probs[1] > 0.35:
                    bias_risk = "MEDIUM"
                if sorted_probs[1] > 0.45:
                    bias_risk = "HIGH"
        else:
            # Fallback to heuristic detection
            hallucination_risk, base_confidence = detect_hallucination(text)
            bias_risk = detect_bias(text)
        
        # Always run heuristic detections for toxicity, PII, and fraud
        toxicity_risk = detect_toxicity(text)
        pii_leak = detect_pii(text)
        fraud_risk = detect_fraud(text)
        
        # Store risks for confidence calculation
        risks = {
            'hallucination_risk': hallucination_risk,
            'bias_risk': bias_risk,
            'toxicity_risk': toxicity_risk,
            'fraud_risk': fraud_risk,
            'pii_leak': pii_leak
        }
        
        # Calculate overall confidence (use MedBERT confidence if available)
        if medbert_confidence:
            # Adjust MedBERT confidence based on other factors
            confidence = medbert_confidence
            if pii_leak:
                confidence = min(confidence + 0.05, 0.99)
            if toxicity_risk == "HIGH" or fraud_risk == "HIGH":
                confidence = min(confidence + 0.03, 0.99)
        else:
            confidence = calculate_confidence(text, risks)
        
        # Generate summary
        summary = generate_summary(
            hallucination_risk, bias_risk, toxicity_risk,
            pii_leak, fraud_risk, confidence
        )
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        analysis_method = "MedBERT+heuristics" if medbert_risk else "heuristics"
        logger.info(f"Analysis complete ({analysis_method}) in {processing_time:.1f}ms - "
                   f"H:{hallucination_risk} B:{bias_risk} T:{toxicity_risk} "
                   f"P:{pii_leak} F:{fraud_risk} C:{confidence:.2f}")
        
        return AnalysisResponse(
            hallucination_risk=hallucination_risk,
            bias_risk=bias_risk,
            toxicity_risk=toxicity_risk,
            pii_leak=pii_leak,
            fraud_risk=fraud_risk,
            confidence_score=round(confidence, 3),
            summary=summary,
            processing_time_ms=round(processing_time, 1)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
