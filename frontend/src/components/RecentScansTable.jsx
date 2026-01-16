function RecentScansTable({ scans, onViewReport }) {
  if (scans.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Recent Scans</h3>
        <div className="text-center py-12 text-slate-400">
          <div className="text-6xl mb-4">📋</div>
          <p>No scans yet. Start analyzing to see results here.</p>
        </div>
      </div>
    )
  }

  const getRiskBadgeClass = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-900/30 text-red-400 border-red-500'
      case 'MEDIUM':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500'
      case 'LOW':
        return 'bg-green-900/30 text-green-400 border-green-500'
      default:
        return 'bg-slate-700 text-slate-400 border-slate-600'
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Recent Scans</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 font-medium py-3 px-4">Time</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Hallucination</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Bias</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Toxicity</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Fraud</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Confidence</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {scans.slice(0, 5).map((scan, index) => (
              <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-3 px-4 text-slate-300 text-sm">
                  {new Date(scan.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskBadgeClass(scan.hallucination_risk)}`}>
                    {scan.hallucination_risk}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskBadgeClass(scan.bias_risk)}`}>
                    {scan.bias_risk}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskBadgeClass(scan.toxicity_risk)}`}>
                    {scan.toxicity_risk}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskBadgeClass(scan.fraud_risk)}`}>
                    {scan.fraud_risk}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 font-semibold">
                  {(scan.confidence_score * 100).toFixed(0)}%
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onViewReport(scan)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentScansTable
