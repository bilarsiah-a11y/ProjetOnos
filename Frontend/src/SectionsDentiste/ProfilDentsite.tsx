import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api, ApiError, urlImage } from '../services/api'
import { useAuth } from '../AuthContext'
import type { OptionsProfil, ProfilDentiste } from '../types'
import '../SectionsDentisteCss/CommunDentiste.css'
import '../SectionsDentisteCss/ProfilDentsite.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TYPES_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp']
const TAILLE_MAX_MO = 5

const message = (err: unknown) =>
  err instanceof Error ? err.message : 'Une erreur est survenue'

function Champ({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="dent-champ">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  )
}

/* ---------- Informations du profil ---------- */

interface FormProfil {
  titre: string
  nom: string
  prenom: string
  genre: string
  date_naissance: string
  lieu_naissance: string
  domaine: string
  region: string
  adresse: string
  contact: string
  autre_contact: string
}

const VIDE: FormProfil = {
  titre: '', nom: '', prenom: '', genre: '', date_naissance: '', lieu_naissance: '',
  domaine: '', region: '', adresse: '', contact: '', autre_contact: '',
}

const depuisProfil = (p: ProfilDentiste): FormProfil => ({
  titre: p.titre,
  nom: p.nom,
  prenom: p.prenom,
  genre: p.genre,
  date_naissance: (p.date_naissance ?? '').slice(0, 10),
  lieu_naissance: p.lieu_naissance ?? '',
  domaine: p.domaine,
  region: p.region,
  adresse: p.adresse ?? '',
  contact: p.contact,
  autre_contact: p.autre_contact ?? '',
})

function FormulaireProfil({
  options, profil, onSauve,
}: {
  options: OptionsProfil
  profil: ProfilDentiste | null
  onSauve: () => Promise<void>
}) {
  const [f, setF] = useState<FormProfil>(profil ? depuisProfil(profil) : VIDE)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const maj = (champ: keyof FormProfil, valeur: string) =>
    setF((x) => ({ ...x, [champ]: valeur }))

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')

    const obligatoires: (keyof FormProfil)[] =
      ['titre', 'nom', 'prenom', 'genre', 'domaine', 'region', 'contact']
    if (obligatoires.some((c) => !f[c].trim())) {
      setErreur('Remplissez tous les champs obligatoires (*).')
      return
    }

    const donnees = {
      titre: f.titre,
      nom: f.nom.trim(),
      prenom: f.prenom.trim(),
      genre: f.genre,
      domaine: f.domaine,
      region: f.region,
      contact: f.contact.trim(),
      date_naissance: f.date_naissance || null,
      lieu_naissance: f.lieu_naissance.trim() || null,
      adresse: f.adresse.trim() || null,
      autre_contact: f.autre_contact.trim() || null,
    }

    setEnvoi(true)
    try {
      if (profil) await api.put('/api/dentistes/profil', donnees)
      else await api.post('/api/dentistes/profil', donnees)
      await onSauve()
      setSucces(profil ? 'Profil mis à jour.' : "Profil créé : il apparaît maintenant dans l'annuaire.")
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form className="dent-carte" onSubmit={enregistrer}>
      <h2>Mes informations</h2>

      <div className="dent-grille">
        <Champ id="pf-titre" label="Titre *">
          <select id="pf-titre" value={f.titre} onChange={(e) => maj('titre', e.target.value)}>
            <option value="">Choisir...</option>
            {options.titres.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Champ>
        <Champ id="pf-genre" label="Genre *">
          <select id="pf-genre" value={f.genre} onChange={(e) => maj('genre', e.target.value)}>
            <option value="">Choisir...</option>
            {options.genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Champ>
        <Champ id="pf-nom" label="Nom *">
          <input id="pf-nom" value={f.nom} onChange={(e) => maj('nom', e.target.value)} />
        </Champ>
        <Champ id="pf-prenom" label="Prénom *">
          <input id="pf-prenom" value={f.prenom} onChange={(e) => maj('prenom', e.target.value)} />
        </Champ>
        <Champ id="pf-date" label="Date de naissance">
          <input id="pf-date" type="date" value={f.date_naissance}
            onChange={(e) => maj('date_naissance', e.target.value)} />
        </Champ>
        <Champ id="pf-lieu" label="Lieu de naissance">
          <input id="pf-lieu" value={f.lieu_naissance}
            onChange={(e) => maj('lieu_naissance', e.target.value)} />
        </Champ>
        <Champ id="pf-domaine" label="Domaine d'exercice *">
          <select id="pf-domaine" value={f.domaine} onChange={(e) => maj('domaine', e.target.value)}>
            <option value="">Choisir...</option>
            {options.domaines.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Champ>
        <Champ id="pf-region" label="Région *">
          <select id="pf-region" value={f.region} onChange={(e) => maj('region', e.target.value)}>
            <option value="">Choisir...</option>
            {options.regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Champ>
        <Champ id="pf-adresse" label="Adresse du cabinet">
          <input id="pf-adresse" value={f.adresse} onChange={(e) => maj('adresse', e.target.value)} />
        </Champ>
        <Champ id="pf-contact" label="Contact *">
          <input id="pf-contact" type="tel" value={f.contact}
            onChange={(e) => maj('contact', e.target.value)} />
        </Champ>
        <Champ id="pf-autre" label="Autre contact">
          <input id="pf-autre" type="tel" value={f.autre_contact}
            onChange={(e) => maj('autre_contact', e.target.value)} />
        </Champ>
      </div>

      {erreur && <p className="dent-erreur">{erreur}</p>}
      {succes && <p className="dent-succes">{succes}</p>}

      <button className="dent-btn" type="submit" disabled={envoi}>
        {envoi ? 'Enregistrement...' : profil ? 'Enregistrer les modifications' : 'Créer mon profil'}
      </button>
    </form>
  )
}

/* ---------- Photo ---------- */

function BlocPhoto({
  profil, onChange,
}: {
  profil: ProfilDentiste | null
  onChange: () => Promise<void>
}) {
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const champ = useRef<HTMLInputElement>(null)

  if (!profil) {
    return (
      <div className="dent-carte">
        <h2>Ma photo</h2>
        <p className="dent-vide">Créez d'abord votre profil pour pouvoir ajouter une photo.</p>
      </div>
    )
  }

  const photo = urlImage(profil.photo)

  const choisir = async (fichier: File | undefined) => {
    setErreur('')
    setSucces('')
    if (!fichier) return
    if (!TYPES_ACCEPTES.includes(fichier.type)) {
      setErreur('Format accepté : JPG, PNG ou WebP.')
      return
    }
    if (fichier.size > TAILLE_MAX_MO * 1024 * 1024) {
      setErreur(`La photo ne doit pas dépasser ${TAILLE_MAX_MO} Mo.`)
      return
    }
    const donnees = new FormData()
    donnees.append('photo', fichier)
    setEnvoi(true)
    try {
      await api.envoyer('/api/dentistes/photo', donnees, 'PUT')
      await onChange()
      setSucces('Photo mise à jour.')
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoi(false)
      if (champ.current) champ.current.value = ''
    }
  }

  const supprimer = async () => {
    if (!window.confirm('Supprimer votre photo ?')) return
    setErreur('')
    setSucces('')
    setEnvoi(true)
    try {
      await api.delete('/api/dentistes/photo')
      await onChange()
      setSucces('Photo supprimée.')
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="dent-carte">
      <h2>Ma photo</h2>

      <div className="pd-photo-ligne">
        {photo ? (
          <img className="pd-photo" src={photo} alt="Ma photo" />
        ) : (
          <span className="pd-photo pd-photo-vide">{profil.nom.charAt(0).toUpperCase()}</span>
        )}
        <div className="pd-photo-actions">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={champ}
            disabled={envoi}
            onChange={(e) => choisir(e.target.files?.[0])}
          />
          {profil.photo && (
            <button className="dent-btn dent-btn-danger" disabled={envoi} onClick={supprimer}>
              Supprimer la photo
            </button>
          )}
          <small>JPG, PNG ou WebP, 5 Mo maximum.</small>
        </div>
      </div>

      {erreur && <p className="dent-erreur">{erreur}</p>}
      {succes && <p className="dent-succes">{succes}</p>}
    </div>
  )
}

/* ---------- Compte (email / mot de passe) ---------- */

function BlocCompte() {
  const { utilisateur, majMail } = useAuth()
  const [actuel, setActuel] = useState('')
  const [nouveauMail, setNouveauMail] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')

    const mail = nouveauMail.trim().toLowerCase()
    if (!mail && !nouveauMdp) {
      setErreur('Renseignez un nouvel email et/ou un nouveau mot de passe.')
      return
    }
    if (mail && !EMAIL_REGEX.test(mail)) {
      setErreur('Adresse email invalide.')
      return
    }
    if (nouveauMdp && nouveauMdp.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (nouveauMdp && nouveauMdp !== confirmation) {
      setErreur('La confirmation ne correspond pas au nouveau mot de passe.')
      return
    }
    if (!actuel) {
      setErreur('Saisissez votre mot de passe actuel pour confirmer.')
      return
    }

    setEnvoi(true)
    try {
      await api.put('/api/dentistes/compte', {
        mot_de_passe_actuel: actuel,
        ...(mail && { nouveau_mail: mail }),
        ...(nouveauMdp && { nouveau_mot_de_passe: nouveauMdp }),
      })
      if (mail) majMail(mail)
      setActuel('')
      setNouveauMail('')
      setNouveauMdp('')
      setConfirmation('')
      setSucces('Compte mis à jour.')
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form className="dent-carte" onSubmit={enregistrer}>
      <h2>Mon compte</h2>
      <p className="pd-mail">Email actuel : <strong>{utilisateur?.mail}</strong></p>

      <Champ id="pc-mail" label="Nouvel email (facultatif)">
        <input id="pc-mail" type="email" value={nouveauMail}
          onChange={(e) => setNouveauMail(e.target.value)} />
      </Champ>
      <Champ id="pc-mdp" label="Nouveau mot de passe (facultatif)">
        <input id="pc-mdp" type="password" autoComplete="new-password" value={nouveauMdp}
          onChange={(e) => setNouveauMdp(e.target.value)} />
      </Champ>
      <Champ id="pc-conf" label="Confirmer le nouveau mot de passe">
        <input id="pc-conf" type="password" autoComplete="new-password" value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)} />
      </Champ>
      <Champ id="pc-actuel" label="Mot de passe actuel (obligatoire)">
        <input id="pc-actuel" type="password" autoComplete="current-password" value={actuel}
          onChange={(e) => setActuel(e.target.value)} />
      </Champ>

      {erreur && <p className="dent-erreur">{erreur}</p>}
      {succes && <p className="dent-succes">{succes}</p>}

      <button className="dent-btn" type="submit" disabled={envoi}>
        {envoi ? 'Enregistrement...' : 'Modifier mon compte'}
      </button>
    </form>
  )
}

/* ---------- Page ---------- */

function ProfilDentsite() {
  const [profil, setProfil] = useState<ProfilDentiste | null>(null)
  const [options, setOptions] = useState<OptionsProfil | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const chargerProfil = async () => {
    try {
      setProfil(await api.get<ProfilDentiste>('/api/dentistes/mon-profil'))
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setProfil(null)
      else throw e
    }
  }

  useEffect(() => {
    Promise.all([
      chargerProfil(),
      api.get<OptionsProfil>('/api/dentistes/options').then(setOptions),
    ])
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  return (
    <section className="dent-page">
      <h1 className="dent-titre">Mon profil</h1>

      {erreur && <p className="dent-erreur">{erreur}</p>}

      {chargement ? (
        <p>Chargement...</p>
      ) : (
        options && (
          <>
            {!profil && (
              <p className="dent-alerte">
                Complétez ce formulaire pour apparaître dans l'annuaire. Les champs marqués d'un * sont obligatoires.
              </p>
            )}
            <FormulaireProfil options={options} profil={profil} onSauve={chargerProfil} />
            <BlocPhoto profil={profil} onChange={chargerProfil} />
            <BlocCompte />
          </>
        )
      )}
    </section>
  )
}

export default ProfilDentsite