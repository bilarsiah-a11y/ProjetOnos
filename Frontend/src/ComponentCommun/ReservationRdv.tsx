import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from '../services/api'
import type { Dentiste } from '../types'
import './ReservationRdv.css'

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

  // Fermeture avec la touche Échap
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer()
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [onFermer])

  // Chargement des créneaux libres quand la date change
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

  const reserver = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')

    if (!date || !heure) {
      setErreur('Choisissez une date et un créneau.')
      return
    }
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
      // Créneau pris entre-temps : on rafraîchit la liste
      if (err instanceof ApiError && err.status === 409) setRechargement((n) => n + 1)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="rdv-fond" onClick={onFermer} role="presentation">
      <div
        className="rdv-fenetre"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="rdv-fermer" aria-label="Fermer" onClick={onFermer}>✕</button>
        <h2>Prendre rendez-vous</h2>
        <p className="rdv-dentiste">{dentiste.titre} {dentiste.prenom} {dentiste.nom}</p>

        {succes ? (
          <>
            <p className="rdv-succes">{succes}</p>
            <p className="rdv-recap">{formaterDate(date)} à {heure}</p>
            <button className="rdv-btn" onClick={onFermer}>Fermer</button>
          </>
        ) : (
          <form onSubmit={reserver}>
                       <div className="rdv-champ">
              <span>Choisissez un jour</span>
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
                <p className="rdv-info">Aucun créneau libre ce jour-là, essayez une autre date.</p>
              ) : (
                <>
                  <p className="rdv-info">Créneaux disponibles :</p>
                  <div className="rdv-creneaux">
                    {creneaux.map((h) => (
                      <button
                        key={h}
                        type="button"
                        className={`rdv-creneau${h === heure ? ' actif' : ''}`}
                        onClick={() => setHeure(h)}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </>
              )
            )}

            {heure && (
              <>
                <p className="rdv-recap">{formaterDate(date)} à {heure}</p>

                <div className="rdv-champ">
                  <label htmlFor="rdv-nom">Votre nom *</label>
                  <input id="rdv-nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div className="rdv-champ">
                  <label htmlFor="rdv-tel">Téléphone *</label>
                  <input id="rdv-tel" type="tel" value={telephone}
                    onChange={(e) => setTelephone(e.target.value)} />
                </div>
                <div className="rdv-champ">
                  <label htmlFor="rdv-email">Email (facultatif)</label>
                  <input id="rdv-email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="rdv-champ">
                  <label htmlFor="rdv-motif">Motif (facultatif)</label>
                  <textarea id="rdv-motif" rows={2} value={motif}
                    onChange={(e) => setMotif(e.target.value)} />
                </div>

                {erreur && <p className="rdv-erreur">{erreur}</p>}

                <button className="rdv-btn" type="submit" disabled={envoi}>
                  {envoi ? 'Envoi...' : 'Envoyer ma demande'}
                </button>
                <p className="rdv-note">
                  Le cabinet vous rappellera au numéro indiqué pour confirmer le rendez-vous.
                </p>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default ReservationRdv