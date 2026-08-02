import { useState } from "react"
import AdminLayout from "../../../components/admin/AdminLayout"
import Dashboard from "../../../components/admin/shared/Dashboard"
import AdminReviewTable from "../../../components/tables/review/AdminReviewTable.tsx"
import UpsertForm from "../../../components/admin/shared/UpsertForm"
import BulkUpload, {type BulkPreviewColumn} from "../../../components/admin/shared/BulkUpload"
import AdminButton from "../../../components/admin/AdminButton"

import { useReviews } from "../../../hooks/reviews/useReviews.ts"
import { useAdminReviewFilters } from "../../../hooks/reviews/useAdminReviewFilters.ts"
import { usePagination } from "../../../hooks/usePagination"
import {
    exportReviewsCsv,
    downloadReviewsTemplate,
    parseCsvPreview,
} from "../../../util/reviewCsv"

import type { AdminTab } from "../../../types/AdminTab"

const REVIEW_PREVIEW_COLUMNS: BulkPreviewColumn[] = [
    { key: "productName", header: "PRODUCT NAME" },
    { key: "userEmail",   header: "USER EMAIL" },
    { key: "rating",      header: "RATING" },
    { key: "comment",     header: "COMMENT" },
]


function AdminReviewsPage() {
    const {
        reviews,
        products,
        categories,
        departments,
        users,
        draft,
        setDraft,
        activeTab,
        setActiveTab,
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
    } = useReviews()

    const {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleReviews,
        resetFilters,
    } = useAdminReviewFilters(reviews, products, categories, departments)

    const { setPage, safePage, totalPages, pagedItems } =
        usePagination(visibleReviews, 6)

    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [csvPreview, setCsvPreview] = useState<{
        columns: Array<{ key: string; label: string }>
        rows: Array<Record<string, string | number>>
    } | null>(null)

    function handleExportCsv() {
        exportReviewsCsv(visibleReviews)
    }

    function handleFileChange(file: File | null) {
        setDraft((d) => ({
            ...d,
            uploadFile: file,
            uploadFileName: file?.name ?? "",
        }))

        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const text = e.target?.result as string
                const preview = parseCsvPreview(text)
                setCsvPreview(preview)
            }
            reader.readAsText(file)
        } else {
            setCsvPreview(null)
        }
    }

    return (
        <AdminLayout
            title="Manage Reviews"
            tabs={[
                { label: "Dashboard", key: "dashboard" },
                { label: "Add Review", key: "upsert" },
            ]}
            activeTab={activeTab}
            onTabChange={(key: AdminTab) => {
                clearMessages()
                resetUpsertState()
                setActiveTab(key)
            }}
            headerActions={
                activeTab === "dashboard" && (
                    <AdminButton variant="pill" onClick={handleExportCsv}>
                        Download CSV
                    </AdminButton>
                )
            }
        >
            {activeTab === "dashboard" && (
                <div className="admin-dashboard-header">
                    <Dashboard
                        title="Reviews"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterSections={filterSections}
                        onReset={resetFilters}
                        isLoading={isLoading}
                        items={visibleReviews}
                        pagedItems={pagedItems}
                        pageSize={6}
                        safePage={safePage}
                        totalPages={totalPages}
                        setPage={setPage}
                        renderTable={(items) => (
                            <AdminReviewTable
                                items={items}
                                users={users}
                                onEdit={handleEditReview}
                                onDelete={handleDeleteReview}
                            />
                        )}
                        emptyMessage="No reviews found."
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                        isFilterOpen={isFilterOpen}
                        onToggleFilter={() => setIsFilterOpen((open) => !open)}
                    />
                </div>
            )}

            {activeTab === "upsert" && (
                <>
                    <UpsertForm
                        title={draft && draft.id ? "Edit Review" : "Add New Review"}
                        subtitle="Create or update a product review."
                        submitLabel={draft && draft.id ? "Update Review" : "Add Review"}
                        isSaving={isSaving}
                        isEditing={Boolean(draft && draft.id)}
                        onSubmit={handleSaveChanges}
                        onBack={() => {
                            clearMessages()
                            resetUpsertState()
                            setActiveTab("dashboard")
                        }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                            <div className="admin-field">
                                <label className="admin-label">Product</label>
                                <select
                                    className="admin-input"
                                    value={draft.productId || 0}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, productId: Number(e.target.value) }))
                                    }
                                >
                                    <option value={0}>Select product…</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-field">
                                <label className="admin-label">User</label>
                                <select
                                    className="admin-input"
                                    value={draft.userId || 0}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, userId: Number(e.target.value) }))
                                    }
                                >
                                    <option value={0}>Select user…</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-field">
                                <label className="admin-label">Rating (1-5)</label>
                                <input
                                    className="admin-input"
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="1"
                                    placeholder="e.g., 5"
                                    value={draft.rating}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, rating: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="admin-field">
                            <label className="admin-label">Comment</label>
                            <textarea
                                className="admin-input"
                                placeholder="Write the review comment..."
                                value={draft.comment}
                                rows={5}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, comment: e.target.value }))
                                }
                            />
                        </div>
                    </UpsertForm>

                    <BulkUpload
                        title="Bulk Upload"
                        subtitle="Upload a reviews CSV to create multiple reviews at once."
                        file={draft.uploadFile}
                        onFileChange={handleFileChange}
                        onDownloadTemplate={downloadReviewsTemplate}
                        onClear={() => {
                            setDraft((d) => ({
                                ...d,
                                uploadFile: null,
                                uploadFileName: "",
                            }))
                            setCsvPreview(null)
                        }}
                        onConfirm={handleBulkUpload}
                        expectedFileName="reviews.csv"
                        previewColumns={REVIEW_PREVIEW_COLUMNS}
                        previewRows={csvPreview?.rows}
                    />
                </>
            )}
        </AdminLayout>
    )
}

export default AdminReviewsPage