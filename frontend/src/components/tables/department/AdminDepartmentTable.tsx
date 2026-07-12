import Table from "../Table.tsx"
import AdminButton from "../../admin/AdminButton.tsx"
import type { DepartmentRecord } from "../../../types/store.ts"
import "./AdminDepartmentTable.css"

interface AdminDepartmentTableProps {
    items: DepartmentRecord[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

function AdminDepartmentTable({ items, onEdit, onDelete }: AdminDepartmentTableProps) {
    return (
        <Table
            items={items}
            renderItem={(dept) => (
                <div className="rf-dept-card">
                    <div className="rf-dept-title">{dept.name}</div>

                    <div className="rf-dept-sub">
                        Manager: <strong>{dept.manager}</strong> · {dept.categoryCount} categories · {dept.productCount} products
                    </div>

                    <div className="rf-dept-actions">
                        <AdminButton
                            variant="pill"
                            icon="edit"
                            onClick={() => onEdit(dept.id)}
                        >
                            Edit
                        </AdminButton>

                        <AdminButton
                            variant="danger"
                            icon="delete"
                            onClick={() => onDelete(dept.id)}
                        >
                            Delete
                        </AdminButton>
                    </div>
                </div>
            )}
        />
    )
}

export default AdminDepartmentTable