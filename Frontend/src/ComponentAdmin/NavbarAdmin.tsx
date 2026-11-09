

import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { 
  House,              // Pour l'Accueil
  BookUser,           // Pour l'Annuaire
  Newspaper,          // Pour Gestion actualité
  Stethoscope,        // Pour Gestion dentiste
  Bell                // Pour Notification
} from 'lucide-react'
import '../ComponentCommun/MenuBurger.css'
import './NavbarAdmin.css'

const LIENS = [
  { to: '/admin/accueil', label: 'Accueil', icon: House },
  { to: '/admin/annuaire', label: 'Annuaire', icon: BookUser },
  { to: '/admin/actualites', label: 'Gestion actualité', icon: Newspaper },
  { to: '/admin/dentistes', label: 'Gestion dentiste', icon: Stethoscope },
  { to: '/admin/notifications', label: 'Notification', icon: Bell },
]

function NavbarAdmin() {
  const { utilisateur, deconnexion } = useAuth()
  const navigate = useNavigate()
  const [ouvert, setOuvert] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [modaleDeconnexion, setModaleDeconnexion] = useState(false)

  // ÉTAT DYNAMIQUE POUR LE NOMBRE DE NOTIFICATIONS
  const [nombreNotifications, setNombreNotifications] = useState(0)

  // ÉCOUTEUR D'ÉVÉNEMENT
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      setNombreNotifications(customEvent.detail)
    }

    window.addEventListener('update-notifications', handleUpdate)

    return () => {
      window.removeEventListener('update-notifications', handleUpdate)
    }
  }, [])

  const mail = utilisateur?.mail ?? ''
  const pseudo = mail.split('@')[0]
  const initiale = mail.charAt(0).toUpperCase()

  const confirmerDeconnexion = () => {
    deconnexion()
    setModaleDeconnexion(false)
    setOuvert(false)
    navigate('/connexion')
  }

  return (
    <>
      <nav className="navbar-admin">
        <Link to="/admin/accueil" className="navbar-admin-logo">
          <span>ONOS</span> <br />
          <p>Page Admin</p>
        </Link>

        <ul className="navbar-admin-links">
          {LIENS.map((l) => {
            const Icon = l.icon;
            return (
              <li key={l.to}>
                {/* On utilise NavLink ici pour avoir la classe "active" automatiquement */}
                <NavLink 
                  to={l.to} 
                  title={l.label} 
                  className={({ isActive }) => isActive ? "nav-icon-link active" : "nav-icon-link"}
                >
                  <Icon size={22} strokeWidth={1.8} />
                  
                  {/* BADGE DYNAMIQUE */}
                  {l.label === 'Notification' && nombreNotifications > 0 && (
                    <span className="badge-notification">{nombreNotifications}</span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>

        <div className="burger">
          <button
            className="burger-btn"
            aria-label="Menu"
            aria-expanded={menuOuvert}
            onClick={() => {
              setMenuOuvert(!menuOuvert)
              setOuvert(false)
            }}
          >
            {menuOuvert ? '✕' : '☰'}
          </button>
          {menuOuvert && (
            <div className="burger-panel">
              {LIENS.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink 
                    key={l.to} 
                    to={l.to} 
                    onClick={() => setMenuOuvert(false)} 
                    className={({ isActive }) => isActive ? "burger-link active" : "burger-link"}
                  >
                    <Icon size={20} strokeWidth={1.8} style={{ marginRight: '10px' }} />
                    {l.label}
                    {l.label === 'Notification' && nombreNotifications > 0 && (
                      <span className="badge-notification-mobile">{nombreNotifications}</span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>

        <div className="navbar-admin-profil">
          <button
            className="navbar-admin-profil-btn"
            onClick={() => {
              setOuvert(!ouvert)
              setMenuOuvert(false)
            }}
          >
            <span className="navbar-admin-avatar">{initiale}</span>
            <span className="navbar-admin-pseudo">{pseudo}</span>
            <span className="navbar-admin-arrow">
              {ouvert ? '▲' : '▼'}
            </span>
          </button>

          {ouvert && (
            <div className="navbar-admin-menu">
              <Link to="/admin/profil" onClick={() => setOuvert(false)}>
                Profil
              </Link>
              <button onClick={() => {
                setModaleDeconnexion(true)
                setOuvert(false)
              }}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>

      {modaleDeconnexion && (
        <div className="modal-overlay" onClick={() => setModaleDeconnexion(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Déconnexion</h2>
            <p>Êtes-vous sûr de vouloir vous déconnecter de votre espace administrateur ?</p>
            <div className="modal-actions">
              <button className="modal-btn-annuler" onClick={() => setModaleDeconnexion(false)}>
                Annuler
              </button>
              <button className="modal-btn-confirmer" onClick={confirmerDeconnexion}>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NavbarAdmin