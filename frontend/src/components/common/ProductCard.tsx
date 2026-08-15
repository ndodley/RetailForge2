import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addProductToCart, removeFromCart, fetchCart } from '../../api/cart'
import { buildBackendImageUrl, type ProductDto } from '../../api/products'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'
import './ProductCard.css'

interface ProductCardProps {
	product: ProductDto
}

function formatPrice(price: number) {
	return `$${Number(price).toFixed(2)}`
}

function ProductCard({ product }: ProductCardProps) {
	const navigate = useNavigate()
	const { user } = useAuth()
	const { isFavorite, toggleFavorite } = useFavorites()

	const favorite = isFavorite(product.id)
	const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null)
	const [cartCount, setCartCount] = useState(0)

	const stockCount = Number(product.stock ?? 0)
	const isOutOfStock = !Number.isFinite(stockCount) || stockCount <= 0

	// ⭐ Load cart count from backend
	useEffect(() => {
		async function load() {
			if (!user) {
				setCartCount(0)
				return
			}
			try {
				const cart = await fetchCart()
				const item = cart.items.find(i => i.productId === product.id)
				setCartCount(item?.quantity ?? 0)
			} catch {
				setCartCount(0)
			}
		}
		load()
	}, [user, product.id])

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

	async function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
		event.stopPropagation()

		if (!user) {
			navigate('/auth?tab=login')
			return
		}

		if (isOutOfStock) return

		try {
			const updated = await addProductToCart(product.id)
			const item = updated.items.find(i => i.productId === product.id)
			setCartCount(item?.quantity ?? 0)
		} catch {
			// ignore errors
		}
	}

	async function handleRemoveFromCart(event: React.MouseEvent<HTMLButtonElement>) {
		event.stopPropagation()

		if (!user) {
			navigate('/auth?tab=login')
			return
		}

		try {
			const updated = await removeFromCart(product.id)
			const item = updated.items.find(i => i.productId === product.id)
			setCartCount(item?.quantity ?? 0)
		} catch {
			setCartCount(0)
		}
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
					if (!user) {
						navigate('/auth?tab=login')
						return
					}
					void toggleFavorite(product.id)
				}}
				title={favorite ? 'Remove from favorites' : 'Add to favorites'}
				aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
			>
				{favorite ? '♥' : '♡'}
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
