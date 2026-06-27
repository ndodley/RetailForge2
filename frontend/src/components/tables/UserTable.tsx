import Table from "../tables/Table"
import AdminButton from "../admin/AdminButton"
import type { UserRecord } from "../../types/store"
import "./UserTable.css"

interface UserTableProps {
    items: UserRecord[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

function UserTable({ items, onEdit, onDelete }: UserTableProps) {
    return (
        <Table
            items={items}
            renderItem={(user) => (
                <div className="rf-user-card">
                    <div className="rf-user-header">
                        <div className="rf-user-icon">👤</div>
                        <div className="rf-user-title">
                            {user.first_name} {user.last_name}
                        </div>
                    </div>

                    <div className="rf-user-meta">
                        Email: <strong>{user.email}</strong>
                    </div>
                    <div className="rf-user-meta">
                        Role: <strong>{user.role}</strong>
                    </div>
                    <div className="rf-user-meta">
                        Phone: <strong>{user.phoneNumber || "—"}</strong>
                    </div>
                    <div className="rf-user-meta">
                        Address: <strong>{user.address || "—"}</strong>
                    </div>

                    <div className="rf-user-actions">
                        <AdminButton
                            variant="pill"
                            icon="edit"
                            onClick={() => onEdit(user.id)}
                        >
                            Edit
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            icon="delete"
                            onClick={() => onDelete(user.id)}
                        >
                            Delete
                        </AdminButton>
                    </div>
                </div>
            )}
        />
    )
}

export default UserTable