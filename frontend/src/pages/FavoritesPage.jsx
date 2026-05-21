import { useState, useEffect } from 'react'
import { Card, Table, Button, Badge } from 'react-bootstrap'
import api from '../api/client'

export default function FavoritesPage() {
  const [items, setItems] = useState([])

  const fetchFavorites = () => {
    api.get('/api/favorites').then((res) => setItems(res.data.items))
  }

  useEffect(fetchFavorites, [])

  const remove = async (id) => {
    await api.delete(`/api/favorites/${id}`)
    fetchFavorites()
  }

  const typeBadge = (type) => {
    const colors = { summary: 'primary', flashcards: 'success', quiz: 'warning', keywords: 'info', simplify: 'secondary', study_plan: 'dark' }
    return <Badge bg={colors[type] || 'secondary'}>{type}</Badge>
  }

  return (
    <div>
      <h2 className="mb-4">Избранное</h2>
      {items.length === 0 ? (
        <Card className="p-4 text-center text-muted">Пока нет избранных. Отмечайте элементы в Истории.</Card>
      ) : (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Тип</th>
              <th>Ввод</th>
              <th>Модель</th>
              <th>Добавлено</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.favorite_id}>
                <td>{typeBadge(item.type)}</td>
                <td className="text-truncate" style={{ maxWidth: 300 }}>{item.input_content}</td>
                <td><small>{item.model_used}</small></td>
                <td><small>{new Date(item.created_at).toLocaleDateString()}</small></td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => remove(item.favorite_id)}>
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
