import { useEffect, useState } from 'react'
import { api, urlImage } from '../services/api'
import type { Dentiste, OptionsProfil } from '../types'
import ReservationRdv from './ReservationRdv'
import './AnnuaireListe.css'

function AnnuaireListe({ reservation = false }: { reservation?: boolean }) {
  const [dentistes, setDentistes] = useState<Dentiste[]>([])
  const [options, setOptions] = useState<OptionsProfil | null>(null)
  const [actifs, setActifs] = useState<number[]>([])
  const [choisi, setChoisi] = useState<Dentiste | null>(null)
  const [recherche, setRecherche] = useState('')
  const [region, setRegion] = useState('')
  const [domaine, setDomaine] = useState('')
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Dentiste[]>('/api/dentistes'),
      api.get<OptionsProfil>('/api/dentistes/options'),
      // Si cette route échoue, l'annuaire s'affiche quand même (sans boutons)
      reservation
        ? api.get<number[]>('/api/rdv/dentistes-actifs').catch(() => [] as number[])
        : Promise.resolve([] as number[]),
    ])
      .then(([liste, opts, ids]) => {
        setDentistes(liste)
        setOptions(opts)
        setActifs(ids)
      })
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [reservation])

  const terme = recherche.trim().toLowerCase()
  const filtres = dentistes.filter(
    (d) =>
      (!region || d.region === region) &&
      (!domaine || d.domaine === domaine) &&
      (`${d.prenom} ${d.nom}`.toLowerCase().includes(terme) ||
        `${d.nom} ${d.prenom}`.toLowerCase().includes(terme))
  )

  return (
    <div className="liste-annuaire">
      <div className="liste-filtres">
        <input
          type="search"
          placeholder="Rechercher un nom..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">Toutes les régions</option>
          {options?.regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select value={domaine} onChange={(e) => setDomaine(e.target.value)}>
          <option value="">Tous les domaines</option>
          {options?.domaines.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {erreur && <p className="liste-erreur">{erreur}</p>}

      {chargement ? (
        <p>Chargement...</p>
      ) : filtres.length === 0 ? (
        <p className="liste-vide">Aucun dentiste trouvé.</p>
      ) : (
        <>
          <p className="liste-compte">
            {filtres.length} dentiste{filtres.length > 1 ? 's' : ''} trouvé{filtres.length > 1 ? 's' : ''}
          </p>
          <ul className="liste-grille">
            {filtres.map((d) => {
              const photo = urlImage(d.photo)
              return (
                <li key={d.id} className="liste-carte">
                  {photo ? (
                    <img className="liste-photo" src={photo} alt={`${d.prenom} ${d.nom}`} />
                  ) : (
                    <span className="liste-photo liste-photo-vide">
                      {d.nom.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="liste-infos">
                    <strong>{d.titre} {d.prenom} {d.nom}</strong>
                    <span>{d.domaine} · {d.region}</span>
                    {d.adresse && <span>{d.adresse}</span>}
                    <span>
                      <a href={`tel:${d.contact.replace(/\s/g, '')}`}>{d.contact}</a>
                      {d.autre_contact && (
                        <> / <a href={`tel:${d.autre_contact.replace(/\s/g, '')}`}>{d.autre_contact}</a></>
                      )}
                    </span>
                    {reservation && actifs.includes(d.id) && (
                      <button className="liste-rdv-btn" onClick={() => setChoisi(d)}>
                        Prendre rendez-vous
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {choisi && <ReservationRdv dentiste={choisi} onFermer={() => setChoisi(null)} />}
    </div>
  )
}

export default AnnuaireListe