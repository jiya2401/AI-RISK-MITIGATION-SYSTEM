import { useState, useEffect } from 'react';
import RiskBadge from './RiskBadge';

export default function Reports() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    setHistory(data.reverse());
  };

  const getMaxRisk = (analysis) => {
    const risks = [
      analysis.hallucination_risk,
      analysis.bias_risk,
      analysis.toxicity_risk,
      analysis.fraud_risk,
    ];
    if (risks.includes('HIGH')) return 'HIGH';
    if (risks.includes('MEDIUM')) return 'MEDIUM';
    return 'LOW';
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'ALL' || getMaxRisk(item) === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const exportJSON = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk-analysis-report-${new Date().toISOString()}.json`;
    link.click();
  };

  const copySummary = () => {
    const summary = `AI Risk Analysis Report
Generated: ${new Date().toLocaleString()}
Total Scans: ${history.length}

Risk Distribution:
- HIGH: ${history.filter(h => getMaxRisk(h) === 'HIGH').length}
- MEDIUM: ${history.filter(h => getMaxRisk(h) === 'MEDIUM').length}
- LOW: ${history.filter(h => getMaxRisk(h) === 'LOW').length}

PII Leaks Detected: ${history.filter(h => h.pii_leak).length}
Average Confidence: ${(history.reduce((sum, h) => sum + (h.confidence_score || 0), 0) / history.length * 100).toFixed(1)}%
`;
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('analysisHistory');
      setHistory([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Reports / History</h2>
          <p className="text-gray-400">View and export your analysis history</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copySummary}
            className="px-4 py-2 bg-accent-purple/20 border border-accent-purple text-accent-purple rounded-xl hover:bg-accent-purple/30 transition-colors font-medium"
          >
            📋 Copy Summary
          </button>
          <button
            onClick={exportJSON}
            className="px-4 py-2 bg-accent-blue/20 border border-accent-blue text-accent-blue rounded-xl hover:bg-accent-blue/30 transition-colors font-medium"
          >
            💾 Export JSON
          </button>
          <button
            onClick={clearHistory}
            className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors font-medium"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search analysis..."
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="ALL">All Risks</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <div className="text-sm text-gray-400 mb-4">
          Showing {filteredHistory.length} of {history.length} scans
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No Reports Found</h3>
            <p className="text-gray-400">Run some analyses to build your history</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredHistory.map((item, idx) => (
              <div
                key={idx}
                className="bg-dark-bg border border-dark-border rounded-xl p-4 hover:border-accent-blue/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <RiskBadge risk={getMaxRisk(item)} size="sm" />
                      {item.pii_leak && (
                        <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500 rounded-full">
                          PII Leak
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">{item.text?.substring(0, 150)}...</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Hallucination:</span>
                    <span className={`ml-1 font-semibold ${
                      item.hallucination_risk === 'HIGH' ? 'text-red-400' :
                      item.hallucination_risk === 'MEDIUM' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {item.hallucination_risk}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bias:</span>
                    <span className={`ml-1 font-semibold ${
                      item.bias_risk === 'HIGH' ? 'text-red-400' :
                      item.bias_risk === 'MEDIUM' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {item.bias_risk}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Toxicity:</span>
                    <span className={`ml-1 font-semibold ${
                      item.toxicity_risk === 'HIGH' ? 'text-red-400' :
                      item.toxicity_risk === 'MEDIUM' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {item.toxicity_risk}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fraud:</span>
                    <span className={`ml-1 font-semibold ${
                      item.fraud_risk === 'HIGH' ? 'text-red-400' :
                      item.fraud_risk === 'MEDIUM' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {item.fraud_risk}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Confidence:</span>
                    <span className="ml-1 font-semibold text-accent-blue">
                      {Math.round((item.confidence_score || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {item.summary && (
                  <p className="text-gray-400 text-xs mt-3 italic">{item.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
