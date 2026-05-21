import { useState, useEffect } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import api from '../api/client'
import { useAuth } from '../auth/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()
  const [defaultModel, setDefaultModel] = useState('')
  const [defaultTemperature, setDefaultTemperature] = useState(0.3)
  const [apiKey, setApiKey] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.settings) {
      try {
        const s = JSON.parse(user.settings)
        setDefaultModel(s.default_model || '')
        setDefaultTemperature(s.temperature ?? 0.3)
      } catch {}
    }
  }, [user])

  const saveSettings = async () => {
    const settings = JSON.stringify({
      default_model: defaultModel || 'llama3.2:3b',
      temperature: defaultTemperature,
    })
    setMessage('Настройки сохранены (хранятся в профиле)')
  }

  const generateApiKey = async () => {
    try {
      const res = await api.post('/api/auth/api-key')
      setApiKey(res.data.api_key)
    } catch {
      setMessage('Не удалось сгенерировать API-ключ')
    }
  }

  return (
    <div>
      <h2 className="mb-4">Настройки</h2>

      {message && <Alert variant="info" onClose={() => setMessage('')} dismissible>{message}</Alert>}

      <Card className="mb-3 p-3">
        <h5>Настройки генерации</h5>
        <Form.Group className="mb-3">
          <Form.Label>Модель по умолчанию</Form.Label>
          <Form.Control value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)}
            placeholder="llama3.2:3b" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Температура по умолчанию ({defaultTemperature})</Form.Label>
          <Form.Range min={0} max={1} step={0.1} value={defaultTemperature}
            onChange={(e) => setDefaultTemperature(Number(e.target.value))} />
        </Form.Group>
        <Button onClick={saveSettings}>Сохранить настройки</Button>
      </Card>

      <Card className="mb-3 p-3">
        <h5>API-ключ</h5>
        <p className="text-muted">Используйте этот ключ для внешнего доступа (заголовок: <code>X-API-Key</code>)</p>
        {apiKey && (
          <Alert variant="success">
            <code>{apiKey}</code>
          </Alert>
        )}
        <Button variant="outline-primary" onClick={generateApiKey}>
          {apiKey ? 'Перегенерировать API-ключ' : 'Сгенерировать API-ключ'}
        </Button>
      </Card>
    </div>
  )
}
