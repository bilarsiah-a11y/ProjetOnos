// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import '../ComponentCommun/MenuBurger.css'
// import "./NavbarVisiteur.css";

// const LIENS = [
//   { to: '/', label: 'Accueil' },
//   { to: '/apropos', label: 'À propos' },
//   { to: '/annuaire', label: 'Annuaire' },
//   { to: '/contact', label: 'Contact' },
// ]

// function NavbarVisiteur() {
//   const [menuOuvert, setMenuOuvert] = useState(false)

//   return (
//     <nav className="navbar-visiteur">
//       {/* Logo avec icône de dent */}
//       <Link to="/" className="navbar-visiteur-logo">
//         <img src="Frontend/src/Public/image.png" alt="" />
//         <span>ONOS</span>
//       </Link>

//       {/* Liens de navigation Desktop */}
//       <ul className="navbar-visiteur-links">
//         {LIENS.map((l) => (
//           <li key={l.to}>
//             <Link to={l.to} className={l.to === '/' ? 'active' : ''}>
//               {l.label}
//             </Link>
//           </li>
//         ))}
//       </ul>

//       {/* Boutons d'authentification Desktop */}
//       <div className="navbar-visiteur-auth">
//         <Link to="/inscription" className="btn-inscription">
//           S'inscrire
//         </Link>
//         <Link to="/connexion" className="btn-connexion">
//           <svg 
//             className="user-icon" 
//             viewBox="0 0 24 24" 
//             fill="none" 
//             stroke="currentColor" 
//             strokeWidth="2" 
//             strokeLinecap="round" 
//             strokeLinejoin="round"
//           >
//             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//             <circle cx="12" cy="7" r="4" />
//           </svg>
//           Se connecter
//         </Link>
//       </div>

//       {/* Menu Burger Mobile */}
//       <div className="burger">
//         <button
//           className="burger-btn"
//           aria-label="Menu"
//           aria-expanded={menuOuvert}
//           onClick={() => setMenuOuvert(!menuOuvert)}
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
//             <hr />
//             <Link to="/inscription" onClick={() => setMenuOuvert(false)}>S'inscrire</Link>
//             <Link to="/connexion" onClick={() => setMenuOuvert(false)}>Se connecter</Link>
//           </div>
//         )}
//       </div>
//     </nav>
//   )
// }

// export default NavbarVisiteur


import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../ComponentCommun/MenuBurger.css'
import "./NavbarVisiteur.css";

const LIENS = [
  { to: '/', label: 'Accueil' },
  { to: '/apropos', label: 'À propos' },
  { to: '/annuaire', label: 'Annuaire' },
  { to: '/contact', label: 'Contact' },
]

function NavbarVisiteur() {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const location = useLocation()

  return (
    <nav className="navbar-visiteur">
      {/* Logo */}
      <Link to="/" className="navbar-visiteur-logo">
        <span>ONOS</span>
      </Link>

      {/* Liens Desktop */}
      <ul className="navbar-visiteur-links">
        {LIENS.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className={location.pathname === l.to ? 'active' : ''}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Boutons Auth Desktop - Style Image 2 (Plat, sans bordure) */}
      <div className="navbar-visiteur-auth">
        <Link to="/inscription" className="auth-link">
          S'inscrire
        </Link>
        <span className="auth-separator">/</span>
        <Link to="/connexion" className="auth-link">
          Se connecter
        </Link>
      </div>

      {/* Burger Mobile */}
      <div className="burger">
        <button
          className="burger-btn"
          aria-label="Menu"
          aria-expanded={menuOuvert}
          onClick={() => setMenuOuvert(!menuOuvert)}
        >
          {menuOuvert ? '✕' : '☰'}
        </button>

        {menuOuvert && (
          <div className="burger-panel">
            {LIENS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={location.pathname === l.to ? 'active' : ''}
                onClick={() => setMenuOuvert(false)}
              >
                {l.label}
              </Link>
            ))}
            <hr />
            <Link to="/inscription" onClick={() => setMenuOuvert(false)}>
              S'inscrire
            </Link>
            <Link to="/connexion" onClick={() => setMenuOuvert(false)}>
              Se connecter
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavbarVisiteur