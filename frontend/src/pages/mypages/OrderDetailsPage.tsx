import { useEffect, useState } from "react"
import { useParams, Navigate, useLocation, Link } from "react-router-dom"
import Layout from "../../components/common/Layout"
import { useAuth } from "../../hooks/useAuth"
import { fetchOrderById, getOrderApiErrorMessage } from "../../api/orders"
import { buildBackendImageUrl } from "../../api/products"
import type { OrderDetailRecord } from "../../types/store"
import "./OrderDetailsPage.css"

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
                <div className="ordet-topbar">
                    <Link to="/my-orders" className="ordet-back-link">
                        ← Back to My Orders
                    </Link>
                </div>

                {(errorMessage || !order) ? (
                    <div className="ordet-error">{errorMessage || "Order not found."}</div>
                ) : (
                    <div className="ordet-panel" data-status={order.status.toLowerCase()}>
                        <div className="ordet-panel-header">
                            <div className="ordet-heading">
                                <div className="ordet-heading-icon" aria-hidden>
                                    📦
                                </div>
                                <div className="ordet-title-block">
                                    <h2 className="ordet-title">Order #{order.id}</h2>
                                    <span className="ordet-subtitle">Placed on {order.createdAt}</span>
                                </div>
                            </div>
                            <div className="ordet-header-shipto">
                                <span className="ordet-label">
                                    <span aria-hidden>📍</span> Ship To
                                </span>
                                <span className="ordet-value">{order.shippingAddress}</span>
                            </div>
                            <div className="ordet-header-actions">
                                <button
                                    type="button"
                                    className="ordet-print-btn"
                                    onClick={() => window.print()}
                                >
                                    🖨️ Print
                                </button>
                            </div>
                        </div>

                        <div className="ordet-panel-body">
                            <OrderStatusStepper status={order.status} />

                            <div className="ordet-summary-card">
                                <div className="ordet-summary-item">
                                    <span className="ordet-label">
                                        <span aria-hidden>🧾</span> Order ID
                                    </span>
                                    <span className="ordet-value">{order.id}</span>
                                </div>
                                <div className="ordet-summary-item">
                                    <span className="ordet-label">
                                        <span aria-hidden>💰</span> Total
                                    </span>
                                    <span className="ordet-value ordet-value--green">
                                        ${order.total.toFixed(2)}
                                    </span>
                                </div>
                                <div className="ordet-summary-item">
                                    <span className="ordet-label">
                                        <span aria-hidden>📌</span> Status
                                    </span>
                                    <span
                                        className="ordet-status-badge"
                                        data-status={order.status.toLowerCase()}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className="ordet-summary-item">
                                    <span className="ordet-label">
                                        <span aria-hidden>📅</span> Date
                                    </span>
                                    <span className="ordet-value">{order.createdAt}</span>
                                </div>
                            </div>

                            <div className="ordet-items-card">
                                <div className="ordet-items-header">
                                    <h3 className="ordet-items-title">Order Items</h3>
                                    <span className="ordet-items-count">
                                        {order.items.length} item{order.items.length === 1 ? "" : "s"}
                                    </span>
                                </div>

                                {order.items.length === 0 ? (
                                    <div className="ordet-empty-row">No items found for this order.</div>
                                ) : (
                                    <div className="ordet-items-list">
                                        <div className="ordet-item-row ordet-item-row--head" aria-hidden="true">
                                            <span className="ordet-item-col ordet-item-col--product">Product</span>
                                            <span className="ordet-item-col ordet-item-col--price">Price</span>
                                            <span className="ordet-item-col ordet-item-col--qty">Qty</span>
                                            <span className="ordet-item-col ordet-item-col--total">Line total</span>
                                        </div>

                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="ordet-item-row">
                                                <div className="ordet-item-col ordet-item-col--product">
                                                    <Link
                                                        to={`/products/${item.productId}`}
                                                        className="ordet-item-image-wrap"
                                                    >
                                                        <img
                                                            src={buildBackendImageUrl(item.imagePath)}
                                                            alt={item.productName}
                                                            className="ordet-item-image"
                                                            onError={(e) => {
                                                                const img = e.target as HTMLImageElement
                                                                img.onerror = null
                                                                img.src = buildBackendImageUrl(null)
                                                            }}
                                                        />
                                                    </Link>
                                                    <Link
                                                        to={`/products/${item.productId}`}
                                                        className="ordet-item-link"
                                                    >
                                                        {item.productName}
                                                    </Link>
                                                </div>
                                                <span className="ordet-item-col ordet-item-col--price">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                                <span className="ordet-item-col ordet-item-col--qty">
                                                    ×{item.quantity}
                                                </span>
                                                <span className="ordet-item-col ordet-item-col--total ordet-item-line-total">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}

                                        <div className="ordet-total-row">
                                            <span className="ordet-total-label">Order Total</span>
                                            <span className="ordet-total-value">${order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default OrderDetailsPage
