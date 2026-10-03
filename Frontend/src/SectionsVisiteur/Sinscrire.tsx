import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import '../SectionsVisiteurCss/FormulaireVisiteur.css'
import '../SectionsVisiteurCss/Sinscrire.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Sinscrire() {
  const [mail, setMail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const sInscrire = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')

    if (!EMAIL_REGEX.test(mail.trim())) {
      setErreur('Adresse email invalide.')
      return
    }
    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (motDePasse !== confirmation) {
      setErreur('La confirmation ne correspond pas au mot de passe.')
      return
    }

    setEnvoi(true)
    try {
      const r = await api.post<{ message: string }>('/api/auth/register', {
        mail: mail.trim(),
        mot_de_passe: motDePasse,
      })
      setSucces(r.message)
      setMail('')
      setMotDePasse('')
      setConfirmation('')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-carte">
        <h1>S'inscrire</h1>
        <p className="auth-sous">Réservé aux dentistes. Votre demande sera examinée par l'administrateur.</p>

        {succes ? (
          <>
            <p className="auth-info">{succes}</p>
            <div className="auth-liens">
              <Link to="/connexion">Aller à la connexion</Link>
            </div>
          </>
        ) : (
          <form onSubmit={sInscrire}>
            {erreur && <p className="auth-erreur">{erreur}</p>}

            <div className="auth-champ">
              <label htmlFor="i-mail">Email</label>
              <input id="i-mail" type="email" autoComplete="email" value={mail}
                onChange={(e) => setMail(e.target.value)} />
            </div>
            <div className="auth-champ">
              <label htmlFor="i-mdp">Mot de passe (8 caractères minimum)</label>
              <input id="i-mdp" type="password" autoComplete="new-password" value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)} />
            </div>
            <div className="auth-champ">
              <label htmlFor="i-conf">Confirmer le mot de passe</label>
              <input id="i-conf" type="password" autoComplete="new-password" value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)} />
            </div>

            <button className="auth-btn" type="submit" disabled={envoi}>
              {envoi ? 'Envoi...' : "Envoyer ma demande"}
            </button>

            <div className="auth-liens">
              <span>Déjà inscrit ? <Link to="/connexion">Se connecter</Link></span>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default Sinscrire