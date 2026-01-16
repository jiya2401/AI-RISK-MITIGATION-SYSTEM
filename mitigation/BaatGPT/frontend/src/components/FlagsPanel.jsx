export default function FlagsPanel({ recentAnalysis }) {
  if (!recentAnalysis) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">ML Flags Panel</h3>
        <p className="text-gray-400 text-sm">No recent analysis available</p>
      </div>
    );
  }

  const flags = [];
  
  if (recentAnalysis.pii_leak) {
    flags.push({ label: 'PII Leak Detected', icon: '🔒', color: 'red' });
  }
  if (recentAnalysis.hallucination_risk === 'HIGH') {
    flags.push({ label: 'High Hallucination Risk', icon: '🌀', color: 'red' });
  }
  if (recentAnalysis.bias_risk === 'HIGH') {
    flags.push({ label: 'High Bias Risk', icon: '⚖️', color: 'red' });
  }
  if (recentAnalysis.toxicity_risk === 'HIGH') {
    flags.push({ label: 'High Toxicity Risk', icon: '☠️', color: 'red' });
  }
  if (recentAnalysis.fraud_risk === 'HIGH') {
    flags.push({ label: 'High Fraud Risk', icon: '🚨', color: 'red' });
  }

  if (flags.length === 0) {
    flags.push({ label: 'All Systems Normal', icon: '✅', color: 'green' });
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">ML Flags Panel</h3>
      <div className="space-y-3">
        {flags.map((flag, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              flag.color === 'red'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-green-500/10 border-green-500/30'
            }`}
          >
            <span className="text-2xl">{flag.icon}</span>
            <span className={`font-medium ${flag.color === 'red' ? 'text-red-400' : 'text-green-400'}`}>
              {flag.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
