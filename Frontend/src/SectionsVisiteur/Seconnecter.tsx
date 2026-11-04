import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { api } from '../services/api'
import '../SectionsVisiteurCss/Seconnecter.css'

type Etape = 'connexion' | 'oubli' | 'reinit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_REGEX = /^[A-Za-z0-9]{6}$/

export default function Seconnecter() {
  const { utilisateur, chargement, connexion } = useAuth()
  const [etape, setEtape] = useState<Etape>('connexion')
  const [mail, setMail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [code, setCode] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
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
      setErreur('Veuillez saisir votre adresse email et votre mot de passe.')
      return
    }
    setEnvoi(true)
    try {
      await connexion(mail.trim(), motDePasse)
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
      setInfo(r.message || 'Un code de réinitialisation vous a été envoyé.')
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
      setErreur('Le code doit contenir exactement 6 caractères.')
      return
    }
    if (nouveauMdp.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (nouveauMdp !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas.')
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
      setInfo(r.message || 'Votre mot de passe a été modifié avec succès.')
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        
        {/* --- PANNEAU GAUCHE (Image & Branding) --- */}
        <aside className="login-left-panel">
          <div className="login-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>

          <div className="login-brand-center">
            <svg className="brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21.5C12 21.5 17 17.5 17 11C17 7.5 14.5 5 12 5C9.5 5 7 7.5 7 11C7 17.5 12 21.5 12 21.5Z" fill="#ffffff" stroke="none" />
              <path d="M7 11C7 7.5 9.5 5 12 5C14.5 5 17 7.5 17 11" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h1>ONOS</h1>
            <p>Ordre National des Odonto-<br/>Stomatologistes</p>
            <div className="brand-separator"></div>
            <span>Une profession engagée<br/>pour votre santé bucco-dentaire</span>
          </div>
        </aside>

        {/* --- PANNEAU DROIT (Formulaire) --- */}
        <main className="login-right-panel">
          <div className="login-form-container">
            
            {/* Icônes d'alerte */}
            {erreur && (
              <div className="alert-box alert-error">
                <span>{erreur}</span>
              </div>
            )}
            {info && (
              <div className="alert-box alert-success">
                <span>{info}</span>
              </div>
            )}

            {/* En-tête du formulaire */}
            <div className="form-header">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2>
                  {etape === 'connexion' && 'Connexion'}
                  {etape === 'oubli' && 'Récupération'}
                  {etape === 'reinit' && 'Nouveau mot de passe'}
                </h2>
                <p>
                  {etape === 'connexion' && 'Accédez à votre espace professionnel accrédité.'}
                  {etape === 'oubli' && 'Indiquez votre email pour recevoir un code.'}
                  {etape === 'reinit' && 'Saisissez le code reçu et votre nouveau mot de passe.'}
                </p>
              </div>
            </div>

            {/* ÉTAPE 1 : CONNEXION */}
            {etape === 'connexion' && (
              <form onSubmit={seConnecter} className="login-form">
                <div className="form-group">
                  <label>Adresse email</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      placeholder="nom@praticien.mg"
                      value={mail}
                      onChange={(e) => setMail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label>Mot de passe</label>
                    <button type="button" className="text-link" onClick={() => changerEtape('oubli')}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={voirMdp ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setVoirMdp(!voirMdp)}>
                      {voirMdp ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={envoi}>
                  {envoi ? 'Chargement...' : 'Se connecter →'}
                </button>

                <div className="form-footer">
                  <span>Vous n'avez pas encore de compte ?</span>
                  <Link to="/inscription">Créer un compte</Link>
                </div>
              </form>
            )}

            {/* ÉTAPE 2 : OUBLI */}
            {etape === 'oubli' && (
              <form onSubmit={demanderCode} className="login-form">
                <div className="form-group">
                  <label>Adresse email</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input
                      type="email"
                      placeholder="nom@praticien.mg"
                      value={mail}
                      onChange={(e) => setMail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={envoi}>
                  {envoi ? 'Envoi...' : 'Envoyer le code →'}
                </button>
                <button type="button" className="back-btn" onClick={() => changerEtape('connexion')}>
                  ← Retour à la connexion
                </button>
              </form>
            )}

            {/* ÉTAPE 3 : REINIT */}
            {etape === 'reinit' && (
              <form onSubmit={reinitialiser} className="login-form">
                <div className="form-group">
                  <label>Code de sécurité</label>
                  <input
                    type="text"
                    className="otp-input"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nouveau mot de passe</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      placeholder="Minimum 8 caractères"
                      value={nouveauMdp}
                      onChange={(e) => setNouveauMdp(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirmation</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      placeholder="Répétez le mot de passe"
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={envoi}>
                  {envoi ? 'Validation...' : 'Réinitialiser →'}
                </button>
              </form>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}