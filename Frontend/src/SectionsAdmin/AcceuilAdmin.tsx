import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../AuthContext'
import type { Actualite, Demande, DentisteAdmin } from '../types'
import '../SectionsAdminCss/AcceuilAdmin.css'

interface Stats {
  demandes: number
  dentistes: number
  actualites: number
}

function AcceuilAdmin() {
  const { utilisateur } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [derniersDentistes, setDerniersDentistes] = useState<DentisteAdmin[]>([])
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Demande[]>('/api/admin/demandes'),
      api.get<DentisteAdmin[]>('/api/admin/dentistes'),
      api.get<Actualite[]>('/api/actualites'),
    ])
      .then(([demandes, dentistes, actualites]) => {
        setStats({
          demandes: demandes.length,
          dentistes: dentistes.length,
          actualites: actualites.length,
        })
        
        const recents = [...dentistes]
          .sort((a, b) => b.id - a.id) 
          .slice(0, 5)
          
        setDerniersDentistes(recents)
      })
      .catch((e: Error) => setErreur(e.message))
  }, [])

  const cartes = stats
    ? [
        { lien: '/admin/notifications', nombre: stats.demandes, libelle: "Demandes en attente" },
        { lien: '/admin/dentistes', nombre: stats.dentistes, libelle: 'Dentistes validés' },
        { lien: '/admin/actualites', nombre: stats.actualites, libelle: 'Actualités publiées' },
      ]
    : []

  return (
    <section className="adm-page">
      <div className="adm-header">
        <h1>Tableau de bord</h1>
      </div>

      {erreur && <p className="adm-erreur">{erreur}</p>}
      {!stats && !erreur && <p>Chargement des données...</p>}

      {stats && (
        <div className="adm-main">
          
          {/* CARTES DU HAUT (Taille réduite) */}
          <div className="acc-grille">
            {cartes.map((c) => (
              <Link key={c.lien} to={c.lien} className="adm-carte acc-carte">
                <span className="acc-nombre">{c.nombre}</span>
                <span className="acc-libelle">{c.libelle}</span>
              </Link>
            ))}
          </div>

          {/* TABLEAU DES DERNIERS PROFILS */}
          <div className="adm-section-card">
            <div className="adm-section-header">
              <h2>Profils récemment publiés</h2>
              <Link to="/admin/dentistes" className="adm-btn-text">Voir tout</Link>
            </div>
            
            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Nom / Email</th>
                    <th>Spécialité</th>
                    <th>Région</th>
                  </tr>
                </thead>
                <tbody>
                  {derniersDentistes.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center' }}>Aucun profil récent.</td></tr>
                  ) : (
                    derniersDentistes.map((d) => {
                      const nomAffiche = d.nom ? d.nom : 'Inconnu'
                      const prenomAffiche = d.prenom ? d.prenom : ''
                      const mailAffiche = d.mail ? d.mail : "Pas d'email"
                      const initiale = nomAffiche.charAt(0).toUpperCase()

                      return (
                        <tr key={d.id}>
                          <td>
                            <div className="adm-table-user">
                              <span className="adm-avatar">{initiale}</span>
                              <div>
                                <strong>{prenomAffiche} {nomAffiche}</strong>
                                <span className="adm-text-muted">{mailAffiche}</span>
                              </div>
                            </div>
                          </td>
                          <td>{d.domaine || '-'}</td>
                          <td>{d.region || '-'}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </section>
  )
}

export default AcceuilAdmin