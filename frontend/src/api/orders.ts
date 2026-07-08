import axios from "axios"
import api from "./axios"
import type { OrderRecord, OrderDetailRecord } from "../types/store"

interface BackendOrderItemDto {
    id: number
    productId: number
    productName: string
    imagePath: string | null
    price: number
    quantity: number
}

interface BackendOrderDto {
    id: number
    userId: number
    userEmail: string
    address: string
    total: number
    status: string
    createdAt: string | { year: number; month: number; day: number; hour: number; minute: number; second: number; nano: number }
    items?: BackendOrderItemDto[]
}

function formatTimestamp(ts: BackendOrderDto["createdAt"]): string {
    if (typeof ts === "string") {
        return new Date(ts).toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        })
    }

    const date = new Date(ts.year, ts.month - 1, ts.day, ts.hour, ts.minute, ts.second)
    return date.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    })
}

function mapOrder(dto: BackendOrderDto): OrderRecord {
    return {
        id: dto.id,
        userId: dto.userId,
        userEmail: dto.userEmail,
        total: dto.total,
        status: dto.status,
        shippingAddress: dto.address,
        createdAt: formatTimestamp(dto.createdAt),
    }
}

function mapOrderDetail(dto: BackendOrderDto): OrderDetailRecord {
    return {
        ...mapOrder(dto),
        items: (dto.items ?? []).map((item) => ({
            productId: item.productId,
            productName: item.productName,
            imagePath: item.imagePath,
            price: item.price,
            quantity: item.quantity,
        })),
    }
}

export async function fetchOrders(): Promise<OrderRecord[]> {
    const { data } = await api.get<BackendOrderDto[]>("/api/admin/orders")
    return data.map(mapOrder)
}

export async function fetchOrderById(id: number): Promise<OrderDetailRecord> {
    const { data } = await api.get<BackendOrderDto>(`/api/admin/orders/${id}`)
    return mapOrderDetail(data)
}

export async function updateOrderStatus(id: number, status: string): Promise<void> {
    await api.put(`/api/admin/orders/${id}/status`, { status })
}

export async function deleteOrder(id: number): Promise<void> {
    await api.delete(`/api/admin/orders/${id}`)
}

export function getOrderApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? fallback
    }
    if (error instanceof Error) {
        return error.message
    }
    return fallback
}

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

    const csv = rows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `order-${order.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
}