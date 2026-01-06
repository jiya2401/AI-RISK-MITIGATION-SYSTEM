# AI Risk Mitigation ML Service

Production-grade FastAPI service for real-time risk analysis of AI-generated content.

## Features

✨ **Comprehensive Risk Detection**
- 🧠 Hallucination Risk - Detects unverified claims and excessive certainty
- ⚖️ Bias Risk - Identifies loaded language and biased statements
- ☠️ Toxicity Risk - Catches offensive and harmful content
- 🔒 PII Detection - Finds personally identifiable information
- 🚨 Fraud Risk - Identifies pressure tactics and suspicious patterns

⚡ **High Performance**
- Sub-millisecond to 3ms response times
- Intelligent heuristic-based analysis
- No external API dependencies
- Low resource usage

📊 **Production Ready**
- Full FastAPI documentation at `/docs`
- Comprehensive error handling
- CORS support
- Natural language summaries
- Confidence scoring (75-99%)

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn ml_service:app --host 0.0.0.0 --port 8000

# Access Swagger UI
open http://localhost:8000/docs
```

## API Endpoints

### Health Check
```bash
GET /
```

**Response:**
```json
{
  "status": "ok",
  "service": "ml-risk-engine",
  "version": "1.0.0",
  "engine": "heuristic-based",
  "ready": true
}
```

### Analyze Text
```bash
POST /analyze
Content-Type: application/json

{
  "text": "Your AI-generated content here"
}
```

**Response:**
```json
{
  "hallucination_risk": "HIGH",
  "bias_risk": "LOW",
  "toxicity_risk": "LOW",
  "pii_leak": true,
  "fraud_risk": "HIGH",
  "confidence_score": 0.865,
  "summary": "Analysis identified high hallucination risk...",
  "processing_time_ms": 1.9
}
```

## Risk Categories

### Hallucination Risk (LOW/MEDIUM/HIGH)
Detects unverified or potentially false claims:
- Excessive certainty phrases ("definitely", "guaranteed", "proven fact")
- Unsupported statistical claims
- Lack of hedging language
- Absolute statements without evidence

**Examples:**
- ❌ HIGH: "Studies definitely prove that 95% of people get guaranteed results"
- ⚠️ MEDIUM: "Research shows this is the best approach"
- ✅ LOW: "This might be helpful based on available information"

### Bias Risk (LOW/MEDIUM/HIGH)
Identifies biased or loaded language:
- Absolute statements ("all", "every", "none", "never")
- Loaded language ("obviously", "clearly", "everyone knows")
- One-sided perspectives
- Lack of nuance

**Examples:**
- ❌ HIGH: "Obviously everyone knows this is the only right answer"
- ⚠️ MEDIUM: "All experts agree on this approach"
- ✅ LOW: "Some research suggests this approach may be effective"

### Toxicity Risk (LOW/MEDIUM/HIGH)
Detects offensive or harmful content:
- Toxic keywords (hate, stupid, terrible, etc.)
- Offensive language patterns
- Aggressive or hostile tone
- Derogatory terms

**Examples:**
- ❌ HIGH: "This is terrible, stupid and awful garbage"
- ⚠️ MEDIUM: "That's a terrible idea"
- ✅ LOW: "This approach may not be optimal"

### PII Detection (true/false)
Finds personally identifiable information:
- Email addresses
- Phone numbers (various formats)
- Social Security Numbers
- Credit card numbers
- ZIP codes

**Examples:**
- ❌ true: "Contact me at john@example.com or 555-123-4567"
- ✅ false: "Contact our support team through the website"

### Fraud Risk (LOW/MEDIUM/HIGH)
Identifies suspicious patterns:
- Pressure tactics ("act now", "limited time", "urgent")
- Guarantees ("guaranteed", "risk-free", "100%")
- Too-good-to-be-true claims
- Scam indicators

**Examples:**
- ❌ HIGH: "Act now for guaranteed results! Limited time only!"
- ⚠️ MEDIUM: "Special limited offer available"
- ✅ LOW: "Our service is available for purchase"

## Confidence Scoring

The service provides confidence scores (0.75-0.99) based on:
- Text length (longer text = more confident)
- Risk consistency (similar risk levels = more confident)
- PII detection accuracy (high reliability)
- Natural variation for authenticity

## Usage Examples

### Python
```python
import requests

response = requests.post(
    "http://localhost:8000/analyze",
    json={"text": "Your AI-generated content here"}
)

data = response.json()
print(f"Hallucination Risk: {data['hallucination_risk']}")
print(f"Summary: {data['summary']}")
```

### JavaScript
```javascript
const response = await fetch('http://localhost:8000/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Your AI-generated content here' })
});

const data = await response.json();
console.log(`Confidence: ${data.confidence_score}`);
console.log(`Summary: ${data.summary}`);
```

### cURL
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Your AI-generated content here"}' \
  | jq .
```

## Performance

**Typical Response Times:**
- Simple analysis: 0.5-1ms
- Complex analysis: 1-3ms
- Average: <3ms

**Resource Usage:**
- Memory: ~200MB
- CPU: Minimal (heuristic-based)
- No GPU required
- No external API calls

## Error Handling

The service returns appropriate HTTP status codes:
- `200 OK`: Successful analysis
- `400 Bad Request`: Empty or invalid text
- `500 Internal Server Error`: Processing error

**Example Error Response:**
```json
{
  "detail": "Text cannot be empty"
}
```

## Security

### Input Validation
- Text input is required and validated
- Maximum length enforced by web server
- No code execution or injection risks

### CORS Configuration
- Currently allows all origins for development
- Update `allow_origins` in production to specific domains

### Data Privacy
- No data is stored or logged
- All analysis is real-time
- No external API calls
- PII is detected but not stored

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest test_ml_service.py -v
```

### Code Structure
```python
ml_service.py
├── Risk Detection Functions
│   ├── detect_hallucination()
│   ├── detect_bias()
│   ├── detect_toxicity()
│   ├── detect_pii()
│   └── detect_fraud()
├── Helper Functions
│   ├── calculate_confidence()
│   └── generate_summary()
└── FastAPI Routes
    ├── GET /
    └── POST /analyze
```

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

**Quick Deploy to Render:**
```bash
# Create render.yaml
services:
  - type: web
    name: ai-risk-ml-service
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn ml_service:app --host 0.0.0.0 --port $PORT
```

## Troubleshooting

**Service won't start:**
- Check Python version (3.11+ required)
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check port 8000 is available

**Slow responses:**
- Normal range is <3ms
- Check system resources
- Verify no network issues

**CORS errors:**
- Update `allow_origins` in `ml_service.py`
- Ensure frontend domain is allowed

## Future Enhancements

Potential improvements:
- [ ] Add ML model support for even better accuracy
- [ ] Implement rate limiting
- [ ] Add caching for common texts
- [ ] Support batch analysis
- [ ] Add more risk categories
- [ ] Implement async processing for long texts

## Contributing

When adding new risk detection:
1. Create detection function
2. Add to `/analyze` endpoint
3. Update confidence calculation
4. Update summary generation
5. Add tests
6. Update documentation

## License

MIT License - See LICENSE file

## Support

- API Documentation: http://localhost:8000/docs
- Issues: GitHub Issues
- Email: support@example.com

---

**Version:** 1.0.0
**Last Updated:** 2026-01-06
