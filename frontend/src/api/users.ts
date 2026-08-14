import api, { getApiErrorMessage, API_BASE_URL } from "./apiClient"
import type { UserRecord } from "../types/store"

export const DEFAULT_AVATAR_PATH = "/images/other_images/default_avatar.jpg"

// Shared avatar-URL builder. Was previously redeclared independently (as a
// local apiBaseUrl + DEFAULT_AVATAR + ternary) in Navbar, ReviewRow,
// MyProfilePage, and every admin table/page that shows a user's avatar.
export function buildAvatarUrl(avatarPath: string | null | undefined) {
    const normalized = avatarPath?.trim() || DEFAULT_AVATAR_PATH
    if (/^https?:\/\//i.test(normalized)) {
        return normalized
    }
    return `${API_BASE_URL}${normalized.startsWith("/") ? normalized : `/${normalized}`}`
}

export interface UserDto {
    id: number
    firstName: string  // ✅ Changed from first_name
    lastName: string   // ✅ Changed from last_name
    email: string
    passwordHash?: string  // ✅ Changed from password
    role: string
    phoneNumber: string
    address: string
    avatar_path: string | null
}

export interface UserBulkRowDto {
    firstName: string  // ✅ Changed from first_name
    lastName: string   // ✅ Changed from last_name
    email: string
    password: string
    role: string
    phoneNumber?: string
    address?: string
}

export interface UserBulkResultDto {
    inserted: number
}

export interface UserUpsertPayload {
    first_name: string
    last_name: string
    email: string
    password?: string
    role: string
    phoneNumber: string
    address: string
    avatar_path?: string | null
}

// ✅ Add mapper function to convert backend DTO to frontend Record
function mapDtoToRecord(dto: UserDto): UserRecord {
    return {
        id: dto.id,
        first_name: dto.firstName,  // Map camelCase to snake_case
        last_name: dto.lastName,
        email: dto.email,
        role: dto.role,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        avatar_path: dto.avatar_path,
    }
}

export async function fetchUsers() {
    const { data } = await api.get<UserDto[]>("/api/users")
    return data.map(mapDtoToRecord)
}

export async function fetchUserById(id: number) {
    const { data } = await api.get<UserDto>(`/api/users/${id}`)
    return mapDtoToRecord(data)
}

export async function createUser(payload: UserUpsertPayload) {
    // Map frontend fields to backend fields
    const backendPayload = {
        firstName: payload.first_name,
        lastName: payload.last_name,
        email: payload.email,
        passwordHash: payload.password,
        role: payload.role,
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        avatar_path: payload.avatar_path || null,
    }

    const { data } = await api.post<UserDto>("/api/users", backendPayload)
    return mapDtoToRecord(data)
}

export async function updateUser(id: number, payload: UserUpsertPayload) {
    // Map frontend fields to backend fields
    const backendPayload: Partial<UserDto> = {
        firstName: payload.first_name,
        lastName: payload.last_name,
        email: payload.email,
        role: payload.role,
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        avatar_path: payload.avatar_path || null,
    }

    // Only include password if provided
    if (payload.password) {
        backendPayload.passwordHash = payload.password
    }

    const { data } = await api.put<UserDto>(`/api/users/${id}`, backendPayload)
    return mapDtoToRecord(data)
}

export async function deleteUser(id: number) {
    await api.delete(`/api/users/${id}`)
}

export async function uploadUserAvatar(id: number, file: File) {
    const form = new FormData()
    form.append("avatar", file)

    const { data } = await api.put<UserDto>(`/api/users/${id}/avatar`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return mapDtoToRecord(data)
}

export async function bulkCreateUsers(rows: UserBulkRowDto[]) {
    // Map frontend fields to backend fields
    const backendRows = rows.map(row => ({
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        password: row.password,
        userRole: row.role,
        phoneNumber: row.phoneNumber || "",
        address: row.address || "",
    }))

    const { data } = await api.post<UserBulkResultDto>("/api/users/bulk", {
        rows: backendRows,
    })
    return data
}

export const getUserApiErrorMessage = getApiErrorMessage