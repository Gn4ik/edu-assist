import { useState, useEffect } from 'react'
import api from '../api/client'
import StatsWidget from '../components/StatsWidget'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/api/users/me/stats').then((res) => setStats(res.data))
  }, [])

  return (
    <div>
      <h2 className="result-header" style={{ marginTop: 0 }}>Панель управления</h2>
      <StatsWidget stats={stats} />

      {stats && (
        <div className="results-section" style={{ marginTop: '2rem' }}>
          <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>По типу</h3>
              {Object.entries(stats.by_type).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                  <span>{type}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>Использованные модели</h3>
              {Object.entries(stats.models_used).map(([model, count]) => (
                <div key={model} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                  <span>{model}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}