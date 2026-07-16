import { useState } from "react"
import AdminLayout from "../../../components/admin/AdminLayout"
import Dashboard from "../../../components/admin/shared/Dashboard"
import AdminProductTable from "../../../components/tables/product/AdminProductTable.tsx"
import UpsertForm from "../../../components/admin/shared/UpsertForm"
import BulkUpload from "../../../components/admin/shared/BulkUpload"

import { useProducts } from "../../../hooks/products/useProducts.ts"
import { useAdminProductFilters } from "../../../hooks/products/useAdminProductFilters.ts"
import { usePagination } from "../../../hooks/usePagination"
import {
    exportProductsCsv,
    downloadProductsTemplate,
} from "../../../util/productCsv"

import type { AdminTab } from "../../../types/AdminTab"

function AdminProductsPage() {
    const {
        products,
        departments,
        categories,
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
        handleEditProduct,
        handleDeleteProduct,
        handleSaveChanges,
        handleBulkUpload,
    } = useProducts()

    const {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleProducts,
        resetFilters,
    } = useAdminProductFilters(products, departments, categories)

    const { setPage, safePage, totalPages, pagedItems } =
        usePagination(visibleProducts, 8)

    const [isFilterOpen, setIsFilterOpen] = useState(false)

    function handleExportCsv() {
        exportProductsCsv(visibleProducts)
    }

    const filteredCategories = categories.filter(
        (c) => c.departmentId === draft.departmentId
    )

    return (
        <AdminLayout
            title="Manage Products"
            tabs={[
                { label: "Dashboard", key: "dashboard" },
                { label: "Add Product", key: "upsert" },
            ]}
            activeTab={activeTab}
            onTabChange={(key: AdminTab) => {
                clearMessages()
                resetUpsertState()
                setActiveTab(key)
            }}
        >
            {activeTab === "dashboard" && (
                <div className="admin-dashboard-header">
                    <Dashboard
                        title="Products"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterSections={filterSections}
                        onReset={resetFilters}
                        isLoading={isLoading}
                        items={visibleProducts}
                        pagedItems={pagedItems}
                        pageSize={8}
                        safePage={safePage}
                        totalPages={totalPages}
                        setPage={setPage}
                        onExportCsv={handleExportCsv}
                        renderTable={(items) => (
                            <AdminProductTable
                                items={items}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                            />
                        )}
                        emptyMessage="No products found."
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
                        title={draft && draft.id ? "Edit Product" : "Add New Product"}
                        subtitle="Create or update a product in your catalog."
                        submitLabel={draft && draft.id ? "Update Product" : "Add Product"}
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
                                <label className="admin-label">Product Name</label>
                                <input
                                    className="admin-input"
                                    placeholder="e.g., MacBook Pro"
                                    value={draft.name}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, name: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="admin-field">
                                <label className="admin-label">Brand</label>
                                <input
                                    className="admin-input"
                                    placeholder="e.g., Apple"
                                    value={draft.brand}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, brand: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="admin-field">
                                <label className="admin-label">Price ($)</label>
                                <input
                                    className="admin-input"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g., 1299.99"
                                    value={draft.price}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, price: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                            <div className="admin-field">
                                <label className="admin-label">Department</label>
                                <select
                                    className="admin-input"
                                    value={draft.departmentId || 0}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            departmentId: Number(e.target.value),
                                            categoryId: 0,
                                        }))
                                    }
                                >
                                    <option value={0}>Select department…</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-field">
                                <label className="admin-label">Category</label>
                                <select
                                    className="admin-input"
                                    value={draft.categoryId || 0}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            categoryId: Number(e.target.value),
                                        }))
                                    }
                                    disabled={!draft.departmentId}
                                >
                                    <option value={0}>Select category…</option>
                                    {filteredCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-field">
                                <label className="admin-label">Stock</label>
                                <input
                                    className="admin-input"
                                    type="number"
                                    placeholder="e.g., 50"
                                    value={draft.stock}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, stock: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="admin-field">
                            <label className="admin-label">Description</label>
                            <textarea
                                className="admin-input"
                                placeholder="Enter product description..."
                                value={draft.description}
                                rows={4}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, description: e.target.value }))
                                }
                            />
                        </div>

                        <div className="admin-field">
                            <label className="admin-label">Product Image</label>
                            <input
                                className="admin-input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    setDraft((d) => ({ ...d, imageFile: file || null }))
                                }}
                            />
                            {draft.imagePath && !draft.imageFile && (
                                <div style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                                    Current image: {draft.imagePath}
                                </div>
                            )}
                        </div>
                    </UpsertForm>

                    <BulkUpload
                        title="Bulk Upload"
                        subtitle="Upload a products CSV to create multiple products at once. Images cannot be uploaded via CSV."
                        file={draft.uploadFile}
                        onFileChange={(file) =>
                            setDraft((d) => ({
                                ...d,
                                uploadFile: file,
                                uploadFileName: file?.name ?? "",
                            }))
                        }
                        onDownloadTemplate={downloadProductsTemplate}
                        onClear={() =>
                            setDraft((d) => ({
                                ...d,
                                uploadFile: null,
                                uploadFileName: "",
                            }))
                        }
                        onConfirm={handleBulkUpload}
                        expectedFileName="products.csv"
                    />
                </>
            )}
        </AdminLayout>
    )
}

export default AdminProductsPage