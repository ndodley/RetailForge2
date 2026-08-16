import { parseCsvLine, rowsToCsv, downloadCsvFile } from "./csvUtils"
import type { UserRecord } from "../types/store"

interface UserCsvRow {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
    phoneNumber?: string
    address?: string
}

export async function parseUserCsv(file: File): Promise<UserCsvRow[]> {
    const text = await file.text()
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

    if (lines.length === 0) return []

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
    const firstNameIndex = headers.indexOf("firstName")
    const lastNameIndex = headers.indexOf("lastName")
    const emailIndex = headers.indexOf("email")
    const passwordIndex = headers.indexOf("password")
    const roleIndex = headers.indexOf("role")
    const phoneIndex = headers.indexOf("phoneNumber")
    const addressIndex = headers.indexOf("address")

    if (
        firstNameIndex === -1 ||
        lastNameIndex === -1 ||
        emailIndex === -1 ||
        passwordIndex === -1 ||
        roleIndex === -1
    ) {
        throw new Error(
            "CSV must include firstName, lastName, email, password, and role columns."
        )
    }

    return lines
        .slice(1)
        .map((line) => parseCsvLine(line))
        .map((cols) => ({
            firstName: cols[firstNameIndex]?.trim() ?? "",
            lastName: cols[lastNameIndex]?.trim() ?? "",
            email: cols[emailIndex]?.trim() ?? "",
            password: cols[passwordIndex]?.trim() ?? "",
            role: cols[roleIndex]?.trim() ?? "",
            phoneNumber: phoneIndex !== -1 ? cols[phoneIndex]?.trim() : undefined,
            address: addressIndex !== -1 ? cols[addressIndex]?.trim() : undefined,
        }))
        .filter((row) => row.firstName && row.lastName && row.email && row.password && row.role)
}

export function exportUsersCsv(users: UserRecord[]) {
    const headers = [
        "firstName",
        "lastName",
        "email",
        "password",
        "role",
        "phoneNumber",
        "address",
    ]
    const rows = users.map((u) => [
        u.first_name,
        u.last_name,
        u.email,
        "********",
        u.role,
        u.phoneNumber || "",
        u.address || "",
    ])

    downloadCsvFile("users.csv", rowsToCsv([headers, ...rows]))
}

export function downloadUsersTemplate() {
    const headers = [
        "firstName",
        "lastName",
        "email",
        "password",
        "role",
        "phoneNumber",
        "address",
    ]
    downloadCsvFile("users_template.csv", rowsToCsv([headers]))
}