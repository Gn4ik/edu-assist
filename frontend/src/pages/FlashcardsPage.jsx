import { useState } from 'react'
import { Card, Form, Button, Spinner, Tabs, Tab, Row, Col } from 'react-bootstrap'
import api from '../api/client'
import FlashcardFlip from '../components/FlashcardFlip'

export default function FlashcardsPage() {
  const [mode, setMode] = useState('text')
  const [text, setText] = useState('')
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('ru')
  const [numCards, setNumCards] = useState(5)
  const [model, setModel] = useState('')
  const [flashcards, setFlashcards] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setFlashcards(null)
    try {
      const body = { language, num_cards: numCards }
      if (model) body.model = model
      if (mode === 'text') body.text = text
      else body.topic = topic

      const res = await api.post('/api/generation/flashcards', body)
      if (res.data.success) {
        setFlashcards(res.data.output)
      }
    } catch (err) {
      setFlashcards(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="mb-4">Карточки</h2>

      <Card className="mb-3 p-3">
        <Tabs activeKey={mode} onSelect={setMode} className="mb-3">
          <Tab eventKey="text" title="Из текста" />
          <Tab eventKey="topic" title="По теме" />
        </Tabs>

        {mode === 'text' ? (
          <Form.Control as="textarea" rows={4} value={text}
            onChange={(e) => setText(e.target.value)} placeholder="Вставьте текст..." />
        ) : (
          <Form.Control value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="Введите тему..." />
        )}

        <Row className="mt-3">
          <Col md={3}>
            <Form.Label>Язык</Form.Label>
            <Form.Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="ru">Русский</option>
              <option value="en">Английский</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>Карточки</Form.Label>
            <Form.Control type="number" min={1} max={20} value={numCards}
              onChange={(e) => setNumCards(Number(e.target.value))} />
          </Col>
          <Col md={3}>
            <Form.Label>Модель</Form.Label>
            <Form.Control value={model} onChange={(e) => setModel(e.target.value)}
              placeholder="llama3.2:3b" />
          </Col>
        </Row>

        <Button className="mt-3" onClick={generate} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Сгенерировать карточки'}
        </Button>
      </Card>

      {flashcards && Array.isArray(flashcards) && (
        <Row>
          {flashcards.map((card, i) => (
            <Col key={i} md={6} lg={4}>
              <FlashcardFlip front={card.front} back={card.back} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
