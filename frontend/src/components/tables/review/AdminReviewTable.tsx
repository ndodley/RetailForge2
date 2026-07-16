import { useState } from "react"
import Table from "../Table.tsx"
import AdminButton from "../../admin/AdminButton.tsx"
import type { ReviewRecord } from "../../../types/store.ts"
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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
const DEFAULT_AVATAR = `${apiBaseUrl}/images/other_images/default_avatar.jpg`

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

interface UserAvatarProps {
    avatarPath: string | null | undefined
    name: string
}

function UserAvatar({ avatarPath, name }: UserAvatarProps) {
    const [err, setErr] = useState(false)
    const src = avatarPath && !err ? `${apiBaseUrl}${avatarPath}` : DEFAULT_AVATAR

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
                            <ProductThumb imagePath={review.productImagePath} name={review.productName} />
                            <div className="rf-review-product-name">{review.productName}</div>
                            <div className="rf-review-date">{formatDate(review.updated_at)}</div>
                        </div>

                        <div className="rf-review-user-row">
                            <UserAvatar avatarPath={avatarPath} name={review.userEmail} />
                            <div className="rf-review-user-info">
                                <Stars rating={review.rating} />
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