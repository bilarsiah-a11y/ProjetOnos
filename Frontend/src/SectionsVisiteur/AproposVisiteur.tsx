import '../SectionsVisiteurCss/CommunVisiteur.css'
import '../SectionsVisiteurCss/AproposVisiteur.css'

function AproposVisiteur() {
  return (
    <section className="vis-page">
      <h1 className="vis-titre">À propos d'Onos</h1>
      <p className="vis-intro">
        Onos est un annuaire en ligne des dentistes de Madagascar. Notre but : faciliter
        l'accès aux soins dentaires en rendant les professionnels faciles à trouver.
      </p>

      <div className="vis-grille">
        <div className="vis-carte">
          <h3>Pour les patients</h3>
          <p>
            La consultation est libre et gratuite. Cherchez un dentiste par région ou par
            domaine d'exercice et retrouvez ses coordonnées.
          </p>
        </div>
        <div className="vis-carte">
          <h3>Pour les dentistes</h3>
          <p>
            Inscrivez-vous avec votre email. Après validation par l'administrateur, complétez
            votre profil : il apparaît alors automatiquement dans l'annuaire.
          </p>
        </div>
        <div className="vis-carte">
          <h3>Des informations fiables</h3>
          <p>
            Chaque inscription est examinée avant d'être acceptée, et chaque dentiste
            gère lui-même les informations de sa fiche.
          </p>
        </div>
      </div>

      <h2 className="vis-sous-titre">Devenir membre</h2>
      <ol className="apropos-etapes">
        <li>Créez votre compte depuis la page « S'inscrire ».</li>
        <li>Attendez la validation de l'administrateur (vous êtes prévenu par email).</li>
        <li>Connectez-vous et remplissez votre profil.</li>
      </ol>
    </section>
  )
}

export default AproposVisiteur