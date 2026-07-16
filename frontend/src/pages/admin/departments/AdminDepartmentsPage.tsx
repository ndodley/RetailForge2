import { useState } from "react"
import AdminLayout from "../../../components/admin/AdminLayout"
import Dashboard from "../../../components/admin/shared/Dashboard"
import AdminDepartmentTable from "../../../components/tables/department/AdminDepartmentTable.tsx"
import UpsertForm from "../../../components/admin/shared/UpsertForm"
import BulkUpload from "../../../components/admin/shared/BulkUpload"

import { useDepartments } from "../../../hooks/departments/useDepartments.ts"
import { useAdminDepartmentFilters } from "../../../hooks/departments/useAdminDepartmentFilters.ts"
import { usePagination } from "../../../hooks/usePagination"
import {
  exportDepartmentsCsv,
  downloadDepartmentsTemplate,
} from "../../../util/departmentCsv"

import type { AdminTab } from "../../../types/AdminTab"

function AdminDepartmentsPage() {
  const {
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
    handleEditDepartment,
    handleDeleteDepartment,
    handleSaveChanges,
    handleBulkUpload,
  } = useDepartments()

  const {
    searchTerm,
    setSearchTerm,
    filterSections,
    visibleDepartments,
    resetFilters,
  } = useAdminDepartmentFilters(departments)

  const { setPage, safePage, totalPages, pagedItems } =
      usePagination(visibleDepartments, 8)

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  function handleExportCsv() {
    exportDepartmentsCsv(visibleDepartments)
  }

  return (
      <AdminLayout
          title="Manage Departments"
          tabs={[
            { label: "Dashboard", key: "dashboard" },
            { label: "Add Department", key: "upsert" },
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
                  title="Departments"
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterSections={filterSections}
                  onReset={resetFilters}
                  isLoading={isLoading}
                  items={visibleDepartments}
                  pagedItems={pagedItems}
                  pageSize={8}
                  safePage={safePage}
                  totalPages={totalPages}
                  setPage={setPage}
                  onExportCsv={handleExportCsv}
                  renderTable={(items) => (
                      <AdminDepartmentTable
                          items={items}
                          onEdit={handleEditDepartment}
                          onDelete={handleDeleteDepartment}
                      />
                  )}
                  emptyMessage="No departments found."
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
                  title={draft && draft.name ? "Edit Department" : "Add New Department"}
                  subtitle="Departments are used to group categories and products."
                  submitLabel={draft && draft.name ? "Update Department" : "Add Department"}
                  isSaving={isSaving}
                  isEditing={Boolean(draft && draft.name)}
                  onSubmit={handleSaveChanges}
                  onBack={() => {
                    clearMessages()
                    resetUpsertState()
                    setActiveTab("dashboard")
                  }}
              >
                <div className="admin-field">
                  <label className="admin-label">Department Name</label>
                  <input
                      className="admin-input"
                      placeholder="e.g., Electronics"
                      value={draft.name}
                      onChange={(e) =>
                          setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                  />
                </div>
              </UpsertForm>

              <BulkUpload
                  title="Bulk Upload"
                  subtitle="Upload a departments CSV to create multiple departments at once."
                  file={draft.uploadFile}
                  onFileChange={(file) =>
                      setDraft((d) => ({
                        ...d,
                        uploadFile: file,
                        uploadFileName: file?.name ?? "",
                      }))
                  }
                  onDownloadTemplate={downloadDepartmentsTemplate}
                  onClear={() =>
                      setDraft((d) => ({
                        ...d,
                        uploadFile: null,
                        uploadFileName: "",
                      }))
                  }
                  onConfirm={handleBulkUpload}
                  expectedFileName="departments.csv"
              />
            </>
        )}
      </AdminLayout>
  )
}

export default AdminDepartmentsPage