import { useState, useEffect } from 'react'
import api from '../api/client'

export default function ModelSelector({ value, onChange, placeholder = "Выберите модель", label = "Модель", autoSelectFirst = true }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/models')
      const modelList = res.data.models || []
      setModels(modelList)
      
      if (autoSelectFirst && modelList.length > 0 && !value) {
        onChange(modelList[0])
      }
    } catch (err) {
      console.error('Failed to fetch models:', err)
      setError('Не удалось загрузить модели')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="input-label">
        <span>{label}</span>
        {loading && <span className="spinner" style={{ width: '16px', height: '16px', marginLeft: '8px' }}></span>}
        {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginLeft: '8px' }}>{error}</span>}
      </div>
      <select
        className="input-url"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="">{placeholder}</option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  )
}