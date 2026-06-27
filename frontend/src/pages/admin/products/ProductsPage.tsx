import { useState } from "react"
import AdminLayout from "../../../components/admin/AdminLayout"
import Dashboard from "../../../components/admin/shared/Dashboard"
import ProductTable from "../../../components/tables/ProductTable"
import UpsertForm from "../../../components/admin/shared/UpsertForm"
import BulkUpload from "../../../components/admin/shared/BulkUpload"
import AdminButton from "../../../components/admin/AdminButton"

import { useProducts } from "../../../hooks/useProducts"
import { useProductFilters } from "../../../hooks/useProductFilters"
import { usePagination } from "../../../hooks/usePagination"
import {
  exportProductsCsv,
  downloadProductsTemplate,
} from "../../../util/productCsv"

import type { AdminTab } from "../../../types/AdminTab"

function ProductsPage() {
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
  } = useProductFilters(products, departments, categories)

  const { setPage, safePage, totalPages, pagedItems } =
      usePagination(visibleProducts, 6)

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  function handleExportCsv() {
    exportProductsCsv(visibleProducts)
  }

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
            <>
              <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
                <AdminButton
                    variant="primary"
                    onClick={() => {
                      clearMessages()
                      resetUpsertState()
                      setActiveTab("upsert")
                    }}
                >
                  Add New Product
                </AdminButton>
              </div>

              <Dashboard
                  title="Products"
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterSections={filterSections}
                  onReset={resetFilters}
                  isLoading={isLoading}
                  items={visibleProducts}
                  pagedItems={pagedItems}
                  pageSize={6}
                  safePage={safePage}
                  totalPages={totalPages}
                  setPage={setPage}
                  onExportCsv={handleExportCsv}
                  renderTable={(items) => (
                      <ProductTable
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
            </>
        )}

        {activeTab === "upsert" && (
            <>
              <UpsertForm
                  title={
                    draft && draft.id
                        ? "Edit Product"
                        : "Add New Product"
                  }
                  subtitle="Add or update product information, pricing, and inventory."
                  isSaving={isSaving}
                  isEditing={Boolean(draft && draft.id)}
                  onSubmit={handleSaveChanges}
                  onBack={() => {
                    clearMessages()
                    resetUpsertState()
                    setActiveTab("dashboard")
                  }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="admin-field">
                    <label className="admin-label">Department</label>
                    <select
                        className="admin-input"
                        value={draft.departmentId || 0}
                        onChange={(e) => {
                          const deptId = Number(e.target.value)
                          setDraft((d) => ({
                            ...d,
                            departmentId: deptId,
                            categoryId: 0,
                          }))
                        }}
                    >
                      <option value={0}>Select a department</option>
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
                      <option value={0}>Select a category</option>
                      {categories
                          .filter((cat) => cat.departmentId === draft.departmentId)
                          .map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="admin-field">
                    <label className="admin-label">Name</label>
                    <input
                        className="admin-input"
                        placeholder="e.g., PlayStation 5"
                        value={draft.name}
                        onChange={(e) =>
                            setDraft((d) => ({ ...d, name: e.target.value }))
                        }
                    />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Brand (optional)</label>
                    <input
                        className="admin-input"
                        placeholder="e.g., Sony"
                        value={draft.brand}
                        onChange={(e) =>
                            setDraft((d) => ({ ...d, brand: e.target.value }))
                        }
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Rating (0-5)</label>
                  <input
                      className="admin-input"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      placeholder="0"
                      value={draft.rating}
                      onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            rating: parseFloat(e.target.value) || 0,
                          }))
                      }
                  />
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="admin-field">
                    <label className="admin-label">Price</label>
                    <input
                        className="admin-input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={draft.price}
                        onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              price: parseFloat(e.target.value) || 0,
                            }))
                        }
                    />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Stock</label>
                    <input
                        className="admin-input"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={draft.stock}
                        onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              stock: parseInt(e.target.value) || 0,
                            }))
                        }
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Image (optional)</label>
                  <input
                      className="admin-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setDraft((d) => ({ ...d, imageFile: file }))
                      }}
                  />
                  {draft.imagePath && !draft.imageFile && (
                      <div style={{ marginTop: "8px", fontSize: "14px", color: "var(--admin-text-muted)" }}>
                        Current: {draft.imagePath}
                      </div>
                  )}
                </div>
              </UpsertForm>

              <BulkUpload
                  title="Bulk Upload"
                  subtitle="Upload a products CSV to create multiple products. Image_path is optional."
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

export default ProductsPage