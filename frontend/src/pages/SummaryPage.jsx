import { useState } from 'react'
import { Card, Form, Button, Spinner, Tabs, Tab, Row, Col } from 'react-bootstrap'
import api from '../api/client'

export default function SummaryPage() {
  const [mode, setMode] = useState('text')
  const [text, setText] = useState('')
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('ru')
  const [maxPoints, setMaxPoints] = useState(7)
  const [model, setModel] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setResult(null)
    try {
      const body = { language, max_points: maxPoints }
      if (model) body.model = model
      if (mode === 'text') body.text = text
      else body.topic = topic

      const res = await api.post('/api/generation/summary', body)
      setResult(res.data)
    } catch (err) {
      setResult({ success: false, error: err.response?.data?.detail || 'Ошибка генерации' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="mb-4">Конспект</h2>

      <Card className="mb-3 p-3">
        <Tabs activeKey={mode} onSelect={setMode} className="mb-3">
          <Tab eventKey="text" title="Из текста" />
          <Tab eventKey="topic" title="По теме" />
        </Tabs>

        {mode === 'text' ? (
          <Form.Control as="textarea" rows={6} value={text}
            onChange={(e) => setText(e.target.value)} placeholder="Вставьте текст..." />
        ) : (
          <Form.Control value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="Введите тему, например: Основы машинного обучения" />
        )}

        <Row className="mt-3">
          <Col md={3}>
            <Form.Label>Язык</Form.Label>
            <Form.Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="ru">Русский</option>
              <option value="en">Английский</option>
              <option value="es">Испанский</option>
              <option value="fr">Французский</option>
              <option value="de">Немецкий</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Макс. пунктов</Form.Label>
            <Form.Control type="number" min={3} max={20} value={maxPoints}
              onChange={(e) => setMaxPoints(Number(e.target.value))} />
          </Col>
          <Col md={3}>
            <Form.Label>Модель (необязательно)</Form.Label>
            <Form.Control value={model} onChange={(e) => setModel(e.target.value)}
              placeholder="llama3.2:3b" />
          </Col>
        </Row>

        <Button className="mt-3" onClick={generate} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Сгенерировать конспект'}
        </Button>
      </Card>

      {result && result.success && (
        <Card className="p-3">
          <h5>Конспект</h5>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{result.output}</pre>
          <small className="text-muted">
            {result.from_cache ? 'Из кэша' : 'Новый'} | {result.processing_time_ms} мс
            {result.generation_id && ` | ID: ${result.generation_id}`}
          </small>
        </Card>
      )}
      {result && !result.success && (
        <Card className="p-3 text-danger">{result.error}</Card>
      )}
    </div>
  )
}
