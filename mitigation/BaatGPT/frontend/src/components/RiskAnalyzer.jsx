import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ResultCard from './ResultCard';

const API_URL = 'https://ai-risk-mitigation-system-2.onrender.com/analyze';

export default function RiskAnalyzer() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const analyzeRisk = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze text. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      analyzeRisk();
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            AI Risk Mitigation System
          </h1>
          <p className="text-gray-400 text-lg">
            Production-grade AI Safety & Risk Analysis
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-8 animate-slide-up">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 shadow-xl">
            <label htmlFor="text-input" className="block text-gray-300 font-medium mb-3">
              Enter AI-generated content for analysis:
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste your AI-generated text here..."
              className="w-full h-48 bg-dark-bg border border-dark-border rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-none"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                {text.length} characters • Press Ctrl+Enter to analyze
              </span>
              <button
                onClick={analyzeRisk}
                disabled={loading || !text.trim()}
                className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {loading ? 'Analyzing...' : 'Analyze Risk'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-dark-card border border-dark-border rounded-lg p-12 text-center">
              <LoadingSpinner />
              <p className="text-gray-400 mt-4">Analyzing AI-generated content...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Results Dashboard */}
        {results && !loading && (
          <div className="max-w-7xl mx-auto animate-fade-in">
            {/* Risk Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <ResultCard title="Hallucination Risk" value={results.hallucination_risk} type="risk" />
              <ResultCard title="Bias Risk" value={results.bias_risk} type="risk" />
              <ResultCard title="Toxicity Risk" value={results.toxicity_risk} type="risk" />
              <ResultCard title="Fraud Risk" value={results.fraud_risk} type="risk" />
              <ResultCard title="PII Leak Detection" value={results.pii_leak} type="pii" />
              <ResultCard title="Confidence Score" value={results.confidence_score} type="confidence" />
            </div>

            {/* Summary Section */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-6 animate-slide-up">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">
                  {results.hallucination_risk === 'HIGH' || results.bias_risk === 'HIGH' || 
                   results.toxicity_risk === 'HIGH' || results.fraud_risk === 'HIGH' || results.pii_leak
                    ? '⚠️'
                    : '✅'}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">Analysis Summary</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {results.summary || 'Analysis completed successfully.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <ResultCard title="Engine Used" value={results.engine_used || 'heuristics'} type="text" />
              <ResultCard 
                title="Processing Time" 
                value={`${results.processing_time_ms?.toFixed(2) || '0.00'} ms`} 
                type="text" 
              />
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-6 border-t border-dark-border mt-12">
        <p>AI Risk Mitigation System • Production-grade AI Safety Analysis</p>
      </footer>
    </div>
  );
}
