import { useState, useRef, useEffect } from 'react'
import type { FormEvent, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react'
import { api } from '../services/api'
import { useAuth } from '../AuthContext'
import '../SectionsAdminCss/ProfilAdmin.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_LENGTH = 6

const nettoyerOtp = (valeur: string) =>
  valeur.toUpperCase().replace(/[^A-Z0-9]/g, '')

// Les 3 étapes de notre processus
type Etape = 'affichage' | 'otp' | 'modification'

function ProfilAdmin() {
  const { utilisateur, majMail } = useAuth()
  
  // Gestion des étapes
  const [etape, setEtape] = useState<Etape>('affichage')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  // --- Gestion des 6 cases OTP ---
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (etape === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    }
  }, [etape])

  const handleOtpChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const caracteres = nettoyerOtp(e.target.value)
    const newOtp = [...otp]

    if (caracteres === '') {
      newOtp[index] = ''
      setOtp(newOtp)
      return
    }

    newOtp[index] = caracteres.slice(-1)
    setOtp(newOtp)

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      e.preventDefault()
      const newOtp = [...otp]
      newOtp[index - 1] = ''
      setOtp(newOtp)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const caracteres = nettoyerOtp(e.clipboardData.getData('text')).slice(0, OTP_LENGTH)
    if (!caracteres) return

    const newOtp = Array(OTP_LENGTH).fill('')
    caracteres.split('').forEach((c, i) => {
      newOtp[i] = c
    })
    setOtp(newOtp)

    const prochain = Math.min(caracteres.length, OTP_LENGTH - 1)
    inputRefs.current[prochain]?.focus()
  }
  // -------------------------------

  // États pour le formulaire de modification
  const [motDePasseActuel, setMotDePasseActuel] = useState('')
  const [nouveauMail, setNouveauMail] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmation, setConfirmation] = useState('')
  
  // Pour voir / masquer les mots de passe
  const [voirNouveauMdp, setVoirNouveauMdp] = useState(false)
  const [voirConf, setVoirConf] = useState(false)
  const [voirActuel, setVoirActuel] = useState(false)

  // --- ÉTAPE 1 -> ÉTAPE 2 : Demander l'OTP ---
  const demanderOtp = async () => {
    setErreur('')
    setSucces('')
    setChargement(true)
    try {
      await api.post('/api/admin/compte/otp', { mail: utilisateur?.mail })
      setSucces(`Un code de sécurité a été envoyé à ${utilisateur?.mail}`)
      setOtp(Array(OTP_LENGTH).fill(''))
      setEtape('otp')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du code')
    } finally {
      setChargement(false)
    }
  }

  // --- ÉTAPE 2 -> ÉTAPE 3 : Vérifier l'OTP ---
  const verifierOtp = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    
    const codeComplet = otp.join('')
    if (codeComplet.length !== OTP_LENGTH) {
      setErreur('Veuillez saisir les 6 caractères du code.')
      return
    }

    setChargement(true)
    try {
      await api.post('/api/admin/compte/verifier-otp', { otp: codeComplet })
      setSucces('Code validé avec succès. Vous pouvez modifier vos informations.')
      setEtape('modification')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Code OTP invalide ou expiré')
    } finally {
      setChargement(false)
    }
  }

  // --- ÉTAPE 3 : Enregistrer les modifications ---
  const enregistrerModifications = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')

    const mail = nouveauMail.trim().toLowerCase()

    if (!mail && !nouveauMdp) {
      setErreur('Renseignez un nouvel email et/ou un nouveau mot de passe.')
      return
    }
    if (mail && !EMAIL_REGEX.test(mail)) {
      setErreur('Adresse email invalide.')
      return
    }
    if (nouveauMdp && nouveauMdp.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (nouveauMdp && nouveauMdp !== confirmation) {
      setErreur('La confirmation ne correspond pas au nouveau mot de passe.')
      return
    }
    if (!motDePasseActuel) {
      setErreur('Saisissez votre mot de passe actuel pour confirmer.')
      return
    }

    setChargement(true)
    try {
      await api.put('/api/admin/compte', {
        mot_de_passe_actuel: motDePasseActuel,
        ...(mail && { nouveau_mail: mail }),
        ...(nouveauMdp && { nouveau_mot_de_passe: nouveauMdp }),
      })
      
      if (mail) majMail(mail)
      
      // Retour à l'étape 1 après succès
      setSucces('Compte mis à jour avec succès.')
      setEtape('affichage')
      setMotDePasseActuel('')
      setNouveauMail('')
      setNouveauMdp('')
      setConfirmation('')
      setOtp(Array(OTP_LENGTH).fill(''))
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setChargement(false)
    }
  }

  return (
    <section className="profil-page">
      <div className="profil-container">
        
        {/* MESSAGES GLOBAUX */}
        {erreur && <p className="profil-erreur">{erreur}</p>}
        {succes && <p className="profil-succes">{succes}</p>}

        {/* ==========================================
            ÉTAPE 1 : AFFICHAGE DES INFOS
            ========================================== */}
        {etape === 'affichage' && (
          <>
            <h1>Mon profil</h1>
            <div className="profil-info-carte">
              <div className="profil-avatar-large">
                {utilisateur?.mail.charAt(0).toUpperCase()}
              </div>
              <div className="profil-info-texts">
                <p className="profil-role">Administrateur</p>
                <h2>{utilisateur?.mail.split('@')[0]}</h2>
                <p className="profil-email">{utilisateur?.mail}</p>
              </div>
            </div>
            
            <button className="profil-btn" onClick={demanderOtp} disabled={chargement}>
              {chargement ? 'Envoi du code...' : 'Modifier mes informations'}
            </button>
          </>
        )}

        {/* ==========================================
            ÉTAPE 2 : VÉRIFICATION OTP (6 CASES)
            ========================================== */}
        {etape === 'otp' && (
          <div className="profil-etape-otp">
            <h1>Vérification de sécurité</h1>
            <p className="profil-desc">
              Pour modifier votre compte, veuillez saisir le code à 6 caractères qui vient d'être envoyé à <strong>{utilisateur?.mail}</strong>.
            </p>
            
            <form onSubmit={verifierOtp} className="profil-carte">
              <div className="profil-champ" style={{ marginBottom: '24px' }}>
                <div className="otp-container">
                  {otp.map((caractere, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="text"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      value={caractere}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      onChange={(e) => handleOtpChange(index, e)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      onFocus={(e) => e.target.select()}
                      className="otp-input"
                      aria-label={`Caractère ${index + 1} du code`}
                    />
                  ))}
                </div>
              </div>
              
              <button className="profil-btn" type="submit" disabled={chargement}>
                {chargement ? 'Vérification...' : 'Valider le code'}
              </button>
              
              <button 
                type="button" 
                className="profil-btn-retour" 
                onClick={() => setEtape('affichage')}
              >
                Annuler
              </button>
            </form>
          </div>
        )}

        {/* ==========================================
            ÉTAPE 3 : FORMULAIRE DE MODIFICATION
            ========================================== */}
        {etape === 'modification' && (
          <>
            <h1>Modification du compte</h1>
            <p className="profil-desc">Sécurité validée. Vous pouvez maintenant modifier vos identifiants.</p>
            
            <form className="profil-carte" onSubmit={enregistrerModifications}>
              
              <div className="profil-champ">
                <label htmlFor="p-mail">Nouvel email (facultatif)</label>
                <input 
                  id="p-mail" 
                  type="email" 
                  placeholder="Ex: nouveau@email.com"
                  value={nouveauMail}
                  onChange={(e) => setNouveauMail(e.target.value)} 
                />
              </div>

              <div className="profil-champ">
                <label htmlFor="p-mdp">Nouveau mot de passe (facultatif)</label>
                <div className="profil-input-group">
                  <input 
                    id="p-mdp" 
                    type={voirNouveauMdp ? 'text' : 'password'} 
                    autoComplete="new-password" 
                    placeholder="Minimum 8 caractères"
                    value={nouveauMdp}
                    onChange={(e) => setNouveauMdp(e.target.value)} 
                  />
                  <button type="button" className="profil-eye-btn" onClick={() => setVoirNouveauMdp(!voirNouveauMdp)}>
                    {voirNouveauMdp ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="profil-champ">
                <label htmlFor="p-conf">Confirmer le nouveau mot de passe</label>
                <div className="profil-input-group">
                  <input 
                    id="p-conf" 
                    type={voirConf ? 'text' : 'password'} 
                    autoComplete="new-password" 
                    placeholder="Répétez le mot de passe"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)} 
                  />
                  <button type="button" className="profil-eye-btn" onClick={() => setVoirConf(!voirConf)}>
                    {voirConf ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="profil-separateur"></div>

              <div className="profil-champ">
                <label htmlFor="p-actuel">Mot de passe actuel (obligatoire pour valider)</label>
                <div className="profil-input-group">
                  <input 
                    id="p-actuel" 
                    type={voirActuel ? 'text' : 'password'} 
                    autoComplete="current-password"
                    placeholder="Saisissez votre mot de passe actuel"
                    value={motDePasseActuel} 
                    onChange={(e) => setMotDePasseActuel(e.target.value)} 
                  />
                  <button type="button" className="profil-eye-btn" onClick={() => setVoirActuel(!voirActuel)}>
                    {voirActuel ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              <button className="profil-btn" type="submit" disabled={chargement}>
                {chargement ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              
              <button 
                type="button" 
                className="profil-btn-retour" 
                onClick={() => setEtape('affichage')}
              >
                Annuler
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}

export default ProfilAdmin