import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, urlImage } from '../services/api'
import type { Actualite } from '../types'
import photoPresident from '../Public/Pesident.png'
import '../SectionsVisiteurCss/AcceuilVisiteur.css'

const ENGAGEMENTS = [
  'Assurer la tenue du tableau national des praticiens',
  'Veiller au respect des bonnes pratiques professionnelles',
  'Représenter la profession auprès des autorités publiques et des partenaires nationaux et internationaux',
  'Contribuer à la formation continue et à la promotion de la santé bucco-dentaire',
]

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
    <div className="acc-full">
    
      {/* ===== Intro & Engagement ===== */}
      <section className="acc-section acc-intro-section">
        <div className="acc-inner acc-centre">
          <h1 className="acc-intro-titre">
            Ordre National des <br />
            <span className="acc-couleur">Odonto-Stomatologistes</span> de Madagascar
          </h1>
          <p className="acc-intro-texte">
            L'ONOS est l'institution de régulation de la profession dentaire dans le pays. 
            Créé pour veiller à l'éthique, à la déontologie et à la qualité des soins bucco-dentaires, 
            il regroupe l'ensemble des chirurgiens-dentistes légalement autorisés à exercer à Madagascar.
          </p>
          
          <div className="acc-engagement-bloc">
            <h2 className="acc-sous-titre-titre">Notre engagement</h2>
            <ul className="acc-engagements">
              {ENGAGEMENTS.map((e, index) => (
                <li key={e}>
                  <span className="acc-numero">{String(index + 1).padStart(2, '0')}</span>
                  <span className="acc-engagement-texte">{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Mot du Président ===== */}
      <section className="acc-section acc-section-president">
        <div className="acc-decor-blob"></div>
        <div className="acc-inner acc-president">
          <div className="acc-president-texte">
            <h2>Mot de bienvenue du Président</h2>
            <p><strong>Chères consœurs, chers confrères, chers partenaires,</strong></p>
            <p>C'est avec honneur et enthousiasme que je vous accueille au nom de l'ONOS.</p>
            <p>
              Notre Ordre incarne les valeurs d'engagement, d'excellence et de responsabilité dans
              la profession bucco-dentaire. Nous nous dédions à défendre la santé bucco-dentaire de
              notre population, à soutenir le développement professionnel de nos membres et à
              promouvoir notre profession sur le plan national et international.
            </p>
            <p>
              Votre présence, votre implication et vos collaborations sont essentielles pour la
              réussite de nos missions. Ensemble, œuvrons pour bâtir une profession forte, solidaire
              et tournée vers l'avenir.
            </p>
            <p><strong>Bienvenue et merci pour votre engagement à nos côtés.</strong></p>
            
            <div className="acc-signature">
              <strong>Dr. Daniel A. RABEMANANJARA</strong>
              <span>Président de l'ONOS</span>
            </div>
          </div>

          <div className="acc-president-photo-zone">
            <div className="acc-photo-cadre">
              <img
                className="acc-president-photo"
                src={photoPresident}
                alt="Dr. Daniel A. RABEMANANJARA"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Hero / Annuaire ===== */}
      <section className="acc-hero">
        <div className="acc-inner">
          <h2 className="acc-hero-titre">
            Services et Ressources
          </h2>
          <p className="acc-sous-titre">
            Accédez rapidement aux services et informations dont vous avez besoin
            Trouvez le dentiste près de chez vous . 
            ONOS réunit les dentistes de Madagascar dans un annuaire simple à consulter,
            avec leurs coordonnées et leur domaine d'exercice.
          </p>
          <div className="acc-hero-actions">
            <Link to="/annuaire" className="acc-btn acc-btn-plein">Consulter l'annuaire</Link>
            <Link to="/inscription" className="acc-btn acc-btn-contour">Je suis dentiste</Link>
          </div>
        </div>
      </section>

      {/* ===== Actualités ===== */}
      <section className="acc-section acc-derniere">
        <div className="acc-inner">
          <h2 className="acc-titre">Dernières actualités</h2>
          {erreur && <p className="vis-erreur">{erreur}</p>}
          {chargement ? (
            <p className="acc-centre">Chargement...</p>
          ) : actualites.length === 0 ? (
            <p className="vis-vide">Aucune actualité pour le moment.</p>
          ) : (
            <div className="acc-actu-grille">
              {actualites.map((a) => {
                const img = urlImage(a.image)
                const complete = ouverte === a.id
                return (
                  <article key={a.id} className="acc-actu-carte">
                    <div className="acc-actu-image-zone">
                      {img ? (
                        <img className="acc-actu-img" src={img} alt={a.titre} />
                      ) : (
                        <div className="acc-actu-img-vide">📰</div>
                      )}
                    </div>

                    <div className="acc-actu-contenu">
                      <span className="acc-actu-date">{formaterDate(a.created_at)}</span>
                      <h3 className="acc-actu-titre">{a.titre}</h3>
                      <p className="acc-actu-texte">
                        {complete || a.contenu.length <= 140
                          ? a.contenu
                          : `${a.contenu.slice(0, 140)}...`}
                      </p>
                      {a.contenu.length > 140 && (
                        <button
                          className="acc-actu-btn"
                          onClick={() => setOuverte(complete ? null : a.id)}
                        >
                          {complete ? 'Réduire' : 'Lire la suite'}
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default AcceuilVisiteur