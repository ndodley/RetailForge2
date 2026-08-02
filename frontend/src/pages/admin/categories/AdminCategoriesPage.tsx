import { useState } from "react"
import AdminLayout from "../../../components/admin/AdminLayout"
import Dashboard from "../../../components/admin/shared/Dashboard"
import AdminCategoryTable from "../../../components/tables/category/AdminCategoryTable.tsx"
import UpsertForm from "../../../components/admin/shared/UpsertForm"
import BulkUpload from "../../../components/admin/shared/BulkUpload"
import AdminButton from "../../../components/admin/AdminButton"

import { useCategories } from "../../../hooks/categories/useCategories.ts"
import { useAdminCategoryFilters } from "../../../hooks/categories/useAdminCategoryFilters.ts"
import { usePagination } from "../../../hooks/usePagination"
import {
  exportCategoriesCsv,
  downloadCategoriesTemplate,
} from "../../../util/categoryCsv"

import type { AdminTab } from "../../../types/AdminTab"

function AdminCategoriesPage() {
  const {
    categories,
    departments,
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
    handleEditCategory,
    handleDeleteCategory,
    handleSaveChanges,
    handleBulkUpload,
  } = useCategories()

  const {
    searchTerm,
    setSearchTerm,
    filterSections,
    visibleCategories,
    resetFilters,
  } = useAdminCategoryFilters(categories, departments)

  const { setPage, safePage, totalPages, pagedItems } =
      usePagination(visibleCategories, 6)

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  function handleExportCsv() {
    exportCategoriesCsv(
        visibleCategories.map((c) => [c.name, c.departmentId])
    )
  }

  return (
      <AdminLayout
          title="Manage Categories"
          tabs={[
            { label: "Dashboard", key: "dashboard" },
            { label: "Add Category", key: "upsert" },
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
                  title="Categories"
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterSections={filterSections}
                  onReset={resetFilters}
                  isLoading={isLoading}
                  items={visibleCategories}
                  pagedItems={pagedItems}
                  pageSize={6}
                  safePage={safePage}
                  totalPages={totalPages}
                  setPage={setPage}
                  renderTable={(items) => (
                      <AdminCategoryTable
                          items={items}
                          onEdit={handleEditCategory}
                          onDelete={handleDeleteCategory}
                      />
                  )}
                  emptyMessage="No categories found."
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
                  title={
                    draft && draft.name && draft.departmentId
                        ? "Edit Category"
                        : "Add New Category"
                  }
                  subtitle="Categories are used to group products within departments."
                  submitLabel={draft && draft.name && draft.departmentId ? "Update Category" : "Add Category"}
                  isSaving={isSaving}
                  isEditing={Boolean(draft && draft.name && draft.departmentId)}
                  onSubmit={handleSaveChanges}
                  onBack={() => {
                    clearMessages()
                    resetUpsertState()
                    setActiveTab("dashboard")
                  }}
              >
                <div className="admin-field">
                  <label className="admin-label">Category Name</label>
                  <input
                      className="admin-input"
                      placeholder="e.g. Laptops"
                      value={draft.name}
                      onChange={(e) =>
                          setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Department</label>
                  <select
                      className="admin-input"
                      value={draft.departmentId || 0}
                      onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            departmentId: Number(e.target.value),
                          }))
                      }
                  >
                    <option value={0}>Select a department…</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Description (Optional)</label>
                  <textarea
                      className="admin-input"
                      placeholder="Enter a brief description..."
                      value={draft.description || ""}
                      rows={4}
                      onChange={(e) =>
                          setDraft((d) => ({ ...d, description: e.target.value }))
                      }
                  />
                </div>
              </UpsertForm>

              <BulkUpload
                  title="Bulk Upload"
                  subtitle="Upload a categories CSV to create multiple categories at once."
                  file={draft.uploadFile}
                  onFileChange={(file) =>
                      setDraft((d) => ({
                        ...d,
                        uploadFile: file,
                        uploadFileName: file?.name ?? "",
                      }))
                  }
                  onDownloadTemplate={downloadCategoriesTemplate}
                  onClear={() =>
                      setDraft((d) => ({
                        ...d,
                        uploadFile: null,
                        uploadFileName: "",
                      }))
                  }
                  onConfirm={handleBulkUpload}
                  expectedFileName="categories.csv"
              />
            </>
        )}
      </AdminLayout>
  )
}

export default AdminCategoriesPage