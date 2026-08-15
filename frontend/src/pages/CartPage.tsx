import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/common/Layout'
import Button from '../components/common/Button'
import { useAuth } from '../hooks/useAuth'
import {
	fetchCart,
	updateCartQuantity,
	removeFromCart,
	clearCartApi,
	type CartItem,
	type CartDto,
} from '../api/cart'
import { buildBackendImageUrl } from '../api/products'
import './CartPage.css'

function CartPage() {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, loading } = useAuth()

	const [cart, setCart] = useState<CartDto | null>(null)
	const [loadingCart, setLoadingCart] = useState(true)

	// Redirect if not logged in
	useEffect(() => {
		if (!loading && !user) {
			navigate('/login', { state: { from: location.pathname }, replace: true })
		}
	}, [user, loading, navigate, location])

	// Load cart
	useEffect(() => {
		if (!loading && user) {
			;(async () => {
				try {
					const data = await fetchCart()
					setCart(data)
				} finally {
					setLoadingCart(false)
				}
			})()
		}
	}, [user, loading])

	if (loading || loadingCart || !user) {
		return (
			<Layout isStorefront>
				<div className="cart-page">
					<div style={{ color: 'var(--text)' }}>Loading cart…</div>
				</div>
			</Layout>
		)
	}

	const cartItems = cart?.items ?? []
	const subtotal = cart?.subtotal ?? 0
	const totalItems = cart?.totalItems ?? 0

	// ⭐ Prevent quantity < 1 and > stock
	const handleQuantityChange = async (item: CartItem, newQty: number) => {
		if (newQty <= 0) {
			// Delete item instead of sending 0
			const updated = await removeFromCart(item.productId)
			setCart(updated)
			return
		}

		if (newQty > item.stock) {
			return // Prevent exceeding stock
		}

		const updated = await updateCartQuantity(item.productId, newQty)
		setCart(updated)
	}

	const handleRemove = async (item: CartItem) => {
		const updated = await removeFromCart(item.productId)
		setCart(updated)
	}

	const handleClearCart = async () => {
		const updated = await clearCartApi()
		setCart(updated)
	}

	return (
		<Layout isStorefront>
			<div className="cart-page">
				<div className="cart-header fade-in">
					<h2>🛒 Shopping Cart</h2>

					{cartItems.length > 0 && (
						<div className="cart-header-actions">
							<Button
								variant="primary"
								className="cart-continue-btn"
								onClick={() => navigate('/products')}
							>
								Continue Shopping
							</Button>
						</div>
					)}
				</div>

				{cartItems.length === 0 ? (
					<div className="empty-cart-modern fade-in">
						<div className="empty-icon">🛍️</div>
						<h3>Your cart is empty</h3>
						<p>Looks like you haven’t added anything yet.</p>

						<Link to="/products" className="button button--primary empty-shop-btn">
							Shop Products
						</Link>
					</div>
				) : (
					<div className="cart-content">
						<div className="cart-items fade-in">
							{cartItems.map((item) => {
								const lineTotal = item.priceAtTime * item.quantity

								return (
									<div key={item.id} className="cart-item-card slide-up">
										<Link to={`/products/${item.productId}`} className="cart-item-image-link">
											<img
												src={buildBackendImageUrl(item.imagePath)}
												alt={item.productName}
												className="cart-item-image"
												onError={(e) => {
													e.currentTarget.src = buildBackendImageUrl(null)
												}}
											/>
										</Link>

										<div className="cart-item-info">
											{item.categoryName && (
												<span className="cart-item-badge">{item.categoryName}</span>
											)}

											{item.brand && <span className="cart-item-brand">{item.brand}</span>}

											<Link to={`/products/${item.productId}`} className="cart-item-name-link">
												<h3 className="cart-item-name">{item.productName}</h3>
											</Link>

											<span className="cart-item-unit-price">${item.priceAtTime.toFixed(2)} each</span>

											{item.stock > 0 && item.stock <= 5 && (
												<span className="cart-item-stock-warning">Only {item.stock} left in stock</span>
											)}
										</div>

										<div className="cart-item-controls">
											<div className="qty-stepper">
												<Button
													variant="pill"
													className="qty-stepper-btn"
													disabled={item.quantity <= 1}
													onClick={() => handleQuantityChange(item, item.quantity - 1)}
													aria-label="Decrease quantity"
												>
													−
												</Button>

												<strong className="qty-display">{item.quantity}</strong>

												<Button
													variant="pill"
													className="qty-stepper-btn"
													disabled={item.quantity >= item.stock}
													onClick={() => handleQuantityChange(item, item.quantity + 1)}
													aria-label="Increase quantity"
												>
													+
												</Button>
											</div>

											<strong className="cart-item-line-total">${lineTotal.toFixed(2)}</strong>

											<button
												type="button"
												className="cart-item-remove"
												onClick={() => handleRemove(item)}
											>
												Remove
											</button>
										</div>
									</div>
								)
							})}
						</div>

						<aside className="cart-summary-card sticky fade-in">
							<h2>Order Summary</h2>

							<div className="summary-row">
								<span className="summary-label">Items</span>
								<strong className="summary-value">{totalItems}</strong>
							</div>

							<div className="summary-row">
								<span className="summary-label">Subtotal</span>
								<strong className="summary-value">${subtotal.toFixed(2)}</strong>
							</div>

							<div className="summary-row total-row">
								<span className="summary-label">Total</span>
								<strong className="summary-value summary-total-value">${subtotal.toFixed(2)}</strong>
							</div>

							<Button
								variant="primary"
								className="cart-checkout-btn"
								fullWidth
								onClick={() =>
									navigate('/checkout', {
										state: { subtotal, cartItems, totalItems },
									})
								}
							>
								Proceed to Checkout
							</Button>

							<button type="button" className="cart-clear-btn" onClick={handleClearCart}>
								Clear Cart
							</button>
						</aside>
					</div>
				)}
			</div>
		</Layout>
	)
}

export default CartPage
