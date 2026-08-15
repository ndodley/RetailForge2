import Table from "../Table.tsx"
import AdminButton from "../../admin/AdminButton.tsx"
import type { CategoryRecord } from "../../../types/store.ts"
import "./AdminCategoryTable.css"

interface AdminCategoryTableProps {
    items: CategoryRecord[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

function AdminCategoryTable({ items, onEdit, onDelete }: AdminCategoryTableProps) {
    return (
        <Table
            items={items}
            renderItem={(cat) => (
                <div className="rf-cat-card">
                    <div className="rf-cat-title">{cat.name}</div>

                    <div className="rf-cat-stats">
                        <span className="rf-cat-badge">{cat.departmentName ?? "Unassigned"}</span>
                        <span className="rf-cat-stat">
                            <strong>{cat.productCount}</strong> {cat.productCount === 1 ? "product" : "products"}
                        </span>
                    </div>

                    <div className="rf-cat-actions">
                        <AdminButton
                            variant="pill"
                            icon="edit"
                            onClick={() => onEdit(cat.id)}
                        >
                            Edit
                        </AdminButton>

                        <AdminButton
                            variant="danger"
                            icon="delete"
                            onClick={() => onDelete(cat.id)}
                        >
                            Delete
                        </AdminButton>
                    </div>
                </div>
            )}
        />
    )
}

export default AdminCategoryTable