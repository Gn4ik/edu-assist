import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  //if (!user) return null

  const navItems = [
    { path: '/', label: 'Панель', icon: '📊' },
    { path: '/summary', label: 'Конспект', icon: '📝' },
    { path: '/flashcards', label: 'Карточки', icon: '🃏' },
    { path: '/quiz', label: 'Тест', icon: '❓' },
    { path: '/keywords', label: 'Ключевые слова', icon: '🔑' },
    { path: '/history', label: 'История', icon: '📜' },
    { path: '/favorites', label: 'Избранное', icon: '⭐' },
  ]

  return (
    <div className="header">
      <div className="header-content">
        {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1>📚 EduAssist</h1>
            <p>AI-ассистент для обучения</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeToggle />
            <Link to="/settings" style={{ textDecoration: 'none' }}>
              <div className="info-box" style={{ margin: 0, cursor: 'pointer' }}>
                👤 {user.username}
              </div>
            </Link>
            <button className="copy-btn" onClick={logout} style={{ background: '#ef4444' }}>
              🚪 Выйти
            </button>
          </div>
        </div> */}

        <div className="modes" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none', flex: 1 }}>
              <div className={`mode-btn ${location.pathname === item.path ? 'active' : ''}`}>
                <span className="mode-icon">{item.icon}</span> {item.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}