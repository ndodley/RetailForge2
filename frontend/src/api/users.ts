import axios from "axios"

export interface UserDto {
    id: number
    first_name: string
    last_name: string
    email: string
    password?: string
    role: string
    phoneNumber: string
    address: string
    avatar_path: string | null
}

export interface UserBulkRowDto {
    first_name: string
    last_name: string
    email: string
    password: string
    role: string
    phoneNumber?: string
    address?: string
}

export interface UserBulkResultDto {
    inserted: number
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
    withCredentials: true,
})

export async function fetchUsers() {
    const { data } = await apiClient.get<UserDto[]>("/api/users")
    return data
}

export async function createUser(payload: Partial<UserDto>) {
    const { data } = await apiClient.post<UserDto>("/api/users", payload)
    return data
}

export async function updateUser(id: number, payload: Partial<UserDto>) {
    const { data } = await apiClient.put<UserDto>(`/api/users/${id}`, payload)
    return data
}

export async function deleteUser(id: number) {
    await apiClient.delete(`/api/users/${id}`)
}

export async function bulkCreateUsers(rows: UserBulkRowDto[]) {
    const { data } = await apiClient.post<UserBulkResultDto>("/api/users/bulk", {
        rows,
    })
    return data
}

export function getApiErrorMessage(error: any, fallback: string): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? fallback
    }
    if (error instanceof Error) {
        return error.message
    }
    return fallback
}