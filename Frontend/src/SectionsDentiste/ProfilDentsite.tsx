import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode, KeyboardEvent, ChangeEvent, ClipboardEvent } from 'react'
import { api, ApiError, urlImage } from '../services/api'
import { useAuth } from '../AuthContext'
import type { OptionsProfil, ProfilDentiste } from '../types'
import '../SectionsDentisteCss/ProfilDentsite.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TYPES_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp']
const TAILLE_MAX_MO = 5
const OTP_LENGTH = 6

const message = (err: unknown) =>
  err instanceof Error ? err.message : 'Une erreur est survenue'

const nettoyerOtp = (valeur: string) =>
  valeur.toUpperCase().replace(/[^A-Z0-9]/g, '')

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

const formaterDate = (isoDate: string) => {
  if (!isoDate) return 'Non renseignée'
  const [annee, mois, jour] = isoDate.split('-')
  if (!annee || !mois || !jour) return isoDate
  return `${jour}/${mois}/${annee}`
}

function BlocProfilPro({
  options, profil, onSauve,
}: {
  options: OptionsProfil
  profil: ProfilDentiste | null
  onSauve: () => Promise<void>
}) {
  const [modeEdition, setModeEdition] = useState(!profil)
  const [f, setF] = useState<FormProfil>(profil ? depuisProfil(profil) : VIDE)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const champPhoto = useRef<HTMLInputElement>(null)
  const [envoiPhoto, setEnvoiPhoto] = useState(false)
  const [modalePhoto, setModalePhoto] = useState(false)
  const photo = profil ? urlImage(profil.photo) : null

  useEffect(() => {
    if (profil) {
      setF(depuisProfil(profil))
      setModeEdition(false)
    }
  }, [profil])

  const maj = (champ: keyof FormProfil, valeur: string) =>
    setF((x) => ({ ...x, [champ]: valeur }))

  const annuler = () => {
    if (profil) setF(depuisProfil(profil))
    setModeEdition(false)
    setErreur('')
    setSucces('')
  }

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
      setModeEdition(false)
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoi(false)
    }
  }

  const choisirPhoto = async (fichier: File | undefined) => {
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
    setEnvoiPhoto(true)
    try {
      await api.envoyer('/api/dentistes/photo', donnees, 'PUT')
      await onSauve()
      setSucces('Photo mise à jour.')
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoiPhoto(false)
      if (champPhoto.current) champPhoto.current.value = ''
    }
  }

  const supprimerPhoto = async () => {
    setModalePhoto(false)
    setErreur('')
    setEnvoiPhoto(true)
    try {
      await api.delete('/api/dentistes/photo')
      await onSauve()
      setSucces('Photo supprimée.')
    } catch (err) {
      setErreur(message(err))
    } finally {
      setEnvoiPhoto(false)
    }
  }

  return (
    <>
      <div className="dent-carte">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '12px' }}>
          <h2 style={{ margin: 0, border: 'none', padding: 0 }}>Profil Professionnel</h2>
          {!modeEdition && (
            <button className="dent-btn" style={{ padding: '8px 16px', fontSize: '0.85rem', margin: 0 }} onClick={() => setModeEdition(true)}>
              Modifier mes informations
            </button>
          )}
        </div>

        {erreur && <p className="dent-erreur">{erreur}</p>}
        {succes && <p className="dent-succes">{succes}</p>}

        {/* BLOC PHOTO */}
        <div className="pd-photo-ligne" style={{ marginBottom: '30px' }}>
          <div style={{ position: 'relative' }}>
            {photo ? (
              <img className="pd-photo" src={photo} alt="Ma photo" />
            ) : (
              <span className="pd-photo pd-photo-vide">{f.nom.charAt(0).toUpperCase() || '?'}</span>
            )}
            
            {modeEdition && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={champPhoto}
                  disabled={envoiPhoto}
                  onChange={(e) => choisirPhoto(e.target.files?.[0])}
                  id="upload-photo"
                  style={{ display: 'none' }}
                />
                <label htmlFor="upload-photo" className="dent-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', margin: 0 }}>
                  {envoiPhoto ? '...' : photo ? 'Changer' : 'Ajouter'}
                </label>
                {photo && (
                  <button className="dent-btn dent-btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem', margin: 0 }} type="button" onClick={() => setModalePhoto(true)}>
                    Suppr.
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pd-photo-actions">
            <p className="pd-photo-texte" style={{ fontSize: '0.9rem' }}>
              {f.prenom} {f.nom} <br/>
              <span style={{ color: '#7c3aed', fontWeight: 600 }}>{f.titre} - {f.domaine}</span>
            </p>
          </div>
        </div>

        {/* BLOC INFOS / FORMULAIRE */}
        {!modeEdition ? (
          <div className="dent-grille" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <div className="dent-champ"><label>Nom complet</label><p style={{margin:0, fontWeight:500}}>{f.prenom} {f.nom}</p></div>
            <div className="dent-champ"><label>Genre</label><p style={{margin:0, fontWeight:500}}>{f.genre}</p></div>
            <div className="dent-champ"><label>Date de naissance</label><p style={{margin:0, fontWeight:500}}>{formaterDate(f.date_naissance)}</p></div>
            <div className="dent-champ"><label>Lieu de naissance</label><p style={{margin:0, fontWeight:500}}>{f.lieu_naissance || 'Non renseigné'}</p></div>
            <div className="dent-champ"><label>Adresse du cabinet</label><p style={{margin:0, fontWeight:500}}>{f.adresse || 'Non renseignée'}</p></div>
            <div className="dent-champ"><label>Région</label><p style={{margin:0, fontWeight:500}}>{f.region}</p></div>
            <div className="dent-champ"><label>Contact</label><p style={{margin:0, fontWeight:500}}>{f.contact}</p></div>
            <div className="dent-champ"><label>Autre contact</label><p style={{margin:0, fontWeight:500}}>{f.autre_contact || 'Non renseigné'}</p></div>
          </div>
        ) : (
          <form onSubmit={enregistrer}>
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
                <input id="pf-date" type="date" value={f.date_naissance} onChange={(e) => maj('date_naissance', e.target.value)} />
              </Champ>
              <Champ id="pf-lieu" label="Lieu de naissance">
                <input id="pf-lieu" value={f.lieu_naissance} onChange={(e) => maj('lieu_naissance', e.target.value)} />
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
                <input id="pf-contact" type="tel" value={f.contact} onChange={(e) => maj('contact', e.target.value)} />
              </Champ>
              <Champ id="pf-autre" label="Autre contact">
                <input id="pf-autre" type="tel" value={f.autre_contact} onChange={(e) => maj('autre_contact', e.target.value)} />
              </Champ>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="dent-btn" type="submit" disabled={envoi}>
                {envoi ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              {profil && (
                <button className="dent-btn pd-btn-annuler" type="button" onClick={annuler}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* MODALE SUPPRESSION PHOTO */}
      {modalePhoto && (
        <div className="pd-modale-fond" onClick={() => setModalePhoto(false)}>
          <div className="pd-modale-boite" onClick={(e) => e.stopPropagation()}>
            <h3>Supprimer la photo ?</h3>
            <p>L'initiale de votre nom sera affichée à la place.</p>
            <div className="pd-modale-actions">
              <button className="dent-btn pd-btn-annuler" onClick={() => setModalePhoto(false)}>Annuler</button>
              <button className="dent-btn dent-btn-danger" onClick={supprimerPhoto}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------- Paramètres de connexion (Sécurisé avec OTP) ---------- */

type EtapeCompte = 'affichage' | 'otp' | 'modification'

function BlocCompte() {
  const { utilisateur, majMail } = useAuth()
  const [etape, setEtape] = useState<EtapeCompte>('affichage')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  // Gestion de l'OTP (6 cases)
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [actuel, setActuel] = useState('')
  const [nouveauMail, setNouveauMail] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmation, setConfirmation] = useState('')

  // Focus automatique sur la 1ère case quand on arrive à l'étape OTP
  useEffect(() => {
    if (etape === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    }
  }, [etape])

  const demanderOtp = async () => {
    setErreur(''); setSucces(''); setChargement(true)
    try {
      await api.post('/api/dentistes/compte/otp', { mail: utilisateur?.mail })
      setSucces(`Un code de sécurité a été envoyé à ${utilisateur?.mail}`)
      setOtp(Array(OTP_LENGTH).fill('')) // Réinitialise les cases
      setEtape('otp')
    } catch (err) {
      setErreur(message(err))
    } finally {
      setChargement(false)
    }
  }

  // --- LOGIQUE DES 6 CASES OTP ---
  const handleOtpChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const caracteres = nettoyerOtp(e.target.value)
    const newOtp = [...otp]

    if (caracteres === '') {
      newOtp[index] = ''
      setOtp(newOtp)
      return
    }

    newOtp[index] = caracteres.slice(-1)
    setOtp(newOtp)

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      e.preventDefault()
      const newOtp = [...otp]
      newOtp[index - 1] = ''
      setOtp(newOtp)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const caracteres = nettoyerOtp(e.clipboardData.getData('text')).slice(0, OTP_LENGTH)
    if (!caracteres) return

    const newOtp = Array(OTP_LENGTH).fill('')
    caracteres.split('').forEach((c, i) => {
      newOtp[i] = c
    })
    setOtp(newOtp)

    const prochain = Math.min(caracteres.length, OTP_LENGTH - 1)
    inputRefs.current[prochain]?.focus()
  }
  // -------------------------------

  const verifierOtp = async (e: FormEvent) => {
    e.preventDefault()
    setErreur(''); setSucces('')
    
    const codeComplet = otp.join('')
    if (codeComplet.length !== OTP_LENGTH) {
      setErreur('Veuillez saisir les 6 caractères du code.'); return
    }
    
    setChargement(true)
    try {
      await api.post('/api/dentistes/compte/verifier-otp', { otp: codeComplet })
      setSucces('Code validé. Vous pouvez modifier vos identifiants.')
      setEtape('modification')
    } catch (err) {
      setErreur(message(err))
    } finally {
      setChargement(false)
    }
  }

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault()
    setErreur(''); setSucces('')
    const mail = nouveauMail.trim().toLowerCase()

    if (!mail && !nouveauMdp) { setErreur('Renseignez un nouvel email et/ou un mot de passe.'); return }
    if (mail && !EMAIL_REGEX.test(mail)) { setErreur('Adresse email invalide.'); return }
    if (nouveauMdp && nouveauMdp.length < 8) { setErreur('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (nouveauMdp && nouveauMdp !== confirmation) { setErreur('La confirmation ne correspond pas.'); return }
    if (!actuel) { setErreur('Saisissez votre mot de passe actuel.'); return }

    setChargement(true)
    try {
      await api.put('/api/dentistes/compte', {
        mot_de_passe_actuel: actuel,
        ...(mail && { nouveau_mail: mail }),
        ...(nouveauMdp && { nouveau_mot_de_passe: nouveauMdp }),
      })
      if (mail) majMail(mail)
      setSucces('Compte mis à jour avec succès.')
      setEtape('affichage')
      setActuel(''); setNouveauMail(''); setNouveauMdp(''); setConfirmation(''); setOtp(Array(OTP_LENGTH).fill(''))
    } catch (err) {
      setErreur(message(err))
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="dent-carte">
      <h2>Paramètres de connexion</h2>
      {erreur && <p className="dent-erreur">{erreur}</p>}
      {succes && <p className="dent-succes">{succes}</p>}

      {etape === 'affichage' && (
        <>
          <p className="pd-mail">Email actuel : <strong>{utilisateur?.mail}</strong></p>
          <button className="dent-btn" style={{ marginTop: '10px' }} onClick={demanderOtp} disabled={chargement}>
            {chargement ? 'Envoi du code...' : 'Modifier mes identifiants'}
          </button>
        </>
      )}

      {etape === 'otp' && (
        <form onSubmit={verifierOtp}>
          <p className="pd-photo-texte" style={{ marginBottom: '16px' }}>
            Saisissez le code à 6 caractères envoyé à <strong>{utilisateur?.mail}</strong>.
          </p>
          <div className="dent-champ" style={{ marginBottom: '20px' }}>
            <div className="otp-container">
              {otp.map((caractere, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  value={caractere}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  onChange={(e) => handleOtpChange(index, e)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  onFocus={(e) => e.target.select()}
                  className="otp-input"
                  aria-label={`Caractère ${index + 1} du code`}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button className="dent-btn" type="submit" disabled={chargement}>
              {chargement ? 'Vérification...' : 'Valider le code'}
            </button>
            <button className="dent-btn pd-btn-annuler" type="button" onClick={() => setEtape('affichage')}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {etape === 'modification' && (
        <form onSubmit={enregistrer}>
          <Champ id="pc-mail" label="Nouvel email (facultatif)">
            <input id="pc-mail" type="email" value={nouveauMail} onChange={(e) => setNouveauMail(e.target.value)} />
          </Champ>
          <Champ id="pc-mdp" label="Nouveau mot de passe (facultatif)">
            <input id="pc-mdp" type="password" autoComplete="new-password" value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)} />
          </Champ>
          <Champ id="pc-conf" label="Confirmer le nouveau mot de passe">
            <input id="pc-conf" type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
          </Champ>
          <Champ id="pc-actuel" label="Mot de passe actuel (obligatoire pour valider)">
            <input id="pc-actuel" type="password" autoComplete="current-password" value={actuel} onChange={(e) => setActuel(e.target.value)} />
          </Champ>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button className="dent-btn" type="submit" disabled={chargement}>
              {chargement ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            <button className="dent-btn pd-btn-annuler" type="button" onClick={() => setEtape('affichage')}>
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/* ---------- Page Principale ---------- */

function ProfilDentsite() {
  const [profil, setProfil] = useState<ProfilDentiste | null>(null)
  const [options, setOptions] = useState<OptionsProfil | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [ongletActif, setOngletActif] = useState<'pro' | 'compte'>('pro')

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
      <h1 className="dent-titre">Mon Espace</h1>

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

            <div className="pd-onglets">
              <button 
                className={`pd-onglet ${ongletActif === 'pro' ? 'actif' : ''}`}
                onClick={() => setOngletActif('pro')}
              >
                Profil Professionnel
              </button>
              <button 
                className={`pd-onglet ${ongletActif === 'compte' ? 'actif' : ''}`}
                onClick={() => setOngletActif('compte')}
              >
                Mon Compte
              </button>
            </div>

            {ongletActif === 'pro' && (
              <div className="pd-contenu-onglet">
                <BlocProfilPro options={options} profil={profil} onSauve={chargerProfil} />
              </div>
            )}

            {ongletActif === 'compte' && (
              <div className="pd-contenu-onglet">
                <BlocCompte />
              </div>
            )}
          </>
        )
      )}
    </section>
  )
}

export default ProfilDentsite