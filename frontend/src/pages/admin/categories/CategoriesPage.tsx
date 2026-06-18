import AdminLayout from "../../../components/admin/AdminLayout"
import { useCategories } from "../../../hooks/useCategories"
import { useCategoryFilters } from "../../../hooks/useCategoryFilters"
import { useCategoryPagination } from "../../../hooks/useCategoryPagination"
import CategoryDashboard from "../../../components/admin/categories/CategoryDashboard"
import CategoryUpsertForm from "../../../components/admin/categories/CategoryUpsertForm"

function CategoriesPage() {
  const {
    categories,
    departments,
    selectedCategory,
    draft,
    setDraft,
    activeTab,
    setActiveTab,
    isLoading,
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
  } = useCategoryFilters(categories, departments)

  const {
    page,
    setPage,
    safePage,
    totalPages,
    pagedCategories,
  } = useCategoryPagination(visibleCategories)

  const openDashboard = () => {
    resetUpsertState()
    setActiveTab("dashboard")
    clearMessages()
  }

  const openUpsert = () => {
    resetUpsertState()
    setActiveTab("upsert")
    clearMessages()
  }

  return (
      <AdminLayout
          title={
            activeTab === "dashboard"
                ? "Manage Categories"
                : selectedCategory
                    ? "Edit Category"
                    : "Add New Category"
          }
          subtitle={
            activeTab === "dashboard"
                ? undefined
                : "Categories belong to a department."
          }
          actions={
            activeTab === "dashboard" ? (
                <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    onClick={openUpsert}
                >
                  Add New Category
                </button>
            ) : null
          }
      >
        {/* Tabs */}
        <div className="rf-tabbar" role="tablist" aria-label="Category tabs">
          <button
              type="button"
              className={activeTab === "dashboard" ? "rf-tab rf-tab--active" : "rf-tab"}
              onClick={openDashboard}
          >
            Dashboard
          </button>
          <button
              type="button"
              className={activeTab === "upsert" ? "rf-tab rf-tab--active" : "rf-tab"}
              onClick={openUpsert}
          >
            Upsert Category
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
            <div className="admin-alert admin-alert--error">{errorMessage}</div>
        )}
        {successMessage && (
            <div className="admin-alert admin-alert--success">{successMessage}</div>
        )}

        {activeTab === "dashboard" ? (
            <CategoryDashboard
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterSections={filterSections}
                visibleCategories={visibleCategories}
                pagedCategories={pagedCategories}
                safePage={safePage}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
            />
        ) : (
            <CategoryUpsertForm
                draft={draft}
                setDraft={setDraft}
                departments={departments}
                selectedCategory={selectedCategory}
                onSave={handleSaveChanges}
                onBack={openDashboard}
                onBulkUpload={handleBulkUpload}
            />
        )}
      </AdminLayout>
  )
}

export default CategoriesPage
