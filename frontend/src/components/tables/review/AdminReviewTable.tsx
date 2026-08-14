import { useState } from "react"
import { Link } from "react-router-dom"
import Table from "../Table.tsx"
import AdminButton from "../../admin/AdminButton.tsx"
import StarRating from "../../common/StarRating.tsx"
import type { ReviewRecord } from "../../../types/store.ts"
import { buildAvatarUrl } from "../../../api/users.ts"
import { buildBackendImageUrl } from "../../../api/products.ts"
import "./AdminReviewTable.css"

interface ReviewUser {
    id: number
    avatar_path: string | null
}

interface ReviewTableProps {
    items: ReviewRecord[]
    users: ReviewUser[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

function formatDate(dt: string) {
    if (!dt) return ""
    const d = new Date(dt)
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

interface ProductThumbProps {
    productId: number
    imagePath: string | null
    name: string
}

function ProductThumb({ productId, imagePath, name }: ProductThumbProps) {
    const [err, setErr] = useState(false)

    if (!imagePath || err) {
        return (
            <Link
                to={`/products/${productId}`}
                className="rf-review-thumb rf-review-thumb--placeholder"
                aria-label={`View ${name}`}
                title={`View ${name}`}
            >
                ?
            </Link>
        )
    }

    return (
        <Link to={`/products/${productId}`} className="rf-review-thumb-link" aria-label={`View ${name}`} title={`View ${name}`}>
            <img
                src={buildBackendImageUrl(imagePath)}
                alt={name}
                className="rf-review-thumb"
                onError={() => setErr(true)}
            />
        </Link>
    )
}

interface UserAvatarProps {
    avatarPath: string | null | undefined
    name: string
}

function UserAvatar({ avatarPath, name }: UserAvatarProps) {
    const [err, setErr] = useState(false)
    const src = buildAvatarUrl(err ? null : avatarPath)

    return (
        <img
            src={src}
            alt={name}
            className="rf-review-user-avatar"
            onError={() => setErr(true)}
        />
    )
}

function AdminReviewTable({ items, users, onEdit, onDelete }: ReviewTableProps) {
    return (
        <Table
            items={items}
            renderItem={(review) => {
                const avatarPath = users.find((u) => u.id === review.userId)?.avatar_path

                return (
                    <div className="rf-review-card">
                        <div className="rf-review-top">
                            <ProductThumb productId={review.productId} imagePath={review.productImagePath} name={review.productName} />
                            <div className="rf-review-product-name">{review.productName}</div>
                            <div className="rf-review-date">{formatDate(review.updated_at)}</div>
                        </div>

                        <div className="rf-review-user-row">
                            <UserAvatar avatarPath={avatarPath} name={review.userEmail} />
                            <div className="rf-review-user-info">
                                <StarRating
                                    rating={review.rating}
                                    wrapperClassName="rf-review-stars"
                                    wrapperAriaLabel={`${Math.round(review.rating)} out of 5 stars`}
                                    getStarClassName={(filled) =>
                                        filled ? "rf-review-star rf-review-star--on" : "rf-review-star"
                                    }
                                />
                                <span className="rf-review-user-email" title={review.userEmail}>
                                    {review.userEmail}
                                </span>
                            </div>
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
                )
            }}
        />
    )
}

export default AdminReviewTable