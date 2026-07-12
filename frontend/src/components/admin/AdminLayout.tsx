import Layout from "../common/Layout"
import "./AdminLayout.css"

import type { AdminTab } from "../../types/AdminTab"

interface AdminLayoutProps {
	title: string
	tabs: { label: string; key: AdminTab }[]
	activeTab: AdminTab
	onTabChange: (key: AdminTab) => void
	children: React.ReactNode
}

function AdminLayout({ title, tabs = [], activeTab, onTabChange, children }: AdminLayoutProps) {
	return (
		<Layout isAdmin={true}>
			<div className="rf-admin-page">
				<header className="rf-admin-header">
					<h1 className="rf-admin-title">{title}</h1>
				</header>

				{tabs.length > 0 && (
					<nav className="rf-admin-tabs">
						{tabs.map((tab) => (
							<button
								key={tab.key}
								className={
									"rf-admin-tab" +
									(activeTab === tab.key ? " rf-admin-tab--active" : "")
								}
								onClick={() => onTabChange(tab.key)}
							>
								{tab.label}
							</button>
						))}
					</nav>
				)}

				<main className="rf-admin-content">{children}</main>
			</div>
		</Layout>
	)
}

export default AdminLayout