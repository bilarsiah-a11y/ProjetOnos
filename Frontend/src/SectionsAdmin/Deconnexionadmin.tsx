import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

function Deconnexionadmin() {
  const { deconnexion } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    deconnexion()
    navigate('/connexion', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <p>Déconnexion...</p>
}

export default Deconnexionadmin