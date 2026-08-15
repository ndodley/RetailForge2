import { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import "./MyReviewsPage.css";

import Layout from "../../components/common/Layout";
import AdvancedSearchPanel from "../../components/common/AdvancedSearchPanel";
import { useAuth } from "../../hooks/useAuth";
import { useMyReviews } from "../../hooks/reviews/useMyReviews";
import { useMyReviewFilters } from "../../hooks/reviews/useMyReviewFilters";
import { usePagination } from "../../hooks/usePagination";
import { useStorefrontData } from "../../hooks/products/useStorefrontData";
import MyReviewTable from "../../components/tables/review/MyReviewTable";
import type { ReviewRecord } from "../../types/store";

const PAGE_SIZE = 6;

function MyReviewsPage() {
    const { user, loading } = useAuth();
    const location = useLocation();
    const { products, categories, departments } = useStorefrontData();

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
    } = useMyReviewFilters(reviews, products, categories, departments);

    const [filtersOpen, setFiltersOpen] = useState(false);

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

    if (loading) {
        return <div className="myrev-fullscreen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isLoading) {
        return <div className="myrev-fullscreen">Loading your reviews...</div>;
    }

    return (
        <Layout isStorefront>
            <div className="myrev-page">
                <div className="myrev-browse-row">
                    <Link to="/products" className="myrev-browse-link">
                        Browse products
                    </Link>
                </div>

                <div className="myrev-panel">
                    <div className="myrev-panel-header">
                        <div className="myrev-heading">
                            <div className="myrev-heading-icon" aria-hidden>
                                ⭐
                            </div>
                            <div className="myrev-title-block">
                                <h2 className="myrev-title">My Reviews</h2>
                                <div className="myrev-subtitle">
                                    View, edit, or delete the reviews you&rsquo;ve written.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="myrev-panel-body">
                        {reviews.length > 0 && (
                            <div className="myrev-search-wrap">
                                <AdvancedSearchPanel
                                    title="Advanced Search"
                                    query={searchTerm}
                                    onQueryChange={setSearchTerm}
                                    isOpen={filtersOpen}
                                    onToggleOpen={() => setFiltersOpen((v) => !v)}
                                    onSearch={() => setFiltersOpen(false)}
                                    onReset={resetFilters}
                                    sections={filterSections}
                                />
                            </div>
                        )}

                        {errorMessage && <div className="myrev-error">{errorMessage}</div>}
                        {successMessage && <div className="myrev-success">{successMessage}</div>}

                        {!errorMessage && reviews.length === 0 && (
                            <div className="myrev-empty">
                                You haven&rsquo;t written any reviews yet.
                            </div>
                        )}

                        {!errorMessage && reviews.length > 0 && visibleReviews.length === 0 && (
                            <div className="myrev-empty">
                                No reviews match your search.
                            </div>
                        )}

                        {!errorMessage && visibleReviews.length > 0 && (
                            <div className="myrev-results-bar">
                                <div className="myrev-results-copy">
                                    Showing {(safePage - 1) * PAGE_SIZE + 1}-
                                    {Math.min(safePage * PAGE_SIZE, visibleReviews.length)} of{" "}
                                    {visibleReviews.length}
                                </div>

                                <div className="myrev-pagination">
                                    <button
                                        type="button"
                                        className="myrev-page-btn"
                                        disabled={safePage <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        Prev
                                    </button>

                                    <span className="myrev-page-info">
                                        Page {safePage} / {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        className="myrev-page-btn"
                                        disabled={safePage >= totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {pagedItems.length > 0 && (
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
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default MyReviewsPage;