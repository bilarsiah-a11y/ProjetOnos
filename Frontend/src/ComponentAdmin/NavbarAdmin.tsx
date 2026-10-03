import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import './NavbarAdmin.css'

function NavbarAdmin() {
  const { utilisateur, deconnexion } = useAuth()
  const navigate = useNavigate()
  const [ouvert, setOuvert] = useState(false)

  const mail = utilisateur?.mail ?? ''
  const pseudo = mail.split('@')[0]
  const initiale = mail.charAt(0).toUpperCase()

  const seDeconnecter = () => {
    deconnexion()
    setOuvert(false)
    navigate('/connexion')
  }

  return (
    <nav className="navbar-admin">
      <Link to="/admin/accueil" className="navbar-admin-logo">
        {/* gardez ici votre <svg> du logo tel quel */}
        <span>ONOS</span>
      </Link>

      <ul className="navbar-admin-links">
        <li><Link to="/admin/accueil">Accueil</Link></li>
        <li><Link to="/admin/annuaire">Annuaire</Link></li>
        <li><Link to="/admin/actualites">Gestion actualité</Link></li>
        <li><Link to="/admin/dentistes">Gestion dentiste</Link></li>
        <li><Link to="/admin/notifications">Notification</Link></li>
      </ul>

      <div className="navbar-admin-profil">
        <button className="navbar-admin-profil-btn" onClick={() => setOuvert(!ouvert)}>
          <span className="navbar-admin-avatar">{initiale}</span>
          <span>{pseudo}</span>
          <span>{ouvert ? '▲' : '▼'}</span>
        </button>

        {ouvert && (
          <div className="navbar-admin-menu">
            <Link to="/admin/profil" onClick={() => setOuvert(false)}>Profil</Link>
            <button onClick={seDeconnecter}>Déconnexion</button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavbarAdmin