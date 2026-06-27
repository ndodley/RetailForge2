import Table from "../tables/Table"
import AdminButton from "../admin/AdminButton"
import type { DepartmentRecord } from "../../types/store"
import "./DepartmentTable.css"

interface DepartmentTableProps {
    items: DepartmentRecord[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

function DepartmentTable({ items, onEdit, onDelete }: DepartmentTableProps) {
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

export default DepartmentTable