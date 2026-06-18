import AdvancedSearchPanel from "../../../components/common/AdvancedSearchPanel"
import CategoryTable from "../../../components/tables/CategoryTable"
import { exportCategoriesCsv } from "../../../util/categoryCsv"
import type { CategoryRecord } from "../../../hooks/useCategories"

interface CategoryDashboardProps {
    isLoading: boolean
    searchTerm: string
    setSearchTerm: (value: string) => void
    filterSections: any[]
    visibleCategories: CategoryRecord[]
    pagedCategories: CategoryRecord[]
    safePage: number
    totalPages: number
    page: number
    setPage: (value: number | ((prev: number) => number)) => void
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

function CategoryDashboard({
                               isLoading,
                               searchTerm,
                               setSearchTerm,
                               filterSections,
                               visibleCategories,
                               pagedCategories,
                               safePage,
                               totalPages,
                               page,
                               setPage,
                               onEdit,
                               onDelete,
                           }: CategoryDashboardProps) {
    const handleSearch = () => {
        if (page !== 1) setPage(1)
    }

    const handleExportCsv = () => {
        exportCategoriesCsv(
            visibleCategories.map((c) => ({
                name: c.name,
                description: c.description,
                departmentName: c.departmentName,
            })),
        )
    }

    return (
        <div className="rf-admin-section">
            <div className="rf-admin-searchWrap">
                <AdvancedSearchPanel
                    title="Advanced Search"
                    query={searchTerm}
                    onQueryChange={setSearchTerm}
                    isOpen={false}
                    onToggleOpen={() => {}}
                    onSearch={handleSearch}
                    sections={filterSections}
                />
            </div>

            <div className="rf-admin-toolbar">
                <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={handleExportCsv}
                >
                    Download CSV
                </button>
            </div>

            {isLoading ? (
                <div className="rf-loading-state">Loading categories...</div>
            ) : visibleCategories.length > 0 ? (
                <>
                    <div className="admin-pagination">
                        <div className="admin-pagination-meta">
                            Showing {(safePage - 1) * 6 + 1}-
                            {Math.min(safePage * 6, visibleCategories.length)} of{" "}
                            {visibleCategories.length}
                        </div>
                        <div className="admin-pagination-controls">
                            <button
                                type="button"
                                className="admin-btn admin-btn--sm"
                                disabled={safePage <= 1}
                                onClick={() =>
                                    setPage((current) => Math.max(1, current - 1))
                                }
                            >
                                Prev
                            </button>
                            <div className="admin-pagination-meta">
                                Page {safePage} / {totalPages}
                            </div>
                            <button
                                type="button"
                                className="admin-btn admin-btn--sm"
                                disabled={safePage >= totalPages}
                                onClick={() =>
                                    setPage((current) => Math.min(totalPages, current + 1))
                                }
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    <CategoryTable
                        categories={pagedCategories}
                        onEdit={onEdit}
                        onDelete={(id: number) => void onDelete(id)}
                    />
                </>
            ) : (
                <div className="rf-empty-state">No categories found.</div>
            )}
        </div>
    )
}

export default CategoryDashboard
