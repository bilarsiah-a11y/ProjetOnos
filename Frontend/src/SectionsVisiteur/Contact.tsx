import { useState } from 'react'
import type { FormEvent } from 'react'
import '../SectionsVisiteurCss/CommunVisiteur.css'
import '../SectionsVisiteurCss/Contact.css'

// À remplacer par vos vraies coordonnées
const CONTACT_MAIL = 'contact@onos.mg'
const CONTACT_TEL = '+261 00 00 000 00'

function Contact() {
  const [nom, setNom] = useState('')
  const [sujet, setSujet] = useState('')
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  const envoyer = (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (!nom.trim() || !sujet.trim() || !message.trim()) {
      setErreur('Remplissez tous les champs.')
      return
    }
    const corps = `${message.trim()}\n\n${nom.trim()}`
    window.location.href =
      `mailto:${CONTACT_MAIL}?subject=${encodeURIComponent(sujet.trim())}&body=${encodeURIComponent(corps)}`
  }

  return (
    <section className="vis-page">
      <h1 className="vis-titre">Contact</h1>
      <p className="vis-intro">Une question, une suggestion ? Écrivez-nous.</p>

      <div className="vis-grille contact-infos">
        <div className="vis-carte">
          <h3>Email</h3>
          <p><a href={`mailto:${CONTACT_MAIL}`}>{CONTACT_MAIL}</a></p>
        </div>
        <div className="vis-carte">
          <h3>Téléphone</h3>
          <p><a href={`tel:${CONTACT_TEL.replace(/\s/g, '')}`}>{CONTACT_TEL}</a></p>
        </div>
      </div>

      <form className="vis-carte contact-form" onSubmit={envoyer}>
        <h3>Nous écrire</h3>

        <div className="contact-champ">
          <label htmlFor="ct-nom">Votre nom</label>
          <input id="ct-nom" value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div className="contact-champ">
          <label htmlFor="ct-sujet">Sujet</label>
          <input id="ct-sujet" value={sujet} onChange={(e) => setSujet(e.target.value)} />
        </div>
        <div className="contact-champ">
          <label htmlFor="ct-message">Message</label>
          <textarea id="ct-message" rows={5} value={message}
            onChange={(e) => setMessage(e.target.value)} />
        </div>

        {erreur && <p className="vis-erreur">{erreur}</p>}

        <button className="vis-btn" type="submit">Ouvrir ma messagerie</button>
      </form>
    </section>
  )
}

export default Contact