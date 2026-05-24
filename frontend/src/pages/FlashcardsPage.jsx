import { useState } from 'react'
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
      <h2 className="result-header" style={{ marginTop: 0 }}>Карточки для запоминания</h2>

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
              <span>Вставьте текст для создания карточек</span>
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
              <span>Язык</span>
            </div>
            <select className="input-url" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="ru">Русский</option>
              <option value="en">Английский</option>
            </select>
          </div>
          <div>
            <div className="input-label">
              <span>Кол-во карточек</span>
            </div>
            <div className="slider-container">
              <span className="slider-min">1</span>
              <input
                type="range"
                className="questions-slider"
                min={1}
                max={20}
                value={numCards}
                onChange={(e) => setNumCards(Number(e.target.value))}
              />
              <span className="slider-max">20</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '5px' }}>{numCards}</div>
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
          {loading ? <span className="spinner"></span> : 'Сгенерировать карточки'}
        </button>
      </div>

      {flashcards && Array.isArray(flashcards) && (
        <div className="results-section">
          <div className="result-header">
            <h2>Ваши карточки</h2>
            <div className="flashcard-counter">{flashcards.length} карточек</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {flashcards.map((card, i) => (
              <FlashcardFlip key={i} front={card.front} back={card.back} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}