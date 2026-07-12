import { useMemo, useState } from "react"
import type { UserRecord } from "../../types/store.ts"
import type { FilterSection } from "../../components/common/AdvancedSearchPanel.tsx"

type SortField = "best" | "last_name" | "first_name" | "email" | "role"
type SortOrder = "asc" | "desc"

export function useAdminUserFilters(users: UserRecord[]) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [roleFilter, setRoleFilter] = useState<string>("all")

    function resetFilters() {
        setSearchTerm("")
        setSortField("best")
        setSortOrder("asc")
        setRoleFilter("all")
    }

    const filterSections: FilterSection[] = useMemo(
        () => [
            {
                key: "sort",
                title: "Sort By",
                type: "radio",
                value: sortField,
                onChange: (v) => setSortField(String(v) as SortField),
                options: [
                    { label: "Best Match", value: "best" },
                    { label: "Last Name", value: "last_name" },
                    { label: "First Name", value: "first_name" },
                    { label: "Email", value: "email" },
                    { label: "Role", value: "role" },
                ],
            },
            {
                key: "order",
                title: "Order",
                type: "radio",
                value: sortOrder,
                onChange: (v) => setSortOrder(String(v) as SortOrder),
                options: [
                    { label: "Ascending", value: "asc" },
                    { label: "Descending", value: "desc" },
                ],
            },
            {
                key: "role",
                title: "Role",
                type: "radio",
                value: roleFilter,
                onChange: (v) => setRoleFilter(String(v)),
                options: [
                    { label: "All", value: "all" },
                    { label: "Customer", value: "CUSTOMER" },
                    { label: "Employee", value: "EMPLOYEE" },
                    { label: "Manager", value: "MANAGER" },
                    //{ label: "Admin", value: "ADMIN" },
                ],
            },
        ],
        [sortField, sortOrder, roleFilter]
    )

    const visibleUsers = useMemo(() => {
        let filtered = [...users]

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (u) =>
                    (u.first_name || "").toLowerCase().includes(term) ||
                    (u.last_name || "").toLowerCase().includes(term) ||
                    (u.email || "").toLowerCase().includes(term) ||
                    (u.role || "").toLowerCase().includes(term)
            )
        }

        if (roleFilter !== "all") {
            filtered = filtered.filter((u) => u.role === roleFilter)
        }

        filtered = [...filtered].sort((a, b) => {
            let comparison = 0

            if (sortField === "best") {
                comparison = a.id - b.id
            } else if (sortField === "last_name") {
                comparison = (a.last_name || "").localeCompare(b.last_name || "")  // ✅ Add null checks
            } else if (sortField === "first_name") {
                comparison = (a.first_name || "").localeCompare(b.first_name || "")  // ✅ Add null checks
            } else if (sortField === "email") {
                comparison = (a.email || "").localeCompare(b.email || "")
            } else if (sortField === "role") {
                comparison = (a.role || "").localeCompare(b.role || "")
            }

            return sortOrder === "desc" ? -comparison : comparison
        })

        return filtered
    }, [users, searchTerm, sortField, sortOrder, roleFilter])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleUsers,
        resetFilters,
    }
}