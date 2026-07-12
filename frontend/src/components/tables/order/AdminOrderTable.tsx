import Table from "../Table.tsx"
import AdminButton from "../../admin/AdminButton.tsx"
import type { OrderRecord } from "../../../types/store.ts"
import "./AdminOrderTable.css"

interface OrderTableProps {
    items: OrderRecord[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

function AdminOrderTable({ items, onEdit, onDelete }: OrderTableProps) {
    return (
        <Table
            items={items}
            renderItem={(order) => (
                <div className="rf-order-card-content">
                    <div className="rf-order-header">
                        <div className="rf-order-title">Order #{order.id}</div>
                        <div className="rf-order-status-badge" data-status={order.status}>
                            {order.status}
                        </div>
                    </div>

                    <div className="rf-order-info">
                        <div className="rf-order-info-item">
                            <span className="rf-order-label">User:</span>
                            <span className="rf-order-value">{order.userEmail}</span>
                        </div>
                        <div className="rf-order-info-item">
                            <span className="rf-order-label">Total:</span>
                            <span className="rf-order-value rf-order-value--price">
                                ${order.total.toFixed(2)}
                            </span>
                        </div>
                        <div className="rf-order-info-item">
                            <span className="rf-order-label">Date:</span>
                            <span className="rf-order-value">{order.createdAt}</span>
                        </div>
                    </div>

                    <div className="rf-order-actions">
                        <AdminButton
                            variant="pill"
                            icon="edit"
                            onClick={() => onEdit(order.id)}
                        >
                            View Details
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            icon="delete"
                            onClick={() => onDelete(order.id)}
                        >
                            Delete
                        </AdminButton>
                    </div>
                </div>
            )}
        />
    )
}

export default AdminOrderTable