import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  clearCart,
  getCartItems,
  removeProductFromCart,
  subscribeToCartUpdates,
  updateCartItemQuantity,
  type StoreCartItem,
} from '../api/cartStore'
import { buildBackendImageUrl } from '../api/products'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'

function Cart() {
  const [cartItems, setCartItems] = useState<StoreCartItem[]>(() => getCartItems())

  useEffect(() => subscribeToCartUpdates(() => setCartItems(getCartItems())), [])

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems])
  const shipping = cartItems.length > 0 ? 12 : 0

  return (
	<>
	  <Navbar />
	  <main className="content-page">
		<section className="content-page__hero">
		  <p className="eyebrow">Cart</p>
		  <h1>Shopping cart starter page</h1>
		  <p>
			This page is a placeholder for your future session-based cart flow. It gives you something
			visual to design around right now.
		  </p>
		</section>

		<section className="section-block cart-layout">
		  <div className="cart-list">
			{cartItems.length === 0 ? (
			  <article className="cart-item-card">
				<div>
				  <span className="cart-item-card__department">Cart is empty</span>
				  <h3>Browse the live catalog to add products.</h3>
				</div>
				<div className="cart-item-card__meta">
				  <Link to="/products" className="button button--primary">
					Shop products
				  </Link>
				</div>
			  </article>
			) : (
			  cartItems.map((item) => (
				<article key={item.productId} className="cart-item-card" style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
				  <img
					src={buildBackendImageUrl(item.imagePath)}
					alt={item.name}
					style={{ width: 92, height: 92, objectFit: 'contain', borderRadius: 12, background: 'var(--surface-3)', border: '1px solid var(--border)', padding: 8 }}
					onError={(event) => {
					  event.currentTarget.src = buildBackendImageUrl(null)
					}}
				  />

				  <div style={{ flex: 1, minWidth: 220 }}>
					<span className="cart-item-card__department">{item.departmentName || 'Uncategorized'}</span>
					<h3>{item.name}</h3>
					<div className="cart-item-card__meta" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
					  <span>${item.price.toFixed(2)} each</span>
					  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
					</div>
				  </div>

				  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
					<button
					  type="button"
					  className="button button--ghost"
					  onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
					>
					  −
					</button>
					<strong style={{ minWidth: 36, textAlign: 'center' }}>Qty {item.quantity}</strong>
					<button
					  type="button"
					  className="button button--ghost"
					  onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
					  disabled={item.quantity >= item.stock}
					>
					  +
					</button>
					<button type="button" className="button button--ghost" onClick={() => removeProductFromCart(item.productId)}>
					  Remove
					</button>
				  </div>
				</article>
			  ))
			)}
		  </div>

		  <aside className="cart-summary-card">
			<h2>Order summary</h2>
			<div className="cart-summary-card__row">
			  <span>Items</span>
			  <strong>{cartItems.reduce((count, item) => count + item.quantity, 0)}</strong>
			</div>
			<div className="cart-summary-card__row">
			  <span>Subtotal</span>
			  <strong>${subtotal.toFixed(2)}</strong>
			</div>
			<div className="cart-summary-card__row">
			  <span>Estimated shipping</span>
			  <strong>${shipping.toFixed(2)}</strong>
			</div>
			<div className="cart-summary-card__row cart-summary-card__row--total">
			  <span>Total</span>
			  <strong>${(subtotal + shipping).toFixed(2)}</strong>
			</div>
			<button type="button" className="button button--primary button--full" disabled={cartItems.length === 0}>
			  Checkout comes next
			</button>
			{cartItems.length > 0 && (
			  <button type="button" className="button button--ghost button--full" onClick={clearCart}>
				Clear cart
			  </button>
			)}
		  </aside>
		</section>
	  </main>
	  <Footer />
	</>
  )
}

export default Cart

