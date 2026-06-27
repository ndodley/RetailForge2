import { useMemo, useState } from "react"

export function usePagination<T>(items: T[], pageSize: number) {
    const [page, setPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)

    const pagedItems = useMemo(
        () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
        [items, safePage, pageSize],
    )

    return { page, setPage, safePage, totalPages, pagedItems }
}
