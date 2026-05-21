import { useState } from 'react'
import { Card, Form, Button, Spinner, Row, Col, Badge } from 'react-bootstrap'
import api from '../api/client'

export default function KeywordsPage() {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('ru')
  const [maxKeywords, setMaxKeywords] = useState(10)
  const [keywords, setKeywords] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setKeywords(null)
    try {
      const res = await api.post('/api/generation/keywords', {
        text, language, max_keywords: maxKeywords,
      })
      if (res.data.success) {
        setKeywords(res.data.output)
      }
    } catch (err) {
      setKeywords(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="mb-4">Извлечение ключевых слов</h2>

      <Card className="mb-3 p-3">
        <Form.Control as="textarea" rows={6} value={text}
          onChange={(e) => setText(e.target.value)} placeholder="Вставьте текст для извлечения ключевых слов..." />

        <Row className="mt-3">
          <Col md={3}>
            <Form.Label>Язык</Form.Label>
            <Form.Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="ru">Русский</option>
              <option value="en">Английский</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>Макс. ключевых слов</Form.Label>
            <Form.Control type="number" min={3} max={30} value={maxKeywords}
              onChange={(e) => setMaxKeywords(Number(e.target.value))} />
          </Col>
        </Row>

        <Button className="mt-3" onClick={generate} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Извлечь ключевые слова'}
        </Button>
      </Card>

      {keywords && Array.isArray(keywords) && (
        <Card className="p-3">
          <h5>Ключевые слова</h5>
          <div>
            {keywords.map((kw, i) => (
              <Badge key={i} bg="primary" className="me-2 mb-2 fs-6">{kw}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
