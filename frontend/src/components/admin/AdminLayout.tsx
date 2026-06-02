import type { ReactNode } from 'react'
import Footer from '../common/Footer'
import Navbar from '../common/Navbar'
import './admin.css'

interface AdminLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

function AdminLayout({ title, subtitle, actions, children }: AdminLayoutProps) {
  return (
	<>
	  <Navbar />
	  <main className="admin-page">
		<div className="admin-container">
		  <header className="admin-header">
			<div>
			  <div className="admin-pretitle">Admin / Catalog</div>
			  <h1 className="admin-title">{title}</h1>
			  {subtitle ? <div className="admin-subtitle">{subtitle}</div> : null}
			</div>
			{actions ? <div className="admin-actions">{actions}</div> : null}
		  </header>

		  <section className="admin-card">{children}</section>
		</div>
	  </main>
	  <Footer />
	</>
  )
}

export default AdminLayout

