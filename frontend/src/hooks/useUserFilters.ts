import { useMemo, useState } from "react"
import type { UserRecord } from "../types/store"
import type { FilterSection } from "../components/common/AdvancedSearchPanel"

type SortField = "best" | "last_name" | "first_name" | "email" | "role"
type SortOrder = "asc" | "desc"

export function useUserFilters(users: UserRecord[]) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [roleFilter, setRoleFilter] = useState<string | null>(null)

    const visibleUsers = useMemo(() => {
        let filtered = users

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (u) =>
                    u.first_name.toLowerCase().includes(term) ||
                    u.last_name.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term) ||
                    u.role.toLowerCase().includes(term)
            )
        }

        if (roleFilter !== null) {
            filtered = filtered.filter((u) => u.role === roleFilter)
        }

        filtered = [...filtered].sort((a, b) => {
            let comparison = 0

            if (sortField === "best") {
                comparison = a.id - b.id
            } else if (sortField === "last_name") {
                comparison = a.last_name.localeCompare(b.last_name)
            } else if (sortField === "first_name") {
                comparison = a.first_name.localeCompare(b.first_name)
            } else if (sortField === "email") {
                comparison = a.email.localeCompare(b.email)
            } else if (sortField === "role") {
                comparison = a.role.localeCompare(b.role)
            }

            return sortOrder === "desc" ? -comparison : comparison
        })

        return filtered
    }, [users, searchTerm, sortField, sortOrder, roleFilter])

    const filterSections: FilterSection[] = [
        {
            label: "Sort",
            options: [
                {
                    value: "best",
                    label: "Best Match",
                    checked: sortField === "best",
                    onChange: () => setSortField("best"),
                },
                {
                    value: "last_name",
                    label: "Last Name",
                    checked: sortField === "last_name",
                    onChange: () => setSortField("last_name"),
                },
                {
                    value: "first_name",
                    label: "First Name",
                    checked: sortField === "first_name",
                    onChange: () => setSortField("first_name"),
                },
                {
                    value: "email",
                    label: "Email",
                    checked: sortField === "email",
                    onChange: () => setSortField("email"),
                },
                {
                    value: "role",
                    label: "Role",
                    checked: sortField === "role",
                    onChange: () => setSortField("role"),
                },
            ],
        },
        {
            label: "Order",
            options: [
                {
                    value: "asc",
                    label: "Ascending",
                    checked: sortOrder === "asc",
                    onChange: () => setSortOrder("asc"),
                },
                {
                    value: "desc",
                    label: "Descending",
                    checked: sortOrder === "desc",
                    onChange: () => setSortOrder("desc"),
                },
            ],
        },
        {
            label: "Role",
            options: [
                {
                    value: "all",
                    label: "All",
                    checked: roleFilter === null,
                    onChange: () => setRoleFilter(null),
                },
                {
                    value: "customer",
                    label: "Customer",
                    checked: roleFilter === "customer",
                    onChange: () => setRoleFilter("customer"),
                },
                {
                    value: "employee",
                    label: "Employee",
                    checked: roleFilter === "employee",
                    onChange: () => setRoleFilter("employee"),
                },
                {
                    value: "manager",
                    label: "Manager",
                    checked: roleFilter === "manager",
                    onChange: () => setRoleFilter("manager"),
                },
                {
                    value: "admin",
                    label: "Admin",
                    checked: roleFilter === "admin",
                    onChange: () => setRoleFilter("admin"),
                },
            ],
        },
    ]

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleUsers,
    }
}