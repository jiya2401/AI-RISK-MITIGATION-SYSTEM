function FlagsPanel({ latestScan }) {
  const flags = []

  if (!latestScan) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">ML Flags</h3>
        <div className="text-center py-12 text-slate-400">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-sm">ML Flags will appear here...</p>
        </div>
      </div>
    )
  }

  // Generate flags based on scan results
  if (latestScan.pii_leak) {
    flags.push({ type: 'warning', icon: '⚠️', text: 'PII Leak Detected', color: 'red' })
  }

  if (latestScan.hallucination_risk === 'HIGH') {
    flags.push({ type: 'warning', icon: '⚠️', text: 'Hallucination Risk', color: 'red' })
  } else if (latestScan.hallucination_risk === 'MEDIUM') {
    flags.push({ type: 'warning', icon: '⚠️', text: 'Moderate Hallucination', color: 'yellow' })
  }

  if (latestScan.fraud_risk === 'HIGH') {
    flags.push({ type: 'warning', icon: '⚠️', text: 'Fraud Pattern Detected', color: 'red' })
  } else if (latestScan.fraud_risk === 'MEDIUM') {
    flags.push({ type: 'warning', icon: '⚠️', text: 'Potential Fraud Pattern', color: 'yellow' })
  }

  if (latestScan.toxicity_risk === 'HIGH') {
    flags.push({ type: 'warning', icon: '⚠️', text: 'High Toxicity', color: 'red' })
  }

  if (latestScan.bias_risk === 'HIGH') {
    flags.push({ type: 'warning', icon: '⚠️', text: 'Bias Detected', color: 'red' })
  }

  // Add safe content flag if everything is low
  if (
    !latestScan.pii_leak &&
    latestScan.hallucination_risk === 'LOW' &&
    latestScan.fraud_risk === 'LOW' &&
    latestScan.toxicity_risk === 'LOW' &&
    latestScan.bias_risk === 'LOW'
  ) {
    flags.push({ type: 'success', icon: '✅', text: 'Safe Content', color: 'green' })
  }

  const getColorClass = (color) => {
    switch (color) {
      case 'red':
        return 'bg-red-900/30 border-red-500 text-red-400'
      case 'yellow':
        return 'bg-yellow-900/30 border-yellow-500 text-yellow-400'
      case 'green':
        return 'bg-green-900/30 border-green-500 text-green-400'
      default:
        return 'bg-slate-700 border-slate-600 text-slate-400'
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">ML Flags</h3>

      {flags.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-sm">ML Flags will appear here...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag, index) => (
            <div
              key={index}
              className={`border rounded-xl p-4 transition-all duration-300 hover:scale-105 ${getColorClass(flag.color)}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{flag.icon}</span>
                <span className="font-semibold">{flag.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          Last updated: {new Date(latestScan.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default FlagsPanel
