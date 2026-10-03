import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api, urlImage } from '../services/api'
import type { Actualite } from '../types'
import '../SectionsAdminCss/AdminCommun.css'
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
      setSucces('Actualité publiée.')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setEnvoi(false)
    }
  }

  const supprimer = async (a: Actualite) => {
    if (!window.confirm(`Supprimer l'actualité « ${a.titre} » ?`)) return
    setEnCours(a.id)
    setErreur('')
    setSucces('')
    try {
      await api.delete(`/api/actualites/${a.id}`)
      setActualites((liste) => liste.filter((x) => x.id !== a.id))
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setEnCours(null)
    }
  }

  const formaterDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <section className="adm-page">
      <h1>Gestion des actualités</h1>

      <form className="adm-carte act-formulaire" onSubmit={publier}>
        <h2>Nouvelle actualité</h2>

        <div className="adm-champ">
          <label htmlFor="act-titre">Titre</label>
          <input id="act-titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
        </div>

        <div className="adm-champ">
          <label htmlFor="act-contenu">Contenu</label>
          <textarea
            id="act-contenu"
            rows={5}
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
          />
        </div>

        <div className="adm-champ">
          <label htmlFor="act-image">Image (facultatif)</label>
          <input
            id="act-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={champImage}
            onChange={(e) => choisirImage(e.target.files?.[0])}
          />
          {apercu && <img className="act-apercu" src={apercu} alt="Aperçu" />}
        </div>

        {erreur && <p className="adm-erreur">{erreur}</p>}
        {succes && <p className="adm-succes">{succes}</p>}

        <button className="adm-btn" type="submit" disabled={envoi}>
          {envoi ? 'Publication...' : 'Publier'}
        </button>
      </form>

      <h2 className="act-sous-titre">Actualités publiées ({actualites.length})</h2>

      {chargement ? (
        <p>Chargement...</p>
      ) : actualites.length === 0 ? (
        <p className="adm-vide">Aucune actualité pour le moment.</p>
      ) : (
        <ul className="act-liste">
          {actualites.map((a) => {
            const img = urlImage(a.image)
            return (
              <li key={a.id} className="adm-carte act-carte">
                {img && <img className="act-image" src={img} alt={a.titre} />}
                <div className="act-texte">
                  <strong>{a.titre}</strong>
                  <span className="act-date">{formaterDate(a.created_at)}</span>
                  <p>{a.contenu.length > 160 ? `${a.contenu.slice(0, 160)}...` : a.contenu}</p>
                </div>
                <button
                  className="adm-btn adm-btn-danger"
                  disabled={enCours === a.id}
                  onClick={() => supprimer(a)}
                >
                  {enCours === a.id ? 'Suppression...' : 'Supprimer'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default GestionActualiter