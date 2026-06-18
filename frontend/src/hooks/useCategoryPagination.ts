import { useMemo, useState } from "react"
import type { CategoryRecord } from "./useCategories"

const pageSize = 6

export function useCategoryPagination(visibleCategories: CategoryRecord[]) {
    const [page, setPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(visibleCategories.length / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)

    const pagedCategories = useMemo(
        () =>
            visibleCategories.slice(
                (safePage - 1) * pageSize,
                safePage * pageSize,
            ),
        [visibleCategories, safePage],
    )

    return {
        page,
        setPage,
        safePage,
        totalPages,
        pagedCategories,
        pageSize,
    }
}
