import { useState } from 'react'
import Analyzer from './components/Analyzer'
import ResultPanel from './components/ResultPanel'

const API_URL = 'https://ai-risk-mitigation-system-2.onrender.com'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeText = async (text) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to analyze text. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            AI Risk Mitigation System
          </h1>
          <p className="text-slate-400 text-lg">
            Analyze AI-generated content for potential risks and biases
          </p>
        </header>

        <div className="space-y-8">
          <Analyzer onAnalyze={analyzeText} loading={loading} />
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 font-medium">Error: {error}</p>
            </div>
          )}
          {result && <ResultPanel result={result} />}
        </div>
      </div>
    </div>
  )
}

export default App
