import { parseCsvLine, rowsToCsv, downloadCsvFile } from "./csvUtils"
import type { CategoryRecord } from "../types/store"

export async function parseCategoryCsv(file: File) {
    const text = await file.text()
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

    if (lines.length === 0) return []

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
    const nameIndex = headers.indexOf("name")
    const descriptionIndex = headers.indexOf("description")
    const departmentNameIndex = headers.indexOf("department_name")
    const departmentIdIndex = headers.indexOf("departmentid")

    if (
        nameIndex === -1 ||
        descriptionIndex === -1 ||
        (departmentNameIndex === -1 && departmentIdIndex === -1)
    ) {
        throw new Error(
            "CSV must include name, description, and department_name (or departmentId) columns."
        )
    }

    return lines
        .slice(1)
        .map((line) => parseCsvLine(line))
        .map((cols) => ({
            name: cols[nameIndex]?.trim() ?? "",
            description: cols[descriptionIndex]?.trim() ?? "",
            departmentName:
                departmentNameIndex !== -1
                    ? cols[departmentNameIndex]?.trim() || undefined
                    : undefined,
            departmentId:
                departmentIdIndex !== -1 && cols[departmentIdIndex]?.trim()
                    ? Number(cols[departmentIdIndex])
                    : undefined,
        }))
        .filter((row) => row.name.length > 0)
}

export function exportCategoriesCsv(categories: CategoryRecord[]) {
    const headers = ["name", "description", "department_name"]
    const rows = categories.map((c) => [c.name, c.description, c.departmentName ?? ""])
    downloadCsvFile("categories.csv", rowsToCsv([headers, ...rows]))
}

export function downloadCategoriesTemplate() {
    downloadCsvFile(
        "categories-template.csv",
        rowsToCsv([["name", "description", "department_name"]])
    )
}
