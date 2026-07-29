import { parseCsvLine } from "./csvUtils"
import type { DepartmentRecord } from "../types/store"

export async function parseDepartmentCsv(file: File) {
    const text = await file.text()
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

    if (lines.length === 0) return []

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
    const nameIndex = headers.indexOf("name")

    if (nameIndex === -1) {
        throw new Error("CSV must include a name column.")
    }

    return lines
        .slice(1)
        .map((line) => parseCsvLine(line))
        .map((cols) => ({ name: cols[nameIndex]?.trim() ?? "" }))
        .filter((row) => row.name.length > 0)
}

export function exportDepartmentsCsv(departments: DepartmentRecord[]) {
    const headers = ["name"]
    const rows = departments.map((d) => [d.name])

    const csv = [headers, ...rows]
        .map((row) =>
            row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
        )
        .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "departments.csv"
    link.click()
    URL.revokeObjectURL(url)
}

export function downloadDepartmentsTemplate() {
    const csv = "name\n"
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "departments-template.csv"
    link.click()
    URL.revokeObjectURL(url)
}
