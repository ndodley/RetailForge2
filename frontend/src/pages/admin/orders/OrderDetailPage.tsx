import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import AdminLayout from "../../../components/admin/AdminLayout"
import AdminButton from "../../../components/admin/AdminButton"
import { fetchOrderById, updateOrderStatus, exportOrderDetailCsv } from "../../../api/orders"
import type { OrderDetailRecord } from "../../../types/store"
import "./OrderDetailPage.css"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

function OrderDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isEditMode = searchParams.get("edit") === "1"

    const [order, setOrder] = useState<OrderDetailRecord | null>(null)
    const [status, setStatus] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    useEffect(() => {
        async function load() {
            if (!id) return
            try {
                const data = await fetchOrderById(Number(id))
                setOrder(data)
                setStatus(data.status)
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
            title={`Order #${order.id}`}
            tabs={[]}
            activeTab="dashboard"
            onTabChange={() => {}}
        >
            <div className="rf-order-detail-header">
                <button className="rf-order-back-link" onClick={() => navigate("/admin/orders")}>
                    ← Back to Orders
                </button>

                <div className="rf-order-detail-top">
                    <p className="rf-order-detail-subtitle">Customer: {order.userEmail}</p>
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
                {/* Summary */}
                <div className="rf-order-detail-card">
                    <h3 className="rf-order-detail-card-title">SUMMARY</h3>
                    <div className="rf-order-detail-row">
                        <span className="rf-order-detail-label">Status:</span>
                        {isEditMode ? (
                            <>
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
                            </>
                        ) : (
                            <span className="rf-order-detail-value">{order.status}</span>
                        )}
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

                {/* Shipping */}
                <div className="rf-order-detail-card">
                    <h3 className="rf-order-detail-card-title">SHIPPING</h3>
                    <p className="rf-order-detail-address">{order.shippingAddress}</p>
                </div>
            </div>

            {/* Purchased Items */}
            <div className="rf-order-detail-items">
                <h3 className="rf-order-detail-section-title">Purchased Items</h3>
                <table className="rf-order-items-table">
                    <thead>
                    <tr>
                        <th>PRODUCT</th>
                        <th>IMAGE</th>
                        <th>PRICE</th>
                        <th>QUANTITY</th>
                        <th>SUBTOTAL</th>
                    </tr>
                    </thead>
                    <tbody>
                    {order.items.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.productName}</td>
                            <td>
                                <img
                                    src={`${apiBaseUrl}${item.imagePath}`}
                                    alt={item.productName}
                                    className="rf-order-item-image"
                                />
                            </td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>{item.quantity}</td>
                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    )
}
export default OrderDetailPage
