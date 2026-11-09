import { useEffect, useState } from 'react'
import { api, urlImage } from '../services/api'
import type { Dentiste, OptionsProfil } from '../types'
import ReservationRdv from '../SectionsVisiteur/ReservationRdv'
import '../SectionsVisiteurCss/AnnuaireVisisteur.css'

function AnnuaireVisiteur() {
  const [dentistes, setDentistes] = useState<Dentiste[]>([])
  const [options, setOptions] = useState<OptionsProfil | null>(null)
  const [actifs, setActifs] = useState<number[]>([])
  const [choisi, setChoisi] = useState<Dentiste | null>(null)
  const [recherche, setRecherche] = useState('')
  const [region, setRegion] = useState('')
  const [domaine, setDomaine] = useState('')
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Dentiste[]>('/api/dentistes'),
      api.get<OptionsProfil>('/api/dentistes/options'),
      api.get<number[]>('/api/rdv/dentistes-actifs').catch(() => [] as number[]),
    ])
      .then(([liste, opts, ids]) => {
        setDentistes(liste)
        setOptions(opts)
        setActifs(ids)
      })
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const terme = recherche.trim().toLowerCase()
  const filtres = dentistes.filter(
    (d) =>
      (!region || d.region === region) &&
      (!domaine || d.domaine === domaine) &&
      (`${d.prenom} ${d.nom}`.toLowerCase().includes(terme) ||
        `${d.nom} ${d.prenom}`.toLowerCase().includes(terme))
  )

  return (
    <section className="vis-page page-annuaire">
      <div className="annuaire-entete">
        <h1 className="annuaire-titre vis-titre">Annuaire des dentistes</h1>
      </div>

      <div className="liste-conteneur">
        <div className="liste-annuaire">

          {/* Barre de filtres */}
          <div className="liste-filtres">
            <input
              type="search"
              placeholder="🔍 Rechercher un nom..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Toutes les régions</option>
              {options?.regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select value={domaine} onChange={(e) => setDomaine(e.target.value)}>
              <option value="">Tous les domaines</option>
              {options?.domaines.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {erreur && <p className="liste-erreur">{erreur}</p>}

          {chargement ? (
            <p className="liste-vide">Chargement...</p>
          ) : filtres.length === 0 ? (
            <p className="liste-vide">Aucun dentiste trouvé pour votre recherche.</p>
          ) : (
            <>
              <p className="liste-compte">
                {filtres.length} dentiste{filtres.length > 1 ? 's' : ''} trouvé{filtres.length > 1 ? 's' : ''}
              </p>

              {/* Grille de cartes */}
              <ul className="liste-grille">
                {filtres.map((d) => {
                  const photo = urlImage(d.photo)
                  return (
                    <li key={d.id} className="liste-carte">

                      {/* Photo à gauche */}
                      <div className="liste-carte-photo-zone">
                        {photo ? (
                          <img className="liste-photo" src={photo} alt={`${d.prenom} ${d.nom}`} />
                        ) : (
                          <span className="liste-photo liste-photo-vide">
                            {d.nom.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Contenu à droite */}
                      <div className="liste-infos">
                        <h3 className="liste-nom">{d.titre} {d.nom} {d.prenom}</h3>
                        <span className="liste-badge">{d.domaine} · {d.region}</span>

                        {d.adresse && <span className="liste-adresse">{d.adresse}</span>}

                        <span className="liste-contact">
                          <a href={`tel:${d.contact.replace(/\s/g, '')}`}>{d.contact}</a>
                          {d.autre_contact && (
                            <> / <a href={`tel:${d.autre_contact.replace(/\s/g, '')}`}>{d.autre_contact}</a></>
                          )}
                        </span>

                        {actifs.includes(d.id) && (
                          <button className="liste-rdv-btn" onClick={() => setChoisi(d)}>
                            Prendre rendez-vous
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {choisi && <ReservationRdv dentiste={choisi} onFermer={() => setChoisi(null)} />}
        </div>
      </div>
    </section>
  )
}

export default AnnuaireVisiteur

// import { useEffect, useState } from 'react'
// import { api, urlImage } from '../services/api'
// import type { Dentiste, OptionsProfil } from '../types'
// import ReservationRdv from '../SectionsVisiteur/ReservationRdv'
// import '../SectionsVisiteurCss/AnnuaireVisisteur.css'

// function AnnuaireVisiteur() {
//   const [dentistes, setDentistes] = useState<Dentiste[]>([])
//   const [options, setOptions] = useState<OptionsProfil | null>(null)
//   const [actifs, setActifs] = useState<number[]>([])
//   const [choisi, setChoisi] = useState<Dentiste | null>(null)
//   const [recherche, setRecherche] = useState('')
//   const [region, setRegion] = useState('')
//   const [domaine, setDomaine] = useState('')
//   const [chargement, setChargement] = useState(true)
//   const [erreur, setErreur] = useState('')

//   // --- GESTION DE LA GÉOLOCALISATION ---
//   const [demanderLoc, setDemanderLoc] = useState(true) // Popup à l'ouverture
//   const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
//   const [locEnCours, setLocEnCours] = useState(false)

//   useEffect(() => {
//     Promise.all([
//       api.get<Dentiste[]>('/api/dentistes'),
//       api.get<OptionsProfil>('/api/dentistes/options'),
//       api.get<number[]>('/api/rdv/dentistes-actifs').catch(() => [] as number[]),
//     ])
//       .then(([liste, opts, ids]) => {
//         setDentistes(liste)
//         setOptions(opts)
//         setActifs(ids)
//       })
//       .catch((e: Error) => setErreur(e.message))
//       .finally(() => setChargement(false))
//   }, [])

//   // Fonction pour activer la localisation
//   const activerLocalisation = () => {
//     if (!navigator.geolocation) {
//       alert("La géolocalisation n'est pas supportée par votre navigateur.")
//       setDemanderLoc(false)
//       return
//     }

//     setLocEnCours(true)
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
//         setLocEnCours(false)
//         setDemanderLoc(false)
//       },
//       (err) => {
//         console.error(err)
//         alert("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres.")
//         setLocEnCours(false)
//         setDemanderLoc(false)
//       },
//       { timeout: 10000 }
//     )
//   }

//   // Calcul de la distance (Formule de Haversine en km)
//   const calculerDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//     const R = 6371 // Rayon de la Terre en km
//     const dLat = (lat2 - lat1) * (Math.PI / 180)
//     const dLon = (lon2 - lon1) * (Math.PI / 180)
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2)
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//     return R * c
//   }

//   const terme = recherche.trim().toLowerCase()
  
//   // Filtrage des dentistes
//   const filtres = dentistes.filter((d: any) => {
//     // 1. Filtres de base (région, domaine, texte)
//     const matchBase =
//       (!region || d.region === region) &&
//       (!domaine || d.domaine === domaine) &&
//       (`${d.prenom} ${d.nom}`.toLowerCase().includes(terme) ||
//         `${d.nom} ${d.prenom}`.toLowerCase().includes(terme))

//     if (!matchBase) return false

//     // 2. Filtre par distance si la position est activée
//     if (position) {
//       // ⚠️ On suppose que ton objet "Dentiste" a des champs latitude et longitude
//       if (d.latitude && d.longitude) {
//         const distance = calculerDistance(position.lat, position.lng, d.latitude, d.longitude)
//         // On garde les dentistes dans un rayon de 50 km
//         return distance <= 50
//       }
//       // Si le dentiste n'a pas de coordonnées, on l'affiche quand même (ou on le cache selon ton choix)
//       return true 
//     }

//     return true
//   })

//   return (
//     <section className="vis-page page-annuaire">
      
//       {/* --- POPUP DE DEMANDE DE LOCALISATION --- */}
//       {demanderLoc && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <div className="modal-icon">📍</div>
//             <h2>Localisation</h2>
//             <p>Souhaitez-vous voir les dentistes proches de vous ?</p>
//             <div className="modal-actions">
//               <button className="modal-btn-annuler" onClick={() => setDemanderLoc(false)}>
//                 Non, plus tard
//               </button>
//               <button className="modal-btn-confirmer" onClick={activerLocalisation} disabled={locEnCours}>
//                 {locEnCours ? 'Recherche...' : 'Oui, activer'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="annuaire-entete">
//         <h1 className="annuaire-titre vis-titre">Annuaire des dentistes</h1>
//       </div>

//       <div className="liste-conteneur">
//         <div className="liste-annuaire">

//           {/* Barre de filtres */}
//           <div className="liste-filtres">
//             <input
//               type="search"
//               placeholder="🔍 Rechercher un nom..."
//               value={recherche}
//               onChange={(e) => setRecherche(e.target.value)}
//             />
//             <select value={region} onChange={(e) => setRegion(e.target.value)}>
//               <option value="">Toutes les régions</option>
//               {options?.regions.map((r) => (
//                 <option key={r} value={r}>{r}</option>
//               ))}
//             </select>
//             <select value={domaine} onChange={(e) => setDomaine(e.target.value)}>
//               <option value="">Tous les domaines</option>
//               {options?.domaines.map((d) => (
//                 <option key={d} value={d}>{d}</option>
//               ))}
//             </select>
            
//             {/* Bouton pour relancer la géolocalisation */}
//             <button 
//               className={`liste-geo-btn ${position ? 'actif' : ''}`}
//               onClick={activerLocalisation}
//             >
//               📍 {position ? 'Autour de moi' : 'Me localiser'}
//             </button>
//           </div>

//           {position && (
//             <p className="liste-geo-info">
//               ✅ Affichage des dentistes dans un rayon de 50 km.
//             </p>
//           )}

//           {erreur && <p className="liste-erreur">{erreur}</p>}

//           {chargement ? (
//             <p className="liste-vide">Chargement...</p>
//           ) : filtres.length === 0 ? (
//             <p className="liste-vide">Aucun dentiste trouvé pour votre recherche.</p>
//           ) : (
//             <>
//               <p className="liste-compte">
//                 {filtres.length} dentiste{filtres.length > 1 ? 's' : ''} trouvé{filtres.length > 1 ? 's' : ''}
//               </p>

//               {/* Grille de cartes */}
//               <ul className="liste-grille">
//                 {filtres.map((d) => {
//                   const photo = urlImage(d.photo)
//                   return (
//                     <li key={d.id} className="liste-carte">

//                       <div className="liste-carte-photo-zone">
//                         {photo ? (
//                           <img className="liste-photo" src={photo} alt={`${d.prenom} ${d.nom}`} />
//                         ) : (
//                           <span className="liste-photo liste-photo-vide">
//                             {d.nom.charAt(0).toUpperCase()}
//                           </span>
//                         )}
//                       </div>

//                       <div className="liste-infos">
//                         <h3 className="liste-nom">{d.titre} {d.nom} {d.prenom}</h3>
//                         <span className="liste-badge">{d.domaine} · {d.region}</span>

//                         {d.adresse && <span className="liste-adresse">{d.adresse}</span>}

//                         <span className="liste-contact">
//                           <a href={`tel:${d.contact.replace(/\s/g, '')}`}>{d.contact}</a>
//                           {d.autre_contact && (
//                             <> / <a href={`tel:${d.autre_contact.replace(/\s/g, '')}`}>{d.autre_contact}</a></>
//                           )}
//                         </span>

//                         {actifs.includes(d.id) && (
//                           <button className="liste-rdv-btn" onClick={() => setChoisi(d)}>
//                             Prendre rendez-vous
//                           </button>
//                         )}
//                       </div>
//                     </li>
//                   )
//                 })}
//               </ul>
//             </>
//           )}

//           {choisi && <ReservationRdv dentiste={choisi} onFermer={() => setChoisi(null)} />}
//         </div>
//       </div>
//     </section>
//   )
// }

// export default AnnuaireVisiteur