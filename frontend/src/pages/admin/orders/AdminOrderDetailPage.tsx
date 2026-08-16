import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import AdminLayout from "../../../components/admin/AdminLayout"
import AdminButton from "../../../components/admin/AdminButton"
import { fetchOrderById, updateOrderStatus } from "../../../api/orders"
import { exportOrderDetailCsv } from "../../../util/orderCsv"
import { fetchUsers, buildAvatarUrl } from "../../../api/users"
import { buildBackendImageUrl } from "../../../api/products"
import type { OrderDetailRecord } from "../../../types/store"
import "./AdminOrderDetailPage.css"

interface Customer {
    id: number
    avatar_path: string | null
    role: string
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
            className="rf-order-detail-customer-avatar"
            onError={() => setErr(true)}
        />
    )
}

function AdminOrderDetailPage() {
    const { id } = useParams<{ id: string }>()

    const [order, setOrder] = useState<OrderDetailRecord | null>(null)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [status, setStatus] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    useEffect(() => {
        async function load() {
            if (!id) return
            try {
                const [data, users] = await Promise.all([
                    fetchOrderById(Number(id)),
                    fetchUsers(),
                ])
                setOrder(data)
                setStatus(data.status)
                setCustomer(users.find((u: Customer) => u.id === data.userId) ?? null)
            } catch (error) {
                setErrorMessage("Unable to load order: " + error)
            }
        }
        void load()
    }, [id])

    async function handleSave() {
        if (!order) return
        setIsSaving(true)
        setErrorMessage("")
        setSuccessMessage("")
        try {
            await updateOrderStatus(order.id, status)
            setSuccessMessage("Order status updated.")
            setOrder((prev) => (prev ? { ...prev, status } : null))
        } catch (error) {
            setErrorMessage("Unable to update order status: " + error)
        } finally {
            setIsSaving(false)
        }
    }

    function handleExportCsv() {
        if (order) {
            exportOrderDetailCsv(order)
        }
    }

    if (!order) {
        return (
            <AdminLayout
                title="Loading..."
                tabs={[]}
                activeTab="dashboard"
                onTabChange={() => {}}
            >
                {errorMessage && (
                    <div className="rf-admin-message rf-admin-message--error">{errorMessage}</div>
                )}
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title=""
            tabs={[]}
            activeTab="dashboard"
            onTabChange={() => {}}
        >
            <Link to="/admin/orders" className="rf-order-back-link">
                ← Back to Orders
            </Link>

            <div className="rf-order-detail-header">
                <div className="rf-order-detail-heading">
                    <div className="rf-order-detail-icon" aria-hidden>
                        📦
                    </div>
                    <div className="rf-order-detail-heading-text">
                        <div className="rf-order-detail-heading-main">
                            <h1 className="rf-order-detail-title">Order #{order.id}</h1>
                            <span className="rf-order-status-badge" data-status={order.status}>
                                {order.status}
                            </span>
                        </div>

                        <div className="rf-order-detail-customer">
                            <UserAvatar avatarPath={customer?.avatar_path} name={order.userEmail} />
                            <div className="rf-order-detail-customer-info">
                                <span className="rf-order-detail-customer-email">{order.userEmail}</span>
                                {customer?.role && (
                                    <span
                                        className={`rf-order-role-badge rf-order-role-badge--${customer.role.toLowerCase()}`}
                                    >
                                        {customer.role}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rf-order-detail-actions">
                    <AdminButton variant="surface" onClick={handleExportCsv}>
                        ⬇️ Download CSV
                    </AdminButton>
                </div>
            </div>

            {errorMessage && (
                <div className="rf-admin-message rf-admin-message--error">{errorMessage}</div>
            )}
            {successMessage && (
                <div className="rf-admin-message rf-admin-message--success">{successMessage}</div>
            )}

            <div className="rf-order-detail-grid">
                <div className="rf-order-detail-card">
                    <h3 className="rf-order-detail-card-title">
                        <span className="rf-order-detail-card-icon" aria-hidden>📌</span>
                        Summary
                    </h3>
                    <div className="rf-order-detail-row">
                        <span className="rf-order-detail-label">Status</span>
                        <div className="rf-order-status-control">
                            <select
                                className="rf-order-status-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="pending">pending</option>
                                <option value="paid">paid</option>
                                <option value="shipped">shipped</option>
                                <option value="cancelled">cancelled</option>
                            </select>
                            <AdminButton
                                variant="primary"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving…" : "💾 Save"}
                            </AdminButton>
                        </div>
                    </div>
                    <div className="rf-order-detail-row">
                        <span className="rf-order-detail-label">Total</span>
                        <span className="rf-order-detail-value rf-order-detail-value--green">
                            ${order.total.toFixed(2)}
                        </span>
                    </div>
                    <div className="rf-order-detail-row">
                        <span className="rf-order-detail-label">Date</span>
                        <span className="rf-order-detail-value">{order.createdAt}</span>
                    </div>
                </div>

                <div className="rf-order-detail-card">
                    <h3 className="rf-order-detail-card-title">
                        <span className="rf-order-detail-card-icon" aria-hidden>📍</span>
                        Shipping
                    </h3>
                    <p className="rf-order-detail-address">{order.shippingAddress}</p>
                </div>
            </div>

            <div className="rf-order-detail-items">
                <div className="rf-order-detail-items-header">
                    <h3 className="rf-order-detail-section-title">Purchased Items</h3>
                    <span className="rf-order-items-count">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </span>
                </div>

                <div className="rf-order-items-list">
                    <div className="rf-order-item-row rf-order-item-row--head" aria-hidden="true">
                        <span className="rf-order-item-col rf-order-item-col--product">Product</span>
                        <span className="rf-order-item-col rf-order-item-col--price">Price</span>
                        <span className="rf-order-item-col rf-order-item-col--qty">Qty</span>
                        <span className="rf-order-item-col rf-order-item-col--total">Line total</span>
                    </div>

                    {order.items.map((item, idx) => (
                        <div key={idx} className="rf-order-item-row">
                            <div className="rf-order-item-col rf-order-item-col--product">
                                <Link
                                    to={`/products/${item.productId}`}
                                    className="rf-order-item-image-wrap"
                                >
                                    <img
                                        src={buildBackendImageUrl(item.imagePath)}
                                        alt={item.productName}
                                        className="rf-order-item-image"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement
                                            img.onerror = null
                                            img.src = buildBackendImageUrl(null)
                                        }}
                                    />
                                </Link>
                                <Link
                                    to={`/products/${item.productId}`}
                                    className="rf-order-item-link"
                                >
                                    {item.productName}
                                </Link>
                            </div>
                            <span className="rf-order-item-col rf-order-item-col--price">
                                ${item.price.toFixed(2)}
                            </span>
                            <span className="rf-order-item-col rf-order-item-col--qty">
                                ×{item.quantity}
                            </span>
                            <span className="rf-order-item-col rf-order-item-col--total rf-order-item-line-total">
                                ${(item.price * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminOrderDetailPage