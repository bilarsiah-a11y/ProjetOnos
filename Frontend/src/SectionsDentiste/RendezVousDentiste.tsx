import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../services/api'
import type { Horaire, ReglagesRdv, Rdv, StatutRdv } from '../types'
import '../SectionsDentisteCss/CommunDentiste.css'
import '../SectionsDentisteCss/RendezVousDentiste.css'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const DUREES = [15, 20, 30, 45, 60, 90]
const LIBELLES: Record<StatutRdv, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  annule: 'Annulé',
}
const enMinutes = (h: string) => parseInt(h.slice(0, 2), 10) * 60 + parseInt(h.slice(3, 5), 10)
const deMinutes = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

const HEURE_FERMETURE = '17:30'
const HEURES = Array.from(
  { length: (enMinutes(HEURE_FERMETURE) - 6 * 60) / 15 + 1 },
  (_, k) => deMinutes(6 * 60 + k * 15)
)

const creneauxDuJour = (plages: Horaire[], duree: number): string[] => {
  const resultat: string[] = []
  const triees = [...plages].sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
  for (const p of triees) {
    let t = enMinutes(p.heure_debut)
    const fin = Math.min(enMinutes(p.heure_fin), enMinutes(HEURE_FERMETURE))
    while (t + duree <= fin) {
      resultat.push(deMinutes(t))
      t += duree
    }
  }
  return resultat
}

function SelecteurHeure({
  valeur, onChange, etiquette,
}: {
  valeur: string
  onChange: (v: string) => void
  etiquette: string
}) {
  const options = HEURES.includes(valeur) ? HEURES : [...HEURES, valeur].sort()
  return (
    <select
      className="rv-heure-select"
      aria-label={etiquette}
      value={valeur}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((h) => <option key={h} value={h}>{h}</option>)}
    </select>
  )
}

const message = (err: unknown) =>
  err instanceof Error ? err.message : 'Une erreur est survenue'

const formaterDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

/* ---------- Liste des rendez-vous ---------- */

function BlocRdv({ rdvs, onChange }: { rdvs: Rdv[]; onChange: () => Promise<void> }) {
  const [afficherAnnules, setAfficherAnnules] = useState(false)
  const [enCours, setEnCours] = useState<number | null>(null)
  const [erreur, setErreur] = useState('')
  
  // --- ÉTAT POUR LA POPUP D'ANNULATION ---
  const [rdvAAnnuler, setRdvAAnnuler] = useState<Rdv | null>(null)

  const confirmerAnnulation = async () => {
    if (!rdvAAnnuler) return
    
    setEnCours(rdvAAnnuler.id)
    setErreur('')
    try {
      await api.patch(`/api/rdv/${rdvAAnnuler.id}/annuler`)
      await onChange()
      setRdvAAnnuler(null) // Ferme la modale
    } catch (e) {
      setErreur(message(e))
    } finally {
      setEnCours(null)
    }
  }

  const confirmerRdv = async (r: Rdv) => {
    setEnCours(r.id)
    setErreur('')
    try {
      await api.patch(`/api/rdv/${r.id}/confirmer`)
      await onChange()
    } catch (e) {
      setErreur(message(e))
    } finally {
      setEnCours(null)
    }
  }

  const visibles = rdvs.filter((r) => afficherAnnules || r.statut !== 'annule')
  const aTraiter = rdvs.filter((r) => r.statut === 'en_attente').length

  return (
    <>
      <div className="dent-carte">
        <h2>
          Rendez-vous à venir
          {aTraiter > 0 && <span className="rv-badge">{aTraiter} à traiter</span>}
        </h2>

        <label className="rv-option">
          <input
            type="checkbox"
            checked={afficherAnnules}
            onChange={(e) => setAfficherAnnules(e.target.checked)}
          />
          Afficher les rendez-vous annulés
        </label>

        {erreur && <p className="dent-erreur">{erreur}</p>}

        {visibles.length === 0 ? (
          <p className="dent-vide">Aucun rendez-vous à venir.</p>
        ) : (
          <ul className="rv-liste">
            {visibles.map((r) => (
              <li key={r.id} className={`rv-rdv rv-${r.statut}`}>
                <div className="rv-quand">
                  <strong>{formaterDate(r.date_rdv)}</strong>
                  <span className="rv-heure">{r.heure}</span>
                </div>

                <div className="rv-patient">
                  <strong>{r.nom_patient}</strong>
                  <a href={`tel:${r.telephone.replace(/\s/g, '')}`}>{r.telephone}</a>
                  {r.email && <span>{r.email}</span>}
                  {r.motif && <span className="rv-motif">« {r.motif} »</span>}
                </div>

                <div className="rv-actions">
                  <span className={`rv-statut rv-statut-${r.statut}`}>{LIBELLES[r.statut]}</span>
                  {r.statut === 'en_attente' && (
                    <button className="dent-btn" disabled={enCours === r.id}
                      onClick={() => confirmerRdv(r)}>
                      Confirmer
                    </button>
                  )}
                  {r.statut !== 'annule' && (
                    <button className="dent-btn dent-btn-danger" disabled={enCours === r.id}
                      onClick={() => setRdvAAnnuler(r)}> {/* <-- Ouvre la modale */}
                      Annuler
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- MODALE DE CONFIRMATION D'ANNULATION --- */}
      {rdvAAnnuler && (
        <div className="modal-overlay" onClick={() => setRdvAAnnuler(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Annuler le rendez-vous</h2>
            <p>
              Voulez-vous vraiment annuler le rendez-vous de <strong>{rdvAAnnuler.nom_patient}</strong> prévu le {formaterDate(rdvAAnnuler.date_rdv)} à {rdvAAnnuler.heure} ?
              <br /><br />
              Le patient sera retiré de votre planning.
            </p>
            <div className="modal-actions">
              <button 
                className="modal-btn-annuler" 
                onClick={() => setRdvAAnnuler(null)}
                disabled={enCours === rdvAAnnuler.id}
              >
                Retour
              </button>
              <button 
                className="modal-btn-confirmer" 
                onClick={confirmerAnnulation}
                disabled={enCours === rdvAAnnuler.id}
              >
                {enCours === rdvAAnnuler.id ? 'Annulation...' : 'Oui, annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------- Horaires (inchangé) ---------- */

function BlocHoraires({
  reglages, onSauve,
}: {
  reglages: ReglagesRdv
  onSauve: () => Promise<void>
}) {
  const [duree, setDuree] = useState(reglages.duree_rdv)
  const [horaires, setHoraires] = useState<Horaire[]>(
    reglages.horaires
      .map((h) => ({
        ...h,
        heure_fin: h.heure_fin > HEURE_FERMETURE ? HEURE_FERMETURE : h.heure_fin,
      }))
      .filter((h) => h.heure_debut < h.heure_fin)
  )
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const ajouter = (jour: number) =>
    setHoraires((liste) => {
      const deja = liste.some((h) => h.jour_semaine === jour)
      return [
        ...liste,
        {
          jour_semaine: jour,
          heure_debut: deja ? '14:00' : '08:00',
          heure_fin: deja ? '17:00' : '12:00',
        },
      ]
    })

  const retirer = (index: number) =>
    setHoraires((liste) => liste.filter((_, k) => k !== index))

  const modifier = (index: number, champ: 'heure_debut' | 'heure_fin', valeur: string) =>
    setHoraires((liste) => liste.map((h, k) => (k === index ? { ...h, [champ]: valeur } : h)))

  const enregistrer = async () => {
    setErreur('')
    setSucces('')

    if (horaires.some((h) => h.heure_debut >= h.heure_fin)) {
      setErreur("L'heure de fin doit être après l'heure de début.")
      return
    }

    setEnvoi(true)
    try {
      await api.put('/api/rdv/horaires', {
        duree_rdv: duree,
        horaires: horaires.map(({ jour_semaine, heure_debut, heure_fin }) => ({
          jour_semaine, heure_debut, heure_fin,
        })),
      })
      await onSauve()
      setSucces('Horaires enregistrés.')
    } catch (e) {
      setErreur(message(e))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="dent-carte">
      <h2>Mes horaires</h2>

      <div className="dent-champ rv-duree">
        <label htmlFor="rv-duree">Durée d'un rendez-vous</label>
        <select id="rv-duree" value={duree} onChange={(e) => setDuree(Number(e.target.value))}>
          {(DUREES.includes(duree) ? DUREES : [...DUREES, duree].sort((a, b) => a - b)).map((m) => (
            <option key={m} value={m}>{m} minutes</option>
          ))}
        </select>
      </div>

      {JOURS.map((nom, k) => {
        const jour = k + 1
        const plages = horaires.map((h, i) => ({ h, i })).filter((x) => x.h.jour_semaine === jour)
        const creneaux = creneauxDuJour(plages.map((x) => x.h), duree)
        return (
          <div key={jour} className="rv-jour">
            <div className="rv-jour-nom">{nom}</div>
            <div className="rv-plages">
              {plages.length === 0 && <span className="rv-ferme">Fermé</span>}
              {plages.map(({ h, i }) => (
                <div key={i} className="rv-plage">
                  <SelecteurHeure etiquette="Début" valeur={h.heure_debut}
                    onChange={(v) => modifier(i, 'heure_debut', v)} />
                  <span>à</span>
                  <SelecteurHeure etiquette="Fin" valeur={h.heure_fin}
                    onChange={(v) => modifier(i, 'heure_fin', v)} />
                  <button type="button" className="rv-retirer"
                    aria-label={`Retirer cette plage du ${nom}`} onClick={() => retirer(i)}>
                    ✕
                  </button>
                </div>
              ))}
              {plages.length > 0 && (
                <p className="rv-apercu">
                  {creneaux.length > 0
                    ? `Créneaux proposés aux patients : ${creneaux.join(' · ')}`
                    : 'Plage trop courte pour la durée choisie : aucun créneau proposé.'}
                </p>
              )}
              <button type="button" className="rv-ajouter" onClick={() => ajouter(jour)}>
                + Ajouter une plage
              </button>
            </div>
          </div>
        )
      })}

      {erreur && <p className="dent-erreur">{erreur}</p>}
      {succes && <p className="dent-succes">{succes}</p>}

      <button className="dent-btn" disabled={envoi} onClick={enregistrer}>
        {envoi ? 'Enregistrement...' : 'Enregistrer mes horaires'}
      </button>
    </div>
  )
}

/* ---------- Page ---------- */

function RendezVousDentiste() {
  const [reglages, setReglages] = useState<ReglagesRdv | null>(null)
  const [rdvs, setRdvs] = useState<Rdv[]>([])
  const [sansProfil, setSansProfil] = useState(false)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const charger = async () => {
    try {
      const [r, liste] = await Promise.all([
        api.get<ReglagesRdv>('/api/rdv/horaires'),
        api.get<Rdv[]>('/api/rdv/mes-rdv'),
      ])
      setReglages(r)
      setRdvs(liste)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setSansProfil(true)
      else throw e
    }
  }

  useEffect(() => {
    charger()
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  return (
    <section className="dent-page">
      <h1 className="dent-titre">Rendez-vous</h1>
      <p className="dent-intro">Définissez vos horaires, puis rappelez les patients pour confirmer leurs demandes.</p>

      {erreur && <p className="dent-erreur">{erreur}</p>}

      {chargement ? (
        <p>Chargement...</p>
      ) : sansProfil ? (
        <div className="dent-alerte">
          <p style={{ marginTop: 0 }}>Créez d'abord votre profil pour gérer vos rendez-vous.</p>
          <Link to="/dentiste/profil" className="dent-btn">Compléter mon profil</Link>
        </div>
      ) : (
        reglages && (
          <>
            <BlocRdv rdvs={rdvs} onChange={charger} />
            <BlocHoraires reglages={reglages} onSauve={charger} />
          </>
        )
      )}
    </section>
  )
}

export default RendezVousDentiste