import { useEffect, useState } from "react";
import {
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    bulkCreateReviews,
    getReviewApiErrorMessage,
    type ReviewDto,
} from "../../api/reviews";
import { fetchUsers } from "../../api/users";
import { fetchProducts } from "../../api/productAdminApi";
import type { ReviewRecord } from "../../types/store";
import { parseReviewCsv } from "../../util/reviewCsv";

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

export function useReviews() {
    const [reviews, setReviews] = useState<ReviewRecord[]>([]);
    const [users, setUsers] = useState<{ id: number; first_name: string; last_name: string; email: string }[]>([]);
    const [products, setProducts] = useState<{ id: number; name: string }[]>([]);

    const [activeTab, setActiveTab] = useState<"dashboard" | "upsert">("dashboard");
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [draft, setDraft] = useState({
        id: null as number | null,
        userId: 0,
        productId: 0,
        rating: "",
        comment: "",
        uploadFile: null as File | null,
        uploadFileName: "",
        isUploading: false,
    });

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const [reviewRes, userRes, productRes] = await Promise.all([
                    fetchReviews(),
                    fetchUsers(),
                    fetchProducts(),
                ]);

                setReviews(reviewRes.map(mapDtoToRecord));
                setUsers(userRes);
                setProducts(productRes);
            } catch (error) {
                setErrorMessage(getReviewApiErrorMessage(error, "Unable to load reviews."));
            } finally {
                setIsLoading(false);
            }
        }

        void load();
    }, []);

    function clearMessages() {
        setErrorMessage("");
        setSuccessMessage("");
    }

    function resetUpsertState() {
        setSelectedReviewId(null);
        setDraft({
            id: null,
            userId: 0,
            productId: 0,
            rating: "",
            comment: "",
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        });
    }

    function handleEditReview(id: number) {
        clearMessages();
        const review = reviews.find((r) => r.id === id);

        setSelectedReviewId(id);
        setDraft({
            id: review?.id || null,
            userId: review?.userId ?? 0,
            productId: review?.productId ?? 0,
            rating: String(review?.rating ?? 0),
            comment: review?.comment ?? "",
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        });

        setActiveTab("upsert");
    }

    async function handleDeleteReview(id: number) {
        clearMessages();

        try {
            await deleteReview(id);
            setReviews((prev) => prev.filter((r) => r.id !== id));
            setSuccessMessage("Review deleted successfully.");
        } catch (error) {
            setErrorMessage(getReviewApiErrorMessage(error, "Unable to delete review."));
        }
    }

    async function handleSaveChanges() {
        const rating = parseInt(draft.rating);

        if (!draft.productId || !draft.userId) {
            setErrorMessage("Product and user are required.");
            return;
        }

        if (isNaN(rating) || rating < 1 || rating > 5) {
            setErrorMessage("Rating must be between 1 and 5.");
            return;
        }

        clearMessages();
        setIsSaving(true);

        try {
            const payload = {
                productId: draft.productId,
                userId: draft.userId,
                rating,
                comment: draft.comment.trim(),
            };

            if (selectedReviewId === null) {
                const created = await createReview(payload);
                setReviews((prev) => [mapDtoToRecord(created), ...prev]);
                setSuccessMessage("Review created successfully.");
            } else {
                const updated = await updateReview(selectedReviewId, payload);
                setReviews((prev) =>
                    prev.map((r) => (r.id === selectedReviewId ? mapDtoToRecord(updated) : r))
                );
                setSuccessMessage("Review updated successfully.");
            }

            resetUpsertState();
            setActiveTab("dashboard");
        } catch (error) {
            setErrorMessage(getReviewApiErrorMessage(error, "Unable to save review."));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleBulkUpload() {
        if (!draft.uploadFile) {
            setErrorMessage("Select a CSV file before uploading.");
            return;
        }

        clearMessages();
        setDraft((d) => ({ ...d, isUploading: true }));

        try {
            const rows = await parseReviewCsv(draft.uploadFile);

            if (rows.length === 0) {
                throw new Error("No review rows found in CSV.");
            }

            const result = await bulkCreateReviews(rows);
            setSuccessMessage(`Uploaded ${result.inserted} reviews successfully.`);

            const refreshed = await fetchReviews();
            setReviews(refreshed.map(mapDtoToRecord));

            resetUpsertState();
            setActiveTab("dashboard");
        } catch (error) {
            setErrorMessage(getReviewApiErrorMessage(error, "Unable to complete bulk upload."));
        } finally {
            setDraft((d) => ({ ...d, isUploading: false }));
        }
    }

    return {
        reviews,
        users,
        products,
        draft,
        setDraft,
        activeTab,
        setActiveTab,
        selectedReviewId,
        isLoading,
        isSaving,
        errorMessage,
        successMessage,
        clearMessages,
        resetUpsertState,
        handleEditReview,
        handleDeleteReview,
        handleSaveChanges,
        handleBulkUpload,
    };
}