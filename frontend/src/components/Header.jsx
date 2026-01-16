import { useState, useEffect } from 'react'

function Header() {
  const [isDark, setIsDark] = useState(true)
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('https://ai-risk-mitigation-system-2.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'health check' })
      })
      setBackendStatus(response.ok ? 'operational' : 'down')
    } catch (err) {
      setBackendStatus('down')
    }
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">
            AI Risk Mitigation System
          </h1>
          <span className="text-slate-400 text-sm hidden md:block">
            Professional Grade Security Analysis
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                backendStatus === 'operational'
                  ? 'bg-green-900/30 text-green-400 border border-green-500'
                  : backendStatus === 'checking'
                  ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500'
                  : 'bg-red-900/30 text-red-400 border border-red-500'
              }`}
            >
              {backendStatus === 'operational' ? '✅ Operational' : 
               backendStatus === 'checking' ? '⏳ Checking...' : 
               '❌ Down'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2">
            <span className={`w-2 h-2 rounded-full ${
              backendStatus === 'operational' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></span>
            <span className="text-slate-300 text-sm font-medium">Backend</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            title="Toggle theme (dark mode only)"
          >
            <span className="text-xl">{isDark ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
