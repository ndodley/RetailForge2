import { parseCsvLine } from "./csvUtils"

export async function parseCategoryCsv(file: File) {
    const text = await file.text()
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

    if (lines.length === 0) return []

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
    const nameIndex = headers.indexOf("name")
    const deptIndex = headers.indexOf("departmentid")

    if (nameIndex === -1 || deptIndex === -1) {
        throw new Error("CSV must include name and departmentId columns.")
    }

    return lines
        .slice(1)
        .map((line) => parseCsvLine(line))
        .map((cols) => ({
            name: cols[nameIndex]?.trim() ?? "",
            description: "",
            departmentId: Number(cols[deptIndex] ?? 0),   // ALWAYS NUMBER
        }))
        .filter((row) => row.name.length > 0)
}

export function exportCategoriesCsv(rows: (string | number | null)[][]) {
    const headers = ["name", "departmentId"]
    const csv = [headers, ...rows]
        .map((row) =>
            row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
        )
        .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "categories.csv"
    link.click()
    URL.revokeObjectURL(url)
}

export function downloadCategoriesTemplate() {
    const csv = "name,departmentId\n"
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "categories-template.csv"
    link.click()
    URL.revokeObjectURL(url)
}
