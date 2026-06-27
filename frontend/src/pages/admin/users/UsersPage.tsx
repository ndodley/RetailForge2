import { useState } from "react"
import AdminLayout from "../../../components/admin/AdminLayout"
import Dashboard from "../../../components/admin/shared/Dashboard"
import UserTable from "../../../components/tables/UserTable"
import UpsertForm from "../../../components/admin/shared/UpsertForm"
import BulkUpload from "../../../components/admin/shared/BulkUpload"
import AdminButton from "../../../components/admin/AdminButton"

import { useUsers } from "../../../hooks/useUsers"
import { useUserFilters } from "../../../hooks/useUserFilters"
import { usePagination } from "../../../hooks/usePagination"
import {
    exportUsersCsv,
    downloadUsersTemplate,
} from "../../../util/userCsv"

import type { AdminTab } from "../../../types/AdminTab"

function UsersPage() {
    const {
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
        handleEditUser,
        handleDeleteUser,
        handleSaveChanges,
        handleBulkUpload,
    } = useUsers()

    const {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleUsers,
    } = useUserFilters(users)

    const { setPage, safePage, totalPages, pagedItems } =
        usePagination(visibleUsers, 6)

    const [isFilterOpen, setIsFilterOpen] = useState(false)

    function handleExportCsv() {
        exportUsersCsv(visibleUsers)
    }

    return (
        <AdminLayout
            title="Manage Users"
            tabs={[
                { label: "Dashboard", key: "dashboard" },
                { label: "Add User", key: "upsert" },
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
                            Add New User
                        </AdminButton>
                    </div>

                    <Dashboard
                        title="Users"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterSections={filterSections}
                        isLoading={isLoading}
                        items={visibleUsers}
                        pagedItems={pagedItems}
                        pageSize={6}
                        safePage={safePage}
                        totalPages={totalPages}
                        setPage={setPage}
                        onExportCsv={handleExportCsv}
                        renderTable={(items) => (
                            <UserTable
                                items={items}
                                onEdit={handleEditUser}
                                onDelete={handleDeleteUser}
                            />
                        )}
                        emptyMessage="No users found."
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
                                ? "Edit User"
                                : "Add New User"
                        }
                        subtitle="Manage user accounts and permissions."
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
                                <label className="admin-label">First Name</label>
                                <input
                                    className="admin-input"
                                    placeholder="e.g., John"
                                    value={draft.first_name}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, first_name: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="admin-field">
                                <label className="admin-label">Last Name</label>
                                <input
                                    className="admin-input"
                                    placeholder="e.g., Doe"
                                    value={draft.last_name}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, last_name: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="admin-field">
                            <label className="admin-label">Email</label>
                            <input
                                className="admin-input"
                                type="email"
                                placeholder="user@example.com"
                                value={draft.email}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, email: e.target.value }))
                                }
                            />
                        </div>

                        <div className="admin-field">
                            <label className="admin-label">
                                Password {draft.id && "(leave blank to keep current)"}
                            </label>
                            <input
                                className="admin-input"
                                type="password"
                                placeholder={draft.id ? "••••••••" : "Enter password"}
                                value={draft.password}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, password: e.target.value }))
                                }
                            />
                        </div>

                        <div className="admin-field">
                            <label className="admin-label">Role</label>
                            <select
                                className="admin-input"
                                value={draft.role}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, role: e.target.value }))
                                }
                            >
                                <option value="">Select a role</option>
                                <option value="customer">Customer</option>
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="admin-field">
                            <label className="admin-label">Phone Number</label>
                            <input
                                className="admin-input"
                                type="tel"
                                placeholder="e.g., 555-1234"
                                value={draft.phoneNumber}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, phoneNumber: e.target.value }))
                                }
                            />
                        </div>

                        <div className="admin-field">
                            <label className="admin-label">Address</label>
                            <textarea
                                className="admin-input"
                                placeholder="Enter address..."
                                value={draft.address}
                                rows={3}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, address: e.target.value }))
                                }
                            />
                        </div>
                    </UpsertForm>

                    <BulkUpload
                        title="Bulk Upload"
                        subtitle="Upload a users CSV to create multiple user accounts at once."
                        file={draft.uploadFile}
                        onFileChange={(file) =>
                            setDraft((d) => ({
                                ...d,
                                uploadFile: file,
                                uploadFileName: file?.name ?? "",
                            }))
                        }
                        onDownloadTemplate={downloadUsersTemplate}
                        onClear={() =>
                            setDraft((d) => ({
                                ...d,
                                uploadFile: null,
                                uploadFileName: "",
                            }))
                        }
                        onConfirm={handleBulkUpload}
                        expectedFileName="users.csv"
                    />
                </>
            )}
        </AdminLayout>
    )
}

export default UsersPage