import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../../components/admin/AdminLayout"
import Dashboard from "../../../components/admin/shared/Dashboard"
import AdminOrderTable from "../../../components/tables/order/AdminOrderTable.tsx"

import { useOrders } from "../../../hooks/orders/useOrders.ts"
import { useAdminOrderFilters } from "../../../hooks/orders/useAdminOrderFilters.ts"
import { usePagination } from "../../../hooks/usePagination"
import { exportOrdersCsv } from "../../../util/orderCsv"

function AdminOrdersPage() {
    const navigate = useNavigate()

    const {
        orders,
        isLoading,
        errorMessage,
        successMessage,
        handleDeleteOrder,
    } = useOrders()

    const {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleOrders,
        resetFilters,
    } = useAdminOrderFilters(orders)

    const { setPage, safePage, totalPages, pagedItems } =
        usePagination(visibleOrders, 6)

    const [isFilterOpen, setIsFilterOpen] = useState(false)

    function handleExportCsv() {
        exportOrdersCsv(visibleOrders)
    }

    function handleViewOrder(id: number) {
        navigate(`/admin/orders/${id}`)
    }

    return (
        <AdminLayout
            title="Manage Orders"
            subtitle="View all orders across the store, including the customer email."
            tabs={[{ label: "Dashboard", key: "dashboard" }]}
            activeTab="dashboard"
            onTabChange={() => {}}
        >
            <Dashboard
                title="Orders"
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterSections={filterSections}
                onReset={resetFilters}
                isLoading={isLoading}
                items={visibleOrders}
                pagedItems={pagedItems}
                pageSize={6}
                safePage={safePage}
                totalPages={totalPages}
                setPage={setPage}
                onExportCsv={handleExportCsv}
                renderTable={(items) => (
                    <AdminOrderTable
                        items={items}
                        onEdit={handleViewOrder}
                        onDelete={handleDeleteOrder}
                    />
                )}
                emptyMessage="No orders found."
                errorMessage={errorMessage}
                successMessage={successMessage}
                isFilterOpen={isFilterOpen}
                onToggleFilter={() => setIsFilterOpen((open) => !open)}
            />
        </AdminLayout>
    )
}

export default AdminOrdersPage