// Backend/routes/chat.js
import express from 'express';
import axios from 'axios';
import { generateText } from '../utils/openai.js';

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT = 10000; // 10 seconds timeout for ML service

// Health proxy to the ML service
router.get('/ml/health', async (req, res) => {
  try {
    const r = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 5000 });
    res.json({ ml_service_status: 'connected', ...r.data });
  } catch (e) {
    res.status(503).json({ ml_service_status: 'disconnected', error: e.message });
  }
});

// User input -> OpenAI -> ML Risk Analysis
router.post('/thread', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: 'prompt is required' });

    console.log(`[${new Date().toISOString()}] Processing prompt: ${prompt.substring(0, 50)}...`);

    // 1) Generate text with OpenAI
    const openaiOutput = await generateText(prompt);

    if (!openaiOutput) {
      return res.status(400).json({ success: false, error: 'Failed to generate text from OpenAI' });
    }

    const openaiTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] OpenAI response received in ${openaiTime}ms`);

    // 2) Send generated text to ML service for risk analysis with timeout and fallback
    let mlFlags = { status: 'unavailable' };
    const mlStartTime = Date.now();
    
    try {
      const mlResp = await axios.post(
        `${ML_SERVICE_URL}/analyze`,
        { text: openaiOutput },
        { timeout: ML_TIMEOUT }
      );

      const mlTime = Date.now() - mlStartTime;
      console.log(`[${new Date().toISOString()}] ML analysis completed in ${mlTime}ms`);
      
      // Map the ML response to our mlFlags format
      mlFlags = {
        hallucination_risk: mlResp.data.hallucination_risk,
        bias_risk: mlResp.data.bias_risk,
        toxicity_risk: mlResp.data.toxicity_risk,
        pii_leak: mlResp.data.pii_leak,
        fraud_risk: mlResp.data.fraud_risk,
        confidence_score: mlResp.data.confidence_score,
        processing_time_ms: mlResp.data.processing_time_ms,
        status: 'success'
      };
    } catch (mlErr) {
      // ML service failed or timed out - don't block the chat response
      const mlTime = Date.now() - mlStartTime;
      console.error(`[${new Date().toISOString()}] ML service error after ${mlTime}ms:`, mlErr.message);
      mlFlags = { status: 'unavailable', error: mlErr.message };
    }

    // 3) Return combined response
    const totalTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Total request time: ${totalTime}ms`);
    
    return res.json({
      success: true,
      reply: openaiOutput,
      openai_output: openaiOutput,
      mlFlags: mlFlags,
      timing: {
        openai_ms: openaiTime,
        ml_ms: mlFlags.processing_time_ms || 0,
        total_ms: totalTime
      }
    });
  } catch (err) {
    console.error('Pipeline error:', err?.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: 'Generation or risk scoring failed',
      details: err.message
    });
  }
});

// Streaming variant: send OpenAI output first, then ML flags when ready
router.post('/thread/stream', async (req, res) => {
  // SSE-like chunked responses
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'prompt is required' })}\n\n`);
      return res.end();
    }

    console.log(`[${new Date().toISOString()}] Streaming: Processing prompt`);

    // 1) Generate text with OpenAI
    const openaiOutput = await generateText(prompt);
    if (!openaiOutput) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'OpenAI generation failed' })}\n\n`);
      return res.end();
    }

    // Send OpenAI output immediately
    console.log(`[${new Date().toISOString()}] Streaming: Sending OpenAI output`);
    res.write(`data: ${JSON.stringify({ type: 'openai', text: openaiOutput })}\n\n`);

    // 2) Call ML service for risk analysis with timeout and fallback
    try {
      const mlResp = await axios.post(
        `${ML_SERVICE_URL}/analyze`,
        { text: openaiOutput },
        { timeout: ML_TIMEOUT }
      );

      console.log(`[${new Date().toISOString()}] Streaming: ML analysis completed`);
      
      // Send ML flags
      res.write(
        `data: ${JSON.stringify({
          type: 'ml',
          mlFlags: {
            hallucination_risk: mlResp.data.hallucination_risk,
            bias_risk: mlResp.data.bias_risk,
            toxicity_risk: mlResp.data.toxicity_risk,
            pii_leak: mlResp.data.pii_leak,
            fraud_risk: mlResp.data.fraud_risk,
            confidence_score: mlResp.data.confidence_score,
            status: 'success'
          }
        })}\n\n`
      );
    } catch (mlErr) {
      console.error(`[${new Date().toISOString()}] Streaming: ML service error:`, mlErr.message);
      res.write(
        `data: ${JSON.stringify({
          type: 'ml',
          mlFlags: { status: 'unavailable', error: mlErr.message }
        })}\n\n`
      );
    }

    // Done
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    return res.end();
  } catch (err) {
    console.error('Stream pipeline error:', err?.response?.data || err?.message || err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Generation or scoring failed' })}\n\n`);
    return res.end();
  }
});

export default router;
