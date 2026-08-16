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

// Stripe.js injects its own floating UI (the "Link" quick-checkout badge) into the page
// the moment it's loaded — and that injected element lives outside React's DOM, so it
// isn't tied to this component's lifecycle at all. Previously `loadStripe()` ran at
// module scope, which executes as soon as this file is evaluated by the bundler —
// regardless of which route the user is actually on — so the badge showed up
// everywhere (cart, product pages, etc.), not just at checkout. Deferring the call
// into a lazily-initialized singleton means Stripe.js only loads once this component
// actually renders, i.e. once the user is really on the checkout page.
let stripePromise: ReturnType<typeof loadStripe> | undefined

function getStripe() {
    if (!stripePromise) {
        stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    }
    return stripePromise
}

interface CartItemDto {
    id: number
    productName: string
    priceAtTime: number
    quantity: number
    imagePath: string | null
    categoryName?: string | null
}

function CheckoutForm() {
    const stripe = useStripe()
    const elements = useElements()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [address, setAddress] = useState<string>("")
    const [addressPrefilled, setAddressPrefilled] = useState(false)
    const [processing, setProcessing] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    // Default the shipping address to the user's saved address, but only once —
    // after that the user is free to edit it (e.g. shipping to a different place)
    // without it getting clobbered by a later re-render.
    useEffect(() => {
        if (!addressPrefilled && user?.address) {
            setAddress(user.address)
            setAddressPrefilled(true)
        }
    }, [user, addressPrefilled])

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
            <label htmlFor="shipping_address" className="checkout-section-label">
                Shipping Address
            </label>
            <input id={"shipping_address"}
                   type="text"
                   placeholder="Shipping Address"
                   value={address}
                   onChange={(e) => setAddress(e.target.value)}
                   required
                   className="address-input"
            />

            <div className="checkout-section-label">Payment Method</div>
            <PaymentElement className="payment-element" />

            <Button
                variant="primary"
                fullWidth
                className="checkout-pay-btn"
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
    const navigate = useNavigate()
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
                <div className="checkout-shell fade-in">
                    <button
                        type="button"
                        className="checkout-back"
                        onClick={() => navigate("/cart")}
                    >
                        <span aria-hidden>←</span> Back to Cart
                    </button>

                    <h2 className="checkout-title">Checkout</h2>

                    <div className="checkout-grid">
                        {/* Order Summary */}
                        <div className="checkout-order-summary">
                            <h3>Order Summary</h3>

                            <div className="checkout-order-items">
                                {cartItems.length === 0 ? (
                                    <div className="checkout-empty-msg">Your cart is empty.</div>
                                ) : (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="checkout-order-item">
                                            <div className="checkout-item-left">
                                                <img
                                                    src={buildBackendImageUrl(item.imagePath)}
                                                    alt={item.productName}
                                                    className="checkout-item-img"
                                                    onError={(e) => {
                                                        e.currentTarget.src = buildBackendImageUrl(null)
                                                    }}
                                                />

                                                <div className="checkout-item-info">
                                                    <div className="checkout-item-name">{item.productName}</div>
                                                    <div className="checkout-item-category">
                                                        {item.categoryName || "Uncategorized"}
                                                    </div>
                                                    <div className="checkout-item-sub">
                                                        Qty {item.quantity} · ${item.priceAtTime.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="checkout-item-total">
                                                ${(item.priceAtTime * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="checkout-order-total">
                                Total: <span>${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Shipping + Payment, combined into a single card */}
                        <div className="checkout-payment-card">
                            <h3>Shipping &amp; Payment</h3>

                            {clientSecret && (
                                <Elements
                                    stripe={getStripe()}
                                    options={{ clientSecret }}
                                >
                                    <CheckoutForm />
                                </Elements>
                            )}

                            {error && <div className="error-msg">{error}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
