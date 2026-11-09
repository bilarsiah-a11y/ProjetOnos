import { MapPin, Phone, Mail } from 'lucide-react'
import '../SectionsVisiteurCss/Contact.css'

// Les vraies coordonnées
const CONTACT_MAIL = 'onosmada@gmail.com'
const CONTACT_TEL = '038 13 303 03'
const CONTACT_ADRESSE = 'Eden Space à Ambatoroka, Près clinique Saint Paul, Antananarivo 101, Madagascar'
const CONTACT_FACEBOOK = 'https://www.facebook.com/profile.php?id=61576975694510'

// Composant SVG personnalisé pour le logo Facebook
const IconeFacebook = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
)

function Contact() {
  return (
    <div className="contact-page">
      <div className="contact-inner">
        
        {/* En-tête */}
        <div className="contact-entete">
          <h1 className="contact-titre">Contactez-nous</h1>
        </div>

        {/* Grille des coordonnées (centrée) */}
        <div className="contact-grille">
          
          <div className="contact-carte">
            <div className="contact-icone">
              <MapPin size={24} strokeWidth={1.8} />
            </div>
            <div className="contact-texte">
              <h3>Adresse</h3>
              <p>{CONTACT_ADRESSE}</p>
            </div>
          </div>

          <div className="contact-carte">
            <div className="contact-icone">
              <Phone size={24} strokeWidth={1.8} />
            </div>
            <div className="contact-texte">
              <h3>Téléphone</h3>
              <p><a href={`tel:${CONTACT_TEL.replace(/\s/g, '')}`}>{CONTACT_TEL}</a></p>
            </div>
          </div>

          <div className="contact-carte">
            <div className="contact-icone">
              <Mail size={24} strokeWidth={1.8} />
            </div>
            <div className="contact-texte">
              <h3>Email</h3>
              <p><a href={`mailto:${CONTACT_MAIL}`}>{CONTACT_MAIL}</a></p>
            </div>
          </div>

          <div className="contact-carte">
            <div className="contact-icone">
              {/* On utilise notre composant SVG personnalisé */}
              <IconeFacebook />
            </div>
            <div className="contact-texte">
              <h3>Facebook</h3>
              <p><a href={CONTACT_FACEBOOK} target="_blank" rel="noopener noreferrer">Page officielle ONOS</a></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Contact