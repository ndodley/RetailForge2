import { parseCsvLine } from "./csvUtils"

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
            headers.forEach((header, i) => {
                row[`col_${i}`] = values[i] ?? ""
            })
            return row
        })

    return { columns, rows }
}

export function exportReviewsCsv(reviews: any[]) {
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

    const csv = [headers, ...rows]
        .map((row) =>
            row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")
        )
        .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "reviews.csv"
    link.click()
    URL.revokeObjectURL(url)
}

export function downloadReviewsTemplate() {
    const headers = ["product_name", "email", "rating", "comment"]
    const csv = [headers].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "reviews-template.csv"
    link.click()
    URL.revokeObjectURL(url)
}