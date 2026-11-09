import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api, urlImage } from '../services/api'
import type { Actualite } from '../types'
import '../SectionsAdminCss/GestionActualiter.css'

const TAILLE_MAX_MO = 5

function GestionActualiter() {
  const [actualites, setActualites] = useState<Actualite[]>([])
  const [titre, setTitre] = useState('')
  const [contenu, setContenu] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [apercu, setApercu] = useState<string | null>(null)
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [enCours, setEnCours] = useState<number | null>(null)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  
  // --- ÉTAT POUR LA MODALE DE SUPPRESSION ---
  const [actualiteASupprimer, setActualiteASupprimer] = useState<Actualite | null>(null)

  const champImage = useRef<HTMLInputElement>(null)
  const TYPES_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp']

  const charger = () =>
    api.get<Actualite[]>('/api/actualites').then(setActualites)

  useEffect(() => {
    charger()
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  // Aperçu de l'image choisie
  useEffect(() => {
    if (!image) {
      setApercu(null)
      return
    }
    const url = URL.createObjectURL(image)
    setApercu(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const choisirImage = (fichier: File | undefined) => {
    setErreur('')
    if (!fichier) {
      setImage(null)
      return
    }
    if (!TYPES_ACCEPTES.includes(fichier.type)) {
      setErreur('Format accepté : JPG, PNG ou WebP.')
      return
    }
    if (fichier.size > TAILLE_MAX_MO * 1024 * 1024) {
      setErreur(`L'image ne doit pas dépasser ${TAILLE_MAX_MO} Mo.`)
      return
    }
    setImage(fichier)
  }

  const publier = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')

    if (!titre.trim() || !contenu.trim()) {
      setErreur('Le titre et le contenu sont obligatoires.')
      return
    }

    const donnees = new FormData()
    donnees.append('titre', titre.trim())
    donnees.append('contenu', contenu.trim())
    if (image) donnees.append('image', image)

    setEnvoi(true)
    try {
      await api.envoyer('/api/actualites', donnees)
      await charger()
      setTitre('')
      setContenu('')
      setImage(null)
      if (champImage.current) champImage.current.value = ''
      setSucces('Actualité publiée avec succès.')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setEnvoi(false)
    }
  }

  // --- LOGIQUE DE SUPPRESSION (Appelée par la modale) ---
  const confirmerSuppression = async () => {
    if (!actualiteASupprimer) return
    
    setEnCours(actualiteASupprimer.id)
    setErreur('')
    setSucces('')
    
    try {
      await api.delete(`/api/actualites/${actualiteASupprimer.id}`)
      setActualites((liste) => liste.filter((x) => x.id !== actualiteASupprimer.id))
      setActualiteASupprimer(null) // Ferme la modale
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setEnCours(null)
    }
  }

  const formaterDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <section className="act-page">
        <h1>Gestion des actualités</h1>

        <form className="act-formulaire" onSubmit={publier}>
          <h2>Publier une nouvelle actualité</h2>

          <div className="act-champ">
            <label htmlFor="act-titre">Titre de l'actualité</label>
            <input 
              type="text"
              id="act-titre" 
              placeholder="Ex: Nouvelles directives sanitaires..."
              value={titre} 
              onChange={(e) => setTitre(e.target.value)} 
            />
          </div>

          <div className="act-champ">
            <label htmlFor="act-contenu">Contenu</label>
            <textarea
              id="act-contenu"
              rows={4}
              placeholder="Écrivez votre article ici..."
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
            />
          </div>

          <div className="act-champ">
            <label htmlFor="act-image">Image d'illustration (facultatif)</label>
            <div className="act-file-wrapper">
              <input
                id="act-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={champImage}
                onChange={(e) => choisirImage(e.target.files?.[0])}
              />
            </div>
            {apercu && <img className="act-apercu" src={apercu} alt="Aperçu" />}
          </div>

          {erreur && <p className="act-erreur">{erreur}</p>}
          {succes && <p className="act-succes">{succes}</p>}

          <button className="act-btn" type="submit" disabled={envoi}>
            {envoi ? 'Publication en cours...' : "Publier l'actualité"}
          </button>
        </form>

        <h2 className="act-sous-titre">Actualités en ligne ({actualites.length})</h2>

        {chargement ? (
          <p>Chargement des actualités...</p>
        ) : actualites.length === 0 ? (
          <p className="act-vide">Aucune actualité n'a été publiée pour le moment.</p>
        ) : (
          <ul className="act-liste">
            {actualites.map((a) => {
              const img = urlImage(a.image)
              return (
                <li key={a.id} className="act-carte">
                  {img ? (
                    <img className="act-image" src={img} alt={a.titre} />
                  ) : (
                    <div className="act-image-vide">📰</div>
                  )}
                  
                  <div className="act-texte">
                    <div className="act-header">
                      <strong>{a.titre}</strong>
                    
                    </div>
                    <p>{a.contenu.length > 160 ? `${a.contenu.slice(0, 160)}...` : a.contenu}</p>
                  </div>

                  <button
                    className="act-btn-danger"
                    disabled={enCours === a.id}
                    onClick={() => setActualiteASupprimer(a)} // <-- Ouvre la modale
                    title="Supprimer"
                  >
                    {enCours === a.id ? '...' : '🗑️'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* --- MODALE DE CONFIRMATION DE SUPPRESSION --- */}
      {actualiteASupprimer && (
        <div className="modal-overlay" onClick={() => setActualiteASupprimer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Supprimer l'actualité</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer définitivement l'actualité <strong>« {actualiteASupprimer.titre} »</strong> ?
              <br /><br />
              Cette action est irréversible.
            </p>
            <div className="modal-actions">
              <button 
                className="modal-btn-annuler" 
                onClick={() => setActualiteASupprimer(null)}
                disabled={enCours === actualiteASupprimer.id}
              >
                Annuler
              </button>
              <button 
                className="modal-btn-confirmer" 
                onClick={confirmerSuppression}
                disabled={enCours === actualiteASupprimer.id}
              >
                {enCours === actualiteASupprimer.id ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GestionActualiter