export default function StatsCards({ stats }) {
  const cards = [
    { label: 'Total Scans', value: stats.totalScans, icon: '🔍', color: 'blue' },
    { label: 'High Risk Scans', value: stats.highRiskScans, icon: '⚠️', color: 'red' },
    { label: 'PII Detected', value: stats.piiDetected, icon: '🔒', color: 'yellow' },
    { label: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: '📊', color: 'purple' },
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-accent-blue/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent-blue/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClass(card.color)} flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">{card.label}</h3>
          <p className="text-3xl font-bold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
