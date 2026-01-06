# AI Risk Mitigation System - Deployment Guide

## Overview

This guide covers deploying the AI Risk Mitigation System to production, specifically targeting Render deployment.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│ ML Service  │
│  (React)    │         │  (Node.js)   │         │  (FastAPI)  │
│  Port: 5173 │         │  Port: 3000  │         │  Port: 8000 │
└─────────────┘         └──────────────┘         └─────────────┘
```

## Quick Start (Local Development)

### 1. Start ML Service

```bash
cd /path/to/AI-RISK-MITIGATION-SYSTEM

# Install Python dependencies
pip install -r requirements.txt

# Start ML service
uvicorn ml_service:app --host 0.0.0.0 --port 8000
```

**Endpoints:**
- Health: `GET http://localhost:8000/`
- Analyze: `POST http://localhost:8000/analyze`
- API Docs: `GET http://localhost:8000/docs`

### 2. Start Backend Server

```bash
cd mitigation/BaatGPT/Backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
ML_SERVICE_URL=http://localhost:8000
PORT=3000
OPENAI_API_KEY=your_openai_key_here
EOF

# Start backend
node server.js
```

### 3. Start Frontend

```bash
cd mitigation/BaatGPT/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Access:** http://localhost:5173

## Render Deployment

### Option 1: Single Service (Recommended for Demo)

Deploy ML service and backend together:

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y nodejs npm curl

WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML service
COPY ml_service.py .
COPY saved_medbert_model ./saved_medbert_model

# Copy backend
COPY mitigation/BaatGPT/Backend ./backend
WORKDIR /app/backend
RUN npm install

WORKDIR /app

# Start script
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 8000 3000

CMD ["./start.sh"]
```

**start.sh:**
```bash
#!/bin/bash
# Start ML service in background
cd /app
uvicorn ml_service:app --host 0.0.0.0 --port 8000 &

# Start backend
cd /app/backend
ML_SERVICE_URL=http://localhost:8000 PORT=3000 node server.js
```

### Option 2: Separate Services

**ML Service (Render Web Service):**
```yaml
# render.yaml for ML service
services:
  - type: web
    name: ai-risk-ml-service
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn ml_service:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PORT
        value: 8000
```

**Backend Service (Render Web Service):**
```yaml
# render.yaml for backend
services:
  - type: web
    name: ai-risk-backend
    env: node
    buildCommand: cd mitigation/BaatGPT/Backend && npm install
    startCommand: cd mitigation/BaatGPT/Backend && node server.js
    envVars:
      - key: ML_SERVICE_URL
        value: https://ai-risk-ml-service.onrender.com
      - key: PORT
        value: 3000
      - key: OPENAI_API_KEY
        sync: false
```

## Environment Variables

### ML Service
- None required (uses heuristic-based analysis)

### Backend
- `ML_SERVICE_URL`: URL of ML service (required)
- `PORT`: Backend port (default: 3000)
- `OPENAI_API_KEY`: OpenAI API key (optional, for real chat)
- `MONGODB_URI`: MongoDB connection string (optional)

### Frontend
- `VITE_API_URL`: Backend API URL (optional, defaults to /api proxy)

## Testing Deployment

### 1. Test ML Service

```bash
# Health check
curl https://your-ml-service.onrender.com/

# Analyze endpoint
curl -X POST https://your-ml-service.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Act now for guaranteed results!"}'
```

**Expected response:**
```json
{
  "hallucination_risk": "HIGH",
  "bias_risk": "LOW",
  "toxicity_risk": "LOW",
  "pii_leak": false,
  "fraud_risk": "HIGH",
  "confidence_score": 0.84,
  "summary": "Analysis identified...",
  "processing_time_ms": 1.2
}
```

### 2. Test Backend

```bash
# Health check
curl https://your-backend.onrender.com/

# Test UI endpoint (demo mode)
curl -X POST https://your-backend.onrender.com/api/test-ui \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Tell me about prices"}'
```

### 3. Test Frontend

Open in browser: https://your-frontend.onrender.com

Test scenarios:
1. **High Risk**: "Tell me about your prices and special offers"
   - Should show HIGH hallucination and fraud risks
2. **PII**: "Contact me at test@example.com"
   - Should show PII detected
3. **Clean**: "What is the weather like?"
   - Should show "No significant risks detected"

## Performance Optimization

### ML Service
- **Response time**: <3ms average
- **Memory**: ~200MB
- **CPU**: Minimal (heuristic-based)

### Scaling Recommendations
- ML service: 1 instance sufficient for moderate traffic
- Backend: Scale based on chat volume
- Use Redis for session management if needed

## Monitoring

### Key Metrics to Monitor

**ML Service:**
- Response time (should be <10ms)
- Error rate (should be <1%)
- Request volume

**Backend:**
- ML service connection errors
- OpenAI API errors (if using real chat)
- Response times

### Health Check Endpoints

- ML Service: `GET /`
- Backend: `GET /`
- Backend ML Status: `GET /api/ml/health`

## Security Checklist

- [ ] Update CORS origins in `ml_service.py` to specific domains
- [ ] Set proper environment variables in Render dashboard
- [ ] Enable HTTPS (automatic on Render)
- [ ] Rate limit ML service endpoint
- [ ] Monitor for abuse

## Troubleshooting

### ML Service Issues

**Problem:** Service won't start
```bash
# Check Python version
python --version  # Should be 3.11+

# Verify dependencies
pip list | grep -E "(fastapi|uvicorn|transformers)"
```

**Problem:** Slow responses
- Check if running on CPU (expected) or GPU
- Verify no blocking operations in endpoint
- Check Render instance specs

### Backend Issues

**Problem:** Can't connect to ML service
```bash
# Test ML service URL
curl $ML_SERVICE_URL/

# Check environment variables
echo $ML_SERVICE_URL
```

**Problem:** CORS errors
- Update CORS settings in `ml_service.py`
- Ensure frontend URL is allowed

### Frontend Issues

**Problem:** API requests fail
- Check proxy configuration in `vite.config.js`
- Verify backend URL
- Check browser console for errors

## Production Checklist

- [ ] ML service deployed and accessible
- [ ] Backend deployed with correct ML_SERVICE_URL
- [ ] Frontend built and deployed
- [ ] All environment variables set
- [ ] Health checks passing
- [ ] Test scenarios verified
- [ ] CORS configured for production domains
- [ ] Monitoring enabled
- [ ] Error logging configured

## Support

For issues or questions:
1. Check `/docs` endpoint on ML service for API documentation
2. Review logs in Render dashboard
3. Test each service independently
4. Verify environment variables

---

**Last Updated:** 2026-01-06
**Version:** 1.0.0
