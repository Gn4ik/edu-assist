import { useState } from 'react'
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
      <h2 className="result-header" style={{ marginTop: 0 }}>Конспект</h2>

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
              <span>Вставьте текст для конспектирования</span>
            </div>
            <textarea
              className="input-textarea"
              rows={6}
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
              placeholder="Например: Основы машинного обучения"
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
              <option value="es">Испанский</option>
              <option value="fr">Французский</option>
              <option value="de">Немецкий</option>
            </select>
          </div>
          <div>
            <div className="input-label">
              <span>Макс. пунктов</span>
            </div>
            <div className="slider-container">
              <span className="slider-min">3</span>
              <input
                type="range"
                className="questions-slider"
                min={3}
                max={20}
                value={maxPoints}
                onChange={(e) => setMaxPoints(Number(e.target.value))}
              />
              <span className="slider-max">20</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '5px' }}>{maxPoints}</div>
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
          {loading ? <span className="spinner"></span> : 'Сгенерировать конспект'}
        </button>
      </div>

      {result && result.success && (
        <div className="results-section">
          <div className="result-header">
            <h2>Результат</h2>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(result.output)
                alert('Скопировано!')
              }}
            >
              Копировать
            </button>
          </div>
          <div className="summary-content">
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.6 }}>
              {result.output}
            </pre>
          </div>
          <div className="info-box" style={{ marginTop: '1rem' }}>
            {result.from_cache ? 'Из кэша' : 'Новый'} | {result.processing_time_ms} мс
            {result.generation_id && ` | ID: ${result.generation_id}`}
          </div>
        </div>
      )}

      {result && !result.success && (
        <div className="info-box" style={{ backgroundColor: '#fee', color: '#c33' }}>
          {result.error}
        </div>
      )}
    </div>
  )
}