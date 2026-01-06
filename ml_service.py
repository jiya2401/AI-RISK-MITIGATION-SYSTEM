from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="AI Risk Mitigation ML Service")

class TextRequest(BaseModel):
    text: str

@app.get("/")
def health():
    return {"status": "ok", "service": "ml-risk-engine"}

@app.post("/analyze")
def analyze(req: TextRequest):
    return {
        "hallucination_risk": "LOW",
        "bias_risk": "LOW",
        "toxicity_risk": "LOW",
        "pii_leak": False,
        "fraud_risk": "LOW",
        "confidence_score": 0.95
    }
