import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../AuthContext'
import type { Actualite, Demande, DentisteAdmin } from '../types'
import '../SectionsAdminCss/AdminCommun.css'
import '../SectionsAdminCss/AcceuilAdmin.css'

interface Stats {
  demandes: number
  dentistes: number
  actualites: number
}

function AcceuilAdmin() {
  const { utilisateur } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Demande[]>('/api/admin/demandes'),
      api.get<DentisteAdmin[]>('/api/admin/dentistes'),
      api.get<Actualite[]>('/api/actualites'),
    ])
      .then(([demandes, dentistes, actualites]) =>
        setStats({
          demandes: demandes.length,
          dentistes: dentistes.length,
          actualites: actualites.length,
        })
      )
      .catch((e: Error) => setErreur(e.message))
  }, [])

  const pseudo = utilisateur?.mail.split('@')[0] ?? ''

  const cartes = stats
    ? [
        { lien: '/admin/notifications', nombre: stats.demandes, libelle: "Demandes d'inscription en attente" },
        { lien: '/admin/dentistes', nombre: stats.dentistes, libelle: 'Dentistes validés' },
        { lien: '/admin/actualites', nombre: stats.actualites, libelle: 'Actualités publiées' },
      ]
    : []

  return (
    <section className="adm-page">
      <h1>Tableau de bord</h1>
      <p className="acc-salut">Bonjour {pseudo}, voici l'état de la plateforme Onos.</p>

      {erreur && <p className="adm-erreur">{erreur}</p>}
      {!stats && !erreur && <p>Chargement...</p>}

      <div className="acc-grille">
        {cartes.map((c) => (
          <Link key={c.lien} to={c.lien} className="adm-carte acc-carte">
            <span className="acc-nombre">{c.nombre}</span>
            <span className="acc-libelle">{c.libelle}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default AcceuilAdmin