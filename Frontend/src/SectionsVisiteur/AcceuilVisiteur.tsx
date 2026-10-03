import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, urlImage } from '../services/api'
import type { Actualite } from '../types'
import '../SectionsVisiteurCss/CommunVisiteur.css'
import '../SectionsVisiteurCss/AcceuilVisiteur.css'

function AcceuilVisiteur() {
  const [actualites, setActualites] = useState<Actualite[]>([])
  const [ouverte, setOuverte] = useState<number | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api
      .get<Actualite[]>('/api/actualites')
      .then((liste) => setActualites(liste.slice(0, 3)))
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const formaterDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="vis-page">
      <section className="acc-hero">
        <h1>Trouvez le bon dentiste, près de chez vous</h1>
        <p>
          Onos réunit les dentistes de Madagascar dans un annuaire simple à consulter,
          avec leurs coordonnées et leur domaine d'exercice.
        </p>
        <div className="acc-hero-actions">
          <Link to="/annuaire" className="vis-btn acc-btn-blanc">Consulter l'annuaire</Link>
          <Link to="/inscription" className="vis-btn vis-btn-clair acc-btn-contour">Je suis dentiste</Link>
        </div>
      </section>

      <h2 className="vis-sous-titre">Comment ça marche</h2>
      <div className="vis-grille">
        <div className="vis-carte">
          <h3>1. Recherchez</h3>
          <p>Filtrez l'annuaire par nom, par région et par domaine (fonctionnaire, privé, libéral).</p>
        </div>
        <div className="vis-carte">
          <h3>2. Choisissez</h3>
          <p>Consultez la fiche du dentiste : titre, adresse, photo et numéros de contact.</p>
        </div>
        <div className="vis-carte">
          <h3>3. Contactez</h3>
          <p>Appelez directement le cabinet depuis la fiche, en un clic sur mobile.</p>
        </div>
      </div>

      <h2 className="vis-sous-titre">Dernières actualités</h2>
      {erreur && <p className="vis-erreur">{erreur}</p>}
      {chargement ? (
        <p>Chargement...</p>
      ) : actualites.length === 0 ? (
        <p className="vis-vide">Aucune actualité pour le moment.</p>
      ) : (
        <div className="vis-grille">
          {actualites.map((a) => {
            const img = urlImage(a.image)
            const complete = ouverte === a.id
            return (
              <article key={a.id} className="vis-carte acc-actu">
                {img && <img className="acc-actu-image" src={img} alt={a.titre} />}
                <span className="acc-actu-date">{formaterDate(a.created_at)}</span>
                <h3>{a.titre}</h3>
                <p>
                  {complete || a.contenu.length <= 140
                    ? a.contenu
                    : `${a.contenu.slice(0, 140)}...`}
                </p>
                {a.contenu.length > 140 && (
                  <button className="acc-actu-lien" onClick={() => setOuverte(complete ? null : a.id)}>
                    {complete ? 'Réduire' : 'Lire la suite'}
                  </button>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AcceuilVisiteur