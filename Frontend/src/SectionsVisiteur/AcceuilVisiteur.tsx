import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, urlImage } from '../services/api'
import type { Actualite } from '../types'
import photoPresident from '../Public/Pesident.png'
import '../SectionsVisiteurCss/CommunVisiteur.css'
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
    
      

      {/* ===== Qu'est-ce que l'ONOS ===== */}
      <section className="acc-section acc-fond-blanc">
        <div className="acc-inner acc-centre">
          <p className="acc-sigle">Ordre National des Odonto-Stomatologistes de Madagascar</p>
          <p className="acc-texte">
            L'Ordre National des Odonto-Stomatologistes de Madagascar (ONOS) est l'institution de
            régulation de la profession dentaire dans le pays. Créé pour veiller à l'éthique, à la
            déontologie et à la qualité des soins bucco-dentaires, il regroupe l'ensemble des
            chirurgiens-dentistes légalement autorisés à exercer à Madagascar.
          </p>
        </div>
      </section>

      {/* ===== Notre engagement ===== */}
      <section className="acc-section acc-fond-clair">
        <div className="acc-inner">
          <h2 className="acc-titre">Notre engagement</h2>
          <ul className="acc-engagements">
            {ENGAGEMENTS.map((e) => (
              <li key={e}>
                <span className="acc-puce">✓</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== Mot du Président ===== */}
      <section className="acc-section acc-fond-blanc acc-section-president">
        <svg
          className="acc-decor"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="onosDecor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6a4bdb" />
              <stop offset="100%" stopColor="#3b6fe0" />
            </linearGradient>
          </defs>
          <path
            d="M75 15 C 45 15, 45 45, 25 45 C 10 45, 10 25, 25 25"
            stroke="url(#onosDecor)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M25 55 C 55 55, 55 85, 75 85 C 90 85, 90 65, 75 65"
            stroke="url(#onosDecor)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

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
            <p className="acc-signature">
              <strong>Dr. Daniel A. RABEMANANJARA</strong>
              <span>Président de l'ONOS</span>
            </p>
          </div>

          <div className="acc-president-photo-zone">
            <img
              className="acc-president-photo"
              src={photoPresident}
              alt="Dr. Daniel A. RABEMANANJARA"
            />
          </div>
        </div>
      </section>

      <section className="acc-hero">
        <div className="acc-inner">
          <h1>
            Trouvez le <span className="acc-couleur">bon dentiste</span>,
            <br />
            près de chez vous
          </h1>
          <p className="acc-sous-titre">
            Onos réunit les dentistes de Madagascar dans un annuaire simple à consulter,
            avec leurs coordonnées et leur domaine d'exercice.
          </p>
          <div className="acc-hero-actions">
            <Link to="/annuaire" className="acc-btn acc-btn-plein">Consulter l'annuaire</Link>
            <Link to="/inscription" className="acc-btn acc-btn-contour">Je suis dentiste</Link>
          </div>
        </div>
      </section>

      {/* ===== Actualités ===== */}
      <section className="acc-section acc-fond-clair acc-derniere">
        <div className="acc-inner">
          <h2 className="acc-titre">Dernières actualités</h2>
          {erreur && <p className="vis-erreur">{erreur}</p>}
          {chargement ? (
            <p className="acc-centre">Chargement...</p>
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
                      <button
                        className="acc-actu-lien"
                        onClick={() => setOuverte(complete ? null : a.id)}
                      >
                        {complete ? 'Réduire' : 'Lire la suite'}
                      </button>
                    )}
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