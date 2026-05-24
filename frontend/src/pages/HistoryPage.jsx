import { useState, useEffect } from 'react'
import api from '../api/client'

const getTypeIcon = (type) => {
  return ''
}


export default function HistoryPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchHistory = (p = page) => {
    const params = { page: p, per_page: 20 }
    if (filter) params.type = filter
    if (search) params.search = search
    api.get('/api/history', { params }).then((res) => {
      setItems(res.data.items)
      setTotal(res.data.total)
      setPages(res.data.pages)
    })
  }

  useEffect(() => { fetchHistory() }, [page, filter])

  const deleteItem = async (id) => {
    if (window.confirm('Удалить этот элемент?')) {
      await api.delete(`/api/history/${id}`)
      fetchHistory()
    }
  }

  const toggleFavorite = async (id, isFav) => {
    if (isFav) {
      const favs = (await api.get('/api/favorites')).data.items
      const fav = favs.find((f) => f.generation_id === id)
      if (fav) await api.delete(`/api/favorites/${fav.favorite_id}`)
    } else {
      await api.post('/api/favorites', { generation_id: id })
    }
    fetchHistory()
  }

  const getTypeColor = (type) => {
    const colors = {
      summary: '#667eea',
      flashcards: '#10b981',
      quiz: '#f59e0b',
      keywords: '#8b5cf6',
      simplify: '#ef4444',
      study_plan: '#06b6d4'
    }
    return colors[type] || '#6b7280'
  }

  return (
    <div>
      <h2 className="result-header" style={{ marginTop: 0 }}>История генераций</h2>

      <div className="input-section" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div className="input-label">
              <span>Фильтр по типу</span>
            </div>
            <select
              className="input-url"
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1) }}
            >
              <option value="">Все типы</option>
              <option value="summary">Конспект</option>
              <option value="flashcards">Карточки</option>
              <option value="quiz">Тест</option>
              <option value="keywords">Тэги</option>
              <option value="simplify">Упрощение</option>
              <option value="study_plan">Учебный план</option>
            </select>
          </div>

          <div style={{ flex: 2 }}>
            <div className="input-label">
              <span>Поиск по тексту</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-url"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                onKeyPress={(e) => e.key === 'Enter' && fetchHistory(1)}
              />
              <button className="copy-btn" onClick={() => { setPage(1); fetchHistory(1) }}>
                Искать
              </button>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="info-box" style={{ justifyContent: 'center' }}>
          История пуста. Сгенерируйте что-нибудь!
        </div>
      ) : (
        <>
          <div className="results-section" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border, #e0e0e0)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Тип</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Ввод</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Модель</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Время</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Дата</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border, #f0f0f0)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        background: getTypeColor(item.type) + '20',
                        color: getTypeColor(item.type),
                        fontWeight: '600'
                      }}>
                        {getTypeIcon(item.type)} {item.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.input_content}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <code style={{ fontSize: '0.85rem' }}>{item.model_used}</code>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="info-box" style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>
                        {item.processing_time_ms} мс
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                      {new Date(item.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="copy-btn"
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.85rem',
                            background: item.is_favorite ? '#f59e0b' : '#6b7280'
                          }}
                          onClick={() => toggleFavorite(item.id, item.is_favorite)}
                          title={item.is_favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                        >
                          {item.is_favorite ? '⭐' : '☆'}
                        </button>
                        <button
                          className="copy-btn"
                          style={{ padding: '0.1rem 0.5rem', fontSize: '1.1rem', background: '#ef4444', color: '#ffffff' }}
                          onClick={() => deleteItem(item.id)}
                          title="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flashcard-controls" style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                ◀ Назад
              </button>
              <span style={{ padding: '0.5rem 1rem', background: 'var(--surface, #f0f4ff)', borderRadius: '8px' }}>
                Страница {page} из {pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pages}
              >
                Вперед ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}