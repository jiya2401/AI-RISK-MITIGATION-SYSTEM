function RiskDistribution({ distribution }) {
  const total = distribution.low + distribution.medium + distribution.high || 1
  const lowPercent = (distribution.low / total) * 100
  const mediumPercent = (distribution.medium / total) * 100
  const highPercent = (distribution.high / total) * 100

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Risk Distribution</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-green-400 font-medium">🟢 Low Risk</span>
            <span className="text-slate-300 font-semibold">{distribution.low}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${lowPercent}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-yellow-400 font-medium">🟡 Medium Risk</span>
            <span className="text-slate-300 font-semibold">{distribution.medium}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${mediumPercent}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-red-400 font-medium">🔴 High Risk</span>
            <span className="text-slate-300 font-semibold">{distribution.high}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${highPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{total}</div>
          <div className="text-slate-400 text-sm">Total Analyses</div>
        </div>
      </div>
    </div>
  )
}

export default RiskDistribution
