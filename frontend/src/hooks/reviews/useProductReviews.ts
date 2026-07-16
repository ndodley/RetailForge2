import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../useAuth'
import {
    fetchReviewsByProduct,
    createReview,
    updateReview,
    deleteReview,
    getReviewApiErrorMessage,
    type ReviewDto,
} from '../../api/reviews'

export function useProductReviews(productId: number) {
    const { user } = useAuth()

    const [reviews, setReviews] = useState<ReviewDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const loadReviews = useCallback(async () => {
        console.log("loadReviews called with productId: ", productId)
        try {
            const data = await fetchReviewsByProduct(productId)
            console.log("data: ", data)
            setReviews(data)
            return true
        } catch (err) {
            console.log("error: ", err)
            setError(getReviewApiErrorMessage(err, 'Failed to load reviews.'))
            return false
        }
    }, [productId])

    useEffect(() => {
        let active = true

        setLoading(true)
        setError('')
        void loadReviews().finally(() => {
            if (active) setLoading(false)
        })

        return () => {
            active = false
        }
    }, [loadReviews])

    async function submitReview(rating: number, comment: string) {
        if (!user) return

        setSubmitting(true)
        setSuccessMessage('')
        setError('')

        try {
            await createReview({ productId, userId: user.id, rating, comment })
            setSuccessMessage('Review submitted!')
            await loadReviews()
        } catch (err) {
            setError(getReviewApiErrorMessage(err, 'Failed to submit review.'))
        } finally {
            setSubmitting(false)
        }
    }

    async function editReview(id: number, rating: number, comment: string) {
        if (!user) return

        try {
            await updateReview(id, { productId, userId: user.id, rating, comment })
            await loadReviews()
        } catch (err) {
            setError(getReviewApiErrorMessage(err, 'Failed to update review.'))
        }
    }

    async function removeReview(id: number) {
        try {
            await deleteReview(id)
            setReviews((prev) => prev.filter((r) => r.id !== id))
        } catch (err) {
            setError(getReviewApiErrorMessage(err, 'Failed to delete review.'))
        }
    }

    return {
        user,
        reviews,
        loading,
        error,
        submitting,
        successMessage,
        submitReview,
        editReview,
        removeReview,
    }
}
