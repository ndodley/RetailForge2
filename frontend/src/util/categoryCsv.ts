export function parseCsvLine(line: string) {
    const values: string[] = []
    let current = ""
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
        const c = line[i]
        const next = line[i + 1]

        if (c === '"') {
            if (insideQuotes && next === '"') {
                current += '"'
                i++
            } else {
                insideQuotes = !insideQuotes
            }
            continue
        }

        if (c === "," && !insideQuotes) {
            values.push(current)
            current = ""
            continue
        }

        current += c
    }

    values.push(current)
    return values.map((v) => v.trim())
}

export async function parseCategoryCsv(file: File) {
    const text = await file.text()
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

    if (lines.length === 0) return []

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
    const nameIndex = headers.indexOf("name")
    const descIndex = headers.indexOf("description")
    const deptNameIndex = headers.indexOf("department_name")
    const deptIdIndex = headers.indexOf("department_id")

    if (nameIndex === -1 || descIndex === -1 || (deptNameIndex === -1 && deptIdIndex === -1)) {
        throw new Error("CSV must include name, description, and department_name.")
    }

    return lines.slice(1).map((line) => {
        const cols = parseCsvLine(line)
        const deptIdText = deptIdIndex === -1 ? "" : cols[deptIdIndex]?.trim() ?? ""
        const parsedDeptId = deptIdText ? Number.parseInt(deptIdText, 10) : undefined

        return {
            name: cols[nameIndex]?.trim() ?? "",
            description: cols[descIndex]?.trim() ?? "",
            departmentName: deptNameIndex === -1 ? undefined : cols[deptNameIndex]?.trim() ?? "",
            departmentId: Number.isFinite(parsedDeptId) ? parsedDeptId : undefined,
        }
    })
}

export function exportCategoriesCsv(categories: any[]) {
    const headers = ["name", "description", "department_name"]
    const rows = categories.map((c) => [
        c.name,
        c.description,
        c.departmentName ?? "",
    ])

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
    const csv = "name,description,department_name\n"
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "categories-template.csv"
    link.click()
    URL.revokeObjectURL(url)
}
