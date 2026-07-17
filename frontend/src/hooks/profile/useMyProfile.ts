import { useEffect, useState } from "react"
import { useAuth } from "../useAuth"
import {
    fetchUserById,
    updateUser,
    uploadUserAvatar,
    getUserApiErrorMessage,
} from "../../api/users"
import type { UserRecord } from "../../types/store"

interface ProfileDraft {
    first_name: string
    last_name: string
    email: string
    phoneNumber: string
    address: string
}

function draftFromProfile(profile: UserRecord | null): ProfileDraft {
    return {
        first_name: profile?.first_name ?? "",
        last_name: profile?.last_name ?? "",
        email: profile?.email ?? "",
        phoneNumber: profile?.phoneNumber ?? "",
        address: profile?.address ?? "",
    }
}

export function useMyProfile() {
    const { user: authUser, refreshUser } = useAuth()

    const [profile, setProfile] = useState<UserRecord | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [draft, setDraft] = useState<ProfileDraft>(draftFromProfile(null))

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        async function load() {
            if (!authUser) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setErrorMessage("")

            try {
                const data = await fetchUserById(authUser.id)
                setProfile(data)
                setDraft(draftFromProfile(data))
            } catch (error) {
                setErrorMessage(getUserApiErrorMessage(error, "Failed to load your profile."))
            } finally {
                setIsLoading(false)
            }
        }

        void load()
    }, [authUser])

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl("")
            return
        }

        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)

        return () => URL.revokeObjectURL(url)
    }, [selectedFile])

    function clearMessages() {
        setErrorMessage("")
        setSuccessMessage("")
    }

    function startEdit() {
        clearMessages()
        setIsEditing(true)
    }

    function cancelEdit() {
        clearMessages()
        setIsEditing(false)
        setDraft(draftFromProfile(profile))
    }

    async function saveProfile() {
        if (!profile) return

        const first_name = draft.first_name.trim()
        const last_name = draft.last_name.trim()
        const email = draft.email.trim()

        if (!first_name || !last_name || !email) {
            setErrorMessage("First name, last name, and email are required.")
            return
        }

        clearMessages()
        setIsSaving(true)

        try {
            const updated = await updateUser(profile.id, {
                first_name,
                last_name,
                email,
                role: profile.role,
                phoneNumber: draft.phoneNumber.trim(),
                address: draft.address.trim(),
            })
            setProfile(updated)
            setDraft(draftFromProfile(updated))
            setIsEditing(false)
            setSuccessMessage("Profile updated successfully.")
            await refreshUser()
        } catch (error) {
            setErrorMessage(getUserApiErrorMessage(error, "Failed to update your profile."))
        } finally {
            setIsSaving(false)
        }
    }

    async function handleUploadAvatar() {
        if (!profile) return

        if (!selectedFile) {
            setErrorMessage("Please choose an image first.")
            return
        }

        clearMessages()
        setIsUploading(true)

        try {
            const updated = await uploadUserAvatar(profile.id, selectedFile)
            setProfile(updated)
            setSelectedFile(null)
            setPreviewUrl("")
            setSuccessMessage("Avatar updated successfully.")
            await refreshUser()
        } catch (error) {
            setErrorMessage(getUserApiErrorMessage(error, "Failed to upload avatar."))
        } finally {
            setIsUploading(false)
        }
    }

    return {
        profile,
        isLoading,
        errorMessage,
        successMessage,
        isEditing,
        isSaving,
        draft,
        setDraft,
        startEdit,
        cancelEdit,
        saveProfile,
        selectedFile,
        setSelectedFile,
        previewUrl,
        isUploading,
        handleUploadAvatar,
    }
}
