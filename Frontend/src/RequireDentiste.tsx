import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

function RequireDentiste() {
  const { utilisateur, chargement } = useAuth()

  if (chargement) return <p>Chargement...</p>
  if (!utilisateur || utilisateur.role !== 'dentiste') {
    return <Navigate to="/connexion" replace />
  }
  return <Outlet />
}

export default RequireDentiste