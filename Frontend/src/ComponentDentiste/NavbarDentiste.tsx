
// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../AuthContext'
// import '../ComponentCommun/MenuBurger.css'
// import './NavbarDentiste.css'

// const LIENS = [
//   { to: '/dentiste/accueil', label: 'Accueil' },
//   { to: '/dentiste/annuaire', label: 'Annuaire' },
//   { to: '/dentiste/rendez-vous', label: 'Rendez-vous' },
// ]

// function NavbarDentiste() {
//   const { utilisateur, deconnexion } = useAuth()
//   const navigate = useNavigate()
//   const [ouvert, setOuvert] = useState(false)
//   const [menuOuvert, setMenuOuvert] = useState(false)

//   const pseudo = (utilisateur?.mail ?? '').split('@')[0]

//   const seDeconnecter = () => {
//     deconnexion()
//     setOuvert(false)
//     navigate('/connexion')
//   }

//   return (
//     <nav className="navbar-dentiste">
//       <Link to="/dentiste/accueil" className="navbar-dentiste-logo">
//         <span>ONOS</span>
//       </Link>

//       <ul className="navbar-dentiste-links">
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

//       <div className="navbar-dentiste-profil">
//         <button
//           className="navbar-dentiste-profil-btn"
//           onClick={() => {
//             setOuvert(!ouvert)
//             setMenuOuvert(false)
//           }}
//         >
//           <span className="navbar-dentiste-avatar">👤</span>
//           <span className="navbar-dentiste-pseudo">{pseudo}</span>
//           <span>{ouvert ? '▲' : '▼'}</span>
//         </button>

//         {ouvert && (
//           <div className="navbar-dentiste-menu">
//             <Link to="/dentiste/profil" onClick={() => setOuvert(false)}>Profil</Link>
//             <button onClick={seDeconnecter}>Déconnexion</button>
//           </div>
//         )}
//       </div>
//     </nav>
//   )
// }

// export default NavbarDentiste

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
            <button onClick={seDeconnecter}>Déconnexion</button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavbarDentiste