import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" /></div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
