import { useEffect, useState, useCallback } from "react";
import {
    fetchReviewsByUser,
    updateReview,
    deleteReview,
    getReviewApiErrorMessage,
    type ReviewDto,
} from "../../api/reviews";
import type { ReviewRecord } from "../../types/store";
import { useAuth } from "../useAuth";

function mapDtoToRecord(dto: ReviewDto): ReviewRecord {
    return {
        id: dto.id,
        productId: dto.productId,
        productName: dto.productName,
        productImagePath: dto.productImagePath,
        userId: dto.userId,
        userEmail: dto.userEmail,
        userFullName: dto.userFullName,
        rating: Number(dto.rating),
        comment: dto.comment ?? "",
        created_at: dto.created_at,
        updated_at: dto.updated_at,
    };
}

export function useMyReviews() {
    const { user, loading } = useAuth();

    const [reviews, setReviews] = useState<ReviewRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadReviews = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            const dtoList = await fetchReviewsByUser(user.id);
            setReviews(dtoList.map(mapDtoToRecord));
        } catch (error) {
            setErrorMessage(getReviewApiErrorMessage(error, "Unable to load your reviews."));
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!loading && user) {
            // Kicks off the fetch once auth resolves; loadReviews owns its
            // own loading/error state, this just triggers it.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            void loadReviews();
        }
        if (!loading && !user) {
            setIsLoading(false);
        }
    }, [loading, user, loadReviews]);

    async function handleUpdateReview(id: number, rating: number, comment: string) {
        if (!user) {
            setErrorMessage("You must be logged in to update reviews.");
            return;
        }

        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const existing = reviews.find((r) => r.id === id);
            if (!existing) {
                setErrorMessage("Review not found.");
                return;
            }

            const updated = await updateReview(id, {
                productId: existing.productId,
                userId: user.id,
                rating,
                comment,
            });

            setReviews((prev) =>
                prev.map((r) =>
                    r.id === id
                        ? {
                            ...r,
                            rating: Number(updated.rating),
                            comment: updated.comment,
                            updated_at: updated.updated_at,
                        }
                        : r
                )
            );

            setSuccessMessage("Review updated successfully.");
        } catch (error) {
            setErrorMessage(getReviewApiErrorMessage(error, "Unable to update review."));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteReview(id: number) {
        if (!user) {
            setErrorMessage("You must be logged in to delete reviews.");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            await deleteReview(id);
            setReviews((prev) => prev.filter((r) => r.id !== id));
            setSuccessMessage("Review deleted successfully.");
        } catch (error) {
            setErrorMessage(getReviewApiErrorMessage(error, "Unable to delete review."));
        }
    }

    function clearMessages() {
        setErrorMessage("");
        setSuccessMessage("");
    }

    return {
        reviews,
        isLoading,
        isSaving,
        errorMessage,
        successMessage,
        clearMessages,
        handleUpdateReview,
        handleDeleteReview,
        reload: loadReviews,
    };
}
