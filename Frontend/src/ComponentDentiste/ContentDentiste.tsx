import './ContentDentiste.css'

function ContentDentiste({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-dentiste">
      {children}
    </div>
  )
}

export default ContentDentiste