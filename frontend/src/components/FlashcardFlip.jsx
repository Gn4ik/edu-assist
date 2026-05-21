import { useState } from 'react'
import { Card, Button } from 'react-bootstrap'

export default function FlashcardFlip({ front, back }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <Card
      className="mb-2"
      style={{ cursor: 'pointer', minHeight: 120 }}
      onClick={() => setFlipped(!flipped)}
    >
      <Card.Body className="text-center d-flex align-items-center justify-content-center">
        <div>
          <small className="text-muted">{flipped ? 'Ответ' : 'Вопрос'}</small>
          <p className="mt-2 fs-5">{flipped ? back : front}</p>
          <Button variant="link" size="sm">
            {flipped ? 'Показать вопрос' : 'Показать ответ'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
