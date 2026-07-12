import { useEffect, useState } from "react"
import { useLocation, Link } from "react-router-dom"
import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import axios from "axios"
import { buildBackendImageUrl } from "../api/products"
import "./OrderConfirmationPage.css"

interface Order {
    id: number
    total: number
    status: string
    address: string
    createdAt: string
}

interface OrderItem {
    id: number
    productId: number
    productName: string
    imagePath: string | null
    price: number
    quantity: number
}

export default function OrderConfirmationPage() {
    const location = useLocation()
    console.log("Location: ", location)
    const { order } = location.state || {}
    console.log("Order: ", order)

    const [items, setItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const loadItems = async () => {
            console.log("Load Items")
            console.log("Order ID: " + order.id)
            if (!order?.id) return

            try {
                const res = await axios.get(`/api/order-details/order/${order.id}`)
                setItems(res.data)
            } catch {
                setError("Failed to load order items.")
            } finally {
                setLoading(false)
            }
        }

        loadItems()
    }, [order])

    if (!order) {
        return (
            <>
                <Navbar />
                <main className="order-missing">
                    <h2>Order not found</h2>
                    <Link to="/" className="home-link">Return to Home</Link>
                </main>
                <Footer />
            </>
        )
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="order-loading">Loading receipt...</main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Navbar />

            <main className="order-confirmation-bg">
                <div className="order-confirmation-container">

                    {/* HEADER */}
                    <div className="order-header">
                        <div className="order-header-inner">
                            <div className="order-checkmark">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M20 6L9 17L4 12"
                                        stroke="var(--surface-2)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <div className="order-header-text">
                                <div className="order-title">Order Confirmed</div>
                                <div className="order-subtitle">Thanks — your payment was successful.</div>
                            </div>
                        </div>
                    </div>

                    {/* SUMMARY */}
                    <div className="order-summary">
                        <div className="summary-row">
                            <span className="summary-label">Total:</span>
                            <span className="summary-value success">${order.total}</span>
                        </div>

                        <div className="summary-row">
                            <span className="summary-label">Status:</span>
                            <span className={`summary-status ${order.status === "paid" ? "paid" : ""}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="summary-row">
                            <span className="summary-label">Date:</span>
                            <span className="summary-value">
                                {new Date(order.createdAt).toLocaleString()}
                            </span>
                        </div>

                        <div className="summary-row full">
                            <span className="summary-label">Ship To:</span>
                            <span className="summary-value">{order.address}</span>
                        </div>
                    </div>

                    {/* ITEMS */}
                    <div className="order-items-card">
                        <div className="items-header">
                            <div className="items-title">Order Items</div>
                            <div className="items-count">
                                {items.length} item{items.length === 1 ? "" : "s"}
                            </div>
                        </div>

                        {error && <div className="items-error">{error}</div>}

                        <div className="items-table-wrapper">
                            <table className="items-table">
                                <thead>
                                <tr>
                                    <th>Product</th>
                                    <th className="right">Price</th>
                                    <th className="center">Qty</th>
                                    <th className="right">Total</th>
                                </tr>
                                </thead>

                                <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="item-product">
                                                <Link to={`/products/${item.productId}`}>
                                                    <img
                                                        src={buildBackendImageUrl(item.imagePath)}
                                                        alt={item.productName}
                                                        className="item-img"
                                                        onError={(e) => {
                                                            e.currentTarget.src = buildBackendImageUrl(null)
                                                        }}
                                                    />
                                                </Link>

                                                <div className="item-info">
                                                    <Link
                                                        to={`/products/${item.productId}`}
                                                        className="item-name"
                                                    >
                                                        {item.productName}
                                                    </Link>
                                                    <div className="item-id">Product ID: {item.productId}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="right link">${item.price}</td>
                                        <td className="center">{item.quantity}</td>
                                        <td className="right success">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="order-footer">
                        <div className="footer-thanks">Thank you for your purchase!</div>
                        <Link to="/" className="footer-home">Return to Home</Link>
                    </div>

                </div>
            </main>

            <Footer />
        </>
    )
}
