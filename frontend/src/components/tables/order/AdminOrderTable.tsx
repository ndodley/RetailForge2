import { useState } from "react"
import Table from "../Table.tsx"
import type { OrderRecord } from "../../../types/store.ts"
import { buildAvatarUrl } from "../../../api/users.ts"
import "./AdminOrderTable.css"

interface OrderUser {
    id: number
    avatar_path: string | null
    role: string
}

interface OrderTableProps {
    items: OrderRecord[]
    users: OrderUser[]
    currentUserId?: number | null   // NEW
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

interface UserAvatarProps {
    avatarPath: string | null | undefined
    name: string
}

function UserAvatar({ avatarPath, name }: UserAvatarProps) {
    const [err, setErr] = useState(false)
    const src = buildAvatarUrl(err ? null : avatarPath)

    return (
        <img
            src={src}
            alt={name}
            className="rf-order-user-avatar"
            onError={() => setErr(true)}
        />
    )
}

function AdminOrderTable({ items, users, currentUserId, onEdit, onDelete }: OrderTableProps) {
    return (
        <Table
            items={items}
            onItemClick={(order) => onEdit(order.id)}
            renderItem={(order) => {
                const orderUser = users.find((u) => u.id === order.userId)
                const isCurrentUser = currentUserId != null && order.userId === currentUserId   // NEW

                return (
                    <div
                        className={`rf-order-card-content${isCurrentUser ? " rf-order-card-content--current" : ""}`}
                    >
                        <div className="rf-order-header">
                            <div className="rf-order-header-main">
                                <div className="rf-order-title">Order #{order.id}</div>
                                <div className="rf-order-status-badge" data-status={order.status}>
                                    {order.status}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="rf-order-delete-btn"
                                aria-label={`Delete order #${order.id}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(order.id)
                                }}
                            >
                                🗑️
                            </button>
                        </div>

                        <div className="rf-order-user-row">
                            <UserAvatar avatarPath={orderUser?.avatar_path} name={order.userEmail} />
                            <div className="rf-order-user-info">
                                <span className="rf-order-user-email">{order.userEmail}</span>
                                <div className="rf-order-badge-row">
                                    {orderUser?.role && (
                                        <span
                                            className={`rf-order-role-badge rf-order-role-badge--${orderUser.role.toLowerCase()}`}
                                        >
                                            {orderUser.role}
                                        </span>
                                    )}
                                    {isCurrentUser && <span className="rf-order-you-badge">You</span>}
                                </div>
                            </div>
                        </div>

                        <div className="rf-order-info">
                            <div className="rf-order-info-item">
                                <span className="rf-order-label">
                                    <span aria-hidden>📦</span> Items
                                </span>
                                <span className="rf-order-value">
                                    {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                                </span>
                            </div>
                            <div className="rf-order-info-item">
                                <span className="rf-order-label">
                                    <span aria-hidden>💰</span> Total
                                </span>
                                <span className="rf-order-value rf-order-value--price">
                                    ${order.total.toFixed(2)}
                                </span>
                            </div>
                            <div className="rf-order-info-item">
                                <span className="rf-order-label">
                                    <span aria-hidden>📅</span> Date
                                </span>
                                <span className="rf-order-value">{order.createdAt}</span>
                            </div>
                        </div>
                    </div>
                )
            }}
        />
    )
}

export default AdminOrderTable