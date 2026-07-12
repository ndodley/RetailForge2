import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import Layout from "../components/common/Layout"
import Button from "../components/common/Button"
import { fetchCart } from "../api/cart"
import { buildBackendImageUrl } from "../api/products"
import { useAuth } from "../hooks/useAuth"
import axios from "axios"
import "./CheckoutPage.css"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface CartItemDto {
    id: number
    name: string
    priceAtTime: number
    quantity: number
    imagePath: string | null
    categoryName?: string | null
}

function CheckoutForm({}: {
    clientSecret: string
    cartItems: CartItemDto[]
    cartTotal: number
}) {
    const stripe = useStripe()
    const elements = useElements()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [address, setAddress] = useState<string>("")
    const [processing, setProcessing] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setProcessing(true)
        setError("")

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {},
            redirect: "if_required",
        })

        if (result.error) {
            setError(result.error.message ?? "Payment failed")
            setProcessing(false)
            return
        }

        try {
            const orderRes = await axios.post("/api/payment/complete-checkout", {
                userId: user?.id,
                address,
            })

            navigate("/order-confirmation", {
                state: { order: orderRes.data },
            })
        } catch {
            setError("Order creation failed")
        }

        setProcessing(false)
    }

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <input id={"shipping_address"}
                   type="text"
                   placeholder="Shipping Address"
                   value={address}
                   onChange={(e) => setAddress(e.target.value)}
                   required
                   className="address-input"
            />

            <PaymentElement className="payment-element" />

            <Button
                variant="primary"
                fullWidth
                disabled={!stripe || processing}
                type="submit"
            >
                {processing ? "Processing..." : "Pay with Stripe"}
            </Button>

            {error && <div className="error-msg">{error}</div>}
        </form>
    )
}

export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState<CartItemDto[]>([])
    const [cartTotal, setCartTotal] = useState(0)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [error, setError] = useState("")

    // Load cart
    useEffect(() => {
        async function load() {
            try {
                const cart = await fetchCart()
                setCartItems(cart.items as CartItemDto[])
                setCartTotal(cart.subtotal ?? 0)
            } catch {
                setError("Failed to load cart")
            }
        }
        load()
    }, [])

    // Create PaymentIntent
    useEffect(() => {
        if (cartTotal <= 0) return

        async function createIntent() {
            try {
                const res = await axios.post("/api/payment/create-payment-intent", {
                    amount: Math.round(cartTotal * 100),
                })
                setClientSecret(res.data.clientSecret)
            } catch {
                setError("Failed to initialize payment")
            }
        }
        createIntent()
    }, [cartTotal])

    return (
        <Layout isStorefront>
            <div className="checkout-page">
                <div className="checkout-card fade-in">
                    <h2 className="checkout-title">Checkout</h2>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h3>Order Summary</h3>

                        <div className="order-items">
                            {cartItems.length === 0 ? (
                                <div className="empty-msg">Your cart is empty.</div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <div className="item-left">
                                            <img
                                                src={buildBackendImageUrl(item.imagePath)}
                                                alt={item.name}
                                                className="item-img"
                                                onError={(e) => {
                                                    e.currentTarget.src = buildBackendImageUrl(null)
                                                }}
                                            />

                                            <div className="item-info">
                                                <div className="item-name">{item.name}</div>
                                                <div className="item-category">
                                                    {item.categoryName || "Uncategorized"}
                                                </div>
                                                <div className="item-sub">
                                                    Qty {item.quantity} · ${item.priceAtTime.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="item-total">
                                            ${(item.priceAtTime * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="order-total">
                            Total: <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Stripe Elements wrapper */}
                    {clientSecret && (
                        <Elements
                            stripe={stripePromise}
                            options={{ clientSecret }}
                        >
                            <CheckoutForm
                                clientSecret={clientSecret}
                                cartItems={cartItems}
                                cartTotal={cartTotal}
                            />
                        </Elements>
                    )}

                    {error && <div className="error-msg">{error}</div>}
                </div>
            </div>
        </Layout>
    )
}
