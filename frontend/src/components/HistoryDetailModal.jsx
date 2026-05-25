import { useState, useEffect } from 'react'
import FlashcardFlip from './FlashcardFlip'
import QuizRunner from './QuizRunner'
import api from '../api/client'
import MarkdownRenderer from './MarkdownRenderer'

export default function HistoryDetailModal({ show, onClose, generationId, onFavoriteToggle }) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (show && generationId) {
      fetchDetail()
    }
  }, [show, generationId])

  const fetchDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/history/${generationId}`)
      setItem(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      summary: 'Конспект',
      flashcards: 'Карточки',
      quiz: 'Тест',
      keywords: 'Ключевые слова',
      simplify: 'Упрощение текста',
      study_plan: 'Учебный план'
    }
    return labels[type] || type
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const renderDetailContent = () => {
    if (!item) return null

    const parsedOutput = (() => {
      try {
        return JSON.parse(item.output_content)
      } catch {
        return item.output_content
      }
    })()

    switch (item.type) {
      case 'flashcards':
        return (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Array.isArray(parsedOutput) && parsedOutput.map((card, idx) => (
              <FlashcardFlip key={idx} front={card.front} back={card.back} />
            ))}
          </div>
        )
      
      case 'quiz':
        return <QuizRunner quiz={Array.isArray(parsedOutput) ? parsedOutput : []} />
      
      case 'keywords':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {Array.isArray(parsedOutput) && parsedOutput.map((kw, idx) => (
              <div
                key={idx}
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
        )
      
      case 'study_plan':
        if (typeof parsedOutput === 'object' && parsedOutput.sessions) {
          return (
            <div>
              <div className="info-box" style={{ marginBottom: '1rem' }}>
                Всего часов: {parsedOutput.total_hours}
              </div>
              {parsedOutput.sessions.map((session, idx) => (
                <div key={idx} className="test-item" style={{ marginBottom: '1rem' }}>
                  <div className="test-question">
                    <span className="question-number">День {session.day}:</span>
                    <span>{session.topic}</span>
                  </div>
                  <div className="info-box" style={{ margin: '0.5rem 0' }}>
                    Часов: {session.hours}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {session.tasks.map((task, taskIdx) => (
                      <li key={taskIdx}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )
        }
        return (
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.6 }}>
            {item.output_content}
          </pre>
        )
      case 'simplify':
        return <MarkdownRenderer content={item.output_content} />
      
      default:
          return <MarkdownRenderer content={item.output_content} />
    }
  }

  if (!show) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--surface, white)',
          borderRadius: '16px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" />
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="info-box" style={{ backgroundColor: '#fee', color: '#c33' }}>
              {error}
            </div>
            <button className="generate-btn" onClick={onClose} style={{ marginTop: '1rem' }}>
              Закрыть
            </button>
          </div>
        ) : item && (
          <>
            <div className="result-header" style={{ padding: '1.5rem 1.5rem 0 1.5rem', marginBottom: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
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
                  {onFavoriteToggle && (
                    <button
                      className="copy-btn"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.85rem',
                        background: item.is_favorite ? '#f59e0b' : '#6b7280'
                      }}
                      onClick={() => onFavoriteToggle(item.id, item.is_favorite)}
                      title={item.is_favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      {item.is_favorite ? '⭐ В избранном' : '☆ В избранное'}
                    </button>
                  )}
                </div>
                <div className="info-box" style={{ marginTop: '0.5rem' }}>
                  {item.from_cache ? 'Из кэша' : 'Новый'} | {item.processing_time_ms} мс | {item.model_used}
                </div>
              </div>
              <button 
                className="copy-btn" 
                style={{ background: '#ef4444' }}
                onClick={onClose}
              >
                ✕ Закрыть
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div className="input-section" style={{ marginBottom: '1.5rem' }}>
                <div className="input-label">
                  <span>Входные данные</span>
                  <button
                    className="copy-btn"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.5rem' }}
                    onClick={() => copyToClipboard(item.input_content)}
                  >
                    Копировать
                  </button>
                </div>
                <div className="info-box" style={{ marginBottom: 0, whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
                  {item.input_content}
                </div>
                <div className="text-muted small" style={{ marginTop: '0.5rem' }}>
                  {item.input_type === 'text' ? 'Из текста' : 'По теме'}
                  {item.language && ` | Язык: ${item.language}`}
                  {item.difficulty && ` | Сложность: ${item.difficulty}`}
                </div>
              </div>

              <div className="results-section">
                <div className="input-label">
                  <span>Результат</span>
                  <button
                    className="copy-btn"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.5rem' }}
                    onClick={() => copyToClipboard(item.output_content)}
                  >
                    Копировать
                  </button>
                </div>
                {renderDetailContent()}
              </div>

              <div className="text-muted small" style={{ marginTop: '1rem', textAlign: 'center' }}>
                Создано: {new Date(item.created_at).toLocaleString('ru-RU')}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}