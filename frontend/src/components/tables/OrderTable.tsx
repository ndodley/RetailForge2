const mediaUrl = (path?: string | null) =>
    path ? `/media/${path}` : `/media/other_images/default_avatar.jpg`

export interface OrderRecord {
    id: number
    user_email: string | null
    status: string
    total: number
    created_at: string
    avatar_path: string | null
}

interface OrderTableProps {
    orders: OrderRecord[]
    currencyFormatter: Intl.NumberFormat
    deletingId: number | null
    onEdit: (orderId: number) => void
    onDelete: (orderId: number) => void
}

export default function OrderTable({
                                       orders,
                                       currencyFormatter,
                                       deletingId,
                                       onEdit,
                                       onDelete,
                                   }: OrderTableProps) {
    if (orders.length === 0) {
        return (
            <div className="department-table__empty">
                <h3>No orders found</h3>
                <p>Try a different search term or adjust your filters.</p>
            </div>
        )
    }

    return (
        <div className="admin-grid">
            {orders.map((order) => (
                <article key={order.id} className="admin-grid-card order-grid-card">

                    {/* Avatar + Title Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                            src={mediaUrl(order.avatar_path)}
                            alt=""
                            width={42}
                            height={42}
                            style={{
                                borderRadius: "50%",
                                objectFit: "cover",
                                flexShrink: 0,
                            }}
                            onError={(e) => {
                                e.currentTarget.src = "/media/other_images/default_avatar.jpg"
                            }}
                        />

                        <div>
                            <div className="admin-grid-title">Order #{order.id}</div>
                            <div className="admin-grid-meta">
                                User: {order.user_email ?? "—"}
                            </div>
                        </div>
                    </div>

                    <div className="admin-grid-meta">Status: {order.status}</div>

                    <div className="admin-grid-meta">
                        Total: {currencyFormatter.format(order.total)}
                    </div>

                    <div className="admin-grid-meta">
                        Date: {new Date(order.created_at).toLocaleString()}
                    </div>

                    <div className="admin-grid-actions admin-row-actions">
                        <button
                            type="button"
                            className="admin-btn admin-btn--sm"
                            onClick={() => onEdit(order.id)}
                        >
                            <span className="admin-action-icon">✎</span>
                            Edit
                        </button>

                        <button
                            type="button"
                            className="admin-btn admin-btn--sm admin-btn--danger"
                            onClick={() => onDelete(order.id)}
                            disabled={deletingId === order.id}
                        >
                            <span className="admin-action-icon">✕</span>
                            {deletingId === order.id ? "Deleting…" : "Delete"}
                        </button>
                    </div>
                </article>
            ))}
        </div>
    )
}
