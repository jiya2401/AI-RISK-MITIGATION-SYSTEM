// Test route for UI testing without OpenAI
import express from 'express';

const router = express.Router();

// Mock OpenAI response for UI testing
router.post('/test-ui', async (req, res) => {
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

    // Always return success with mock ML flags
    return res.json({
      success: true,
      reply: mockResponse,
      openai_output: mockResponse,
      mlFlags: {
        hallucination_risk: "MEDIUM",
        bias_risk: "LOW",
        toxicity_risk: "LOW",
        pii_leak: prompt.toLowerCase().includes('email') || prompt.toLowerCase().includes('contact'),
        fraud_risk: prompt.toLowerCase().includes('price') ? "HIGH" : "LOW",
        confidence_score: 0.75,
        processing_time_ms: 12.5,
        status: 'success'
      },
      timing: {
        openai_ms: 100,
        ml_ms: 12.5,
        total_ms: 112.5
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
