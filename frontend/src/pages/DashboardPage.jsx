import { useState, useEffect } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import api from '../api/client'
import StatsWidget from '../components/StatsWidget'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/api/users/me/stats').then((res) => setStats(res.data))
  }, [])

  return (
    <div>
      <h2 className="mb-4">Панель</h2>
      <StatsWidget stats={stats} />

      {stats && (
        <Row className="g-3">
          <Col md={6}>
            <Card className="p-3">
              <h5>По типу</h5>
              {Object.entries(stats.by_type).map(([type, count]) => (
                <div key={type} className="d-flex justify-content-between">
                  <span>{type}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </Card>
          </Col>
          <Col md={6}>
            <Card className="p-3">
              <h5>Использованные модели</h5>
              {Object.entries(stats.models_used).map(([model, count]) => (
                <div key={model} className="d-flex justify-content-between">
                  <span>{model}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
