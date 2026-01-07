import RiskBadge from './RiskBadge'

function ResultPanel({ result }) {
  if (!result) return null

  const confidence = (result.confidence_score * 100).toFixed(1)

  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Analysis Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RiskBadge level={result.hallucination_risk} label="Hallucination Risk" />
        <RiskBadge level={result.bias_risk} label="Bias Risk" />
        <RiskBadge level={result.toxicity_risk} label="Toxicity Risk" />
        <RiskBadge level={result.fraud_risk} label="Fraud Risk" />
      </div>

      {result.pii_leak && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-red-400 font-bold text-lg mb-1">PII Leak Detected</h3>
              <p className="text-red-300 text-sm">
                Personally identifiable information was found in the text. Please review and remove sensitive data.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-lg p-5">
        <h3 className="text-slate-300 font-semibold mb-3">Confidence Score</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Analysis Confidence</span>
            <span className="font-bold text-blue-400">{confidence}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>
      </div>

      {result.summary && (
        <div className="bg-slate-900 rounded-lg p-5">
          <h3 className="text-slate-300 font-semibold mb-3">Summary</h3>
          <p className="text-slate-400 leading-relaxed">{result.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-slate-500 text-sm mb-1">Engine Used</div>
          <div className="text-slate-200 font-semibold">
            {result.engine_used || 'N/A'}
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-slate-500 text-sm mb-1">Processing Time</div>
          <div className="text-slate-200 font-semibold">
            {result.processing_time_ms ? `${result.processing_time_ms.toFixed(2)} ms` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultPanel
