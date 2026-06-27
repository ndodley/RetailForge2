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
