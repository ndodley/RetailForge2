import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
    fetchReviewsByProduct,
    createReview,
    updateReview,
    deleteReview,
    getReviewApiErrorMessage,
    type ReviewDto,
} from '../api/reviews'
import './ProductReviews.css'

interface ProductReviewsProps {
    productId: number
}

const RATING_OPTIONS = [5, 4, 3, 2, 1]
const COMMENT_PREVIEW_LENGTH = 120

function StarRating({ rating }: { rating: number }) {
    return (
        <span className="pr-stars" aria-hidden>
			{Array.from({ length: 5 }).map((_, idx) => (
                <span key={idx} className={idx < rating ? 'pr-star pr-star--filled' : 'pr-star'}>
					{idx < rating ? '★' : '☆'}
				</span>
            ))}
		</span>
    )
}

function ProductReviews({ productId }: ProductReviewsProps) {
    const { user } = useAuth()

    const [reviews, setReviews] = useState<ReviewDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [newRating, setNewRating] = useState(5)
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const [editReviewId, setEditReviewId] = useState<number | null>(null)
    const [editRating, setEditRating] = useState(5)
    const [editComment, setEditComment] = useState('')

    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})

    useEffect(() => {
        let active = true

        async function load() {
            setLoading(true)
            setError('')
            try {
                const data = await fetchReviewsByProduct(productId)
                if (active) setReviews(data)
            } catch (err) {
                if (active) setError(getReviewApiErrorMessage(err, 'Failed to load reviews.'))
            } finally {
                if (active) setLoading(false)
            }
        }

        void load()
        return () => {
            active = false
        }
    }, [productId])

    async function refreshReviews() {
        try {
            const data = await fetchReviewsByProduct(productId)
            setReviews(data)
        } catch {
            /* keep the existing list on a refresh failure */
        }
    }

    async function handleSubmitReview(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!user) return

        setSubmitting(true)
        setSuccessMessage('')
        setError('')

        try {
            await createReview({
                productId,
                userId: user.id,
                rating: newRating,
                comment: newComment,
            })
            setNewRating(5)
            setNewComment('')
            setSuccessMessage('Review submitted!')
            await refreshReviews()
        } catch (err) {
            setError(getReviewApiErrorMessage(err, 'Failed to submit review.'))
        } finally {
            setSubmitting(false)
        }
    }

    function handleEditReview(review: ReviewDto) {
        setEditReviewId(review.id)
        setEditRating(review.rating)
        setEditComment(review.comment)
    }

    async function handleUpdateReview(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!user || editReviewId == null) return

        try {
            await updateReview(editReviewId, {
                productId,
                userId: user.id,
                rating: editRating,
                comment: editComment,
            })
            setEditReviewId(null)
            await refreshReviews()
        } catch (err) {
            setError(getReviewApiErrorMessage(err, 'Failed to update review.'))
        }
    }

    async function handleDeleteReview(id: number) {
        if (!user) return
        if (!window.confirm('Delete this review?')) return

        try {
            await deleteReview(id)
            setReviews((prev) => prev.filter((r) => r.id !== id))
        } catch (err) {
            setError(getReviewApiErrorMessage(err, 'Failed to delete review.'))
        }
    }

    function toggleExpandComment(id: number) {
        setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const showActionsColumn = Boolean(user)

    return (
        <div className="pr-section">
            <h3 className="pr-title">Product Reviews</h3>

            {loading ? (
                <div className="pr-loading">Loading reviews...</div>
            ) : error ? (
                <div className="pr-error">{error}</div>
            ) : (
                <div className="pr-table-wrapper">
                    <table className="pr-table">
                        <thead>
                        <tr>
                            <th>User</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Date</th>
                            {showActionsColumn && <th>Actions</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {reviews.length === 0 ? (
                            <tr>
                                <td colSpan={showActionsColumn ? 5 : 4} className="pr-empty-row">
                                    No reviews yet. Be the first to review!
                                </td>
                            </tr>
                        ) : (
                            reviews.map((review) => {
                                const isOwnReview = user?.id === review.userId
                                const isExpanded = Boolean(expandedComments[review.id])
                                const comment = review.comment ?? ''
                                const isLong = comment.length > COMMENT_PREVIEW_LENGTH

                                return (
                                    <tr key={review.id}>
                                        <td className="pr-user-cell">{review.userEmail}</td>
                                        <td>
                                            <StarRating rating={review.rating} />
                                        </td>
                                        <td className="pr-comment-cell">
                                            {editReviewId === review.id ? (
                                                <form onSubmit={handleUpdateReview} className="pr-edit-form">
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
                                                        <button
                                                            type="button"
                                                            className="pr-btn pr-btn--cancel"
                                                            onClick={() => setEditReviewId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    {isExpanded || !isLong
                                                        ? comment
                                                        : `${comment.slice(0, COMMENT_PREVIEW_LENGTH)}...`}
                                                    {isLong && (
                                                        <div className="pr-show-more-row">
                                                            <button
                                                                type="button"
                                                                className="pr-show-more"
                                                                onClick={() => toggleExpandComment(review.id)}
                                                            >
                                                                {isExpanded ? 'Show less' : 'Show more'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="pr-date-cell">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </td>
                                        {showActionsColumn && (
                                            <td className="pr-actions-cell">
                                                {isOwnReview && editReviewId !== review.id && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            title="Edit Review"
                                                            className="pr-icon-btn pr-icon-btn--edit"
                                                            onClick={() => handleEditReview(review)}
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Delete Review"
                                                            className="pr-icon-btn pr-icon-btn--delete"
                                                            onClick={() => handleDeleteReview(review.id)}
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                )
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="pr-add-review">
                <h4 className="pr-add-review-title">Leave a Review</h4>
                {user ? (
                    <form onSubmit={handleSubmitReview} className="pr-review-form">
                        <label className="pr-form-label pr-form-label--inline">
                            <span>Rating</span>
                            <select
                                value={newRating}
                                onChange={(e) => setNewRating(Number(e.target.value))}
                                className="pr-select"
                            >
                                {RATING_OPTIONS.map((n) => (
                                    <option key={n} value={n}>
                                        {n} Star{n > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your review..."
                            rows={5}
                            required
                            className="pr-textarea"
                        />
                        <button type="submit" disabled={submitting} className="pr-submit-btn">
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                        {successMessage && <div className="pr-success">{successMessage}</div>}
                    </form>
                ) : (
                    <div className="pr-login-prompt">
                        You must{' '}
                        <Link to="/auth?tab=login" className="pr-login-link">
                            log in
                        </Link>{' '}
                        to leave a review.
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductReviews
