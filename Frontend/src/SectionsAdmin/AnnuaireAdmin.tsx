import { useEffect, useState } from 'react'
import { api, urlImage } from '../services/api'
import type { Dentiste, OptionsProfil } from '../types'
import '../SectionsAdminCss/AdminCommun.css'
import '../SectionsAdminCss/AnnuaireAdmin.css'

function AnnuaireAdmin() {
  const [dentistes, setDentistes] = useState<Dentiste[]>([])
  const [options, setOptions] = useState<OptionsProfil | null>(null)
  const [recherche, setRecherche] = useState('')
  const [region, setRegion] = useState('')
  const [domaine, setDomaine] = useState('')
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Dentiste[]>('/api/dentistes'),
      api.get<OptionsProfil>('/api/dentistes/options'),
    ])
      .then(([liste, opts]) => {
        setDentistes(liste)
        setOptions(opts)
      })
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const terme = recherche.trim().toLowerCase()
  const filtres = dentistes.filter(
    (d) =>
      (!region || d.region === region) &&
      (!domaine || d.domaine === domaine) &&
      (`${d.prenom} ${d.nom}`.toLowerCase().includes(terme) ||
        d.nom.toLowerCase().includes(terme))
  )

  return (
    <section className="adm-page">
      <h1>Annuaire des dentistes</h1>

      <div className="ann-filtres">
        <div className="adm-champ">
          <input
            type="search"
            placeholder="Rechercher un nom..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>
        <div className="adm-champ">
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Toutes les régions</option>
            {options?.regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="adm-champ">
          <select value={domaine} onChange={(e) => setDomaine(e.target.value)}>
            <option value="">Tous les domaines</option>
            {options?.domaines.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {erreur && <p className="adm-erreur">{erreur}</p>}

      {chargement ? (
        <p>Chargement...</p>
      ) : filtres.length === 0 ? (
        <p className="adm-vide">Aucun dentiste trouvé.</p>
      ) : (
        <ul className="ann-liste">
          {filtres.map((d) => {
            const photo = urlImage(d.photo)
            return (
              <li key={d.id} className="adm-carte ann-carte">
                {photo ? (
                  <img className="ann-photo" src={photo} alt={`${d.prenom} ${d.nom}`} />
                ) : (
                  <span className="ann-photo ann-photo-vide">{d.nom.charAt(0).toUpperCase()}</span>
                )}
                <div className="ann-infos">
                  <strong>{d.titre} {d.prenom} {d.nom}</strong>
                  <span>{d.domaine} · {d.region}</span>
                  {d.adresse && <span>{d.adresse}</span>}
                  <span>
                    {d.contact}
                    {d.autre_contact ? ` / ${d.autre_contact}` : ''}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default AnnuaireAdmin