import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError, urlImage } from '../services/api'
import { useAuth } from '../AuthContext'
import type { Actualite, ProfilDentiste } from '../types'
import '../SectionsDentisteCss/CommunDentiste.css'
import '../SectionsDentisteCss/AcceuilDentiste.css'

function AcceuilDentiste() {
  const { utilisateur } = useAuth()
  const [profil, setProfil] = useState<ProfilDentiste | null>(null)
  const [actualites, setActualites] = useState<Actualite[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<ProfilDentiste>('/api/dentistes/mon-profil').catch((e) => {
        if (e instanceof ApiError && e.status === 404) return null
        throw e
      }),
      api.get<Actualite[]>('/api/actualites'),
    ])
      .then(([p, a]) => {
        setProfil(p)
        setActualites(a.slice(0, 3))
      })
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const pseudo = (utilisateur?.mail ?? '').split('@')[0]
  const photo = profil ? urlImage(profil.photo) : null

  const formaterDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <section className="dent-page">
      <h1 className="dent-titre">
        Bonjour {profil ? `${profil.titre} ${profil.nom}` : pseudo}
      </h1>
      <p className="dent-intro">Bienvenue dans votre espace dentiste Onos.</p>

      {erreur && <p className="dent-erreur">{erreur}</p>}

      {chargement ? (
        <p>Chargement...</p>
      ) : profil ? (
        <div className="dent-carte acc-dent-profil">
          {photo ? (
            <img className="acc-dent-photo" src={photo} alt="Ma photo" />
          ) : (
            <span className="acc-dent-photo acc-dent-photo-vide">{profil.nom.charAt(0).toUpperCase()}</span>
          )}
          <div className="acc-dent-texte">
            <strong>Votre profil est publié dans l'annuaire.</strong>
            <span>{profil.domaine} · {profil.region}</span>
            <Link to="/dentiste/profil" className="dent-btn acc-dent-btn">Modifier mon profil</Link>
          </div>
        </div>
      ) : (
        <div className="dent-alerte">
          <p style={{ marginTop: 0 }}>
            Votre compte est validé, mais votre profil n'est pas encore rempli : vous
            n'apparaissez pas dans l'annuaire.
          </p>
          <Link to="/dentiste/profil" className="dent-btn">Compléter mon profil</Link>
        </div>
      )}

      <div className="dent-carte">
        <h2>Dernières actualités</h2>
        {actualites.length === 0 ? (
          <p className="dent-vide">Aucune actualité pour le moment.</p>
        ) : (
          <ul className="acc-dent-actus">
            {actualites.map((a) => (
              <li key={a.id}>
                <strong>{a.titre}</strong>
                <span className="acc-dent-date">{formaterDate(a.created_at)}</span>
                <p>{a.contenu.length > 140 ? `${a.contenu.slice(0, 140)}...` : a.contenu}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default AcceuilDentiste