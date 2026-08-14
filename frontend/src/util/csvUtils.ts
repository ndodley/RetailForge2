// Shared by every *Csv.ts export/template function: quotes and escapes each
// field (so values containing commas or quotes don't corrupt the file) and
// joins everything into one CSV string. Pass the header row as the first
// row, e.g. rowsToCsv([headers, ...dataRows]).
export function rowsToCsv(rows: Array<Array<string | number | null | undefined>>): string {
    return rows
        .map((row) => row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","))
        .join("\n")
}

// Shared by every *Csv.ts export/template function: triggers a browser
// download of the given CSV content under the given filename.
export function downloadCsvFile(
    filename: string,
    csvContent: string,
    mimeType = "text/csv;charset=utf-8;",
) {
    const blob = new Blob([csvContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

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
