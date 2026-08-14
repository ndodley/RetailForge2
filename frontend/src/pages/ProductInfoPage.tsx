import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchCart, addProductToCart, removeFromCart } from '../api/cart'
import { buildBackendImageUrl, fetchStoreProductById, getProductApiErrorMessage, type ProductDto } from '../api/products'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/common/Layout'
import ProductReviews from '../components/reviews/ProductReviews'
import StarRating from '../components/common/StarRating'
import './ProductInfoPage.css'

function ProductInfoPage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()

	const productId = Number(id)
	const hasValidProductId = Number.isFinite(productId)

	const [product, setProduct] = useState<ProductDto | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [favorite, setFavorite] = useState(false)
	const [cartCount, setCartCount] = useState(0)
	const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null)

	// Load product
	useEffect(() => {
		if (!hasValidProductId) return

		let mounted = true

		async function load() {
			setLoading(true)
			setError(null)

			try {
				const data = await fetchStoreProductById(productId)
				if (!mounted) return

				setProduct(data)
				setFailedImageSrc(null)
			} catch (err) {
				if (!mounted) return
				setError(getProductApiErrorMessage(err, 'Failed to load product info.'))
			} finally {
				if (mounted) setLoading(false)
			}
		}

		void load()
		return () => {
			mounted = false
		}
	}, [productId, hasValidProductId])

	// Load cart count
	useEffect(() => {
		if (!user || !hasValidProductId) {
			// Resets the cart badge when there's no logged-in user / no valid product.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setCartCount(0)
			return
		}

		async function loadCart() {
			try {
				const cart = await fetchCart()
				const item = cart.items.find(i => i.productId === productId)
				setCartCount(item?.quantity ?? 0)
			} catch {
				setCartCount(0)
			}
		}

		void loadCart()
	}, [user, productId, hasValidProductId])

	const primaryImageSrc = useMemo(() => buildBackendImageUrl(product?.imagePath), [product?.imagePath])
	const fallbackImageSrc = useMemo(() => buildBackendImageUrl(null), [])
	const imageSrc = failedImageSrc === primaryImageSrc ? fallbackImageSrc : primaryImageSrc

	const descriptionParagraphs = useMemo(
		() =>
			String(product?.description ?? '')
				.replace(/\\n/g, '\n')
				.split(/\n\s*\n+/)
				.map((p) => p.trim())
				.filter(Boolean),
		[product?.description],
	)

	if (!hasValidProductId) {
		return (
			<Layout isStorefront>
				<div className="pi-empty">
					<div className="pi-error">Product not found.</div>
				</div>
			</Layout>
		)
	}

	if (loading) {
		return (
			<Layout isStorefront>
				<div className="pi-empty">
					<div className="pi-loading">Loading product...</div>
				</div>
			</Layout>
		)
	}

	if (error || !product) {
		return (
			<Layout isStorefront>
				<div className="pi-empty">
					<div className="pi-error">{error ?? 'Product not found.'}</div>
				</div>
			</Layout>
		)
	}

	const currentProduct = product
	const stockCount = Number(currentProduct.stock ?? 0)
	const isOutOfStock = !Number.isFinite(stockCount) || stockCount <= 0
	const isInCart = cartCount > 0

	async function handleAddToCart() {
		if (!user) {
			navigate('/auth?tab=login')
			return
		}
		if (isOutOfStock) return

		try {
			const updated = await addProductToCart(currentProduct.id)
			const item = updated.items.find(i => i.productId === currentProduct.id)
			setCartCount(item?.quantity ?? 0)
		} catch {
			/* no-op */
		}
	}

	async function handleRemoveFromCart() {
		if (!user) {
			navigate('/auth?tab=login')
			return
		}

		try {
			const updated = await removeFromCart(currentProduct.id)
			const item = updated.items.find(i => i.productId === currentProduct.id)
			setCartCount(item?.quantity ?? 0)
		} catch {
			setCartCount(0)
		}
	}

	return (
		<Layout isStorefront>
			<div className="pi-main">
				<div className="pi-container">

					<Link to="/products" className="pi-back">
						<span aria-hidden>←</span> Back to Products
					</Link>

					<div className="pi-content">

						{/* IMAGE */}
						<div className="pi-image-shell">
							<img
								src={imageSrc}
								alt={currentProduct.name}
								key={primaryImageSrc}
								className="pi-image"
								onError={() => {
									if (imageSrc !== fallbackImageSrc) setFailedImageSrc(primaryImageSrc)
								}}
							/>
						</div>

						{/* DETAILS */}
						<div className="pi-details">

							<div className="pi-title-row">
								<h2 className="pi-title">{currentProduct.name}</h2>

								<button
									type="button"
									className={`pi-favorite ${favorite ? 'pi-favorite--active' : ''}`}
									onClick={() => setFavorite(v => !v)}
								>
									{favorite ? '♥' : '♡'}
								</button>
							</div>

							<div className="pi-price-row">
								<div className="pi-price">${Number(currentProduct.price).toFixed(2)}</div>

								<div className={`pi-stock ${isOutOfStock ? 'pi-stock--out' : 'pi-stock--in'}`}>
									{isOutOfStock ? 'Out of stock' : 'In stock'}
								</div>

								<div className="pi-save">{favorite ? 'Saved to favorites' : 'Save for later'}</div>
							</div>

							<div className="pi-meta">
								<div>Brand: <span>{currentProduct.brand || '—'}</span></div>
								<div>Department: <span>{currentProduct.departmentName || '—'}</span></div>
								<div>Category: <span>{currentProduct.categoryName || '—'}</span></div>

								<div className="pi-rating">
									Rating:
									<span className="pi-rating-value">{Number(currentProduct.rating || 0).toFixed(1)}</span>
									<StarRating
										rating={Number(currentProduct.rating || 0)}
										wrapperClassName="pi-stars"
										getStarClassName={(filled) => (filled ? 'pi-star--filled' : 'pi-star')}
									/>
								</div>
							</div>

							<div className="pi-description">
								{(descriptionParagraphs.length > 0 ? descriptionParagraphs : ['No description available.'])
									.map((p, i) => (
										<p key={i}>{p}</p>
									))}
							</div>

							{isInCart ? (
								<button className="pi-remove-btn" onClick={handleRemoveFromCart}>
									Remove from Cart{cartCount > 1 ? ` (${cartCount})` : ''}
								</button>
							) : (
								<button
									className={`pi-add-btn ${isOutOfStock ? 'pi-add-btn--disabled' : ''}`}
									disabled={isOutOfStock}
									onClick={handleAddToCart}
								>
									{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
								</button>
							)}

						</div>
					</div>
				</div>

				<ProductReviews productId={currentProduct.id} />
			</div>
		</Layout>
	)
}

export default ProductInfoPage
