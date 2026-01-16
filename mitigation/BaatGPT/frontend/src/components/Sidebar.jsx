export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analyzer', label: 'Analyzer', icon: '🔍' },
    { id: 'mitigation', label: 'Mitigation Fix', icon: '🛡️' },
    { id: 'reports', label: 'Reports / History', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-dark-card border-r border-dark-border h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          AI Risk System
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg'
                : 'text-gray-400 hover:bg-dark-border hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border text-sm text-gray-500">
        <p>© 2026 AI Risk Mitigation</p>
      </div>
    </div>
  );
}
