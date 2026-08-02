import { useState } from "react"
import { Link } from "react-router-dom"
import Table from "../Table.tsx"
import AdminButton from "../../admin/AdminButton.tsx"
import type { ProductRecord } from "../../../types/store.ts"
import "./AdminProductTable.css"

interface ProductTableProps {
	items: ProductRecord[]
	onEdit: (id: number) => void
	onDelete: (id: number) => void
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

interface ProductImageProps {
	productId: number
	imagePath: string | null
	name: string
}

function ProductImage({ productId, imagePath, name }: ProductImageProps) {
	const [hasLoadError, setHasLoadError] = useState(false)

	if (!imagePath || hasLoadError) {
		return (
			<Link
				to={`/products/${productId}`}
				className="rf-product-img-placeholder"
				aria-label={`View ${name}`}
				title={`View ${name}`}
			>
				No image
			</Link>
		)
	}

	return (
		<Link
			to={`/products/${productId}`}
			className="rf-product-img-link"
			aria-label={`View ${name}`}
			title={`View ${name}`}
		>
			<img
				src={`${apiBaseUrl}${imagePath}`}
				alt={name}
				className="rf-product-img"
				onError={() => setHasLoadError(true)}
			/>
		</Link>
	)
}

function AdminProductTable({ items, onEdit, onDelete }: ProductTableProps) {
	return (
		<Table
			items={items}
			renderItem={(product) => (
				<div className="rf-product-card">
					<ProductImage productId={product.id} imagePath={product.imagePath} name={product.name} />

					<div className="rf-product-body">
						<div className="rf-product-title">{product.name}</div>

						<div className="rf-product-meta-grid">
							<div className="rf-product-meta">
								<span className="rf-product-meta-label">Brand</span>
								<strong>{product.brand || '—'}</strong>
							</div>
							<div className="rf-product-meta">
								<span className="rf-product-meta-label">Category</span>
								<strong>{product.categoryName || 'Unassigned'}</strong>
							</div>
							<div className="rf-product-meta">
								<span className="rf-product-meta-label">Rating</span>
								<strong>{product.rating.toFixed(1)}</strong>
							</div>
							<div className="rf-product-meta">
								<span className="rf-product-meta-label">Price</span>
								<strong className="rf-product-meta-price">${product.price.toFixed(2)}</strong>
							</div>
							<div className="rf-product-meta">
								<span className="rf-product-meta-label">Stock</span>
								<strong>{product.stock}</strong>
							</div>
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
				</div>
			)}
		/>
	)
}

export default AdminProductTable