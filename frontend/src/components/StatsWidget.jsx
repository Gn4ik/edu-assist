import { Card, Row, Col } from 'react-bootstrap'

export default function StatsWidget({ stats }) {
  if (!stats) return null

  const items = [
    { label: 'Всего генераций', value: stats.total_generations },
    { label: 'За неделю', value: stats.generations_last_7_days },
    { label: 'Избранное', value: stats.total_favorites },
    { label: 'Среднее время (мс)', value: stats.avg_processing_time_ms },
  ]

  return (
    <Row className="g-3 mb-4">
      {items.map((item) => (
        <Col key={item.label} xs={6} md={3}>
          <Card className="text-center p-3">
            <h2>{item.value}</h2>
            <small className="text-muted">{item.label}</small>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
