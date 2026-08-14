import { parseCsvLine, rowsToCsv, downloadCsvFile } from "./csvUtils"
import type { ReviewRecord } from "../types/store"

export async function parseReviewCsv(file: File) {
    const text = await file.text()
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

    if (lines.length === 0) return []

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())

    const productNameIndex = headers.indexOf("product_name")
    const emailIndex = headers.indexOf("email")
    const ratingIndex = headers.indexOf("rating")
    const commentIndex = headers.indexOf("comment")

    if (
        productNameIndex === -1 ||
        emailIndex === -1 ||
        ratingIndex === -1 ||
        commentIndex === -1
    ) {
        throw new Error(
            "CSV must include product_name, email, rating, and comment columns."
        )
    }

    return lines
        .slice(1)
        .map((line) => parseCsvLine(line))
        .map((cols) => ({
            productName: cols[productNameIndex]?.trim() ?? "",
            userEmail: cols[emailIndex]?.trim() ?? "",
            rating: parseFloat(cols[ratingIndex]) || 0,
            comment: cols[commentIndex]?.trim() ?? "",
        }))
        .filter((row) => row.productName.length > 0 && row.userEmail.length > 0)
}

/**
 * ⭐ Parse CSV for preview (NEW FUNCTION)
 */
export function parseCsvPreview(text: string) {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

    if (lines.length === 0) {
        return {
            columns: [],
            rows: [],
        }
    }

    const headers = parseCsvLine(lines[0])
    const columns = headers.map((h, i) => ({
        key: `col_${i}`,
        label: h,
    }))

    const rows = lines
        .slice(1, 11) // First 10 rows only for preview
        .map((line) => {
            const values = parseCsvLine(line)
            const row: Record<string, string | number> = {}
            headers.forEach((_, i) => {
                row[`col_${i}`] = values[i] ?? ""
            })
            return row
        })

    return { columns, rows }
}

export function exportReviewsCsv(reviews: ReviewRecord[]) {
    const headers = [
        "product_name",
        "email",
        "rating",
        "comment",
        "created_at",
        "updated_at",
    ]

    const rows = reviews.map((r) => [
        r.productName,
        r.userEmail,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
    ])

    downloadCsvFile("reviews.csv", rowsToCsv([headers, ...rows]))
}

export function downloadReviewsTemplate() {
    const headers = ["product_name", "email", "rating", "comment"]
    downloadCsvFile("reviews-template.csv", rowsToCsv([headers]))
}