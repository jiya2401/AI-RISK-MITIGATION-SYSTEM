export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-400">Configure your AI Risk Mitigation System</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-dark-border">
              <span className="text-gray-400">API Endpoint</span>
              <span className="text-gray-300 text-sm">ai-risk-mitigation-system-2.onrender.com</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-dark-border">
              <span className="text-gray-400">Version</span>
              <span className="text-gray-300">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-dark-border">
              <span className="text-gray-400">Engine</span>
              <span className="text-gray-300">Heuristics + MedBERT</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Status</span>
              <span className="text-green-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Operational
              </span>
            </div>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
                alert(`You have ${history.length} analyses stored locally`);
              }}
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-left hover:border-accent-blue transition-colors"
            >
              <div className="font-medium text-white mb-1">View Storage Info</div>
              <div className="text-sm text-gray-400">Check local storage usage</div>
            </button>
            <button
              onClick={() => {
                if (confirm('Export all data as JSON?')) {
                  const data = {
                    version: '1.0.0',
                    exported: new Date().toISOString(),
                    history: JSON.parse(localStorage.getItem('analysisHistory') || '[]'),
                  };
                  const dataStr = JSON.stringify(data, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `ai-risk-backup-${Date.now()}.json`;
                  link.click();
                }
              }}
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-left hover:border-accent-blue transition-colors"
            >
              <div className="font-medium text-white mb-1">Export Data</div>
              <div className="text-sm text-gray-400">Download backup as JSON</div>
            </button>
            <button
              onClick={() => {
                if (confirm('This will delete all stored analyses. Continue?')) {
                  localStorage.removeItem('analysisHistory');
                  alert('All data cleared successfully');
                }
              }}
              className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-left hover:border-red-500 transition-colors"
            >
              <div className="font-medium text-red-400 mb-1">Clear All Data</div>
              <div className="text-sm text-red-400/70">Delete all stored analyses</div>
            </button>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">About</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            AI Risk Mitigation System is a production-grade platform for analyzing and mitigating
            risks in AI-generated content. It detects hallucinations, bias, toxicity, fraud patterns,
            and PII leaks using advanced heuristics and ML models.
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Risk Categories</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-red-400">🌀</span>
              <div>
                <div className="text-white font-medium">Hallucination</div>
                <div className="text-gray-400">Factually incorrect or fabricated information</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">⚖️</span>
              <div>
                <div className="text-white font-medium">Bias</div>
                <div className="text-gray-400">Unfair or prejudiced content</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400">☠️</span>
              <div>
                <div className="text-white font-medium">Toxicity</div>
                <div className="text-gray-400">Harmful, offensive, or inappropriate content</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400">🔒</span>
              <div>
                <div className="text-white font-medium">PII Leak</div>
                <div className="text-gray-400">Personal identifiable information exposure</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400">🚨</span>
              <div>
                <div className="text-white font-medium">Fraud</div>
                <div className="text-gray-400">Scam patterns and deceptive claims</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
