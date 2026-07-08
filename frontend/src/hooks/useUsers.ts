import { useEffect, useState } from "react"
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkCreateUsers,
    getUserApiErrorMessage,
} from "../api/users"
import type { UserRecord } from "../types/store"
import { parseUserCsv } from "../util/userCsv"

export function useUsers() {
    const [users, setUsers] = useState<UserRecord[]>([])

    const [activeTab, setActiveTab] = useState<"dashboard" | "upsert">("dashboard")
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const [draft, setDraft] = useState({
        id: null as number | null,
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "customer",
        phoneNumber: "",
        address: "",
        uploadFile: null as File | null,
        uploadFileName: "",
        isUploading: false,
    })

    useEffect(() => {
        async function load() {
            setIsLoading(true)
            setErrorMessage("")

            try {
                const usersRes = await fetchUsers()
                setUsers(usersRes)
            } catch (error) {
                setErrorMessage(getUserApiErrorMessage(error, "Unable to load users."))
            } finally {
                setIsLoading(false)
            }
        }

        void load()
    }, [])

    function clearMessages() {
        setErrorMessage("")
        setSuccessMessage("")
    }

    function resetUpsertState() {
        setSelectedUserId(null)
        setDraft({
            id: null,
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            role: "customer",
            phoneNumber: "",
            address: "",
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })
    }

    function handleEditUser(id: number) {
        clearMessages()
        const user = users.find((u) => u.id === id)

        setSelectedUserId(id)
        setDraft({
            id: user?.id || null,
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            email: user?.email ?? "",
            password: "",
            role: user?.role ?? "customer",
            phoneNumber: user?.phoneNumber ?? "",
            address: user?.address ?? "",
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })

        setActiveTab("upsert")
    }

    async function handleDeleteUser(id: number) {
        clearMessages()

        try {
            await deleteUser(id)
            setUsers((prev) => prev.filter((u) => u.id !== id))
            setSuccessMessage("User deleted successfully.")
        } catch (error) {
            setErrorMessage(getUserApiErrorMessage(error, "Unable to delete user."))
        }
    }

    async function handleSaveChanges() {
        const first_name = draft.first_name.trim()
        const last_name = draft.last_name.trim()
        const email = draft.email.trim()
        const role = draft.role

        if (!first_name || !last_name || !email || !role) {
            setErrorMessage("First name, last name, email, and role are required.")
            return
        }

        if (selectedUserId === null && !draft.password) {
            setErrorMessage("Password is required for new users.")
            return
        }

        clearMessages()
        setIsSaving(true)

        try {
            const payload: any = {
                first_name,
                last_name,
                email,
                role,
                phoneNumber: draft.phoneNumber.trim(),
                address: draft.address.trim(),
            }

            if (draft.password) {
                payload.password = draft.password
            }

            if (selectedUserId === null) {
                const created = await createUser(payload)
                setUsers((prev) => [created, ...prev])
                setSuccessMessage("User created successfully.")
            } else {
                const updated = await updateUser(selectedUserId, payload)
                setUsers((prev) =>
                    prev.map((u) => (u.id === selectedUserId ? updated : u))
                )
                setSuccessMessage("User updated successfully.")
            }

            resetUpsertState()
            setActiveTab("dashboard")
        } catch (error) {
            setErrorMessage(getUserApiErrorMessage(error, "Unable to save user."))
        } finally {
            setIsSaving(false)
        }
    }

    async function handleBulkUpload() {
        if (!draft.uploadFile) {
            setErrorMessage("Select a CSV file before uploading.")
            return
        }

        clearMessages()
        setDraft((d) => ({ ...d, isUploading: true }))

        try {
            const rows = await parseUserCsv(draft.uploadFile)

            if (rows.length === 0) {
                throw new Error("No user rows found in CSV.")
            }

            const result = await bulkCreateUsers(rows)
            setSuccessMessage(`Uploaded ${result.inserted} users successfully.`)

            const refreshed = await fetchUsers()
            setUsers(refreshed)

            resetUpsertState()
            setActiveTab("dashboard")
        } catch (error) {
            setErrorMessage(getUserApiErrorMessage(error, "Unable to complete bulk upload."))
        } finally {
            setDraft((d) => ({ ...d, isUploading: false }))
        }
    }

    return {
        users,
        draft,
        setDraft,
        activeTab,
        setActiveTab,
        isLoading,
        isSaving,
        errorMessage,
        successMessage,
        clearMessages,
        resetUpsertState,
        handleEditUser,
        handleDeleteUser,
        handleSaveChanges,
        handleBulkUpload,
    }
}