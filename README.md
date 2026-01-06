# AI Risk Mitigation System

A comprehensive AI safety platform that provides real-time risk analysis of AI-generated content using machine learning and heuristic-based detection.

## 🎯 Overview

This system analyzes AI-generated text for multiple risk factors:
- **Hallucination Risk**: Detects potentially false or unverified information
- **Bias Risk**: Identifies biased language or perspectives
- **Toxicity Risk**: Flags harmful or offensive content
- **PII Leak**: Detects personally identifiable information
- **Fraud Risk**: Identifies suspicious or fraudulent patterns

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │─────▶│   Node.js    │─────▶│   FastAPI   │
│  Frontend   │◀─────│   Backend    │◀─────│ ML Service  │
│  (Port 5173)│      │  (Port 3000) │      │ (Port 8000) │
└─────────────┘      └──────────────┘      └─────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │   OpenAI     │
                     │   GPT-4o     │
                     └──────────────┘
```

### Flow:
1. User enters a prompt in the React frontend
2. Frontend sends prompt to Node.js backend
3. Backend calls OpenAI API to generate response
4. Backend sends AI response to ML Service for risk analysis
5. ML Service returns comprehensive risk flags
6. Backend combines AI response + risk flags
7. Frontend displays response with risk indicators

## 🚀 Getting Started

### Prerequisites

- Node.js 22.16.0+
- Python 3.12+
- OpenAI API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jiya2401/AI-RISK-MITIGATION-SYSTEM.git
cd AI-RISK-MITIGATION-SYSTEM
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Install Backend dependencies**
```bash
cd mitigation/BaatGPT/Backend
npm install
```

4. **Install Frontend dependencies**
```bash
cd ../frontend
npm install
```

5. **Set up environment variables**

Create a `.env` file in the Backend directory:
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
ML_SERVICE_URL=http://localhost:8000
PORT=3000
```

### Running the System

You need to start three services:

#### 1. Start ML Service (Terminal 1)
```bash
cd mitigation/BaatGPT/Backend
python3 ml_service_fastapi.py
# Service runs on http://localhost:8000
```

#### 2. Start Backend (Terminal 2)
```bash
cd mitigation/BaatGPT/Backend
npm start
# Or: node server.js
# Service runs on http://localhost:3000
```

#### 3. Start Frontend (Terminal 3)
```bash
cd mitigation/BaatGPT/frontend
npm run dev
# Service runs on http://localhost:5173
```

Now open http://localhost:5173 in your browser!

## 📊 ML Risk Analysis

### Risk Categories

#### Hallucination Risk (LOW/MEDIUM/HIGH)
Detects absolutist language patterns that may indicate false certainty:
- Keywords: "definitely", "absolutely", "guaranteed", "without doubt"
- High confidence statements without qualifiers

#### Bias Risk (LOW/MEDIUM/HIGH)
Identifies potentially biased language:
- Keywords: "always", "never", "all", "none", "everyone"
- Absolutist generalizations

#### Toxicity Risk (LOW/MEDIUM/HIGH)
Flags harmful or offensive content:
- Keywords: "hate", "stupid", "idiot", "terrible"
- Negative and aggressive language

#### Fraud Risk (LOW/MEDIUM/HIGH)
Detects suspicious patterns:
- Keywords: "guaranteed", "free money", "limited time", "act now"
- Urgency and pressure tactics

#### PII Leak (YES/NO)
Detects personally identifiable information:
- Email addresses
- Phone numbers
- Social Security Numbers
- Credit card numbers
- Physical addresses

### API Endpoints

#### POST /analyze
Analyzes text for all risk factors.

**Request:**
```json
{
  "text": "Your AI-generated content here"
}
```

**Response:**
```json
{
  "hallucination_risk": "MEDIUM",
  "bias_risk": "LOW",
  "toxicity_risk": "LOW",
  "pii_leak": false,
  "fraud_risk": "LOW",
  "confidence_score": 0.75,
  "ml_prediction": "medium risk",
  "processing_time_ms": 12.34
}
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu",
  "timestamp": 1767677556.389
}
```

## 🎨 Frontend Features

- **Real-time Risk Analysis**: See risk flags as they're generated
- **Professional UI**: Clean, enterprise-grade design
- **Dark/Light Theme**: Seamless theme switching
- **Mobile Responsive**: Works on all devices
- **Streaming Support**: Optional streaming mode for faster responses
- **Risk Visualization**: Color-coded risk indicators (🟢 Low, 🟡 Medium, 🔴 High)

## 🔒 Security & Privacy

- ML service runs locally - no data sent to third parties
- PII detection prevents accidental data leaks
- Timeout protection prevents service blocking
- Graceful fallback when ML service unavailable

## 📝 Future Enhancements

- [ ] Fine-tune MedBERT model on domain-specific data
- [ ] Add more sophisticated NLP analysis
- [ ] Implement user feedback loop for model improvement
- [ ] Add batch analysis API
- [ ] Export risk reports as PDF
- [ ] Add custom risk threshold configuration
- [ ] Implement advanced toxicity detection (Perspective API)
- [ ] Add multilingual support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- MedBERT model by Emily Alsentzer
- FastAPI framework
- React and Vite
- OpenAI GPT-4o-mini
- Transformers library by Hugging Face
