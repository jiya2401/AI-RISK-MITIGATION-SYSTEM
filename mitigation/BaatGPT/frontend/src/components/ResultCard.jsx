export default function ResultCard({ title, value, type = 'risk' }) {
  const getRiskColor = (risk) => {
    if (risk === 'LOW') return 'bg-green-500/20 text-green-400 border-green-500';
    if (risk === 'MEDIUM') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
    if (risk === 'HIGH') return 'bg-red-500/20 text-red-400 border-red-500';
    return 'bg-gray-500/20 text-gray-400 border-gray-500';
  };

  const getRiskIcon = (risk) => {
    if (risk === 'LOW') return '✓';
    if (risk === 'MEDIUM') return '⚠';
    if (risk === 'HIGH') return '✕';
    return '•';
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-accent-blue/50 transition-all duration-300 animate-slide-up">
      <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      {type === 'risk' ? (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getRiskColor(value)}`}>
          <span className="text-lg">{getRiskIcon(value)}</span>
          <span className="font-semibold">{value}</span>
        </div>
      ) : type === 'pii' ? (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          value ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-green-500/20 text-green-400 border-green-500'
        }`}>
          <span className="text-lg">{value ? '⚠' : '✓'}</span>
          <span className="font-semibold">{value ? 'DETECTED' : 'NONE'}</span>
        </div>
      ) : type === 'confidence' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-accent-blue font-semibold">{Math.round(value * 100)}%</span>
          </div>
          <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-accent-blue to-accent-purple h-full rounded-full transition-all duration-500"
              style={{ width: `${value * 100}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 font-medium">{value}</p>
      )}
    </div>
  );
}
