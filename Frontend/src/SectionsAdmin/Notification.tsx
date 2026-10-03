import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Demande } from '../types'
import '../SectionsAdminCss/Notification.css'

function Notification() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState<number | null>(null)

  useEffect(() => {
    api
      .get<Demande[]>('/api/admin/demandes')
      .then(setDemandes)
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const traiter = async (demande: Demande, action: 'accepter' | 'refuser') => {
    if (action === 'refuser' && !window.confirm(`Refuser la demande de ${demande.mail} ?`)) {
      return
    }
    setEnCours(demande.id)
    setErreur('')
    try {
      if (action === 'accepter') {
        await api.patch(`/api/admin/demandes/${demande.id}/accepter`)
      } else {
        await api.delete(`/api/admin/demandes/${demande.id}`)
      }
      setDemandes((liste) => liste.filter((d) => d.id !== demande.id))
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Une erreur est survenue')
    } finally {
      setEnCours(null)
    }
  }

  const formaterDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  return (
    <section className="notification">
      <h1>
        Demandes d'inscription
        {demandes.length > 0 && <span className="notification-badge">{demandes.length}</span>}
      </h1>

      {erreur && <p className="notification-erreur">{erreur}</p>}

      {chargement ? (
        <p>Chargement...</p>
      ) : demandes.length === 0 ? (
        <p className="notification-vide">Aucune demande en attente.</p>
      ) : (
        <ul className="notification-liste">
          {demandes.map((d) => (
            <li key={d.id} className="notification-carte">
              <div className="notification-infos">
                <strong>{d.mail}</strong>
                <span>Demande reçue le {formaterDate(d.created_at)}</span>
              </div>
              <div className="notification-actions">
                <button
                  className="btn-accepter"
                  disabled={enCours === d.id}
                  onClick={() => traiter(d, 'accepter')}
                >
                  {enCours === d.id ? 'En cours...' : 'Accepter'}
                </button>
                <button
                  className="btn-refuser"
                  disabled={enCours === d.id}
                  onClick={() => traiter(d, 'refuser')}
                >
                  Refuser
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Notification