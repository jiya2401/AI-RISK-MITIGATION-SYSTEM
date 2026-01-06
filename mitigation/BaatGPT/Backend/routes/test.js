// Test route for UI testing without OpenAI
import express from 'express';
import axios from 'axios';

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT = 10000; // 10 seconds timeout

// Mock OpenAI response for UI testing with real ML analysis
router.post('/test-ui', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: 'prompt is required' });

    // Simulate OpenAI-like response based on prompt
    let mockResponse = "Based on your query, here's what I can tell you: ";
    
    // Add different responses based on keywords for demo
    if (prompt.toLowerCase().includes('email') || prompt.toLowerCase().includes('contact')) {
      mockResponse += "You can contact our support team at support@example.com or call us at 555-123-4567. We're here to help with any questions you may have!";
    } else if (prompt.toLowerCase().includes('price') || prompt.toLowerCase().includes('cost')) {
      mockResponse += "Our pricing is absolutely the best in the market, guaranteed! Everyone agrees this is definitely the most affordable option without any doubt whatsoever. Act now for this limited time offer!";
    } else if (prompt.toLowerCase().includes('bad') || prompt.toLowerCase().includes('negative')) {
      mockResponse += "That idea is terrible and stupid. I hate that suggestion, it's the worst thing I've ever heard. It's completely horrible and awful.";
    } else {
      mockResponse += "I'd be happy to help you with that. Let me provide some information that might be useful for your situation. Perhaps you could provide more details about what specifically you're looking for?";
    }

    const openaiTime = Date.now() - startTime;

    // Call real ML service for risk analysis
    let mlFlags = { status: 'unavailable' };
    const mlStartTime = Date.now();
    
    try {
      const mlResp = await axios.post(
        `${ML_SERVICE_URL}/analyze`,
        { text: mockResponse },
        { timeout: ML_TIMEOUT }
      );

      const mlTime = Date.now() - mlStartTime;
      console.log(`[${new Date().toISOString()}] Test mode ML analysis completed in ${mlTime}ms`);
      
      mlFlags = {
        hallucination_risk: mlResp.data.hallucination_risk,
        bias_risk: mlResp.data.bias_risk,
        toxicity_risk: mlResp.data.toxicity_risk,
        pii_leak: mlResp.data.pii_leak,
        fraud_risk: mlResp.data.fraud_risk,
        confidence_score: mlResp.data.confidence_score,
        summary: mlResp.data.summary,
        processing_time_ms: mlResp.data.processing_time_ms,
        status: 'success'
      };
    } catch (mlErr) {
      console.error(`[${new Date().toISOString()}] Test mode ML service error:`, mlErr.message);
      mlFlags = { status: 'unavailable', error: mlErr.message };
    }

    const totalTime = Date.now() - startTime;

    return res.json({
      success: true,
      reply: mockResponse,
      openai_output: mockResponse,
      mlFlags: mlFlags,
      timing: {
        openai_ms: openaiTime,
        ml_ms: mlFlags.processing_time_ms || 0,
        total_ms: totalTime
      }
    });
  } catch (err) {
    console.error('Test endpoint error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Test endpoint failed'
    });
  }
});

export default router;
