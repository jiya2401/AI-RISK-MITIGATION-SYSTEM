import { useEffect, useState } from 'react';
import StatsCards from './StatsCards';
import FlagsPanel from './FlagsPanel';
import RiskBadge from './RiskBadge';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalScans: 0,
    highRiskScans: 0,
    piiDetected: 0,
    avgConfidence: 0,
  });
  const [recentScans, setRecentScans] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState({
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    
    const totalScans = history.length;
    const highRiskScans = history.filter(
      (item) =>
        item.hallucination_risk === 'HIGH' ||
        item.bias_risk === 'HIGH' ||
        item.toxicity_risk === 'HIGH' ||
        item.fraud_risk === 'HIGH'
    ).length;
    const piiDetected = history.filter((item) => item.pii_leak).length;
    const avgConfidence =
      totalScans > 0
        ? Math.round((history.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / totalScans) * 100)
        : 0;

    setStats({ totalScans, highRiskScans, piiDetected, avgConfidence });
    setRecentScans(history.slice(-5).reverse());

    const distribution = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    history.forEach((item) => {
      const maxRisk = getMaxRisk(item);
      distribution[maxRisk] = (distribution[maxRisk] || 0) + 1;
    });
    setRiskDistribution(distribution);
  };

  const getMaxRisk = (analysis) => {
    const risks = [
      analysis.hallucination_risk,
      analysis.bias_risk,
      analysis.toxicity_risk,
      analysis.fraud_risk,
    ];
    if (risks.includes('HIGH')) return 'HIGH';
    if (risks.includes('MEDIUM')) return 'MEDIUM';
    return 'LOW';
  };

  const maxCount = Math.max(...Object.values(riskDistribution), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">Overview of your AI risk analysis</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Risk Distribution</h3>
            <div className="space-y-4">
              {Object.entries(riskDistribution).map(([risk, count]) => (
                <div key={risk}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">{risk}</span>
                    <span className="text-gray-400 text-sm">{count} scans</span>
                  </div>
                  <div className="w-full bg-dark-border rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        risk === 'LOW'
                          ? 'bg-green-500'
                          : risk === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Analysis</h3>
            {recentScans.length === 0 ? (
              <p className="text-gray-400 text-sm">No scans yet. Run an analysis to see results here.</p>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-dark-bg border border-dark-border rounded-xl hover:border-accent-blue/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-gray-400 text-xs">
                        {new Date(scan.timestamp).toLocaleString()}
                      </span>
                      <RiskBadge risk={getMaxRisk(scan)} size="sm" />
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">{scan.text?.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <FlagsPanel recentAnalysis={recentScans[0]} />
        </div>
      </div>
    </div>
  );
}
