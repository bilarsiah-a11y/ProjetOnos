import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { api } from '../services/api'
import '../SectionsVisiteurCss/FormulaireVisiteur.css'
import '../SectionsVisiteurCss/Seconnecter.css'

type Etape = 'connexion' | 'oubli' | 'reinit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_REGEX = /^[A-Za-z0-9]{6}$/

function Seconnecter() {
  const { utilisateur, chargement, connexion } = useAuth()
  const [etape, setEtape] = useState<Etape>('connexion')
  const [mail, setMail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [code, setCode] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')

  if (chargement) return null
  if (utilisateur) {
    return <Navigate to={utilisateur.role === 'admin' ? '/admin/accueil' : '/dentiste/accueil'} replace />
  }

  const changerEtape = (e: Etape) => {
    setEtape(e)
    setErreur('')
    setInfo('')
  }

  const message = (err: unknown) =>
    err instanceof Error ? err.message : 'Une erreur est survenue'

  const seConnecter = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (!mail.trim() || !motDePasse) {
      setErreur('Saisissez votre email et votre mot de passe.')
      return
    }
    setEnvoi(true)
    try {
      await connexion(mail.trim(), motDePasse)
      // La redirection se fait toute seule (voir plus haut)
    } catch (err) {
      setErreur(message(err))
      setEnvoi(false)
    }
  }

  const demanderCode = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (!EMAIL_REGEX.test(mail.trim())) {
      setErreur('Adresse email invalide.')
      return
    }
    setEnvoi(true)
    try {
      const r = await api.post<{ message: string }>('/api/auth/forgot-password', { mail: mail.trim() })
      setInfo(r.message)
      setEtape('reinit')
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoi(false)
    }
  }

  const reinitialiser = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (!CODE_REGEX.test(code.trim())) {
      setErreur('Le code contient 6 caractères (lettres et chiffres).')
      return
    }
    if (nouveauMdp.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (nouveauMdp !== confirmation) {
      setErreur('La confirmation ne correspond pas au nouveau mot de passe.')
      return
    }
    setEnvoi(true)
    try {
      const r = await api.post<{ message: string }>('/api/auth/reset-password', {
        mail: mail.trim(),
        otp: code.trim(),
        nouveau_mot_de_passe: nouveauMdp,
      })
      setCode('')
      setNouveauMdp('')
      setConfirmation('')
      setMotDePasse('')
      setEtape('connexion')
      setInfo(r.message)
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-carte">
        {etape === 'connexion' && (
          <form onSubmit={seConnecter}>
            <h1>Se connecter</h1>
            <p className="auth-sous">Accédez à votre espace Onos</p>

            {info && <p className="auth-info">{info}</p>}
            {erreur && <p className="auth-erreur">{erreur}</p>}

            <div className="auth-champ">
              <label htmlFor="c-mail">Email</label>
              <input id="c-mail" type="email" autoComplete="email" value={mail}
                onChange={(e) => setMail(e.target.value)} />
            </div>
            <div className="auth-champ">
              <label htmlFor="c-mdp">Mot de passe</label>
              <input id="c-mdp" type="password" autoComplete="current-password" value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)} />
            </div>

            <button className="auth-btn" type="submit" disabled={envoi}>
              {envoi ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="auth-liens">
              <button type="button" className="auth-lien-btn" onClick={() => changerEtape('oubli')}>
                Mot de passe oublié ?
              </button>
              <span>Pas encore de compte ? <Link to="/inscription">S'inscrire</Link></span>
            </div>
          </form>
        )}

        {etape === 'oubli' && (
          <form onSubmit={demanderCode}>
            <h1>Mot de passe oublié</h1>
            <p className="auth-sous">Un code à 6 caractères vous sera envoyé par email.</p>

            {erreur && <p className="auth-erreur">{erreur}</p>}

            <div className="auth-champ">
              <label htmlFor="o-mail">Email</label>
              <input id="o-mail" type="email" autoComplete="email" value={mail}
                onChange={(e) => setMail(e.target.value)} />
            </div>

            <button className="auth-btn" type="submit" disabled={envoi}>
              {envoi ? 'Envoi...' : 'Recevoir le code'}
            </button>

            <div className="auth-liens">
              <button type="button" className="auth-lien-btn" onClick={() => changerEtape('connexion')}>
                Retour à la connexion
              </button>
            </div>
          </form>
        )}

        {etape === 'reinit' && (
          <form onSubmit={reinitialiser}>
            <h1>Nouveau mot de passe</h1>
            <p className="auth-sous">Saisissez le code reçu (valable 10 minutes).</p>

            {info && <p className="auth-info">{info}</p>}
            {erreur && <p className="auth-erreur">{erreur}</p>}

            <div className="auth-champ">
              <label htmlFor="r-code">Code</label>
              <input id="r-code" maxLength={6} autoComplete="one-time-code" value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())} />
            </div>
            <div className="auth-champ">
              <label htmlFor="r-mdp">Nouveau mot de passe</label>
              <input id="r-mdp" type="password" autoComplete="new-password" value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)} />
            </div>
            <div className="auth-champ">
              <label htmlFor="r-conf">Confirmer le mot de passe</label>
              <input id="r-conf" type="password" autoComplete="new-password" value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)} />
            </div>

            <button className="auth-btn" type="submit" disabled={envoi}>
              {envoi ? 'Enregistrement...' : 'Modifier le mot de passe'}
            </button>

            <div className="auth-liens">
              <button type="button" className="auth-lien-btn" onClick={() => changerEtape('oubli')}>
                Renvoyer un code
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default Seconnecter