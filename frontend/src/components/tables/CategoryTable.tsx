import Table from "../tables/Table"
import AdminButton from "../admin/AdminButton"
import type { CategoryRecord } from "../../types/store"
import "./CategoryTable.css"

interface CategoryTableProps {
    items: CategoryRecord[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

function CategoryTable({ items, onEdit, onDelete }: CategoryTableProps) {
    return (
        <Table
            items={items}
            renderItem={(cat) => (
                <div className="rf-cat-card">
                    <div className="rf-cat-title">{cat.name}</div>

                    <div className="rf-cat-sub">
                        Department: <strong>{cat.departmentName ?? "Unassigned"}</strong>
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

export default CategoryTable