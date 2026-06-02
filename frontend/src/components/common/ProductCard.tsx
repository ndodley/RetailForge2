import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addProductToCart, getCartItemQuantity, removeProductFromCart, subscribeToCartUpdates } from '../../api/cartStore'
import { buildBackendImageUrl, type StoreProductDto } from '../../api/products'
import './ProductCard.css'

interface ProductCardProps {
  product: StoreProductDto
}

function formatPrice(price: number) {
  return `$${Number(price).toFixed(2)}`
}

function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const [favorite, setFavorite] = useState(false)
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(() => getCartItemQuantity(product.id))

  const stockCount = Number(product.stock ?? 0)
  const isOutOfStock = !Number.isFinite(stockCount) || stockCount <= 0

  useEffect(() => subscribeToCartUpdates(() => setCartCount(getCartItemQuantity(product.id))), [product.id])

  const inCart = cartCount > 0
  const ratingText = useMemo(() => Number(product.rating ?? 0).toFixed(1), [product.rating])
  const primaryImageSrc = useMemo(() => buildBackendImageUrl(product.imagePath), [product.imagePath])
  const fallbackImageSrc = useMemo(() => buildBackendImageUrl(null), [])
  const imageSrc = failedImageSrc === primaryImageSrc ? fallbackImageSrc : primaryImageSrc

  function goToProduct() {
	navigate(`/products/${product.id}`)
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
	if (event.key === 'Enter' || event.key === ' ') {
	  event.preventDefault()
	  goToProduct()
	}
  }

  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
	event.stopPropagation()
	if (isOutOfStock) {
	  return
	}

	setCartCount(addProductToCart(product, 1))
  }

  function handleRemoveFromCart(event: React.MouseEvent<HTMLButtonElement>) {
	event.stopPropagation()
	removeProductFromCart(product.id)
	setCartCount(0)
  }

  return (
	<div
	  className="store-product-card"
	  role="link"
	  tabIndex={0}
	  aria-label={`View ${product.name}`}
	  onClick={goToProduct}
	  onKeyDown={handleCardKeyDown}
	>
	  <button
		type="button"
		className={`store-product-card__favorite${favorite ? ' store-product-card__favorite--active' : ''}`}
		onClick={(event) => {
		  event.stopPropagation()
		  setFavorite((currentValue) => !currentValue)
		}}
		title={favorite ? 'Remove from favorites' : 'Add to favorites'}
		aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
	  >
		{favorite ? '★' : '☆'}
	  </button>

	  <div className="store-product-card__image-shell">
		<img
		  src={imageSrc}
		  alt={product.name}
		  key={primaryImageSrc}
		  className="store-product-card__image"
		  onError={() => {
			if (imageSrc !== fallbackImageSrc) {
			  setFailedImageSrc(primaryImageSrc)
			}
		  }}
		/>
	  </div>

	  <div className="store-product-card__content">
		<div className="store-product-card__title">
		  {product.name}
		</div>

		<div className="store-product-card__price">
		  {formatPrice(product.price)}
		</div>
	  </div>

	  <div className="store-product-card__footer" onClick={(event) => event.stopPropagation()}>
		{inCart ? (
		  <button
			type="button"
			className="store-product-card__action store-product-card__action--remove"
			onClick={handleRemoveFromCart}
		  >
			Remove from cart{cartCount > 1 ? ` (${cartCount})` : ''}
		  </button>
		) : (
		  <button
			type="button"
			disabled={isOutOfStock}
			className={`store-product-card__action store-product-card__action--add${isOutOfStock ? ' store-product-card__action--disabled' : ''}`}
			onClick={handleAddToCart}
		  >
			{isOutOfStock ? 'Out of stock' : 'Add to cart'}
		  </button>
		)}

		<div className="store-product-card__meta">
		  <span>{product.categoryName ?? 'Uncategorized'}</span>
		  <span>★ {ratingText}</span>
		</div>
	  </div>
	</div>
  )
}

export default ProductCard


