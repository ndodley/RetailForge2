import AdminButton from "../AdminButton"
import AdminSearchPanel from "../AdminSearchPanel"
import type { FilterSection } from "../../common/AdvancedSearchPanel"
import "./Dashboard.css"
import React from "react";

interface DashboardProps<T> {
    title: string
    searchTerm: string
    setSearchTerm: (value: string) => void
    filterSections: FilterSection[]
    onReset: () => void   // ⭐ ADDED
    isLoading: boolean
    items: T[]
    pagedItems: T[]
    pageSize: number
    safePage: number
    totalPages: number
    setPage: (value: number | ((prev: number) => number)) => void
    renderTable: (items: T[]) => React.ReactNode
    emptyMessage: string
    errorMessage?: string
    successMessage?: string
    isFilterOpen: boolean
    onToggleFilter: () => void
}

function Dashboard<T>({
                          title,
                          searchTerm,
                          setSearchTerm,
                          filterSections,
                          onReset,            // ⭐ ADDED
                          isLoading,
                          items,
                          pagedItems,
                          pageSize,
                          safePage,
                          totalPages,
                          setPage,
                          renderTable,
                          emptyMessage,
                          errorMessage,
                          successMessage,
                          isFilterOpen,
                          onToggleFilter,
                      }: DashboardProps<T>) {
    return (
        <section className="rf-admin-section">
            {errorMessage && (
                <div className="rf-admin-message rf-admin-message--error">
                    {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className="rf-admin-message rf-admin-message--success">
                    {successMessage}
                </div>
            )}

            <div className="rf-admin-searchWrap">
                <AdminSearchPanel
                    title="Advanced Search"
                    query={searchTerm}
                    onQueryChange={setSearchTerm}
                    isOpen={isFilterOpen}
                    onToggleOpen={onToggleFilter}
                    onSearch={() => {}}
                    onReset={onReset}      // ⭐ ADDED
                    sections={filterSections}
                />
            </div>

            {isLoading ? (
                <div className="rf-loading-state">
                    Loading {title.toLowerCase()}…
                </div>
            ) : items.length > 0 ? (
                <>
                    <div className="admin-pagination">
                        <div className="admin-pagination-meta">
                            Showing {(safePage - 1) * pageSize + 1}–
                            {Math.min(safePage * pageSize, items.length)} of {items.length}
                        </div>

                        <div className="admin-pagination-controls">
                            <AdminButton
                                variant="pill"
                                disabled={safePage <= 1}
                                onClick={() =>
                                    setPage((current) => Math.max(1, current - 1))
                                }
                            >
                                Prev
                            </AdminButton>

                            <span className="admin-pagination-meta">
                                Page {safePage} / {totalPages}
                            </span>

                            <AdminButton
                                variant="pill"
                                disabled={safePage >= totalPages}
                                onClick={() =>
                                    setPage((current) => Math.min(totalPages, current + 1))
                                }
                            >
                                Next
                            </AdminButton>
                        </div>
                    </div>

                    {renderTable(pagedItems)}
                </>
            ) : (
                <div className="rf-empty-state">{emptyMessage}</div>
            )}
        </section>
    )
}

export default Dashboard
