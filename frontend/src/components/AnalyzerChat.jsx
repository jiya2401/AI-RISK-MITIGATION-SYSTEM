import { useState } from 'react'
import RiskBadge from './RiskBadge'

function AnalyzerChat({ onAnalyze, loading }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [showJsonDetails, setShowJsonDetails] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    const textToAnalyze = inputText
    setInputText('')

    try {
      const result = await onAnalyze(textToAnalyze)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        result,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Failed to analyze. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const runDemo = () => {
    const demoText = "URGENT! You've won $1,000,000! Click here NOW to claim your prize! Limited time offer! Contact us at winner@fake-lottery.com or call 555-0123. This is a guaranteed opportunity that requires immediate action. Don't miss out on this once-in-a-lifetime chance to become rich instantly!"
    setInputText(demoText)
  }

  const toggleJson = (messageId) => {
    setShowJsonDetails(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }))
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Risk Analyzer</h2>
        <button
          onClick={runDemo}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
        >
          🚀 Run Demo
        </button>
      </div>

      <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Start a conversation to analyze AI-generated content</p>
                <p className="text-sm mt-2">Enter text below or click "Run Demo"</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                {message.type === 'user' && (
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      <p className="text-xs text-blue-200 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {message.type === 'ai' && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
                      <div className="mb-4">
                        <div className="text-xs text-slate-400 mb-3">Analysis Results</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                            message.result.hallucination_risk === 'HIGH' ? 'bg-red-900/30 text-red-400' :
                            message.result.hallucination_risk === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-green-900/30 text-green-400'
                          }`}>
                            Hallucination: {message.result.hallucination_risk}
                          </div>
                          <div className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                            message.result.bias_risk === 'HIGH' ? 'bg-red-900/30 text-red-400' :
                            message.result.bias_risk === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-green-900/30 text-green-400'
                          }`}>
                            Bias: {message.result.bias_risk}
                          </div>
                          <div className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                            message.result.toxicity_risk === 'HIGH' ? 'bg-red-900/30 text-red-400' :
                            message.result.toxicity_risk === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-green-900/30 text-green-400'
                          }`}>
                            Toxicity: {message.result.toxicity_risk}
                          </div>
                          <div className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                            message.result.fraud_risk === 'HIGH' ? 'bg-red-900/30 text-red-400' :
                            message.result.fraud_risk === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-green-900/30 text-green-400'
                          }`}>
                            Fraud: {message.result.fraud_risk}
                          </div>
                        </div>
                      </div>

                      {message.result.pii_leak && (
                        <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                            <span>⚠️</span>
                            <span>PII Leak Detected</span>
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="text-xs text-slate-400 mb-2">Confidence Score</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(message.result.confidence_score * 100).toFixed(0)}%` }}
                            ></div>
                          </div>
                          <span className="text-blue-400 font-bold text-sm">
                            {(message.result.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {message.result.summary && (
                        <div className="mb-4">
                          <div className="text-xs text-slate-400 mb-2">Summary</div>
                          <p className="text-slate-300 text-sm leading-relaxed">{message.result.summary}</p>
                        </div>
                      )}

                      <button
                        onClick={() => toggleJson(message.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        {showJsonDetails[message.id] ? '▼ Hide' : '▶'} Technical JSON Details
                      </button>

                      {showJsonDetails[message.id] && (
                        <div className="mt-3 bg-slate-900 rounded-lg p-3 overflow-x-auto">
                          <pre className="text-xs text-slate-300">
                            {JSON.stringify(message.result, null, 2)}
                          </pre>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 mt-3">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}

                {message.type === 'error' && (
                  <div className="flex justify-start">
                    <div className="bg-red-900/30 border border-red-500 text-red-400 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <p>{message.text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-slate-300 text-sm">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter AI-generated text to analyze..."
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AnalyzerChat
