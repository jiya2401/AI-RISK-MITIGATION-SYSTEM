import { useState } from 'react'

function MitigationPanel({ latestScan }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const generateMitigationSuggestions = (scan) => {
    if (!scan) return []

    const suggestions = []

    if (scan.pii_leak) {
      suggestions.push({
        category: 'PII Leak',
        icon: '🔒',
        color: 'red',
        steps: [
          'Remove or mask email addresses and phone numbers',
          'Replace names with placeholders or anonymize them',
          'Remove social security numbers and sensitive identifiers',
          'Use data tokenization for necessary identifiers'
        ]
      })
    }

    if (scan.hallucination_risk === 'HIGH' || scan.hallucination_risk === 'MEDIUM') {
      suggestions.push({
        category: 'Hallucination Risk',
        icon: '🎭',
        color: 'yellow',
        steps: [
          'Ask the AI to provide citations and sources',
          'Implement Retrieval-Augmented Generation (RAG)',
          'Add disclaimer about AI-generated content accuracy',
          'Cross-verify facts with reliable sources',
          'Use temperature=0 for more factual outputs'
        ]
      })
    }

    if (scan.fraud_risk === 'HIGH' || scan.fraud_risk === 'MEDIUM') {
      suggestions.push({
        category: 'Fraud Risk',
        icon: '⚠️',
        color: 'red',
        steps: [
          'Remove urgency language and time pressure tactics',
          'Eliminate guaranteed money/prize claims',
          'Add multi-step verification process',
          'Include official contact information verification',
          'Flag suspicious patterns for manual review'
        ]
      })
    }

    if (scan.toxicity_risk === 'HIGH' || scan.toxicity_risk === 'MEDIUM') {
      suggestions.push({
        category: 'Toxicity Risk',
        icon: '🚫',
        color: 'red',
        steps: [
          'Apply content moderation filter',
          'Remove offensive or harmful language',
          'Rephrase with neutral, professional tone',
          'Use sentiment analysis for pre-filtering',
          'Implement strict safety guidelines'
        ]
      })
    }

    if (scan.bias_risk === 'HIGH' || scan.bias_risk === 'MEDIUM') {
      suggestions.push({
        category: 'Bias Risk',
        icon: '⚖️',
        color: 'yellow',
        steps: [
          'Balance language and remove absolute claims',
          'Include diverse perspectives',
          'Remove stereotypical assumptions',
          'Use inclusive and neutral terminology',
          'Review for demographic fairness'
        ]
      })
    }

    if (suggestions.length === 0) {
      suggestions.push({
        category: 'Safe Content',
        icon: '✅',
        color: 'green',
        steps: [
          'Content passed all safety checks',
          'No immediate mitigation required',
          'Continue monitoring for quality assurance',
          'Consider periodic re-evaluation'
        ]
      })
    }

    return suggestions
  }

  const suggestions = generateMitigationSuggestions(latestScan)

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

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      // Still show feedback even if copy failed
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Mitigation Suggestions</h2>
        {latestScan && (
          <div className="text-sm text-slate-400">
            Based on last analysis: {new Date(latestScan.timestamp).toLocaleString()}
          </div>
        )}
      </div>

      {!latestScan ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">💡</div>
          <p className="text-slate-400 text-lg mb-2">No analysis available</p>
          <p className="text-slate-500 text-sm">Run an analysis first to see mitigation suggestions</p>
        </div>
      ) : (
        <div className="space-y-6">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${getColorClass(suggestion.color)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{suggestion.icon}</span>
                  <h3 className="text-xl font-bold text-white">{suggestion.category}</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(suggestion.steps.join('\n'), index)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {copiedIndex === index ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>

              <div className="space-y-3">
                {suggestion.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                        {stepIndex + 1}
                      </div>
                    </div>
                    <p className="flex-1 text-slate-200 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              {suggestion.color !== 'green' && (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                    <span>🤖</span>
                    <span>Auto Rewrite Suggestion (Coming Soon)</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Pro Tip</h3>
                <p className="text-slate-300 leading-relaxed">
                  Implementing these mitigation strategies will significantly improve the safety and reliability 
                  of AI-generated content. Always combine automated checks with human review for critical applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MitigationPanel
