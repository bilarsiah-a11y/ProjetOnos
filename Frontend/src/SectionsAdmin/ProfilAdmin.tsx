import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { useAuth } from '../AuthContext'
import '../SectionsAdminCss/AdminCommun.css'
import '../SectionsAdminCss/ProfilAdmin.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ProfilAdmin() {
  const { utilisateur, majMail } = useAuth()
  const [motDePasseActuel, setMotDePasseActuel] = useState('')
  const [nouveauMail, setNouveauMail] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmation, setConfirmation] = useState('')
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
      setSucces('Compte mis à jour.')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="adm-page profil-page">
      <h1>Mon profil</h1>
      <p className="profil-mail">Email actuel : <strong>{utilisateur?.mail}</strong></p>

      <form className="adm-carte" onSubmit={enregistrer}>
        <div className="adm-champ">
          <label htmlFor="p-mail">Nouvel email (facultatif)</label>
          <input id="p-mail" type="email" value={nouveauMail}
            onChange={(e) => setNouveauMail(e.target.value)} />
        </div>

        <div className="adm-champ">
          <label htmlFor="p-mdp">Nouveau mot de passe (facultatif)</label>
          <input id="p-mdp" type="password" autoComplete="new-password" value={nouveauMdp}
            onChange={(e) => setNouveauMdp(e.target.value)} />
        </div>

        <div className="adm-champ">
          <label htmlFor="p-conf">Confirmer le nouveau mot de passe</label>
          <input id="p-conf" type="password" autoComplete="new-password" value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)} />
        </div>

        <div className="adm-champ">
          <label htmlFor="p-actuel">Mot de passe actuel (obligatoire)</label>
          <input id="p-actuel" type="password" autoComplete="current-password"
            value={motDePasseActuel} onChange={(e) => setMotDePasseActuel(e.target.value)} />
        </div>

        {erreur && <p className="adm-erreur">{erreur}</p>}
        {succes && <p className="adm-succes">{succes}</p>}

        <button className="adm-btn" type="submit" disabled={envoi}>
          {envoi ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </section>
  )
}

export default ProfilAdmin