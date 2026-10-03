import { useEffect, useState } from 'react'
import { api, urlImage } from '../services/api'
import type { DentisteAdmin } from '../types'
import '../SectionsAdminCss/Gestiondentiste.css'

function Gestiondentiste() {
  const [dentistes, setDentistes] = useState<DentisteAdmin[]>([])
  const [recherche, setRecherche] = useState('')
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState<number | null>(null)

  useEffect(() => {
    api
      .get<DentisteAdmin[]>('/api/admin/dentistes')
      .then(setDentistes)
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const nomComplet = (d: DentisteAdmin) =>
    d.nom || d.prenom ? `${d.prenom ?? ''} ${d.nom ?? ''}`.trim() : null

  const supprimer = async (d: DentisteAdmin) => {
    const libelle = nomComplet(d) ?? d.mail
    if (!window.confirm(`Supprimer définitivement ${libelle} ? Son compte et son profil seront effacés.`)) {
      return
    }
    setEnCours(d.id)
    setErreur('')
    try {
      await api.delete(`/api/admin/dentistes/${d.id}`)
      setDentistes((liste) => liste.filter((x) => x.id !== d.id))
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Une erreur est survenue')
    } finally {
      setEnCours(null)
    }
  }

  const terme = recherche.trim().toLowerCase()
  const filtres = dentistes.filter((d) =>
    [d.mail, d.nom, d.prenom, d.region, d.domaine]
      .filter(Boolean)
      .some((champ) => champ!.toLowerCase().includes(terme))
  )

  return (
    <section className="gestion-dentiste">
      <h1>
        Gestion des dentistes
        {dentistes.length > 0 && <span className="gd-badge">{dentistes.length}</span>}
      </h1>

      <input
        className="gd-recherche"
        type="search"
        placeholder="Rechercher (nom, email, région, domaine)..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      {erreur && <p className="gd-erreur">{erreur}</p>}

      {chargement ? (
        <p>Chargement...</p>
      ) : filtres.length === 0 ? (
        <p className="gd-vide">
          {dentistes.length === 0 ? 'Aucun dentiste validé pour le moment.' : 'Aucun résultat.'}
        </p>
      ) : (
        <ul className="gd-liste">
          {filtres.map((d) => {
            const photo = urlImage(d.photo)
            const nom = nomComplet(d)
            return (
              <li key={d.id} className="gd-carte">
                {photo ? (
                  <img className="gd-photo" src={photo} alt={nom ?? d.mail} />
                ) : (
                  <span className="gd-photo gd-photo-vide">{d.mail.charAt(0).toUpperCase()}</span>
                )}

                <div className="gd-infos">
                  <strong>{nom ? `${d.titre ?? ''} ${nom}`.trim() : 'Profil non complété'}</strong>
                  <span>{d.mail}</span>
                  {d.domaine && <span>{d.domaine}{d.region ? ` · ${d.region}` : ''}</span>}
                  {d.contact && <span>Contact : {d.contact}</span>}
                </div>

                <button
                  className="gd-supprimer"
                  disabled={enCours === d.id}
                  onClick={() => supprimer(d)}
                >
                  {enCours === d.id ? 'Suppression...' : 'Supprimer'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default Gestiondentiste