import { useState } from "react"
import Table from "../Table.tsx"
import AdminButton from "../../admin/AdminButton.tsx"
import type { UserRecord } from "../../../types/store.ts"
import "./AdminUserTable.css"

interface UserTableProps {
    items: UserRecord[]
    currentUserId?: number | null
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
const DEFAULT_AVATAR = `${apiBaseUrl}/images/other_images/default_avatar.jpg`

interface UserAvatarProps {
    avatarPath: string | null
    name: string
}

function UserAvatar({ avatarPath, name }: UserAvatarProps) {
    const [err, setErr] = useState(false)
    const src = avatarPath && !err ? `${apiBaseUrl}${avatarPath}` : DEFAULT_AVATAR

    return (
        <img
            src={src}
            alt={name}
            className="rf-user-avatar"
            onError={() => setErr(true)}
        />
    )
}

function AdminUserTable({ items, currentUserId, onEdit, onDelete }: UserTableProps) {
    return (
        <Table
            items={items}
            renderItem={(user) => {
                const isCurrentUser = currentUserId != null && user.id === currentUserId
                const fullName = `${user.first_name} ${user.last_name}`

                return (
                    <div className={`rf-user-card${isCurrentUser ? " rf-user-card--current" : ""}`}>
                        <div className="rf-user-header">
                            <UserAvatar avatarPath={user.avatar_path} name={fullName} />

                            <div className="rf-user-heading">
                                <div className="rf-user-name-row">
                                    <div className="rf-user-title">{fullName}</div>
                                    {isCurrentUser && <span className="rf-user-you-badge">You</span>}
                                </div>
                                <span className={`rf-user-role-badge rf-user-role-badge--${user.role?.toLowerCase()}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div className="rf-user-meta-list">
                            <div className="rf-user-meta">
                                <span className="rf-user-meta-label">Email</span>
                                <span className="rf-user-meta-value">{user.email}</span>
                            </div>
                            <div className="rf-user-meta">
                                <span className="rf-user-meta-label">Phone</span>
                                <span className="rf-user-meta-value">{user.phoneNumber || "—"}</span>
                            </div>
                            <div className="rf-user-meta">
                                <span className="rf-user-meta-label">Address</span>
                                <span className="rf-user-meta-value">{user.address || "—"}</span>
                            </div>
                        </div>

                        <div className="rf-user-actions">
                            <AdminButton variant="pill" icon="edit" onClick={() => onEdit(user.id)}>
                                Edit
                            </AdminButton>
                            <AdminButton variant="danger" icon="delete" onClick={() => onDelete(user.id)}>
                                Delete
                            </AdminButton>
                        </div>
                    </div>
                )
            }}
        />
    )
}

export default AdminUserTable