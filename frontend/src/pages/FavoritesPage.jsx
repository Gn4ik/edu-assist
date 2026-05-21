import { useState, useEffect } from 'react'
import api from '../api/client'

export default function FavoritesPage() {
  const [items, setItems] = useState([])

  const fetchFavorites = () => {
    api.get('/api/favorites').then((res) => setItems(res.data.items))
  }

  useEffect(fetchFavorites, [])

  const remove = async (id) => {
    if (window.confirm('Удалить из избранного?')) {
      await api.delete(`/api/favorites/${id}`)
      fetchFavorites()
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      summary: '📝',
      flashcards: '🃏',
      quiz: '❓',
      keywords: '🔑',
      simplify: '📖',
      study_plan: '📅'
    }
    return icons[type] || '📄'
  }

  return (
    <div>
      <h2 className="result-header" style={{ marginTop: 0 }}>⭐ Избранное</h2>

      {items.length === 0 ? (
        <div className="input-section" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
          <h3>Пока нет избранных</h3>
          <p className="text-muted">Отмечайте понравившиеся генерации в истории, чтобы они появились здесь</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map((item) => (
            <div key={item.favorite_id} className="results-section">
              <div className="result-header" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(item.type)}</span>
                  <h3 style={{ margin: 0, color: '#667eea' }}>{item.type}</h3>
                  <code style={{ fontSize: '0.85rem' }}>{item.model_used}</code>
                </div>
                <button
                  className="copy-btn"
                  style={{ background: '#ef4444' }}
                  onClick={() => remove(item.favorite_id)}
                >
                  🗑️ Удалить
                </button>
              </div>
              <div className="input-section" style={{ marginBottom: 0, padding: '1rem' }}>
                <div className="input-label" style={{ marginBottom: '0.5rem' }}>
                  <span className="label-icon">📥</span>
                  <span>Входные данные</span>
                </div>
                <div className="info-box" style={{ marginBottom: '1rem' }}>
                  {item.input_content}
                </div>

                {item.output && (
                  <>
                    <div className="input-label" style={{ marginBottom: '0.5rem' }}>
                      <span className="label-icon">📤</span>
                      <span>Результат</span>
                    </div>
                    <div className="info-box" style={{ marginBottom: 0, background: 'var(--bg, #f9f9f9)' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {typeof item.output === 'string'
                          ? item.output.substring(0, 200) + (item.output.length > 200 ? '...' : '')
                          : JSON.stringify(item.output, null, 2).substring(0, 200)}
                      </pre>
                    </div>
                  </>
                )}

                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--muted, #666)' }}>
                  Добавлено: {new Date(item.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}