import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import RiskBadge from './RiskBadge';

const API_URL = 'https://ai-risk-mitigation-system-2.onrender.com/analyze';

export default function AnalyzerChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const runDemo = () => {
    const demoText = "Get rich quick! Send me your credit card details and I'll make you $10,000 in just 24 hours! My AI system guarantees 100% returns. Call now at [DEMO-PHONE] or email demo@example.com. This is a limited time offer!";
    setInput(demoText);
  };

  const analyzeText = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      
      const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
      history.push({ ...data, text: input, timestamp: new Date().toISOString() });
      localStorage.setItem('analysisHistory', JSON.stringify(history));

      const botMessage = { role: 'assistant', content: data };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: { error: error.message || 'Failed to analyze text' },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeText();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-white mb-2">AI Risk Analyzer</h2>
        <p className="text-gray-400">ChatGPT-style interface for risk analysis</p>
      </div>

      <div className="flex-1 bg-dark-card border border-dark-border rounded-2xl p-6 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">Start Analyzing</h3>
              <p className="text-gray-400 mb-4">Enter text below or run a demo to see the analysis</p>
              <button
                onClick={runDemo}
                className="px-4 py-2 bg-accent-purple/20 border border-accent-purple text-accent-purple rounded-lg hover:bg-accent-purple/30 transition-colors"
              >
                🎯 Run Demo
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[70%] bg-accent-blue/20 border border-accent-blue/30 rounded-2xl px-4 py-3">
                  <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="max-w-[85%] bg-dark-bg border border-dark-border rounded-2xl p-4 space-y-3">
                  {msg.content.error ? (
                    <p className="text-red-400">{msg.content.error}</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <div className="text-xs text-gray-500 w-full mb-1">Risk Assessment:</div>
                        <div className="space-y-1 w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm w-32">Hallucination:</span>
                            <RiskBadge risk={msg.content.hallucination_risk} size="sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm w-32">Bias:</span>
                            <RiskBadge risk={msg.content.bias_risk} size="sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm w-32">Toxicity:</span>
                            <RiskBadge risk={msg.content.toxicity_risk} size="sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm w-32">Fraud:</span>
                            <RiskBadge risk={msg.content.fraud_risk} size="sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm w-32">PII Leak:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${msg.content.pii_leak ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                              {msg.content.pii_leak ? '⚠ Detected' : '✓ None'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Confidence:</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-dark-border rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-accent-blue to-accent-purple h-full rounded-full transition-all duration-500"
                              style={{ width: `${(msg.content.confidence_score || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-accent-blue font-semibold text-sm">
                            {Math.round((msg.content.confidence_score || 0) * 100)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Summary:</div>
                        <p className="text-gray-300 text-sm">{msg.content.summary || 'Analysis complete.'}</p>
                      </div>

                      <details className="text-xs">
                        <summary className="text-gray-500 cursor-pointer hover:text-gray-400">
                          View JSON Details
                        </summary>
                        <pre className="mt-2 p-2 bg-dark-card rounded border border-dark-border overflow-x-auto text-gray-400">
                          {JSON.stringify(msg.content, null, 2)}
                        </pre>
                      </details>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-dark-bg border border-dark-border rounded-2xl p-4">
              <LoadingSpinner />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={runDemo}
          className="px-4 py-3 bg-accent-purple/20 border border-accent-purple text-accent-purple rounded-xl hover:bg-accent-purple/30 transition-colors font-medium"
        >
          🎯 Run Demo
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter text to analyze..."
          className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          disabled={loading}
        />
        <button
          onClick={analyzeText}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Analyze
        </button>
      </div>
    </div>
  );
}
