// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../AuthContext'
// import './NavbarAdmin.css'

// function NavbarAdmin() {
//   const { utilisateur, deconnexion } = useAuth()
//   const navigate = useNavigate()
//   const [ouvert, setOuvert] = useState(false)

//   const mail = utilisateur?.mail ?? ''
//   const pseudo = mail.split('@')[0]
//   const initiale = mail.charAt(0).toUpperCase()

//   const seDeconnecter = () => {
//     deconnexion()
//     setOuvert(false)
//     navigate('/connexion')
//   }

//   return (
//     <nav className="navbar-admin">
//       <Link to="/admin/accueil" className="navbar-admin-logo">
//         {/* gardez ici votre <svg> du logo tel quel */}
//         <span>ONOS</span>
//       </Link>

//       <ul className="navbar-admin-links">
//         <li><Link to="/admin/accueil">Accueil</Link></li>
//         <li><Link to="/admin/annuaire">Annuaire</Link></li>
//         <li><Link to="/admin/actualites">Gestion actualité</Link></li>
//         <li><Link to="/admin/dentistes">Gestion dentiste</Link></li>
//         <li><Link to="/admin/notifications">Notification</Link></li>
//       </ul>

//       <div className="navbar-admin-profil">
//         <button className="navbar-admin-profil-btn" onClick={() => setOuvert(!ouvert)}>
//           <span className="navbar-admin-avatar">{initiale}</span>
//           <span>{pseudo}</span>
//           <span>{ouvert ? '▲' : '▼'}</span>
//         </button>

//         {ouvert && (
//           <div className="navbar-admin-menu">
//             <Link to="/admin/profil" onClick={() => setOuvert(false)}>Profil</Link>
//             <button onClick={seDeconnecter}>Déconnexion</button>
//           </div>
//         )}
//       </div>
//     </nav>
//   )
// }

// export default NavbarAdmin


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import '../ComponentCommun/MenuBurger.css'
import './NavbarAdmin.css'

const LIENS = [
  { to: '/admin/accueil', label: 'Accueil' },
  { to: '/admin/annuaire', label: 'Annuaire' },
  { to: '/admin/actualites', label: 'Gestion actualité' },
  { to: '/admin/dentistes', label: 'Gestion dentiste' },
  { to: '/admin/notifications', label: 'Notification' },
]

function NavbarAdmin() {
  const { utilisateur, deconnexion } = useAuth()
  const navigate = useNavigate()
  const [ouvert, setOuvert] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)

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
        <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="onosGradientAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#E0DFFF" />
            </linearGradient>
          </defs>
          <path d="M75 15 C 45 15, 45 45, 25 45 C 10 45, 10 25, 25 25"
            stroke="url(#onosGradientAdmin)" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M25 55 C 55 55, 55 85, 75 85 C 90 85, 90 65, 75 65"
            stroke="url(#onosGradientAdmin)" strokeWidth="9" strokeLinecap="round" fill="none" />
        </svg>
        <span>ONOS</span>
      </Link>

      <ul className="navbar-admin-links">
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