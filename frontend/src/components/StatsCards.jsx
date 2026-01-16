function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Scans',
      value: stats.totalScans,
      icon: '📊',
      color: 'blue'
    },
    {
      label: 'High Risk Count',
      value: stats.highRiskCount,
      icon: '🔴',
      color: 'red'
    },
    {
      label: 'PII Detected',
      value: stats.piiCount,
      icon: '🔒',
      color: 'yellow'
    },
    {
      label: 'Avg Confidence',
      value: `${stats.avgConfidence}%`,
      icon: '✅',
      color: 'green'
    }
  ]

  const colorClasses = {
    blue: {
      bg: 'bg-blue-900/30',
      border: 'border-blue-500',
      text: 'text-blue-400',
      glow: 'hover:shadow-blue-500/50'
    },
    red: {
      bg: 'bg-red-900/30',
      border: 'border-red-500',
      text: 'text-red-400',
      glow: 'hover:shadow-red-500/50'
    },
    yellow: {
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-500',
      text: 'text-yellow-400',
      glow: 'hover:shadow-yellow-500/50'
    },
    green: {
      bg: 'bg-green-900/30',
      border: 'border-green-500',
      text: 'text-green-400',
      glow: 'hover:shadow-green-500/50'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const colors = colorClasses[card.color]
        return (
          <div
            key={index}
            className={`${colors.bg} border ${colors.border} rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl ${colors.glow}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{card.icon}</span>
              <div className={`text-3xl font-bold ${colors.text}`}>
                {card.value}
              </div>
            </div>
            <div className="text-slate-300 font-medium">{card.label}</div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards
