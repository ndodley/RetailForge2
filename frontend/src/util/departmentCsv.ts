import { parseCsvLine, rowsToCsv, downloadCsvFile } from "./csvUtils"
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
    downloadCsvFile("departments.csv", rowsToCsv([headers, ...rows]))
}

export function downloadDepartmentsTemplate() {
    downloadCsvFile("departments-template.csv", rowsToCsv([["name"]]))
}
