import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import '../SectionsVisiteurCss/Sinscrire.css'
import imageInscription from '../Public/Sary1.png'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Sinscrire() {
  const [mail, setMail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [voirConf, setVoirConf] = useState(false)
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
    <section className="auth-page-custom">
      <div className="auth-container">
        
        {/* PARTIE GAUCHE : IMAGE EN FOND */}
        <aside 
          className="auth-visuel-custom"
          style={{ backgroundImage: `url(${imageInscription})` }}
        >
          <div className="auth-texte-haut">
            <h2>ONOS</h2>
            <p>L'annuaire officiel des chirurgiens-dentistes de Madagascar.</p>
          </div>
          
          <div className="auth-bas-gauche">
            <span>J'ai déjà un compte ?</span>
            <Link to="/connexion" className="auth-btn-connexion">Se connecter</Link>
          </div>
        </aside>

        {/* PARTIE DROITE : FORMULAIRE */}
        <div className="auth-formulaire-custom">
          <div className="auth-carte-custom">
            <h1>Inscription</h1>
            <p className="auth-sous">
              Réservé aux dentistes. Votre demande sera examinée par l'administrateur.
            </p>

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
                  <input
                    id="i-mail"
                    type="email"
                    autoComplete="email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                  />
                </div>
                <div className="auth-champ">
                  <label htmlFor="i-mdp">Mot de passe (8 caractères minimum)</label>
                  <div className="auth-input-group">
                    <input
                      id="i-mdp"
                      type={voirMdp ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
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
                <div className="auth-champ">
                  <label htmlFor="i-conf">Confirmer le mot de passe</label>
                  <div className="auth-input-group">
                    <input
                      id="i-conf"
                      type={voirConf ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                    />
                    <button type="button" className="auth-eye-btn" onClick={() => setVoirConf(!voirConf)} aria-label="Voir la confirmation">
                      {voirConf ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                <button className="auth-btn" type="submit" disabled={envoi}>
                  {envoi ? 'Envoi...' : "S'inscrire"}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}

export default Sinscrire