
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import '../ComponentCommun/MenuBurger.css'
import './NavbarDentiste.css'

const LIENS = [
  { to: '/dentiste/accueil', label: 'Accueil' },
  { to: '/dentiste/annuaire', label: 'Annuaire' },
  { to: '/dentiste/rendez-vous', label: 'Rendez-vous' },
]

function NavbarDentiste() {
  const { utilisateur, deconnexion } = useAuth()
  const navigate = useNavigate()
  const [ouvert, setOuvert] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)

  const pseudo = (utilisateur?.mail ?? '').split('@')[0]

  const seDeconnecter = () => {
    deconnexion()
    setOuvert(false)
    navigate('/connexion')
  }

  return (
    <nav className="navbar-dentiste">
      <Link to="/dentiste/accueil" className="navbar-dentiste-logo">
        <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="onosGradientDentiste" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#E0DFFF" />
            </linearGradient>
          </defs>
          <path d="M75 15 C 45 15, 45 45, 25 45 C 10 45, 10 25, 25 25"
            stroke="url(#onosGradientDentiste)" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M25 55 C 55 55, 55 85, 75 85 C 90 85, 90 65, 75 65"
            stroke="url(#onosGradientDentiste)" strokeWidth="9" strokeLinecap="round" fill="none" />
        </svg>
        <span>ONOS</span>
      </Link>

      <ul className="navbar-dentiste-links">
        {LIENS.map((l) => (
          <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
        ))}
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
            {LIENS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOuvert(false)}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="navbar-dentiste-profil">
        <button
          className="navbar-dentiste-profil-btn"
          onClick={() => {
            setOuvert(!ouvert)
            setMenuOuvert(false)
          }}
        >
          <span className="navbar-dentiste-avatar">👤</span>
          <span className="navbar-dentiste-pseudo">{pseudo}</span>
          <span>{ouvert ? '▲' : '▼'}</span>
        </button>

        {ouvert && (
          <div className="navbar-dentiste-menu">
            <Link to="/dentiste/profil" onClick={() => setOuvert(false)}>Profil</Link>
            <button onClick={seDeconnecter}>Déconnexion</button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavbarDentiste