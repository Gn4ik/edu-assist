import { useState } from 'react'
import api from '../api/client'
import QuizRunner from '../components/QuizRunner'

export default function QuizPage() {
  const [mode, setMode] = useState('text')
  const [text, setText] = useState('')
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('ru')
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const [model, setModel] = useState('')
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setQuiz(null)
    try {
      const body = { language, num_questions: numQuestions, difficulty }
      if (model) body.model = model
      if (mode === 'text') body.text = text
      else body.topic = topic

      const res = await api.post('/api/generation/quiz', body)
      if (res.data.success) {
        setQuiz(res.data.output)
      }
    } catch (err) {
      setQuiz(null)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyIcon = (diff) => {
    switch (diff) {
      case 'easy': return '🟢'
      case 'medium': return '🟡'
      case 'hard': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div>
      <h2 className="result-header" style={{ marginTop: 0 }}>Генератор тестов</h2>

      <div className="input-section">
        <div className="modes">
          <button
            className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
            onClick={() => setMode('text')}
          > Из текста
          </button>
          <button
            className={`mode-btn ${mode === 'topic' ? 'active' : ''}`}
            onClick={() => setMode('topic')}
          > По теме
          </button>
        </div>

        {mode === 'text' ? (
          <>
            <div className="input-label">
              <span>Вставьте текст для создания теста</span>
            </div>
            <textarea
              className="input-textarea"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Вставьте текст..."
            />
          </>
        ) : (
          <>
            <div className="input-label">
              <span>Введите тему</span>
            </div>
            <input
              type="text"
              className="input-url"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Введите тему..."
            />
          </>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <div className="input-label">
              <span>Кол-во вопросов</span>
            </div>
            <div className="slider-container">
              <span className="slider-min">1</span>
              <input
                type="range"
                className="questions-slider"
                min={1}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              />
              <span className="slider-max">20</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold' }}>{numQuestions}</div>
          </div>

          <div>
            <div className="input-label">
              <span>Сложность</span>
            </div>
            <select className="input-url" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">{getDifficultyIcon('easy')} Лёгкий</option>
              <option value="medium">{getDifficultyIcon('medium')} Средний</option>
              <option value="hard">{getDifficultyIcon('hard')} Сложный</option>
            </select>
          </div>

          <div>
            <div className="input-label">
              <span>Язык</span>
            </div>
            <select className="input-url" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="ru">Русский</option>
              <option value="en">Английский</option>
            </select>
          </div>

          <div>
            <div className="input-label">
              <span>Модель</span>
            </div>
            <input
              type="text"
              className="input-url"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="llama3.1:latest"
            />
          </div>
        </div>

        <button className="generate-btn" onClick={generate} disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Сгенерировать тест'}
        </button>
      </div>

      {quiz && (
        <div className="results-section">
          <div className="result-header">
            <h2>Ваш тест</h2>
            <div className="info-box" style={{ margin: 0 }}>
              {getDifficultyIcon(difficulty)} {difficulty === 'easy' ? 'Лёгкий' : difficulty === 'medium' ? 'Средний' : 'Сложный'} | {numQuestions} вопросов
            </div>
          </div>
          <QuizRunner quiz={quiz} />
        </div>
      )}
    </div>
  )
}