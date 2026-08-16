import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildBackendImageUrl, fetchStoreProducts, getProductApiErrorMessage, type ProductDto } from '../../api/products.ts'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'
import StarRating from './StarRating'
import './HomeProductShowcase.css'

const SHOWCASE_LIMIT = 14

/**
 * Picks a diverse spread of products for the homepage showcase instead of
 * just taking the first N in API order (which tends to be dominated by
 * whichever department happens to have the most inventory). Round-robins
 * across departments so every department gets fair representation.
 */
function pickDiverseProducts(products: ProductDto[], limit: number): ProductDto[] {
  const buckets = new Map<string, ProductDto[]>()
  const departmentOrder: string[] = []

  for (const product of products) {
    const key = product.departmentName?.trim() || 'Other'
    if (!buckets.has(key)) {
      buckets.set(key, [])
      departmentOrder.push(key)
    }
    buckets.get(key)!.push(product)
  }

  const result: ProductDto[] = []
  let round = 0

  while (result.length < limit && result.length < products.length) {
    let addedThisRound = false

    for (const key of departmentOrder) {
      if (result.length >= limit) {
        break
      }

      const bucket = buckets.get(key)!
      if (bucket.length > round) {
        result.push(bucket[round])
        addedThisRound = true
      }
    }

    if (!addedThisRound) {
      break
    }

    round += 1
  }

  return result
}

function HomeProductShowcase() {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [products, setProducts] = useState<ProductDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      setLoading(true)
      setError(null)

      try {
        const productData = await fetchStoreProducts()

        if (!isMounted) {
          return
        }

        setProducts(pickDiverseProducts(productData, SHOWCASE_LIMIT))
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(getProductApiErrorMessage(loadError, 'Failed to load products.'))
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const items = useMemo(() => products, [products])

  function scrollByAmount(direction: number) {
    const element = scrollerRef.current
    if (!element) {
      return
    }

    const cardWidth = 336
    const amount = Math.max(cardWidth + 14, Math.floor(element.clientWidth * 0.85))
    element.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  if (loading) {
    return <div className="home-showcase__empty">Loading products...</div>
  }

  if (error) {
    return <div className="home-showcase__empty">{error}</div>
  }

  if (!items.length) {
    return <div className="home-showcase__empty">No products to show.</div>
  }

  return (
    <div className="home-showcase">
      <div className="home-showcase__header">
        <div>
          <div className="home-showcase__heading">Trending across the store</div>
          <div className="home-showcase__subheading">A mix of top picks from every department</div>
        </div>
      </div>

      <div className="home-showcase__rail">
        <button
          type="button"
          aria-label="Scroll products left"
          className="home-showcase__nav home-showcase__nav--left"
          onClick={() => scrollByAmount(-1)}
        >
          ‹
        </button>

        <div className="home-showcase__scroller" ref={scrollerRef}>
        {items.map((product) => (
          <article
            key={product.id}
            role="link"
            tabIndex={0}
            aria-label={`View ${product.name}`}
            className="home-showcase__card"
            onClick={() => navigate(`/products/${product.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(`/products/${product.id}`)
              }
            }}
          >
            <div className="home-showcase__cardFrame">
              <button
                type="button"
                className={`home-showcase__favorite${isFavorite(product.id) ? ' home-showcase__favorite--active' : ''}`}
                onClick={(event) => {
                  event.stopPropagation()
                  if (!user) {
                    navigate('/auth?tab=login')
                    return
                  }
                  void toggleFavorite(product.id)
                }}
                title={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite(product.id) ? '♥' : '♡'}
              </button>

              <div className="home-showcase__imageWrap">
                <div className="home-showcase__imageFrame">
                  <img
                    src={buildBackendImageUrl(product.imagePath)}
                    alt={product.name}
                    className="home-showcase__productImage"
                    onError={(event) => {
                      event.currentTarget.src = buildBackendImageUrl(null)
                    }}
                  />
                </div>
              </div>

              <div className="home-showcase__content">
                <div className="home-showcase__title">{product.name}</div>

                {(product.departmentName || product.categoryName) && (
                  <span className="home-showcase__badge">
                    {product.departmentName || product.categoryName}
                  </span>
                )}

                <div className="home-showcase__ratingRow">
                  <StarRating rating={Number(product.rating ?? 0)} wrapperClassName="home-showcase__stars" />
                  <span className="home-showcase__ratingValue">{Number(product.rating ?? 0).toFixed(1)}</span>
                  <span className="home-showcase__price">${Number(product.price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
        </div>

        <button
          type="button"
          aria-label="Scroll products right"
          className="home-showcase__nav home-showcase__nav--right"
          onClick={() => scrollByAmount(1)}
        >
          ›
        </button>
      </div>
    </div>
  )
}

export default HomeProductShowcase


