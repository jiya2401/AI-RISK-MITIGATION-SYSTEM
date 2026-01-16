import StatsCards from './StatsCards'
import RiskDistribution from './RiskDistribution'
import RecentScansTable from './RecentScansTable'
import FlagsPanel from './FlagsPanel'

function Dashboard({ stats, scans, onViewReport }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <div className="text-sm text-slate-400">
          Real-time monitoring and analytics
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskDistribution distribution={stats.distribution} />
        </div>
        <div>
          <FlagsPanel latestScan={scans[0]} />
        </div>
      </div>

      <RecentScansTable scans={scans} onViewReport={onViewReport} />
    </div>
  )
}

export default Dashboard
