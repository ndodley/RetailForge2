import { useState } from "react";
import "./MyReviewsPage.css";

import Layout from "../../components/common/Layout";
import { useMyReviews } from "../../hooks/reviews/useMyReviews";
import { useMyReviewFilters } from "../../hooks/reviews/useMyReviewFilters";
import { usePagination } from "../../hooks/usePagination";
import MyReviewTable from "../../components/tables/review/MyReviewTable";
import type { ReviewRecord } from "../../types/store";

const PAGE_SIZE = 5;

function MyReviewsPage() {
    const {
        reviews,
        isLoading,
        isSaving,
        errorMessage,
        successMessage,
        clearMessages,
        handleUpdateReview,
        handleDeleteReview,
    } = useMyReviews();

    const {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleReviews,
        resetFilters,
    } = useMyReviewFilters(reviews);

    // Pagination AFTER filtering
    const {
        setPage,
        safePage,
        totalPages,
        pagedItems,
    } = usePagination(visibleReviews, PAGE_SIZE);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editRating, setEditRating] = useState<number>(0);
    const [editComment, setEditComment] = useState<string>("");

    function startEdit(review: ReviewRecord) {
        clearMessages();
        setEditingId(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    }

    function cancelEdit() {
        clearMessages();
        setEditingId(null);
        setEditRating(0);
        setEditComment("");
    }

    async function saveEdit(id: number) {
        await handleUpdateReview(id, editRating, editComment.trim());
        setEditingId(null);
    }

    return (
        <Layout isStorefront>
            <div className="myrev-page">
                <h1 className="myrev-title">My Reviews</h1>

                {/* Search + Filters */}
                <div className="myrev-controls">
                    <input
                        type="text"
                        className="myrev-search"
                        placeholder="Search your reviews…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <button className="myrev-reset-btn" onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>

                {/* Filter Sections */}
                <div className="myrev-filter-panel">
                    {filterSections.map((section) => (
                        <div key={section.key} className="myrev-filter-section">
                            <div className="myrev-filter-title">{section.title}</div>
                            <div className="myrev-filter-options">
                                {section.options.map((opt) => (
                                    <label key={opt.value} className="myrev-filter-option">
                                        <input
                                            type="radio"
                                            name={section.key}
                                            value={opt.value}
                                            checked={section.value === opt.value}
                                            onChange={() => section.onChange(opt.value)}
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Messages */}
                {errorMessage && <div className="myrev-error">{errorMessage}</div>}
                {successMessage && <div className="myrev-success">{successMessage}</div>}

                {/* Loading */}
                {isLoading && <div className="myrev-loading">Loading your reviews…</div>}

                {/* Table + Pagination */}
                {!isLoading && (
                    <>
                        <MyReviewTable
                            items={pagedItems}
                            editingId={editingId}
                            editRating={editRating}
                            editComment={editComment}
                            saving={isSaving}
                            onStartEdit={startEdit}
                            onCancelEdit={cancelEdit}
                            onSaveEdit={saveEdit}
                            onDeleteReview={handleDeleteReview}
                            onChangeRating={setEditRating}
                            onChangeComment={setEditComment}
                        />

                        <div className="myrev-pagination">
                            <button
                                className="myrev-page-btn"
                                disabled={safePage <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Prev
                            </button>

                            <span className="myrev-page-info">
                                Page {safePage} of {totalPages}
                            </span>

                            <button
                                className="myrev-page-btn"
                                disabled={safePage >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

export default MyReviewsPage;
