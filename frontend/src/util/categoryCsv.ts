import { parseCsvLine, rowsToCsv, downloadCsvFile } from "./csvUtils"

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
    downloadCsvFile("categories.csv", rowsToCsv([headers, ...rows]))
}

export function downloadCategoriesTemplate() {
    downloadCsvFile("categories-template.csv", rowsToCsv([["name", "departmentId"]]))
}
