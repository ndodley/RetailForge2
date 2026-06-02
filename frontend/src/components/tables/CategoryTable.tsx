interface CategoryRecord {
  id: number
  name: string
  description: string
  departmentId: number | null
  departmentName: string | null
}

interface CategoryTableProps {
  categories: CategoryRecord[]
  onEdit: (categoryId: number) => void
  onDelete: (categoryId: number) => void
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="department-table__empty">
        <h3>No categories found</h3>
        <p>Try a different search term or create a new category from the editor tab.</p>
      </div>
    )
  }

  return (
    <div className="admin-grid">
      {categories.map((category) => (
        <article key={category.id} className="admin-grid-card category-grid-card">
          <div className="admin-grid-title">{category.name}</div>
          <div className="admin-grid-meta">Department: {category.departmentName ?? 'Unassigned'}</div>
          <div className="admin-grid-meta">{category.description || 'No description'}</div>
          <div className="admin-grid-actions admin-row-actions">
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => onEdit(category.id)}>
              <span className="admin-action-icon" aria-hidden="true">
                ✎
              </span>
              Edit
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--sm admin-btn--danger"
              onClick={() => onDelete(category.id)}
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

export default CategoryTable

