import Layout from "../common/Layout"
import "./AdminLayout.css"

import type { AdminTab } from "../../types/AdminTab"

interface AdminLayoutProps {
	title: string
	subtitle?: string
	tabs: { label: string; key: AdminTab }[]
	activeTab: AdminTab
	onTabChange: (key: AdminTab) => void
	headerActions?: React.ReactNode
	children: React.ReactNode
}

function AdminLayout({ title, subtitle, tabs = [], activeTab, onTabChange, headerActions, children }: AdminLayoutProps) {
	return (
		<Layout isAdmin={true}>
			<div className="rf-admin-page">
				<header className="rf-admin-header">
					<h1 className="rf-admin-title">{title}</h1>
					{subtitle && <p className="rf-admin-subtitle">{subtitle}</p>}
				</header>

				{(tabs.length > 0 || headerActions) && (
					<div className="rf-admin-tabsRow">
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
						{headerActions && (
							<div className="rf-admin-tabsActions">{headerActions}</div>
						)}
					</div>
				)}

				<main className="rf-admin-content">{children}</main>
			</div>
		</Layout>
	)
}

export default AdminLayout