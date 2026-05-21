import { useState } from 'react'
import { Card, Form, Button, Alert, ProgressBar } from 'react-bootstrap'

export default function QuizRunner({ quiz }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  if (!quiz || quiz.length === 0) return <p>Нет вопросов для теста.</p>

  const score = submitted
    ? quiz.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0)
    : 0

  return (
    <div>
      {quiz.map((q, idx) => (
        <Card key={idx} className="mb-3">
          <Card.Body>
            <Card.Title>{idx + 1}. {q.question}</Card.Title>
            {q.options.map((opt, optIdx) => (
              <Form.Check
                key={optIdx}
                type="radio"
                name={`q-${idx}`}
                label={opt}
                checked={answers[idx] === optIdx}
                onChange={() => setAnswers({ ...answers, [idx]: optIdx })}
                disabled={submitted}
                isInvalid={submitted && answers[idx] === optIdx && optIdx !== q.correct}
                isValid={submitted && optIdx === q.correct}
              />
            ))}
            {submitted && q.explanation && (
              <Alert variant="info" className="mt-2 mb-0">
                <small>{q.explanation}</small>
              </Alert>
            )}
          </Card.Body>
        </Card>
      ))}

      {!submitted && (
        <Button
          variant="primary"
          disabled={Object.keys(answers).length < quiz.length}
          onClick={() => setSubmitted(true)}
        >
          Отправить ответы
        </Button>
      )}

      {submitted && (
        <div className="mt-3">
          <h4>
            Результат: {score}/{quiz.length} ({Math.round((score / quiz.length) * 100)}%)
          </h4>
          <ProgressBar
            now={(score / quiz.length) * 100}
            variant={score >= quiz.length * 0.7 ? 'success' : 'warning'}
          />
          <Button variant="outline-secondary" className="mt-2" onClick={() => { setAnswers({}); setSubmitted(false) }}>
            Повторить
          </Button>
        </div>
      )}
    </div>
  )
}
