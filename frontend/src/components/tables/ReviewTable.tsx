import { useState } from "react"
import Table from "../tables/Table"
import AdminButton from "../admin/AdminButton"
import type { ReviewRecord } from "../../types/store"
import "./ReviewTable.css"

interface ReviewTableProps {
    items: ReviewRecord[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

function Stars({ rating }: { rating: number }) {
    const filled = Math.round(rating)
    return (
        <span className="rf-review-stars" aria-label={`${filled} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < filled ? "rf-review-star rf-review-star--on" : "rf-review-star"}>
                    {i < filled ? "★" : "☆"}
                </span>
            ))}
        </span>
    )
}

function formatDate(dt: string) {
    if (!dt) return ""
    const d = new Date(dt)
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

interface ProductThumbProps {
    imagePath: string | null
    name: string
}

function ProductThumb({ imagePath, name }: ProductThumbProps) {
    const [err, setErr] = useState(false)

    if (!imagePath || err) {
        return (
            <div className="rf-review-thumb rf-review-thumb--placeholder" aria-label="No image">
                ?
            </div>
        )
    }

    return (
        <img
            src={`${apiBaseUrl}${imagePath}`}
            alt={name}
            className="rf-review-thumb"
            onError={() => setErr(true)}
        />
    )
}

function ReviewTable({ items, onEdit, onDelete }: ReviewTableProps) {
    return (
        <Table
            items={items}
            renderItem={(review) => (
                <div className="rf-review-card">
                    <div className="rf-review-top">
                        <ProductThumb imagePath={review.productImagePath} name={review.productName} />
                        <div className="rf-review-product-name">{review.productName}</div>
                        <div className="rf-review-date">{formatDate(review.updated_at)}</div>
                    </div>

                    <div className="rf-review-user-row">
                        <span className="rf-review-user-icon">👤</span>
                        <span className="rf-review-user-email">User: {review.userEmail}</span>
                        <Stars rating={review.rating} />
                    </div>

                    <div className="rf-review-comment">
                        {review.comment || <em>No comment</em>}
                    </div>

                    <div className="rf-review-actions">
                        <AdminButton variant="pill" icon="edit" onClick={() => onEdit(review.id)}>
                            Edit
                        </AdminButton>
                        <AdminButton variant="danger" icon="delete" onClick={() => onDelete(review.id)}>
                            Delete
                        </AdminButton>
                    </div>
                </div>
            )}
        />
    )
}

export default ReviewTable