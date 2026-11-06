import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { useAuth } from '../AuthContext'
import '../SectionsAdminCss/ProfilAdmin.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ProfilAdmin() {
  const { utilisateur, majMail } = useAuth()
  const [motDePasseActuel, setMotDePasseActuel] = useState('')
  const [nouveauMail, setNouveauMail] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmation, setConfirmation] = useState('')
  
  // Pour voir / masquer les mots de passe
  const [voirNouveauMdp, setVoirNouveauMdp] = useState(false)
  const [voirConf, setVoirConf] = useState(false)
  const [voirActuel, setVoirActuel] = useState(false)

  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const enregistrer = async (e: FormEvent) => {
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

    setEnvoi(true)
    try {
      await api.put('/api/admin/compte', {
        mot_de_passe_actuel: motDePasseActuel,
        ...(mail && { nouveau_mail: mail }),
        ...(nouveauMdp && { nouveau_mot_de_passe: nouveauMdp }),
      })
      if (mail) majMail(mail)
      setMotDePasseActuel('')
      setNouveauMail('')
      setNouveauMdp('')
      setConfirmation('')
      setSucces('Compte mis à jour avec succès.')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="profil-page">
      <div className="profil-container">
        <h1>Mon profil</h1>
        <p className="profil-mail">
          Email actuel : <strong>{utilisateur?.mail}</strong>
        </p>

        <form className="profil-carte" onSubmit={enregistrer}>
          
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
              <button type="button" className="profil-eye-btn" onClick={() => setVoirNouveauMdp(!voirNouveauMdp)} aria-label="Voir le mot de passe">
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
              <button type="button" className="profil-eye-btn" onClick={() => setVoirConf(!voirConf)} aria-label="Voir la confirmation">
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
              <button type="button" className="profil-eye-btn" onClick={() => setVoirActuel(!voirActuel)} aria-label="Voir le mot de passe actuel">
                {voirActuel ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          {erreur && <p className="profil-erreur">{erreur}</p>}
          {succes && <p className="profil-succes">{succes}</p>}

          <button className="profil-btn" type="submit" disabled={envoi}>
            {envoi ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default ProfilAdmin