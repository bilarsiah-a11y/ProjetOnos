import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from '../services/api'
import type { Dentiste } from '../types'
import '../SectionsVisiteurCss/ReservationRdv.css'

const TEL_REGEX = /^\+?[\d\s.-]{8,20}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const JOURS_MAX = 6

const versISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const dansJours = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return versISO(d)
}

const partiesDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`)
  return {
    semaine: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
    jour: d.getDate(),
    mois: d.toLocaleDateString('fr-FR', { month: 'short' }),
  }
}

const formaterDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

function ReservationRdv({ dentiste, onFermer }: { dentiste: Dentiste; onFermer: () => void }) {
  const [etape, setEtape] = useState<1 | 2>(1) // Nouvel état pour les 2 étapes
  
  const [date, setDate] = useState('')
  const [creneaux, setCreneaux] = useState<string[] | null>(null)
  const [chargement, setChargement] = useState(false)
  const [erreurCreneaux, setErreurCreneaux] = useState('')
  const [rechargement, setRechargement] = useState(0)
  const [heure, setHeure] = useState('')
  
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [motif, setMotif] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  
  const jours = Array.from({ length: JOURS_MAX + 1 }, (_, n) => dansJours(n))

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer()
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [onFermer])

  useEffect(() => {
    setHeure('')
    setErreurCreneaux('')
    if (!date) {
      setCreneaux(null)
      return
    }
    let annule = false
    setChargement(true)
    api
      .get<{ date: string; creneaux: string[] }>(`/api/rdv/disponibilites/${dentiste.id}?date=${date}`)
      .then((r) => {
        if (!annule) setCreneaux(r.creneaux)
      })
      .catch((e: Error) => {
        if (!annule) {
          setCreneaux(null)
          setErreurCreneaux(e.message)
        }
      })
      .finally(() => {
        if (!annule) setChargement(false)
      })
    return () => {
      annule = true
    }
  }, [date, dentiste.id, rechargement])

  const choisirCreneau = (h: string) => {
    setHeure(h)
    setEtape(2) // Passe à l'étape 2 dès qu'on choisit l'heure
  }

  const reserver = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')

    if (nom.trim().length < 2) {
      setErreur('Saisissez votre nom.')
      return
    }
    if (!TEL_REGEX.test(telephone.trim())) {
      setErreur('Numéro de téléphone invalide.')
      return
    }
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      setErreur('Adresse email invalide.')
      return
    }

    setEnvoi(true)
    try {
      const r = await api.post<{ message: string }>('/api/rdv', {
        dentiste_id: dentiste.id,
        date,
        heure,
        nom: nom.trim(),
        telephone: telephone.trim(),
        email: email.trim() || undefined,
        motif: motif.trim() || undefined,
      })
      setSucces(r.message)
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
      if (err instanceof ApiError && err.status === 409) {
        setRechargement((n) => n + 1)
        setEtape(1) // Retourne à l'étape 1 si le créneau a été pris
      }
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="rdv-fond" onClick={onFermer} role="presentation">
      <div className="rdv-fenetre" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="rdv-fermer" aria-label="Fermer" onClick={onFermer}>✕</button>
        
        <div className="rdv-entete">
          <h2>Prendre rendez-vous</h2>
          <p className="rdv-dentiste">{dentiste.titre} {dentiste.prenom} {dentiste.nom}</p>
          {/* Indicateur d'étape */}
          {!succes && (
            <div className="rdv-etapes-indicateur">
              <span className={etape === 1 ? 'actif' : ''}>1. Date & Heure</span>
              <span className="rdv-tiret">-</span>
              <span className={etape === 2 ? 'actif' : ''}>2. Vos infos</span>
            </div>
          )}
        </div>

        {succes ? (
          <div className="rdv-succes-zone">
            <p className="rdv-succes">{succes}</p>
            <p className="rdv-recap">{formaterDate(date)} à {heure}</p>
            <button className="rdv-btn" onClick={onFermer}>Fermer</button>
          </div>
        ) : (
          <form onSubmit={reserver}>
            
            {/* ================= ÉTAPE 1 : DATE & HEURE ================= */}
            {etape === 1 && (
              <div className="rdv-etape-contenu">
                <div className="rdv-champ">
                  <span className="rdv-label">Choisissez un jour</span>
                  <div className="rdv-jours">
                    {jours.map((j) => {
                      const p = partiesDate(j)
                      return (
                        <button
                          key={j}
                          type="button"
                          className={`rdv-jour${j === date ? ' actif' : ''}`}
                          onClick={() => setDate(j)}
                        >
                          <span>{p.semaine}</span>
                          <strong>{p.jour}</strong>
                          <span>{p.mois}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {erreurCreneaux && <p className="rdv-erreur">{erreurCreneaux}</p>}
                {chargement && <p className="rdv-info">Recherche des créneaux...</p>}

                {!chargement && creneaux !== null && (
                  creneaux.length === 0 ? (
                    <p className="rdv-info">Aucun créneau libre ce jour-là.</p>
                  ) : (
                    <>
                      <p className="rdv-label" style={{ marginTop: '16px' }}>Créneaux disponibles :</p>
                      <div className="rdv-creneaux">
                        {creneaux.map((h) => (
                          <button
                            key={h}
                            type="button"
                            className="rdv-creneau"
                            onClick={() => choisirCreneau(h)}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </>
                  )
                )}
              </div>
            )}

            {/* ================= ÉTAPE 2 : INFOS ================= */}
            {etape === 2 && (
              <div className="rdv-etape-contenu">
                <p className="rdv-recap">
                  {formaterDate(date)} à {heure}
                </p>

                <div className="rdv-champ">
                  <label htmlFor="rdv-nom">Votre nom *</label>
                  <input id="rdv-nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div className="rdv-champ">
                  <label htmlFor="rdv-tel">Téléphone *</label>
                  <input id="rdv-tel" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                </div>
                <div className="rdv-champ">
                  <label htmlFor="rdv-email">Email (facultatif)</label>
                  <input id="rdv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="rdv-champ">
                  <label htmlFor="rdv-motif">Motif (facultatif)</label>
                  <textarea id="rdv-motif" rows={2} value={motif} onChange={(e) => setMotif(e.target.value)} />
                </div>

                {erreur && <p className="rdv-erreur">{erreur}</p>}

                <div className="rdv-actions">
                  <button type="button" className="rdv-btn-retour" onClick={() => setEtape(1)}>
                    ← Retour
                  </button>
                  <button className="rdv-btn" type="submit" disabled={envoi}>
                    {envoi ? 'Envoi...' : 'Confirmer'}
                  </button>
                </div>
                <p className="rdv-note">
                  Le cabinet vous rappellera pour confirmer.
                </p>
              </div>
            )}
            
          </form>
        )}
      </div>
    </div>
  )
}

export default ReservationRdv