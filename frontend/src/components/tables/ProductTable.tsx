import { useState } from "react"
import Table from "../tables/Table"
import AdminButton from "../admin/AdminButton"
import type { ProductRecord } from "../../types/store"
import "./ProductTable.css"

interface ProductTableProps {
	items: ProductRecord[]
	onEdit: (id: number) => void
	onDelete: (id: number) => void
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
				className="rf-product-img-placeholder"
				aria-label="No product image available"
			>
				No image
			</div>
		)
	}

	return (
		<img
			src={`${apiBaseUrl}${imagePath}`}
			alt={name}
			className="rf-product-img"
			onError={() => setHasLoadError(true)}
		/>
	)
}

function ProductTable({ items, onEdit, onDelete }: ProductTableProps) {
	return (
		<Table
			items={items}
			renderItem={(product) => (
				<div className="rf-product-card">
					<div className="rf-product-header">
						<div className="rf-product-title">{product.name}</div>
						<ProductImage imagePath={product.imagePath} name={product.name} />
					</div>

					<div className="rf-product-meta">
						Brand: <strong>{product.brand || '—'}</strong>
					</div>
					<div className="rf-product-meta">
						Category: <strong>{product.categoryName || 'Unassigned'}</strong>
					</div>
					<div className="rf-product-meta">
						Rating: <strong>{product.rating.toFixed(1)}</strong>
					</div>
					<div className="rf-product-meta">
						Price: <strong>${product.price.toFixed(2)}</strong>
					</div>
					<div className="rf-product-meta">
						Stock: <strong>{product.stock}</strong>
					</div>

					<div className="rf-product-actions">
						<AdminButton
							variant="pill"
							icon="edit"
							onClick={() => onEdit(product.id)}
						>
							Edit
						</AdminButton>
						<AdminButton
							variant="danger"
							icon="delete"
							onClick={() => onDelete(product.id)}
						>
							Delete
						</AdminButton>
					</div>
				</div>
			)}
		/>
	)
}

export default ProductTable