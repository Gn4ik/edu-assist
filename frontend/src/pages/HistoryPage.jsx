import { useState, useEffect } from 'react'
import { Card, Table, Form, Button, Badge, Pagination } from 'react-bootstrap'
import api from '../api/client'

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
    await api.delete(`/api/history/${id}`)
    fetchHistory()
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

  const typeBadge = (type) => {
    const colors = { summary: 'primary', flashcards: 'success', quiz: 'warning', keywords: 'info', simplify: 'secondary', study_plan: 'dark' }
    return <Badge bg={colors[type] || 'secondary'}>{type}</Badge>
  }

  return (
    <div>
      <h2 className="mb-4">История</h2>

      <Card className="mb-3 p-3">
        <div className="d-flex gap-3">
          <Form.Select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1) }}
            style={{ width: 200 }}>
            <option value="">Все типы</option>
            <option value="summary">Конспект</option>
            <option value="flashcards">Карточки</option>
            <option value="quiz">Тест</option>
            <option value="keywords">Ключевые слова</option>
            <option value="simplify">Упрощение</option>
            <option value="study_plan">Учебный план</option>
          </Form.Select>
          <Form.Control value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..." style={{ width: 300 }} />
          <Button onClick={() => { setPage(1); fetchHistory(1) }}>Искать</Button>
        </div>
      </Card>

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Тип</th>
            <th>Ввод</th>
            <th>Модель</th>
            <th>Время (мс)</th>
            <th>Яз</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{typeBadge(item.type)}</td>
              <td className="text-truncate" style={{ maxWidth: 300 }}>{item.input_content}</td>
              <td><small>{item.model_used}</small></td>
              <td>{item.processing_time_ms}</td>
              <td>{item.language}</td>
              <td><small>{new Date(item.created_at).toLocaleDateString()}</small></td>
              <td>
                <Button size="sm" variant={item.is_favorite ? 'warning' : 'outline-warning'}
                  onClick={() => toggleFavorite(item.id, item.is_favorite)}>
                  {item.is_favorite ? 'Убрать' : '★'}
                </Button>{' '}
                <Button size="sm" variant="outline-danger" onClick={() => deleteItem(item.id)}>
                  ✕
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {pages > 1 && (
        <Pagination>
          {Array.from({ length: pages }, (_, i) => (
            <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </div>
  )
}
