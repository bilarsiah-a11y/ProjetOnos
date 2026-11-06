import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Demande } from '../types'
import '../SectionsAdminCss/Notification.css'

function Notification() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState<number | null>(null)

  // État pour gérer la demande sélectionnée à droite
  const [selectionnee, setSelectionnee] = useState<Demande | null>(null)
  
  // État pour le motif de refus
  const [motifRefus, setMotifRefus] = useState('')
  const [afficherMotif, setAfficherMotif] = useState(false)

  useEffect(() => {
    api
      .get<Demande[]>('/api/admin/demandes')
      .then((data) => {
        setDemandes(data)
        if (data.length > 0) setSelectionnee(data[0]) // Sélectionne la première par défaut
      })
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const traiter = async (demande: Demande, action: 'accepter' | 'refuser') => {
    if (action === 'refuser' && !motifRefus.trim()) {
      setErreur('Veuillez indiquer un motif de refus.')
      return
    }

    setEnCours(demande.id)
    setErreur('')
    try {
      if (action === 'accepter') {
        await api.patch(`/api/admin/demandes/${demande.id}/accepter`)
      } else {
        // 👇 On pourrait envoyer le motif à l'API si ton backend le gère :
        // await api.delete(`/api/admin/demandes/${demande.id}`, { data: { motif: motifRefus } })
        await api.delete(`/api/admin/demandes/${demande.id}`)
      }

      const nouvelleListe = demandes.filter((d) => d.id !== demande.id)
      setDemandes(nouvelleListe)
      
      // Mettre à jour la sélection
      setSelectionnee(nouvelleListe.length > 0 ? nouvelleListe[0] : null)
      setAfficherMotif(false)
      setMotifRefus('')
      
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
      hour: '2-digit',
      minute: '2-digit'
    })

  return (
    <section className="notification-page">
      <div className="notification-header">
        <h1>
          Demandes d'inscription
          {demandes.length > 0 && <span className="notification-badge">{demandes.length}</span>}
        </h1>
      </div>

      {erreur && <p className="notification-erreur">{erreur}</p>}

      {chargement ? (
        <p className="notification-vide">Chargement...</p>
      ) : demandes.length === 0 ? (
        <p className="notification-vide">Aucune demande en attente.</p>
      ) : (
        <div className="notification-layout">
          
          {/* PANNEAU GAUCHE : LISTE DES DEMANDES */}
          <div className="notification-liste-panneau">
            <ul className="notification-liste">
              {demandes.map((d) => (
                <li 
                  key={d.id} 
                  className={`notification-item ${selectionnee?.id === d.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectionnee(d)
                    setAfficherMotif(false)
                    setMotifRefus('')
                  }}
                >
                  <div className="notification-item-avatar">
                    {d.mail.charAt(0).toUpperCase()}
                  </div>
                  <div className="notification-item-infos">
                    <strong>{d.mail.split('@')[0]}</strong>
                    <span>{d.mail}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* PANNEAU DROIT : DÉTAILS ET ACTIONS */}
          {selectionnee && (
            <div className="notification-detail-panneau">
              <div className="detail-header">
                <div className="detail-avatar">
                  {selectionnee.mail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{selectionnee.mail.split('@')[0]}</h2>
                  <p>{selectionnee.mail}</p>
                </div>
              </div>

              <div className="detail-body">
                <div className="detail-row">
                  <span>Date de la demande</span>
                  <strong>{formaterDate(selectionnee.created_at)}</strong>
                </div>
                <div className="detail-row">
                  <span>Statut</span>
                  <strong className="status-en-attente">En attente de validation</strong>
                </div>
              </div>

              {afficherMotif && (
                <div className="detail-motif">
                  <label htmlFor="motif">Motif du refus</label>
                  <textarea 
                    id="motif" 
                    placeholder="Expliquez pourquoi vous refusez cette demande..."
                    value={motifRefus}
                    onChange={(e) => setMotifRefus(e.target.value)}
                  />
                </div>
              )}

              <div className="detail-actions">
                <button
                  className="btn-accepter"
                  disabled={enCours === selectionnee.id}
                  onClick={() => traiter(selectionnee, 'accepter')}
                >
                  {enCours === selectionnee.id ? '...' : 'Accepter la demande'}
                </button>

                {!afficherMotif ? (
                  <button
                    className="btn-refuser-outline"
                    disabled={enCours === selectionnee.id}
                    onClick={() => setAfficherMotif(true)}
                  >
                    Refuser
                  </button>
                ) : (
                  <div className="refuser-actions">
                    <button
                      className="btn-refuser"
                      disabled={enCours === selectionnee.id || !motifRefus.trim()}
                      onClick={() => traiter(selectionnee, 'refuser')}
                    >
                      Confirmer le refus
                    </button>
                    <button
                      className="btn-annuler"
                      onClick={() => {
                        setAfficherMotif(false)
                        setMotifRefus('')
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Notification