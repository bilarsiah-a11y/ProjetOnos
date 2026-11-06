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
  
  // États pour les menus
  const [ouvert, setOuvert] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)
  
  // Nouvel état pour la modale de déconnexion
  const [modaleDeconnexion, setModaleDeconnexion] = useState(false)

  const pseudo = (utilisateur?.mail ?? '').split('@')[0]

  // Fonction appelée quand on confirme la déconnexion dans la modale
  const confirmerDeconnexion = () => {
    setModaleDeconnexion(false) // On ferme la modale
    setOuvert(false) // On ferme le menu déroulant
    deconnexion() // On supprime le token et l'utilisateur
    navigate('/connexion') // Redirection
  }

  return (
    <>
      <nav className="navbar-dentiste">
        <Link to="/dentiste/accueil" className="navbar-dentiste-logo">
          <span>ONOS</span>
        </Link>

        <ul className="navbar-dentiste-links">
          {LIENS.map((l) => (
            <li key={l.to}>
              <Link to={l.to}>{l.label}</Link>
            </li>
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
            <span className="navbar-dentiste-arrow">
              {ouvert ? '▲' : '▼'}
            </span>
          </button>

          {ouvert && (
            <div className="navbar-dentiste-menu">
              <Link to="/dentiste/profil" onClick={() => setOuvert(false)}>
                Profil
              </Link>
              {/* Au clic, on ouvre la modale au lieu de déconnecter direct */}
              <button onClick={() => setModaleDeconnexion(true)}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 
          MODALE DE CONFIRMATION DE DÉCONNEXION*/}
      {modaleDeconnexion && (
        <div className="pd-modale-fond" onClick={() => setModaleDeconnexion(false)}>
          <div className="pd-modale-boite" onClick={(e) => e.stopPropagation()}>
            
            <div className="pd-modale-icone">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>

            <h3>Se déconnecter ?</h3>
            <p>
              Êtes-vous sûr de vouloir vous déconnecter de votre espace ? 
              Vous devrez saisir vos identifiants pour vous reconnecter.
            </p>
            
            <div className="pd-modale-actions">
              <button 
                className="dent-btn pd-btn-annuler" 
                onClick={() => setModaleDeconnexion(false)}
              >
                Annuler
              </button>
              <button 
                className="dent-btn dent-btn-danger" 
                onClick={confirmerDeconnexion}
              >
                Oui, me déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NavbarDentiste