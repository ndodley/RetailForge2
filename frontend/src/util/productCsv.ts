import type { ProductAdminBulkRowDto } from "../api/productAdminApi"
import type { ProductRecord } from "../types/store"
import { parseCsvLine } from "./csvUtils"

export async function parseProductCsv(file: File): Promise<ProductAdminBulkRowDto[]> {
    const text = await file.text()
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

    if (lines.length === 0) return []

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
    const nameIndex = headers.indexOf("name")
    const brandIndex = headers.indexOf("brand")
    const ratingIndex = headers.indexOf("rating")
    const descriptionIndex = headers.indexOf("description")
    const priceIndex = headers.indexOf("price")
    const stockIndex = headers.indexOf("stock")
    const categoryNameIndex = headers.indexOf("category_name")
    const departmentNameIndex = headers.indexOf("department_name")
    const imagePathIndex = headers.indexOf("image_path")

    if (
        nameIndex === -1 ||
        descriptionIndex === -1 ||
        priceIndex === -1 ||
        stockIndex === -1 ||
        categoryNameIndex === -1
    ) {
        throw new Error(
            "CSV must include name, description, price, stock, and category_name columns."
        )
    }

    return lines
        .slice(1)
        .map((line) => parseCsvLine(line))
        .map((cols) => ({
            name: cols[nameIndex]?.trim() ?? "",
            brand: cols[brandIndex]?.trim() || undefined,
            rating: ratingIndex !== -1 ? parseFloat(cols[ratingIndex]) || 0 : undefined,
            description: cols[descriptionIndex]?.trim() ?? "",
            price: parseFloat(cols[priceIndex]) || 0,
            stock: parseInt(cols[stockIndex]) || 0,
            categoryName: cols[categoryNameIndex]?.trim() ?? "",
            departmentName:
                departmentNameIndex !== -1 ? cols[departmentNameIndex]?.trim() : undefined,
            imagePath: imagePathIndex !== -1 ? cols[imagePathIndex]?.trim() : undefined,
        }))
        .filter((row) => row.name.length > 0 && row.categoryName.length > 0)
}

export function exportProductsCsv(products: ProductRecord[]) {
    const headers = [
        "name",
        "brand",
        "rating",
        "description",
        "price",
        "stock",
        "category_name",
        "department_name",
        "image_path",
    ]
    const rows = products.map((p) => [
        p.name,
        p.brand || "",
        p.rating,
        p.description,
        p.price,
        p.stock,
        p.categoryName || "",
        p.departmentName || "",
        p.imagePath || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "products.csv"
    a.click()
    URL.revokeObjectURL(url)
}

export function downloadProductsTemplate() {
    const headers = [
        "name",
        "brand",
        "rating",
        "description",
        "price",
        "stock",
        "category_name",
        "department_name",
        "image_path",
    ]
    const csv = headers.join(",")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "products_template.csv"
    a.click()
    URL.revokeObjectURL(url)
}