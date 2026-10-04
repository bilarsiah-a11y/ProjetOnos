// import { Link } from 'react-router-dom'
// import './NavbarVisiteur.css'

// function NavbarVisiteur() {
//   return (
//     <nav className="navbar-visiteur">
//       <Link to="/" className="navbar-visiteur-logo">
//         <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             <linearGradient id="onosGradientVisiteur" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor="#ffffff" />
//               <stop offset="100%" stopColor="#E0DFFF" />
//             </linearGradient>
//           </defs>
//           <path d="M75 15 C 45 15, 45 45, 25 45 C 10 45, 10 25, 25 25"
//             stroke="url(#onosGradientVisiteur)" strokeWidth="9" strokeLinecap="round" fill="none" />
//           <path d="M25 55 C 55 55, 55 85, 75 85 C 90 85, 90 65, 75 65"
//             stroke="url(#onosGradientVisiteur)" strokeWidth="9" strokeLinecap="round" fill="none" />
//         </svg>
//         <span>ONOS</span>
//       </Link>

//       <ul className="navbar-visiteur-icons">
             
//         <li><Link to="/" title="Accueil">🏠</Link></li>
//         <li><Link to="/apropos" title="À propos">i️</Link></li>
//         <li><Link to="/annuaire" title="Annuaire">🦷</Link></li>
//         <li><Link to="/contact" title="Contact">✉️</Link></li>
      
//       </ul>

//       <div className="navbar-visiteur-auth">
//         <Link to="/inscription">S'inscrire</Link>
//         <span className="separator">/</span>
//         <Link to="/connexion">Se connecter</Link>
//       </div>
//     </nav>
//   )
// }

// export default NavbarVisiteur



import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../ComponentCommun/MenuBurger.css'
import './NavbarVisiteur.css'

const LIENS = [
  { to: '/', icone: '🏠', label: 'Accueil' },
  { to: '/apropos', icone: 'ℹ️', label: 'À propos' },
  { to: '/annuaire', icone: '🦷', label: 'Annuaire' },
  { to: '/contact', icone: '✉️', label: 'Contact' },
]

function NavbarVisiteur() {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <nav className="navbar-visiteur">
      <Link to="/" className="navbar-visiteur-logo">
        <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="onosGradientVisiteur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#E0DFFF" />
            </linearGradient>
          </defs>
          <path d="M75 15 C 45 15, 45 45, 25 45 C 10 45, 10 25, 25 25"
            stroke="url(#onosGradientVisiteur)" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M25 55 C 55 55, 55 85, 75 85 C 90 85, 90 65, 75 65"
            stroke="url(#onosGradientVisiteur)" strokeWidth="9" strokeLinecap="round" fill="none" />
        </svg>
        <span>ONOS</span>
      </Link>

      <ul className="navbar-visiteur-icons">
        {LIENS.map((l) => (
          <li key={l.to}><Link to={l.to} title={l.label}>{l.icone}</Link></li>
        ))}
      </ul>

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
              <Link key={l.to} to={l.to} onClick={() => setMenuOuvert(false)}>
                {l.icone} {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="navbar-visiteur-auth">
        <Link to="/inscription">S'inscrire</Link>
        <span className="separator">/</span>
        <Link to="/connexion">Se connecter</Link>
      </div>
    </nav>
  )
}

export default NavbarVisiteur