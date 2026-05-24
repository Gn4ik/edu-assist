import { useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from '../auth/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()
  const [defaultModel, setDefaultModel] = useState('')
  const [defaultTemperature, setDefaultTemperature] = useState(0.3)
  const [apiKey, setApiKey] = useState(null)
  const [message, setMessage] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (user?.settings) {
      try {
        const s = JSON.parse(user.settings)
        setDefaultModel(s.default_model || '')
        setDefaultTemperature(s.temperature ?? 0.3)
      } catch { }
    }
  }, [user])

  const saveSettings = async () => {
    const settings = JSON.stringify({
      default_model: defaultModel || 'llama3.1:latest',
      temperature: defaultTemperature,
    })
    setMessage('Настройки сохранены!')
    setTimeout(() => setMessage(''), 3000)
  }

  const generateApiKey = async () => {
    try {
      const res = await api.post('/api/auth/api-key')
      setApiKey(res.data.api_key)
      setMessage('Новый API-ключ сгенерирован!')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('Не удалось сгенерировать API-ключ')
    }
  }

  return (
    <div>
      <h2 className="result-header" style={{ marginTop: 0 }}>Настройки</h2>

      {message && (
        <div className="info-box" style={{ marginBottom: '1rem', backgroundColor: '#10b98120', color: '#10b981' }}>
          {message}
        </div>
      )}

      <div className="input-section">
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Настройки генерации</h3>

        <div className="input-label">
          <span>Модель по умолчанию</span>
        </div>
        <input
          type="text"
          className="input-url"
          value={defaultModel}
          onChange={(e) => setDefaultModel(e.target.value)}
          placeholder="llama3.1:latest"
          style={{ marginBottom: '1rem' }}
        />

        <div className="input-label">
          <span>Температура (креативность): {defaultTemperature}</span>
        </div>
        <div className="slider-container">
          <span className="slider-min">0 (точный)</span>
          <input
            type="range"
            className="questions-slider"
            min={0}
            max={1}
            step={0.1}
            value={defaultTemperature}
            onChange={(e) => setDefaultTemperature(Number(e.target.value))}
          />
          <span className="slider-max">1 (креативный)</span>
        </div>

        <button className="generate-btn" onClick={saveSettings} style={{ marginTop: '1.5rem' }}>
          Сохранить настройки
        </button>
      </div>

      <div className="input-section">
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>API-доступ</h3>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          Используйте этот ключ для внешнего доступа к API (заголовок: <code>X-API-Key</code>)
        </p>

        {apiKey && (
          <div className="info-box" style={{ marginBottom: '1rem', backgroundColor: '#10b98120', wordBreak: 'break-all' }}>
            <strong>Ваш API-ключ:</strong>
            <br />
            <code style={{ fontSize: '0.85rem' }}>
              {showApiKey ? apiKey : '•'.repeat(40)}
            </code>
            <button
              className="copy-btn"
              style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? 'Показать' : 'скрыть'}
            </button>
            <button
              className="copy-btn"
              style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
              onClick={() => {
                navigator.clipboard.writeText(apiKey)
                setMessage('API-ключ скопирован!')
              }}
            >
            </button>
          </div>
        )}

        <button className="copy-btn" onClick={generateApiKey} style={{ width: '100%' }}>
          {apiKey ? 'Перегенерировать API-ключ' : 'Сгенерировать API-ключ'}
        </button>

        <div className="info-box" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          API-ключ используется для авторизации запросов к API из внешних приложений
        </div>
      </div>
    </div>
  )
}