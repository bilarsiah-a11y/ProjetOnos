import AnnuaireListe from '../ComponentCommun/AnnuaireListe'
import '../SectionsVisiteurCss/CommunVisiteur.css'

function AnnuaireVisiteur() {
  return (
    <section className="vis-page">
      <h1 className="vis-titre">Annuaire des dentistes</h1>
      <p className="vis-intro">Trouvez un dentiste à Madagascar, par région et par domaine d'exercice.</p>
      <AnnuaireListe />
    </section>
  )
}

export default AnnuaireVisiteur