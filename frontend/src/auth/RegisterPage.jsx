import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="input-section" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2 className="result-header" style={{ justifyContent: 'center', borderBottom: 'none' }}>
        Создать аккаунт
      </h2>
      {error && (
        <div className="info-box" style={{ backgroundColor: '#fee', color: '#c33', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="input-label">
          <span className="label-icon">👤</span>
          <span>Имя пользователя (мин. 3 символа)</span>
        </div>
        <input
          type="text"
          className="input-textarea"
          style={{ marginBottom: '1rem' }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          required
        />

        <div className="input-label">
          <span className="label-icon">📧</span>
          <span>Email</span>
        </div>
        <input
          type="email"
          className="input-textarea"
          style={{ marginBottom: '1rem' }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="input-label">
          <span className="label-icon">🔒</span>
          <span>Пароль (мин. 8 символов)</span>
        </div>
        <input
          type="password"
          className="input-textarea"
          style={{ marginBottom: '1.5rem' }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit" className="generate-btn" disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Зарегистрироваться'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted, #666)' }}>
        Уже есть аккаунт? <Link to="/login" style={{ color: '#667eea' }}>Войти</Link>
      </p>
    </div>
  )
}