
// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../AuthContext'
// import '../ComponentCommun/MenuBurger.css'
// import './NavbarAdmin.css'

// const LIENS = [
//   { to: '/admin/accueil', label: 'Accueil' },
//   { to: '/admin/annuaire', label: 'Annuaire' },
//   { to: '/admin/actualites', label: 'Gestion actualité' },
//   { to: '/admin/dentistes', label: 'Gestion dentiste' },
//   { to: '/admin/notifications', label: 'Notification' },
// ]

// function NavbarAdmin() {
//   const { utilisateur, deconnexion } = useAuth()
//   const navigate = useNavigate()
//   const [ouvert, setOuvert] = useState(false)
//   const [menuOuvert, setMenuOuvert] = useState(false)

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
//         <span>ONOS</span>
//       </Link>

//       <ul className="navbar-admin-links">
//         {LIENS.map((l) => (
//           <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
//         ))}
//       </ul>

//       <div className="burger">
//         <button
//           className="burger-btn"
//           aria-label="Menu"
//           aria-expanded={menuOuvert}
//           onClick={() => {
//             setMenuOuvert(!menuOuvert)
//             setOuvert(false)
//           }}
//         >
//           {menuOuvert ? '✕' : '☰'}
//         </button>
//         {menuOuvert && (
//           <div className="burger-panel">
//             {LIENS.map((l) => (
//               <Link key={l.to} to={l.to} onClick={() => setMenuOuvert(false)}>
//                 {l.label}
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="navbar-admin-profil">
//         <button
//           className="navbar-admin-profil-btn"
//           onClick={() => {
//             setOuvert(!ouvert)
//             setMenuOuvert(false)
//           }}
//         >
//           <span className="navbar-admin-avatar">{initiale}</span>
//           <span className="navbar-admin-pseudo">{pseudo}</span>
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
        <span>ONOS</span>
      </Link>

      <ul className="navbar-admin-links">
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
            <button onClick={seDeconnecter}>Déconnexion</button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavbarAdmin