import { useState, useEffect } from 'react';

export default function Header() {
  const [isDark, setIsDark] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('https://ai-risk-mitigation-system-2.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' }),
      });
      setBackendStatus(response.ok ? 'connected' : 'error');
    } catch {
      setBackendStatus('error');
    }
  };

  return (
    <header className="h-16 bg-dark-card border-b border-dark-border fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white">AI Risk Mitigation System</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Operational</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-400 text-sm">
            Backend {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg bg-dark-border hover:bg-dark-border/50 transition-colors"
          title="Theme toggle (always dark)"
        >
          <span className="text-xl">🌙</span>
        </button>
      </div>
    </header>
  );
}
