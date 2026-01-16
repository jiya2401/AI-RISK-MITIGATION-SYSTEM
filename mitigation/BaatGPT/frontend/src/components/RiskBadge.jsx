export default function RiskBadge({ risk, size = 'md' }) {
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

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border ${getRiskColor(risk)} ${sizeClasses}`}>
      <span>{getRiskIcon(risk)}</span>
      <span className="font-semibold">{risk}</span>
    </div>
  );
}
