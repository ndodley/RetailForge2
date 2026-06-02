import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addProductToCart, getCartItemQuantity, removeProductFromCart, subscribeToCartUpdates } from '../api/cartStore'
import { getApiErrorMessage } from '../api/departments'
import { buildBackendImageUrl, fetchStoreProductById, type StoreProductDto } from '../api/products'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'

function ProductInfoPage() {
  const { id } = useParams()
  const productId = Number(id)
  const hasValidProductId = Number.isFinite(productId)
  const [product, setProduct] = useState<StoreProductDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favorite, setFavorite] = useState(false)
  const [cartCount, setCartCount] = useState(() => (hasValidProductId ? getCartItemQuantity(productId) : 0))
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null)

  useEffect(() => {
	if (!hasValidProductId) {
      return
    }

    let isMounted = true

    async function loadProduct() {
      setLoading(true)
      setError(null)

      try {
        const productData = await fetchStoreProductById(productId)

        if (!isMounted) {
          return
        }

        setProduct(productData)
        setFailedImageSrc(null)
        setCartCount(getCartItemQuantity(productId))
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(getApiErrorMessage(loadError, 'Failed to load product info.'))
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      isMounted = false
    }
  }, [hasValidProductId, productId])

  useEffect(() => {
	if (!hasValidProductId) {
      return
    }

    return subscribeToCartUpdates(() => setCartCount(getCartItemQuantity(productId)))
  }, [hasValidProductId, productId])

  const primaryImageSrc = useMemo(() => buildBackendImageUrl(product?.imagePath), [product?.imagePath])
  const fallbackImageSrc = useMemo(() => buildBackendImageUrl(null), [])
  const imageSrc = failedImageSrc === primaryImageSrc ? fallbackImageSrc : primaryImageSrc

  const descriptionParagraphs = useMemo(
    () =>
      String(product?.description ?? '')
        .replace(/\\n/g, '\n')
        .split(/\n\s*\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [product?.description],
  )

  if (!hasValidProductId) {
	return (
	  <>
		<Navbar />
		<main style={{ minHeight: '100vh', background: 'var(--app-bg)', display: 'grid', placeItems: 'center', padding: '2rem 1rem' }}>
		  <div style={{ color: '#ef4444', fontWeight: 800 }}>Product not found.</div>
		</main>
		<Footer />
	  </>
	)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: 'var(--app-bg)', display: 'grid', placeItems: 'center' }}>
          <div style={{ color: 'var(--muted-2)', fontWeight: 800 }}>Loading product...</div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: 'var(--app-bg)', display: 'grid', placeItems: 'center', padding: '2rem 1rem' }}>
          <div style={{ color: '#ef4444', fontWeight: 800 }}>{error ?? 'Product not found.'}</div>
        </main>
        <Footer />
      </>
    )
  }

  const currentProduct = product
  const stockCount = Number(currentProduct.stock ?? 0)
  const isOutOfStock = !Number.isFinite(stockCount) || stockCount <= 0
  const isInCart = cartCount > 0

  function handleAddToCart() {
    if (isOutOfStock) {
      return
    }

	setCartCount(addProductToCart(currentProduct, 1))
  }

  function handleRemoveFromCart() {
	removeProductFromCart(currentProduct.id)
    setCartCount(0)
  }

  return (
	<>
	  <Navbar />
	  <main
		style={{
		  minHeight: '100vh',
		  background: 'var(--app-bg)',
		  padding: 0,
		  fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
		  color: 'var(--text)',
		}}
	  >
		<div
		  style={{
			maxWidth: 1240,
			margin: '2.5rem auto',
			padding: '2.25rem 1.25rem',
			background: 'var(--surface-2)',
			borderRadius: 22,
			boxShadow: 'var(--shadow)',
			border: '1px solid var(--border)',
		  }}
		>
		  <Link
			to="/products"
			style={{
			  textDecoration: 'none',
			  color: 'var(--text)',
			  fontWeight: 900,
			  fontSize: 14,
			  display: 'inline-flex',
			  alignItems: 'center',
			  gap: 10,
			  marginBottom: 10,
			  letterSpacing: 0.2,
			  padding: '10px 12px',
			  borderRadius: 12,
			  background: 'var(--nav-pill-bg)',
			  border: '1px solid var(--border)',
			  boxShadow: 'var(--shadow)',
			}}
		  >
			<span aria-hidden="true">←</span>
			Back to Products
		  </Link>

		  <div
			style={{
			  marginTop: 18,
			  display: 'flex',
			  flexWrap: 'wrap',
			  gap: 34,
			  background: 'var(--surface-3)',
			  borderRadius: 18,
			  boxShadow: 'var(--shadow)',
			  padding: 34,
			  alignItems: 'flex-start',
			  border: '1px solid var(--border)',
			}}
		  >
			<div
			  style={{
				width: 'min(360px, 100%)',
				height: 'min(520px, 80vw)',
				borderRadius: 14,
				boxShadow: 'var(--shadow)',
				background: 'var(--surface-2)',
				display: 'grid',
				placeItems: 'center',
				border: '1.5px solid var(--border)',
				overflow: 'hidden',
				padding: 26,
				boxSizing: 'border-box',
			  }}
			>
			  <img
				src={imageSrc}
				alt={currentProduct.name}
				key={primaryImageSrc}
				style={{
				  width: '100%',
				  height: '100%',
				  objectFit: 'contain',
				  objectPosition: 'center center',
				  display: 'block',
				}}
				onError={() => {
				  if (imageSrc !== fallbackImageSrc) {
					setFailedImageSrc(primaryImageSrc)
				  }
				}}
			  />
			</div>

			<div style={{ flex: 1, minWidth: 240 }}>
			  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
				<h2
				  style={{
					fontSize: '2.1rem',
					margin: 0,
					fontWeight: 900,
					letterSpacing: 0.2,
					lineHeight: 1.15,
					color: 'var(--text)',
					flex: '1 1 auto',
				  }}
				>
				  {currentProduct.name}
				</h2>

				<button
				  type="button"
				  onClick={() => setFavorite((currentValue) => !currentValue)}
				  title={favorite ? 'Remove from favorites' : 'Add to favorites'}
				  aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
				  style={{
					width: 44,
					height: 44,
					borderRadius: 999,
					border: favorite ? '1.5px solid rgba(255,152,0,0.55)' : '1.5px solid var(--border)',
					background: favorite ? 'rgba(255,152,0,0.16)' : 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
					color: favorite ? 'var(--accent)' : 'var(--muted-2)',
					cursor: 'pointer',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 20,
					fontWeight: 900,
					boxShadow: 'var(--shadow)',
					flex: '0 0 auto',
				  }}
				>
				  {favorite ? '★' : '☆'}
				</button>
			  </div>

			  <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
				<div style={{ fontSize: '1.6rem', color: 'var(--success)', fontWeight: 900, letterSpacing: 0.2 }}>
				  ${Number(currentProduct.price).toFixed(2)}
				</div>
				<div
				  style={{
					fontSize: 12,
					fontWeight: 900,
					letterSpacing: 0.4,
					textTransform: 'uppercase',
					padding: '6px 10px',
					borderRadius: 999,
					border: '1px solid var(--border)',
					background: isOutOfStock
					  ? 'color-mix(in srgb, var(--accent) 18%, var(--surface-2))'
					  : 'var(--success-soft)',
					color: isOutOfStock ? 'var(--accent)' : 'var(--success)',
				  }}
				>
				  {isOutOfStock ? 'Out of stock' : 'In stock'}
				</div>
				<div style={{ fontSize: 13, color: 'var(--muted-2)', fontWeight: 700 }}>
				  {favorite ? 'Saved to favorites' : 'Save for later'}
				</div>
			  </div>

			  <div style={{ marginTop: 10, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
				<div style={{ fontSize: 13, color: 'var(--muted-2)', fontWeight: 800 }}>
				  Brand: <span style={{ color: 'var(--text)', fontWeight: 900 }}>{currentProduct.brand || '—'}</span>
				</div>
				<div style={{ fontSize: 13, color: 'var(--muted-2)', fontWeight: 800 }}>
				  Department: <span style={{ color: 'var(--text)', fontWeight: 900 }}>{currentProduct.departmentName || '—'}</span>
				</div>
				<div style={{ fontSize: 13, color: 'var(--muted-2)', fontWeight: 800 }}>
				  Category: <span style={{ color: 'var(--text)', fontWeight: 900 }}>{currentProduct.categoryName || '—'}</span>
				</div>
				<div style={{ fontSize: 13, color: 'var(--muted-2)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
				  Rating:
				  <span style={{ color: 'var(--text)', fontWeight: 900 }}>{Number(currentProduct.rating || 0).toFixed(1)}</span>
				  <span aria-hidden style={{ display: 'inline-flex', gap: 2, transform: 'translateY(-0.5px)' }}>
					{Array.from({ length: 5 }).map((_, index) => {
					  const filled = index < Math.round(Number(currentProduct.rating || 0))
					  return (
						<span
						  key={index}
						  style={{
							fontSize: 14,
							lineHeight: 1,
							color: filled ? 'var(--accent)' : 'var(--muted-2)',
							fontWeight: 900,
						  }}
						>
						  {filled ? '★' : '☆'}
						</span>
					  )
					})}
				  </span>
				</div>
			  </div>

			  <div style={{ marginTop: 14, marginBottom: 22 }}>
				{(descriptionParagraphs.length > 0 ? descriptionParagraphs : ['No description available.']).map((paragraph, index) => (
				  <p
					key={`${index}-${paragraph.slice(0, 24)}`}
					style={{
					  fontSize: '1.08rem',
					  color: 'var(--muted)',
					  margin: 0,
					  marginTop: index === 0 ? 0 : 16,
					  lineHeight: 1.7,
					  whiteSpace: 'pre-line',
					}}
				  >
					{paragraph}
				  </p>
				))}
			  </div>

			  {isInCart ? (
				<button
				  type="button"
				  style={{
					padding: '0.8rem 2.2rem',
					background: 'var(--danger-soft)',
					color: 'var(--text)',
					border: '1px solid var(--border)',
					borderRadius: 10,
					fontSize: '1.08rem',
					fontWeight: 600,
					cursor: 'pointer',
					boxShadow: 'var(--shadow)',
					marginBottom: 8,
					width: '100%',
				  }}
				  onClick={handleRemoveFromCart}
				>
				  Remove from Cart{cartCount > 1 ? ` (${cartCount})` : ''}
				</button>
			  ) : (
				<button
				  type="button"
				  disabled={isOutOfStock}
				  style={{
					padding: '0.8rem 2.2rem',
					background: isOutOfStock ? 'rgba(148,163,184,0.28)' : 'var(--link)',
					color: isOutOfStock ? 'var(--muted)' : 'var(--surface-2)',
					border: '1px solid var(--border)',
					borderRadius: 10,
					fontSize: '1.08rem',
					fontWeight: 600,
					cursor: isOutOfStock ? 'not-allowed' : 'pointer',
					boxShadow: 'var(--shadow)',
					marginBottom: 8,
					width: '100%',
				  }}
				  onClick={handleAddToCart}
				  title={isOutOfStock ? 'This product is currently out of stock.' : undefined}
				>
				  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
				</button>
			  )}
			</div>
		  </div>
		</div>
	  </main>
	  <Footer />
	</>
  )
}

export default ProductInfoPage

