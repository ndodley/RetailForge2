import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import AdminLayout from "../../../components/admin/AdminLayout"
import AdminButton from "../../../components/admin/AdminButton"
import { fetchOrderById, updateOrderStatus, exportOrderDetailCsv } from "../../../api/orders"
import { fetchUsers } from "../../../api/users"
import type { OrderDetailRecord } from "../../../types/store"
import "./AdminOrderDetailPage.css"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
const DEFAULT_AVATAR = `${apiBaseUrl}/images/other_images/default_avatar.jpg`

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
    const src = avatarPath && !err ? `${apiBaseUrl}${avatarPath}` : DEFAULT_AVATAR

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
    const navigate = useNavigate()

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

                <div className="rf-order-detail-actions">
                    <AdminButton variant="surface" onClick={handleExportCsv}>
                        Download CSV
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
                    <h3 className="rf-order-detail-card-title">SUMMARY</h3>
                    <div className="rf-order-detail-row">
                        <span className="rf-order-detail-label">Status:</span>
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
                            style={{ marginLeft: "8px" }}
                        >
                            Save
                        </AdminButton>
                    </div>
                    <div className="rf-order-detail-row">
                        <span className="rf-order-detail-label">Total:</span>
                        <span className="rf-order-detail-value rf-order-detail-value--green">
                            ${order.total.toFixed(2)}
                        </span>
                    </div>
                    <div className="rf-order-detail-row">
                        <span className="rf-order-detail-label">Date:</span>
                        <span className="rf-order-detail-value">{order.createdAt}</span>
                    </div>
                </div>

                <div className="rf-order-detail-card">
                    <h3 className="rf-order-detail-card-title">SHIPPING</h3>
                    <p className="rf-order-detail-address">{order.shippingAddress}</p>
                </div>
            </div>

            <div className="rf-order-detail-items">
                <h3 className="rf-order-detail-section-title">Purchased Items</h3>
                <table className="rf-order-items-table">
                    <thead>
                    <tr>
                        <th>PRODUCT</th>
                        <th>IMAGE</th>
                        <th>PRICE</th>
                        <th>QTY</th>
                        <th>LINE TOTAL</th>
                    </tr>
                    </thead>
                    <tbody>
                    {order.items.map((item, idx) => (
                        <tr key={idx}>
                            <td>
                                <Link
                                    to={`/products/${item.productId}`}
                                    className="rf-order-item-link"
                                >
                                    {item.productName}
                                </Link>
                            </td>
                            <td>
                                <Link to={`/products/${item.productId}`}>
                                    <img
                                        src={
                                            item.imagePath
                                                ? `${apiBaseUrl}${item.imagePath}`
                                                : `${apiBaseUrl}/images/other_images/dummy_product.jpg`
                                        }
                                        alt={item.productName}
                                        className="rf-order-item-image"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement
                                            img.onerror = null
                                            img.src = `${apiBaseUrl}/images/other_images/dummy_product.jpg`
                                        }}
                                    />
                                </Link>
                            </td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>{item.quantity}</td>
                            <td className="rf-order-item-line-total">
                                ${(item.price * item.quantity).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    )
}

export default AdminOrderDetailPage