import './ContentAdmin.css'

function ContentAdmin({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-admin">
      {children}
    </div>
  )
}

export default ContentAdmin