import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="input-section" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2 className="result-header" style={{ justifyContent: 'center', borderBottom: 'none' }}>
        Вход в EduAssist
      </h2>
      {error && (
        <div className="info-box" style={{ backgroundColor: '#fee', color: '#c33', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="input-label">
          <span>Имя пользователя или Email</span>
        </div>
        <input
          type="text"
          className="input-textarea"
          style={{ marginBottom: '1rem' }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <div className="input-label">
          <span>Пароль</span>
        </div>
        <input
          type="password"
          className="input-textarea"
          style={{ marginBottom: '1.5rem' }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="generate-btn" disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Войти'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted, #666)' }}>
        Нет аккаунта? <Link to="/register" style={{ color: '#667eea' }}>Регистрация</Link>
      </p>
    </div>
  )
}