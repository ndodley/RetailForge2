import { Link } from "react-router-dom"
import Table from "../Table.tsx"
import type { OrderRecord } from "../../../types/store"
import "./MyOrderTable.css"

interface MyOrderTableProps {
    items: OrderRecord[]
}

function MyOrderTable({ items }: MyOrderTableProps) {
    return (
        <Table
            items={items}
            renderItem={(order) => (
                <Link
                    to={`/order-details/${order.id}`}
                    className="my-order-card"
                    data-status={order.status.toLowerCase()}
                >
                    <div className="my-order-header">
                        <div className="my-order-title">Order #{order.id}</div>
                        <span className="my-order-status-badge" data-status={order.status.toLowerCase()}>
                            {order.status}
                        </span>
                    </div>

                    <div className="my-order-date">{order.createdAt}</div>

                    <div className="my-order-meta">
                        <div className="my-order-meta-item">
                            <span className="my-order-label">Total</span>
                            <span className="my-order-value my-order-value--price">
                                ${order.total.toFixed(2)}
                            </span>
                        </div>
                        <div className="my-order-meta-item">
                            <span className="my-order-label">Ship to</span>
                            <span className="my-order-value">{order.shippingAddress}</span>
                        </div>
                    </div>

                    <div className="my-order-footer">
                        <span className="my-order-items-chip">
                            {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                        </span>
                    </div>
                </Link>
            )}
        />
    )
}

export default MyOrderTable