import './FooterVisiteur.css'

function FooterVisiteur() {
  return (
    <footer className="footer-visiteur">
      <p>© {new Date().getFullYear()} ONOS - Tous droits réservés</p>
    </footer>
  )
}

export default FooterVisiteur