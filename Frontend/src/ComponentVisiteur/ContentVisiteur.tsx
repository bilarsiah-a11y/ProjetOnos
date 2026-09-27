import './ContentVisiteur.css'

function ContentVisiteur({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-visiteur">
      {children}
    </div>
  )
}

export default ContentVisiteur