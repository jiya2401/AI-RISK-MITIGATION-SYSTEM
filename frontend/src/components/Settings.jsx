function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Backend Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">API Endpoint</label>
              <input
                type="text"
                value="https://ai-risk-mitigation-system-2.onrender.com"
                disabled
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-300"
              />
            </div>
            <div className="text-xs text-slate-500">
              Backend is deployed and managed externally
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Display Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dark Mode</span>
              <div className="bg-blue-600 rounded-full p-1 w-12">
                <div className="bg-white w-4 h-4 rounded-full transform translate-x-6"></div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Theme toggle available in header
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Data Storage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Store History Locally</span>
              <span className="text-green-400 font-semibold">✓ Enabled</span>
            </div>
            <button className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-500 text-red-400 font-semibold py-2 px-4 rounded-lg transition-colors">
              Clear All History
            </button>
            <div className="text-xs text-slate-500">
              History is stored in browser localStorage
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">About</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Version</span>
              <span className="text-slate-300 font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Engine</span>
              <span className="text-slate-300 font-semibold">MedBERT + Heuristics</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className="text-green-400 font-semibold">Operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">ℹ️</span>
          <div>
            <h3 className="text-white font-bold text-lg mb-2">System Information</h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              AI Risk Mitigation System provides comprehensive analysis of AI-generated content for potential 
              risks including hallucinations, bias, toxicity, fraud patterns, and PII leaks. The system uses 
              advanced machine learning models combined with rule-based heuristics for accurate detection.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
