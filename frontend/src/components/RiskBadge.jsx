function RiskBadge({ level, label }) {
  const getStyles = () => {
    switch (level?.toUpperCase()) {
      case 'HIGH':
        return {
          bg: 'bg-red-900/30',
          border: 'border-red-500',
          text: 'text-red-400',
          icon: '🔴'
        }
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-900/30',
          border: 'border-yellow-500',
          text: 'text-yellow-400',
          icon: '🟡'
        }
      case 'LOW':
        return {
          bg: 'bg-green-900/30',
          border: 'border-green-500',
          text: 'text-green-400',
          icon: '🟢'
        }
      default:
        return {
          bg: 'bg-slate-800',
          border: 'border-slate-600',
          text: 'text-slate-400',
          icon: '⚪'
        }
    }
  }

  const styles = getStyles()

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 transition-all hover:scale-105`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className={`${styles.text} font-bold text-lg flex items-center gap-2`}>
          <span>{styles.icon}</span>
          {level?.toUpperCase() || 'N/A'}
        </span>
      </div>
    </div>
  )
}

export default RiskBadge
