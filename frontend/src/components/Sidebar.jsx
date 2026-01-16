import { useState } from 'react'

function Sidebar({ activePage, onPageChange }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analyzer', label: 'Analyzer', icon: '🔍' },
    { id: 'mitigation', label: 'Mitigation Suggestions', icon: '💡' },
    { id: 'reports', label: 'History / Reports', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">🛡️</span>
          <span>AI Shield</span>
        </div>
        <p className="text-slate-400 text-xs mt-1">Risk Mitigation System</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activePage === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50 transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-900 rounded-xl p-3 text-xs">
          <div className="text-slate-400 mb-1">Backend Status</div>
          <div className="flex items-center gap-2 text-green-400 font-semibold">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Connected
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
