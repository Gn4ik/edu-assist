import { useState, useEffect } from 'react'
import api from '../api/client'
import HistoryDetailModal from '../components/HistoryDetailModal'

const getTypeLabel = (type) => {
  const labels = {
    summary: 'Конспект',
    flashcards: 'Карточки',
    quiz: 'Тест',
    keywords: 'Ключевые слова',
    simplify: 'Упрощение',
    study_plan: 'Учебный план'
  }
  return labels[type] || type
}

export default function FavoritesPage() {
  const [items, setItems] = useState([])
  const [selectedGenerationId, setSelectedGenerationId] = useState(null)
  const [showModal, setShowModal] = useState(false)

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

  const viewDetails = (generationId) => {
    setSelectedGenerationId(generationId)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedGenerationId(null)
  }

  const handleFavoriteToggle = async (id, isFav) => {
    if (isFav) {
      const fav = items.find(f => f.generation_id === id)
      if (fav) await api.delete(`/api/favorites/${fav.favorite_id}`)
      fetchFavorites()
    }
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
      <h2 className="result-header" style={{ marginTop: 0 }}>Избранное</h2>

      {items.length === 0 ? (
        <div className="input-section" style={{ textAlign: 'center' }}>
          <h3>Пока нет избранных</h3>
          <p className="text-muted">Отмечайте понравившиеся генерации в истории, чтобы они появились здесь</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map((item) => (
            <div 
              key={item.favorite_id} 
              className="results-section"
              style={{ cursor: 'pointer' }}
              onClick={() => viewDetails(item.generation_id)}
            >
              <div className="result-header" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                    {getTypeLabel(item.type)}
                  </span>
                  <code style={{ fontSize: '0.85rem' }}>{item.model_used}</code>
                </div>
                <button
                  className="copy-btn"
                  style={{ background: '#ef4444' }}
                  onClick={(e) => { e.stopPropagation(); remove(item.favorite_id) }}
                >
                  Удалить
                </button>
              </div>
              <div className="input-section" style={{ marginBottom: 0, padding: '1rem' }}>
                <div className="input-label" style={{ marginBottom: '0.5rem' }}>
                  <span>Входные данные</span>
                </div>
                <div className="info-box" style={{ marginBottom: '1rem' }}>
                  {item.input_content}
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--muted, #666)' }}>
                  Добавлено: {new Date(item.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <HistoryDetailModal
        show={showModal}
        onClose={closeModal}
        generationId={selectedGenerationId}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </div>
  )
}