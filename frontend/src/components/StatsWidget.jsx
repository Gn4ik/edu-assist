export default function StatsWidget({ stats }) {
  if (!stats) return null

  const items = [
    { label: 'Всего генераций', value: stats.total_generations },
    { label: 'За неделю', value: stats.generations_last_7_days },
    { label: 'Избранное', value: stats.total_favorites },
    { label: 'Среднее время (мс)', value: stats.avg_processing_time_ms},
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      {items.map((item) => (
        <div key={item.label} className="results-section" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#667eea' }}>{item.value}</h2>
          <small className="text-muted">{item.label}</small>
        </div>
      ))}
    </div>
  )
}