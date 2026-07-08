import AdminButton from "../admin/AdminButton"
import type { OrderRecord, UserRecord } from "../../types/store"
import "./OrderTable.css"

interface OrderTableProps {
    items: OrderRecord[]
    users: UserRecord[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

function OrderTable({ items, users, onEdit, onDelete }: OrderTableProps) {
    return (
        <div className="rf-order-table">
            {items.map((order) => (
                <div key={order.id} className="rf-order-card">
                    <div className="rf-order-card-row">
                        <div className="rf-order-card-section">
                            <div className="rf-order-card-label">ORDER #</div>
                            <div className="rf-order-card-value">{order.id}</div>
                        </div>

                        <div className="rf-order-card-section">
                            <div className="rf-order-card-label">USER</div>
                            <div className="rf-order-card-value">{order.userEmail}</div>
                        </div>

                        <div className="rf-order-card-section">
                            <div className="rf-order-card-label">STATUS</div>
                            <div className={`rf-order-status rf-order-status--${order.status}`}>
                                {order.status}
                            </div>
                        </div>

                        <div className="rf-order-card-section">
                            <div className="rf-order-card-label">TOTAL</div>
                            <div className="rf-order-card-value rf-order-card-value--price">
                                ${order.total.toFixed(2)}
                            </div>
                        </div>

                        <div className="rf-order-card-section">
                            <div className="rf-order-card-label">DATE</div>
                            <div className="rf-order-card-value">{order.createdAt}</div>
                        </div>
                    </div>

                    <div className="rf-order-card-actions">
                        <AdminButton variant="surface" onClick={() => onEdit(order.id)}>
                            View Details
                        </AdminButton>
                        <AdminButton variant="danger" onClick={() => onDelete(order.id)}>
                            Delete
                        </AdminButton>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default OrderTable