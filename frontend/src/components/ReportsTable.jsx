import { useState } from 'react'

function ReportsTable({ scans, onViewDetails }) {
  const [filterRisk, setFilterRisk] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

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

  const getMaxRiskLevel = (scan) => {
    const risks = [
      scan.hallucination_risk,
      scan.bias_risk,
      scan.toxicity_risk,
      scan.fraud_risk
    ]
    if (risks.includes('HIGH')) return 'HIGH'
    if (risks.includes('MEDIUM')) return 'MEDIUM'
    return 'LOW'
  }

  const filteredScans = scans.filter(scan => {
    const maxRisk = getMaxRiskLevel(scan)
    const matchesFilter = filterRisk === 'all' || maxRisk.toUpperCase() === filterRisk.toUpperCase()
    const matchesSearch = searchTerm === '' || 
      scan.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(scan).toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const exportReport = () => {
    const reportData = {
      exportDate: new Date().toISOString(),
      totalScans: scans.length,
      scans: scans
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-risk-report-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyReportText = () => {
    const reportText = scans.map((scan, index) => {
      return `
Analysis #${index + 1}
Time: ${new Date(scan.timestamp).toLocaleString()}
Hallucination: ${scan.hallucination_risk}
Bias: ${scan.bias_risk}
Toxicity: ${scan.toxicity_risk}
Fraud: ${scan.fraud_risk}
PII Leak: ${scan.pii_leak ? 'Yes' : 'No'}
Confidence: ${(scan.confidence_score * 100).toFixed(1)}%
Summary: ${scan.summary || 'N/A'}
---`
    }).join('\n')

    navigator.clipboard.writeText(reportText)
    alert('Report copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Analysis History & Reports</h2>
        <div className="flex gap-3">
          <button
            onClick={copyReportText}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            📋 Copy Report
          </button>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            📥 Export JSON
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterRisk('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterRisk === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRisk('LOW')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterRisk === 'LOW'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setFilterRisk('MEDIUM')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterRisk === 'MEDIUM'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setFilterRisk('HIGH')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterRisk === 'HIGH'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              High
            </button>
          </div>
        </div>

        {filteredScans.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg mb-2">No reports found</p>
            <p className="text-sm">
              {scans.length === 0 
                ? 'Run analyses to see reports here' 
                : 'Try adjusting your filters or search term'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Time</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Hallucination</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Bias</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Toxicity</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Fraud</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">PII</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Confidence</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan, index) => (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 text-slate-300 text-sm">
                      <div>{new Date(scan.timestamp).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </div>
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
                    <td className="py-3 px-4 text-center">
                      {scan.pii_leak ? (
                        <span className="text-red-400 text-xl">⚠️</span>
                      ) : (
                        <span className="text-green-400 text-xl">✓</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-semibold">
                      {(scan.confidence_score * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onViewDetails(scan)}
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
        )}

        <div className="mt-6 pt-6 border-t border-slate-700 text-center text-slate-400 text-sm">
          Showing {filteredScans.length} of {scans.length} total reports
        </div>
      </div>
    </div>
  )
}

export default ReportsTable
