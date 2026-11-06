import { useState, useRef } from 'react'
import type { FormEvent, KeyboardEvent, ChangeEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { api } from '../services/api'
import '../SectionsVisiteurCss/Seconnecter.css'
import imageConnexion from '../Public/Sary1.png' 

type Etape = 'connexion' | 'oubli' | 'code' | 'reinit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Seconnecter() {
  const { utilisateur, chargement, connexion } = useAuth()
  const [etape, setEtape] = useState<Etape>('connexion')
  const [mail, setMail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  
  // Gestion du code OTP
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  
  // Gestion des alertes
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')
  const [succes, setSucces] = useState('') 
  const [attente, setAttente] = useState(false) 
  
  // Pour bloquer la redirection le temps de lire le message
  const [redirectionEnCours, setRedirectionEnCours] = useState(false)

  // Fonction utilitaire pour afficher les messages pendant 3 secondes
  const afficherMessage = (setter: (val: any) => void, message: string) => {
    setter(message)
    setTimeout(() => {
      setter('')
    }, 3000)
  }

  if (chargement) return null
  if (utilisateur && !redirectionEnCours) {
    return <Navigate to={utilisateur.role === 'admin' ? '/admin/accueil' : '/dentiste/accueil'} replace />
  }

  const changerEtape = (e: Etape) => {
    setEtape(e)
    setErreur('')
    setInfo('')
    setSucces('')
    setAttente(false)
  }

  const message = (err: unknown) =>
    err instanceof Error ? err.message : 'Une erreur est survenue'

  const seConnecter = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    setAttente(false)

    if (!mail.trim() || !motDePasse) {
      afficherMessage(setErreur, 'Veuillez saisir votre adresse email et votre mot de passe.')
      return
    }
    
    setEnvoi(true)
    try {
      await connexion(mail.trim(), motDePasse)
      
      // CONNEXION RÉUSSIE
      setSucces('Connexion réussie ! Redirection en cours...')
      setRedirectionEnCours(true) // Bloque la redirection immédiate
      
      // On attend 3 secondes avant d'autoriser la redirection
      setTimeout(() => {
        setRedirectionEnCours(false)
      }, 3000)

    } catch (err) {
      const msg = message(err)
      const lowerMsg = msg.toLowerCase()

      // COMPTE EN ATTENTE
      if (lowerMsg.includes('attente') || lowerMsg.includes('valid') || lowerMsg.includes('approuv') || lowerMsg.includes('actif')) {
        setAttente(true)
        setTimeout(() => setAttente(false), 3000) // Disparaît après 3s
      } else {
        // ERREUR CLASSIQUE
        afficherMessage(setErreur, msg)
      }
      setEnvoi(false)
    }
  }

  const demanderCode = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    setInfo('')
    if (!EMAIL_REGEX.test(mail.trim())) {
      afficherMessage(setErreur, 'Adresse email invalide.')
      return
    }
    setEnvoi(true)
    try {
      const r = await api.post<{ message: string }>('/api/auth/forgot-password', { mail: mail.trim() })
      afficherMessage(setInfo, r.message || 'Un code de réinitialisation vous a été envoyé.')
      setEtape('code')
    } catch (err) {
      afficherMessage(setErreur, message(err))
    } finally {
      setEnvoi(false)
    }
  }

  const handleOtpChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (isNaN(Number(val)) && val !== '') return

    const newOtp = [...otp]
    newOtp[index] = val.substring(val.length - 1)
    setOtp(newOtp)

    if (val !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const validerCode = (e: FormEvent) => {
    e.preventDefault()
    const codeComplet = otp.join('')
    if (codeComplet.length !== 6) {
      afficherMessage(setErreur, 'Veuillez saisir les 6 caractères du code.')
      return
    }
    setErreur('')
    setEtape('reinit')
  }

  const reinitialiser = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    
    if (nouveauMdp.length < 8) {
      afficherMessage(setErreur, 'Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (nouveauMdp !== confirmation) {
      afficherMessage(setErreur, 'Les mots de passe ne correspondent pas.')
      return
    }
    
    setEnvoi(true)
    try {
      const r = await api.post<{ message: string }>('/api/auth/reset-password', {
        mail: mail.trim(),
        otp: otp.join(''),
        nouveau_mot_de_passe: nouveauMdp,
      })
      setOtp(Array(6).fill(''))
      setNouveauMdp('')
      setConfirmation('')
      setMotDePasse('')
      setEtape('connexion')
      afficherMessage(setInfo, r.message || 'Votre mot de passe a été modifié avec succès.')
    } catch (err) {
      afficherMessage(setErreur, message(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="auth-page-custom">
      <div className="auth-container">
        
        {/* PARTIE GAUCHE : FORMULAIRE */}
        <div className="auth-formulaire-custom">
          <div className="auth-carte-custom">
            <h1>
              {etape === 'connexion' && 'Connexion'}
              {etape === 'oubli' && 'Récupération'}
              {etape === 'code' && 'Code de sécurité'}
              {etape === 'reinit' && 'Nouveau mot de passe'}
            </h1>
            <p className="auth-sous">
              {etape === 'connexion' && 'Accédez à votre espace professionnel.'}
              {etape === 'oubli' && 'Indiquez votre email pour recevoir un code.'}
              {etape === 'code' && 'Saisissez le code à 6 chiffres reçu par email.'}
              {etape === 'reinit' && 'Choisissez votre nouveau mot de passe.'}
            </p>

            {/* AFFICHAGE DES ALERTES */}
            {erreur && <p className="auth-erreur">{erreur}</p>}
            {info && <p className="auth-info">{info}</p>}
            {succes && <p className="auth-succes">{succes}</p>}
            {attente && (
              <p className="auth-attente">
                Votre compte est en attente de validation par l'administrateur. Veuillez réessayer plus tard.
              </p>
            )}

            {/* ÉTAPE 1 : CONNEXION */}
            {etape === 'connexion' && (
              <form onSubmit={seConnecter}>
                <div className="auth-champ">
                  <label htmlFor="i-mail">Adresse email</label>
                  <input
                    id="i-mail"
                    type="email"
                    placeholder="nom@praticien.mg"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-champ">
                  <label htmlFor="i-mdp">Mot de passe</label>
                  <div className="auth-input-group">
                    <input
                      id="i-mdp"
                      type={voirMdp ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                    />
                    <button type="button" className="auth-eye-btn" onClick={() => setVoirMdp(!voirMdp)} aria-label="Voir le mot de passe">
                      {voirMdp ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                <button className="auth-btn" type="submit" disabled={envoi || succes !== ''}>
                  {envoi ? 'Vérification...' : succes ? 'Connecté !' : 'Se connecter'}
                </button>

                <div className="auth-liens">
                  <button type="button" className="auth-text-link" onClick={() => changerEtape('oubli')}>
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>
            )}

            {/* ÉTAPE 2 : OUBLI */}
            {etape === 'oubli' && (
              <form onSubmit={demanderCode}>
                <div className="auth-champ">
                  <label htmlFor="i-mail-oublie">Adresse email</label>
                  <input
                    id="i-mail-oublie"
                    type="email"
                    placeholder="nom@praticien.mg"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    required
                  />
                </div>
                <button className="auth-btn" type="submit" disabled={envoi}>
                  {envoi ? 'Envoi...' : 'Envoyer le code'}
                </button>
                <div className="auth-liens">
                  <button type="button" className="auth-text-link" onClick={() => changerEtape('connexion')}>
                    ← Retour à la connexion
                  </button>
                </div>
              </form>
            )}

            {/* ÉTAPE 3 : CODE OTP */}
            {etape === 'code' && (
              <form onSubmit={validerCode}>
                <div className="auth-champ">
                  <label>Code de sécurité</label>
                  <div className="otp-container">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        onChange={(e) => handleOtpChange(index, e)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="otp-input"
                      />
                    ))}
                  </div>
                </div>
                <button className="auth-btn" type="submit">
                  Valider le code
                </button>
              </form>
            )}

            {/* ÉTAPE 4 : NOUVEAU MOT DE PASSE */}
            {etape === 'reinit' && (
              <form onSubmit={reinitialiser}>
                <div className="auth-champ">
                  <label htmlFor="i-new-mdp">Nouveau mot de passe</label>
                  <input
                    id="i-new-mdp"
                    type="password"
                    placeholder="Minimum 8 caractères"
                    value={nouveauMdp}
                    onChange={(e) => setNouveauMdp(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-champ">
                  <label htmlFor="i-conf-mdp">Confirmation</label>
                  <input
                    id="i-conf-mdp"
                    type="password"
                    placeholder="Répétez le mot de passe"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    required
                  />
                </div>
                <button className="auth-btn" type="submit" disabled={envoi}>
                  {envoi ? 'Validation...' : 'Réinitialiser'}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* PARTIE DROITE : IMAGE EN FOND */}
        <aside 
          className="auth-visuel-custom"
          style={{ backgroundImage: `url(${imageConnexion})` }}
        >
          <div className="auth-texte-haut">
            <h2>ONOS</h2>
            <p>L'annuaire officiel des chirurgiens-dentistes de Madagascar.</p>
          </div>
          
          <div className="auth-bas-gauche">
            <span style={{ whiteSpace: 'nowrap' }}>Pas encore de compte ?</span>
            <Link to="/inscription" className="auth-btn-connexion">S'inscrire</Link>
          </div>
        </aside>

      </div>
    </section>
  )
}