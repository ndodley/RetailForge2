import type { DepartmentRecord } from '../../types/store'

interface DepartmentTableProps {
  departments: DepartmentRecord[]
  onEdit: (departmentId: number) => void
  onDelete: (departmentId: number) => void
}

function DepartmentTable({
  departments,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  if (departments.length === 0) {
	return (
	  <div className="department-table__empty">
		<h3>No departments found</h3>
		<p>Try a different search term or create a new department from the editor tab.</p>
	  </div>
	)
  }

  return (
	<div className="admin-grid">
	  {departments.map((department) => (
		<article key={department.id} className="admin-grid-card department-grid-card">
		  <div className="admin-grid-title">{department.name}</div>
		  <div className="admin-grid-meta">
			<div>{department.description}</div>
			<div>
			  Manager: {department.manager} · {department.categoryCount} categories · {department.productCount} products
			</div>
		  </div>
		  <div className="admin-grid-actions admin-row-actions">
			<button type="button" className="admin-btn admin-btn--sm" onClick={() => onEdit(department.id)}>
			  <span className="admin-action-icon" aria-hidden="true">
				✎
			  </span>
			  Edit
			</button>
			<button
			  type="button"
			  className="admin-btn admin-btn--sm admin-btn--danger"
			  onClick={() => onDelete(department.id)}
			>
			  <span className="admin-action-icon" aria-hidden="true">
				✕
			  </span>
			  Delete
			</button>
		  </div>
		</article>
	  ))}
	</div>
  )
}

export default DepartmentTable

