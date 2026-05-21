import { useState } from 'react'

export default function QuizRunner({ quiz }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  if (!quiz || quiz.length === 0) return <p>Нет вопросов для теста.</p>

  const score = submitted
    ? quiz.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0)
    : 0

  return (
    <div>
      <div className="tests-list">
        {quiz.map((q, idx) => (
          <div key={idx} className="test-item">
            <div className="test-question">
              <span className="question-number">{idx + 1}.</span>
              <span>{q.question}</span>
            </div>
            <div className="test-options">
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} className="test-option">
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={optIdx}
                    checked={answers[idx] === optIdx}
                    onChange={() => setAnswers({ ...answers, [idx]: optIdx })}
                    disabled={submitted}
                  />
                  <span className="option-text">{opt}</span>
                  {submitted && optIdx === q.correct && <span className="correct-mark">✓</span>}
                  {submitted && answers[idx] === optIdx && optIdx !== q.correct && <span className="wrong-mark">✗</span>}
                </label>
              ))}
            </div>
            {submitted && q.explanation && (
              <div className="explanation">
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          className="generate-btn"
          style={{ width: 'auto', padding: '0.75rem 2rem' }}
          disabled={Object.keys(answers).length < quiz.length}
          onClick={() => setSubmitted(true)}
        >
          Отправить ответы
        </button>
      )}

      {submitted && (
        <div className="results-section" style={{ marginTop: '1rem' }}>
          <div className="result-header">
            <h3>Результат: {score}/{quiz.length} ({Math.round((score / quiz.length) * 100)}%)</h3>
            <button className="copy-btn" onClick={() => { setAnswers({}); setSubmitted(false) }}>
              Повторить
            </button>
          </div>
          <div className="slider-container">
            <div style={{
              width: `${(score / quiz.length) * 100}%`,
              height: '30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {Math.round((score / quiz.length) * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}