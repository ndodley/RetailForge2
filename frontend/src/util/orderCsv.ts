import type { OrderDetailRecord, OrderRecord } from "../types/store"
import { rowsToCsv, downloadCsvFile } from "./csvUtils"

export function exportOrdersCsv(orders: OrderRecord[]) {
    const headers = ["Order ID", "User Email", "Status", "Total", "Date", "Shipping Address"]

    const rows = orders.map((o) => [
        o.id.toString(),
        o.userEmail,
        o.status,
        o.total.toFixed(2),
        o.createdAt,
        o.shippingAddress,
    ])

    downloadCsvFile(
        `orders-${new Date().toISOString().split("T")[0]}.csv`,
        rowsToCsv([headers, ...rows]),
    )
}

// Moved in from api/orders.ts — this isn't an API call, it's the same
// client-side CSV-download logic as exportOrdersCsv above, just for a
// single order's full detail (including line items).
export function exportOrderDetailCsv(order: OrderDetailRecord) {
    const rows = [
        ["Order ID", order.id],
        ["User Email", order.userEmail],
        ["Total", `$${order.total.toFixed(2)}`],
        ["Status", order.status],
        ["Date", order.createdAt],
        ["Shipping Address", order.shippingAddress],
        [],
        ["Product", "Price", "Quantity", "Subtotal"],
        ...order.items.map((item) => [
            item.productName,
            `$${item.price.toFixed(2)}`,
            item.quantity.toString(),
            `$${(item.price * item.quantity).toFixed(2)}`,
        ]),
    ]

    downloadCsvFile(`order-${order.id}.csv`, rowsToCsv(rows))
}
