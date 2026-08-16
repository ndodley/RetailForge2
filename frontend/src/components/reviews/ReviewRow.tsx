import { useState } from 'react'
import { RATING_OPTIONS, COMMENT_PREVIEW_LENGTH, type ReviewDto } from '../../api/reviews'
import { buildAvatarUrl } from '../../api/users'
import StarRating from '../common/StarRating'
import './ProductReviews.css'

const DEFAULT_AVATAR = buildAvatarUrl(null)

interface ReviewRowProps {
    review: ReviewDto
    isOwnReview: boolean
    showActionsColumn: boolean
    onSave: (id: number, rating: number, comment: string) => void | Promise<void>
    onDelete: (id: number) => void | Promise<void>
}

function ReviewRow({ review, isOwnReview, showActionsColumn, onSave, onDelete }: ReviewRowProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editRating, setEditRating] = useState(review.rating)
    const [editComment, setEditComment] = useState(review.comment)
    const [isExpanded, setIsExpanded] = useState(false)

    const comment = review.comment ?? ''
    const isLong = comment.length > COMMENT_PREVIEW_LENGTH

    function startEditing() {
        setEditRating(review.rating)
        setEditComment(review.comment)
        setIsEditing(true)
    }

    return (
        <tr>
            <td className="pr-user-cell">
                <img
                    className="pr-user-avatar"
                    src={buildAvatarUrl(review.userAvatarPath)}
                    alt=""
                    aria-hidden
                    onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.onerror = null
                        img.src = DEFAULT_AVATAR
                    }}
                />
                <span className="pr-user-email">{review.userEmail}</span>
            </td>
            <td>
                <StarRating
                    rating={review.rating}
                    wrapperClassName="pr-stars"
                    getStarClassName={(filled) => (filled ? 'pr-star pr-star--filled' : 'pr-star')}
                />
            </td>
            <td className="pr-comment-cell">
                {isEditing ? (
                    <form
                        className="pr-edit-form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            setIsEditing(false)
                            void onSave(review.id, editRating, editComment)
                        }}
                    >
                        <label className="pr-form-label">Edit Comment</label>
                        <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={4}
                            required
                            className="pr-textarea"
                        />
                        <label className="pr-form-label">Edit Rating</label>
                        <select
                            value={editRating}
                            onChange={(e) => setEditRating(Number(e.target.value))}
                            className="pr-select"
                        >
                            {RATING_OPTIONS.map((n) => (
                                <option key={n} value={n}>
                                    {n} Star{n > 1 ? 's' : ''}
                                </option>
                            ))}
                        </select>
                        <div className="pr-edit-actions">
                            <button type="submit" className="pr-btn pr-btn--save">
                                Save
                            </button>
                            <button type="button" className="pr-btn pr-btn--cancel" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {isExpanded || !isLong ? comment : `${comment.slice(0, COMMENT_PREVIEW_LENGTH)}...`}
                        {isLong && (
                            <div className="pr-show-more-row">
                                <button type="button" className="pr-show-more" onClick={() => setIsExpanded((v) => !v)}>
                                    {isExpanded ? 'Show less' : 'Show more'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </td>
            <td className="pr-date-cell">{new Date(review.created_at).toLocaleDateString()}</td>
            {showActionsColumn && (
                <td className="pr-actions-cell">
                    {isOwnReview && !isEditing && (
                        <>
                            <button type="button" title="Edit Review" className="pr-icon-btn pr-icon-btn--edit" onClick={startEditing}>
                                ✎
                            </button>
                            <button
                                type="button"
                                title="Delete Review"
                                className="pr-icon-btn pr-icon-btn--delete"
                                onClick={() => onDelete(review.id)}
                            >
                                ✕
                            </button>
                        </>
                    )}
                </td>
            )}
        </tr>
    )
}

export default ReviewRow
