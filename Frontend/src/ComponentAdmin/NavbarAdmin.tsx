import { Link } from 'react-router-dom'
import './NavbarAdmin.css'

function NavbarAdmin() {
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
        <li><Link to="/admin/accueil">Accueil</Link></li>
        <li><Link to="/admin/annuaire">Annuaire</Link></li>
        <li><Link to="/admin/actualites">Gestion actualité</Link></li>
        <li><Link to="/admin/notifications">Notification</Link></li>
      </ul>

      <div className="navbar-admin-profil">
        <Link to="/admin/profil">Profil</Link>
      </div>
    </nav>
  )
}

export default NavbarAdmin