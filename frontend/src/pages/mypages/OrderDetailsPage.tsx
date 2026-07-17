import { useEffect, useState } from "react"
import { useParams, Navigate, useLocation, Link } from "react-router-dom"
import Layout from "../../components/common/Layout"
import { useAuth } from "../../hooks/useAuth"
import { fetchOrderById, getOrderApiErrorMessage } from "../../api/orders"
import type { OrderDetailRecord } from "../../types/store"
import "./OrderDetailsPage.css"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

const STEPS = ["pending", "paid", "shipped"] as const

function OrderStatusStepper({ status }: { status: string }) {
    const current = status.toLowerCase()

    if (current === "cancelled") {
        return (
            <div className="ordet-stepper ordet-stepper--cancelled">
                <span className="ordet-stepper-cancelled-icon">✕</span>
                <span>This order was cancelled</span>
            </div>
        )
    }

    const currentIndex = STEPS.indexOf(current as (typeof STEPS)[number])

    return (
        <div className="ordet-stepper">
            {STEPS.map((step, idx) => (
                <div key={step} className="ordet-stepper-step">
                    <div className="ordet-stepper-node">
                        <span
                            className="ordet-stepper-dot"
                            data-state={idx < currentIndex ? "done" : idx === currentIndex ? "active" : "pending"}
                        >
                            {idx < currentIndex ? "✓" : idx + 1}
                        </span>
                        <span className="ordet-stepper-label">
                            {step.charAt(0).toUpperCase() + step.slice(1)}
                        </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                        <span className="ordet-stepper-line" data-filled={idx < currentIndex} />
                    )}
                </div>
            ))}
        </div>
    )
}

function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const { user, loading } = useAuth()
    const location = useLocation()

    const [order, setOrder] = useState<OrderDetailRecord | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        async function load() {
            if (!id) return
            setIsLoading(true)
            setErrorMessage("")
            try {
                const data = await fetchOrderById(Number(id))
                setOrder(data)
            } catch (error) {
                setErrorMessage(getOrderApiErrorMessage(error, "Failed to load order details."))
            } finally {
                setIsLoading(false)
            }
        }
        void load()
    }, [id])

    if (loading) {
        return <div className="ordet-fullscreen">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (isLoading) {
        return <div className="ordet-fullscreen">Loading order details...</div>
    }

    return (
        <Layout isStorefront>
            <div className="ordet-page">
                {(errorMessage || !order) ? (
                    <>
                        <Link to="/my-orders" className="ordet-back-link">
                            ← Back to My Orders
                        </Link>
                        <div className="ordet-error">{errorMessage || "Order not found."}</div>
                    </>
                ) : (
                    <div className="ordet-panel" data-status={order.status.toLowerCase()}>
                        <div className="ordet-panel-header">
                            <div className="ordet-title-block">
                                <h2 className="ordet-title">Order #{order.id}</h2>
                                <span className="ordet-subtitle">Placed on {order.createdAt}</span>
                            </div>
                            <div className="ordet-header-actions">
                                <button
                                    type="button"
                                    className="ordet-print-btn"
                                    onClick={() => window.print()}
                                >
                                    🖨️ Print
                                </button>
                                <Link to="/my-orders" className="ordet-back-link">
                                    ← Back to My Orders
                                </Link>
                            </div>
                        </div>

                        <div className="ordet-panel-body">
                            <OrderStatusStepper status={order.status} />

                            <div className="ordet-summary-card">
                                <div className="ordet-summary-item">
                                    <span className="ordet-label">Order ID</span>
                                    <span className="ordet-value">{order.id}</span>
                                </div>
                                <div className="ordet-summary-item">
                                    <span className="ordet-label">Total</span>
                                    <span className="ordet-value ordet-value--green">
                                        ${order.total.toFixed(2)}
                                    </span>
                                </div>
                                <div className="ordet-summary-item">
                                    <span className="ordet-label">Status</span>
                                    <span
                                        className="ordet-status-badge"
                                        data-status={order.status.toLowerCase()}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className="ordet-summary-item">
                                    <span className="ordet-label">Date</span>
                                    <span className="ordet-value">{order.createdAt}</span>
                                </div>
                                <div className="ordet-summary-item ordet-summary-item--full">
                                    <span className="ordet-label">Ship To</span>
                                    <span className="ordet-value">{order.shippingAddress}</span>
                                </div>
                            </div>

                            <div className="ordet-items-card">
                                <div className="ordet-items-header">
                                    <h3 className="ordet-items-title">Order Items</h3>
                                    <span className="ordet-items-count">
                                        {order.items.length} item{order.items.length === 1 ? "" : "s"}
                                    </span>
                                </div>

                                <table className="ordet-table">
                                    <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Image</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Line total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {order.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="ordet-empty-row">
                                                No items found for this order.
                                            </td>
                                        </tr>
                                    ) : (
                                        order.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <Link
                                                        to={`/products/${item.productId}`}
                                                        className="ordet-item-link"
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
                                                            className="ordet-item-image"
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
                                                <td className="ordet-item-line-total">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                    {order.items.length > 0 && (
                                        <tfoot>
                                        <tr className="ordet-total-row">
                                            <td colSpan={4} className="ordet-total-label">
                                                Order Total
                                            </td>
                                            <td className="ordet-total-value">
                                                ${order.total.toFixed(2)}
                                            </td>
                                        </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default OrderDetailsPage
