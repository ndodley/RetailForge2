import { useState } from 'react'

interface ProductRecord {
  id: number
  name: string
  brand: string | null
  rating: number
  price: number
  description: string
  stock: number
  imagePath: string | null
  categoryId: number | null
  categoryName: string | null
  departmentId: number | null
  departmentName: string | null
}

interface ProductTableProps {
  products: ProductRecord[]
  onEdit: (productId: number) => void
  onDelete: (productId: number) => void
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

interface ProductImageProps {
  imagePath: string | null
  name: string
}

function ProductImage({ imagePath, name }: ProductImageProps) {
  const [hasLoadError, setHasLoadError] = useState(false)

  if (!imagePath || hasLoadError) {
	return (
	  <div
		className="product-grid-card__image"
		aria-label="No product image available"
		style={{
		  display: 'grid',
		  placeItems: 'center',
		  color: '#9bb3d9',
		  fontSize: '0.7rem',
		  textAlign: 'center',
		  padding: '0.25rem',
		}}
	  >
		No image
	  </div>
	)
  }

  return (
	<img
	  src={`${apiBaseUrl}${imagePath}`}
	  alt={name}
	  width="48"
	  height="48"
	  className="product-grid-card__image"
	  onError={() => setHasLoadError(true)}
	/>
  )
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
	return (
	  <div className="department-table__empty">
		<h3>No products found</h3>
		<p>Try a different search term or add a product from the editor tab.</p>
	  </div>
	)
  }

  return (
	<div className="admin-grid">
	  {products.map((product) => (
		<article key={product.id} className="admin-grid-card product-grid-card">
		  <div className="product-grid-card__header">
			<div className="admin-grid-title">{product.name}</div>
			<ProductImage imagePath={product.imagePath} name={product.name} />
		  </div>

		  <div className="admin-grid-meta">Brand: {product.brand || '—'}</div>
		  <div className="admin-grid-meta">Category: {product.categoryName || 'Unassigned'}</div>
		  <div className="admin-grid-meta">Rating: {product.rating.toFixed(1)}</div>
		  <div className="admin-grid-meta">Price: ${product.price.toFixed(2)}</div>
		  <div className="admin-grid-meta">Stock: {product.stock}</div>

		  <div className="admin-grid-actions admin-row-actions">
			<button type="button" className="admin-btn admin-btn--sm" onClick={() => onEdit(product.id)}>
			  <span className="admin-action-icon" aria-hidden="true">
				✎
			  </span>
			  Edit
			</button>
			<button
			  type="button"
			  className="admin-btn admin-btn--sm admin-btn--danger"
			  onClick={() => onDelete(product.id)}
			>
			  <span className="admin-action-icon" aria-hidden="true">
				✕
			  </span>
			  Delete
			</button>
		  </div>
		</article>
	  ))}
	</div>
  )
}

export default ProductTable

