import AnnuaireListe from '../ComponentCommun/AnnuaireListe'
import '../SectionsDentisteCss/CommunDentiste.css'

function AnnuaireDentiste() {
  return (
    <section className="dent-page">
      <h1 className="dent-titre">Annuaire des dentistes</h1>
      <p className="dent-intro">Consultez les confrères inscrits sur Onos.</p>
      <AnnuaireListe />
    </section>
  )
}

export default AnnuaireDentiste