import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductReviews } from '../../hooks/reviews/useProductReviews'
import { RATING_OPTIONS } from '../../api/reviews'
import ReviewRow from './ReviewRow'
import './ProductReviews.css'

interface ProductReviewsProps {
    productId: number
}

function ProductReviews({ productId }: ProductReviewsProps) {
    const { user, reviews, loading, error, submitting, successMessage, submitReview, editReview, removeReview } =
        useProductReviews(productId)

    const [newRating, setNewRating] = useState(5)
    const [newComment, setNewComment] = useState('')

    const showActionsColumn = Boolean(user)

    async function handleDelete(id: number) {
        if (window.confirm('Delete this review?')) {
            await removeReview(id)
        }
    }

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
                            reviews.map((review) => (
                                <ReviewRow
                                    key={review.id}
                                    review={review}
                                    isOwnReview={user?.id === review.userId}
                                    showActionsColumn={showActionsColumn}
                                    onSave={editReview}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="pr-add-review">
                <h4 className="pr-add-review-title">Leave a Review</h4>
                {user ? (
                    <form
                        className="pr-review-form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            void submitReview(newRating, newComment)
                            setNewComment('')
                        }}
                    >
                        <label className="pr-form-label pr-form-label--inline">
                            <span>Rating</span>
                            <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} className="pr-select">
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
