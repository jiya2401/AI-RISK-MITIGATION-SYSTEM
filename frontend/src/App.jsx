import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import AnalyzerChat from './components/AnalyzerChat'
import MitigationPanel from './components/MitigationPanel'
import ReportsTable from './components/ReportsTable'
import Settings from './components/Settings'
import { API_URL, STORAGE_KEY } from './config'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedScans = localStorage.getItem(STORAGE_KEY)
    if (savedScans) {
      try {
        setScans(JSON.parse(savedScans))
      } catch (err) {
        console.error('Failed to load scans from localStorage', err)
      }
    }
  }, [])

  const saveScans = (newScans) => {
    setScans(newScans)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newScans))
  }

  const analyzeText = async (text) => {
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const scanResult = {
        ...data,
        timestamp: new Date().toISOString(),
        text: text.substring(0, 200)
      }

      const updatedScans = [scanResult, ...scans]
      saveScans(updatedScans)
      
      return data
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    if (scans.length === 0) {
      return {
        totalScans: 0,
        highRiskCount: 0,
        piiCount: 0,
        avgConfidence: 0,
        distribution: { low: 0, medium: 0, high: 0 }
      }
    }

    const highRiskCount = scans.filter(s => 
      s.hallucination_risk === 'HIGH' || 
      s.bias_risk === 'HIGH' || 
      s.toxicity_risk === 'HIGH' || 
      s.fraud_risk === 'HIGH'
    ).length

    const piiCount = scans.filter(s => s.pii_leak).length

    const avgConfidence = scans.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / scans.length * 100

    const distribution = scans.reduce((acc, scan) => {
      const risks = [scan.hallucination_risk, scan.bias_risk, scan.toxicity_risk, scan.fraud_risk]
      if (risks.includes('HIGH')) {
        acc.high++
      } else if (risks.includes('MEDIUM')) {
        acc.medium++
      } else {
        acc.low++
      }
      return acc
    }, { low: 0, medium: 0, high: 0 })

    return {
      totalScans: scans.length,
      highRiskCount,
      piiCount,
      avgConfidence: avgConfidence.toFixed(1),
      distribution
    }
  }

  const handleViewReport = (scan) => {
    // In a real application, this would open a modal or detailed view
    console.log('Viewing detailed report:', scan)
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {activePage === 'dashboard' && (
            <Dashboard stats={stats} scans={scans} onViewReport={handleViewReport} />
          )}
          
          {activePage === 'analyzer' && (
            <AnalyzerChat onAnalyze={analyzeText} loading={loading} />
          )}
          
          {activePage === 'mitigation' && (
            <MitigationPanel latestScan={scans[0]} />
          )}
          
          {activePage === 'reports' && (
            <ReportsTable scans={scans} onViewDetails={handleViewReport} />
          )}
          
          {activePage === 'settings' && (
            <Settings />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
