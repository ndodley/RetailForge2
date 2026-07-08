import type { OrderRecord } from "../types/store"

export function exportOrdersCsv(orders: OrderRecord[]) {
    const headers = ["Order ID", "User Email", "Status", "Total", "Date", "Shipping Address"]
    const rows = orders.map((o) => [
        o.id.toString(),
        o.userEmail,
        o.status,
        o.total.toFixed(2),
        o.createdAt,
        `"${o.shippingAddress.replace(/"/g, '""')}"`,
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
}