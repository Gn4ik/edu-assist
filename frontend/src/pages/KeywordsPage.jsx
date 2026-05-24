import { useState } from 'react'
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
      <h2 className="result-header" style={{ marginTop: 0 }}>Извлечение ключевых слов</h2>

      <div className="input-section">
        <div className="input-label">
          <span>Вставьте текст для анализа</span>
        </div>
        <textarea
          className="input-textarea"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Вставьте текст для извлечения ключевых слов..."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
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
              <span>Макс. ключевых слов</span>
            </div>
            <div className="slider-container">
              <span className="slider-min">3</span>
              <input
                type="range"
                className="questions-slider"
                min={3}
                max={30}
                value={maxKeywords}
                onChange={(e) => setMaxKeywords(Number(e.target.value))}
              />
              <span className="slider-max">30</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold' }}>{maxKeywords}</div>
          </div>
        </div>

        <button className="generate-btn" onClick={generate} disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Извлечь тэги'}
        </button>
      </div>

      {keywords && Array.isArray(keywords) && keywords.length > 0 && (
        <div className="results-section">
          <div className="result-header">
            <h2>Тэги</h2>
            <div className="info-box" style={{ margin: 0 }}>
              Найдено: {keywords.length} слов
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {keywords.map((kw, i) => (
              <div
                key={i}
                className="mode-btn"
                style={{
                  flex: '0 0 auto',
                  padding: '0.5rem 1rem',
                  cursor: 'default',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none'
                }}
              >
                #{kw}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}