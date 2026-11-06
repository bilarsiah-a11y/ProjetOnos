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
      <div className="gd-header">
        <h1>
          Gestion des dentistes
          {dentistes.length > 0 && <span className="gd-badge">{dentistes.length}</span>}
        </h1>
      </div>

      <input
        className="gd-recherche"
        type="search"
        placeholder="Rechercher (nom, email, région, domaine)..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      {erreur && <p className="gd-erreur">{erreur}</p>}

      {chargement ? (
        <p className="gd-texte-vide">Chargement...</p>
      ) : filtres.length === 0 ? (
        <p className="gd-texte-vide">
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
                  <span className="gd-mail">{d.mail}</span>
                  {d.domaine && <span>{d.domaine}{d.region ? ` · ${d.region}` : ''}</span>}
                  {d.contact && <span>Contact : {d.contact}</span>}
                </div>

                <button
                  className="gd-btn-supprimer"
                  disabled={enCours === d.id}
                  onClick={() => supprimer(d)}
                  title="Supprimer ce dentiste"
                >
                  {enCours === d.id ? (
                    <span className="gd-loader">...</span>
                  ) : (
                    // Icône de corbeille SVG
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  )}
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