import photoGroupe from '../Public/Sary2.png'
import '../SectionsVisiteurCss/AproposVisiteur.css'

const MISSIONS = [
  "Garantir l'accès à des soins bucco-dentaires de qualité pour la population malgache.",
  "Assurer l'enregistrement des chirurgiens-dentistes et la tenue du tableau national.",
  "Veiller au respect du Code de déontologie et à l'éthique professionnelle.",
  "Accompagner le développement professionnel des membres par la formation continue.",
  "Défendre les intérêts de la profession auprès des autorités nationales et internationales.",
  "Promouvoir la santé publique bucco-dentaire à travers des campagnes et actions de sensibilisation."
]

const HISTOIRE_POINTS = [
  "Officialisation du statut des praticiens dentaires malgaches",
  "Élaboration d'un cadre déontologique strict et respecté",
]

const VALEURS = [
  {
    titre: "Déontologie",
    texte: "Un respect strict des règles professionnelles pour garantir la qualité des soins.",
    icone: "⚖️", // Tu pourras remplacer par de vraies icônes SVG plus tard
    couleur: "bleu"
  },
  {
    titre: "Éthique",
    texte: "Une conduite exemplaire, respectueuse des patients et de la dignité humaine.",
    icone: "🤝",
    couleur: "vert"
  },
  {
    titre: "Santé publique",
    texte: "Une contribution active à l'amélioration de la santé bucco-dentaire au service de tous.",
    icone: "❤️",
    couleur: "violet"
  },
]

function AproposVisiteur() {
  return (
    <div className="apropos-full">
      
      {/* ===== EN-TÊTE ===== */}
      <section className="apropos-hero">
        <div className="apropos-inner apropos-centre">
          <h1 className="apropos-titre">
            À propos de <span className="apropos-couleur">l'ONOS</span>
          </h1>
          <p className="apropos-sous-titre">
            L'Ordre National des Odonto-Stomatologistes de Madagascar (ONOS) est l'organe régulateur 
            de la profession dentaire à Madagascar. En tant qu'institution de référence, il veille à l'organisation, 
            au bon exercice, à la régulation et à la représentation de tous les praticiens du secteur dentaire 
            sur le territoire national.
          </p>
        </div>
      </section>

      {/* ===== NOS MISSIONS ===== */}
      <section className="apropos-section">
        <div className="apropos-inner">
          <h2 className="apropos-titre-section">Nos missions</h2>
          <ul className="apropos-liste-numerotee">
            {MISSIONS.map((mission, index) => (
              <li key={index}>
                <span className="apropos-numero">{String(index + 1).padStart(2, '0')}</span>
                <span className="apropos-texte-item">{mission}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== NOTRE HISTOIRE & PHOTO ===== */}
      <section className="apropos-section">
        <div className="apropos-inner">
          <div className="apropos-grille-2">
            <div className="apropos-texte-bloc">
              <h2 className="apropos-titre-section apropos-texte-gauche">Notre Histoire</h2>
              <p>
                Créé officiellement en 1961, l'ONOS est né de la volonté de structurer la profession 
                dentaire à Madagascar de manière rigoureuse, éthique et unifiée. Depuis sa fondation, 
                notre institution s'est développée pour devenir un pilier essentiel de la santé 
                bucco-dentaire dans le pays.
              </p>
              <ul className="apropos-liste-puces">
                {HISTOIRE_POINTS.map((point, index) => (
                  <li key={index}>
                    <span className="apropos-puce">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="apropos-image-bloc">
              <img 
                src={photoGroupe} 
                alt="Les membres de l'ONOS" 
                className="apropos-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== NOS VALEURS ===== */}
      <section className="apropos-section">
        <div className="apropos-inner">
          <h2 className="apropos-titre-section">Nos Valeurs</h2>
          <p className="apropos-sous-titre-section">
            Les principes qui guident notre action au quotidien
          </p>
          
          <div className="apropos-grille-valeurs">
            {VALEURS.map((valeur, index) => (
              <div key={index} className={`apropos-carte-valeur couleur-${valeur.couleur}`}>
                <div className="apropos-icone-zone">
                  <span className="apropos-icone">{valeur.icone}</span>
                  <h3>{valeur.titre}</h3>
                </div>
                <p>{valeur.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default AproposVisiteur