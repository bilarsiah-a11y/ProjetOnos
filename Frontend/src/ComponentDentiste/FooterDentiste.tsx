import './FooterDentiste.css'

function FooterDentiste() {
  return (
    <footer className="footer-dentiste">
      <p>© {new Date().getFullYear()} Onos — Espace Dentiste</p>
    </footer>
  )
}

export default FooterDentiste