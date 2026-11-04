import AnnuaireListe from '../ComponentCommun/AnnuaireListe'
import '../SectionsVisiteurCss/AnnuaireVisisteur.css'

function AnnuaireVisiteur() {
  return (
    <section className="vis-page">
      <h1 className="vis-titre">Annuaire des dentistes</h1>
            <AnnuaireListe reservation />
    </section>
  )
}

export default AnnuaireVisiteur