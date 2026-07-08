import { useEffect, useMemo, useState } from "react"
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkCreateCategories,
    getCategoryApiErrorMessage,
} from "../api/categories"

import { fetchDepartments } from "../api/departments"
import type { CategoryRecord } from "../types/store"
import { parseCategoryCsv } from "../util/categoryCsv"

export function useCategories() {
    const [categories, setCategories] = useState<CategoryRecord[]>([])
    const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])

    const [activeTab, setActiveTab] = useState<"dashboard" | "upsert">("dashboard")
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const [draft, setDraft] = useState({
        name: "",
        description: "",
        departmentId: 0,
        uploadFile: null as File | null,
        uploadFileName: "",
        isUploading: false,
    })

    const selectedCategory = useMemo(
        () => categories.find((c) => c.id === selectedCategoryId) ?? null,
        [categories, selectedCategoryId],
    )

    useEffect(() => {
        async function load() {
            setIsLoading(true)
            setErrorMessage("")

            try {
                const [catRes, deptRes] = await Promise.all([
                    fetchCategories(),
                    fetchDepartments(),
                ])

                setCategories(catRes)
                setDepartments(deptRes)
            } catch (error) {
                setErrorMessage(getCategoryApiErrorMessage(error, "Unable to load categories."))
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
        setSelectedCategoryId(null)
        setDraft({
            name: "",
            description: "",
            departmentId: 0,
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })
    }

    function handleEditCategory(id: number) {
        clearMessages()
        const cat = categories.find((c) => c.id === id)

        setSelectedCategoryId(id)
        setDraft({
            name: cat?.name ?? "",
            description: cat?.description ?? "",
            departmentId: cat?.departmentId ?? 0,
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })

        setActiveTab("upsert")
    }

    async function handleDeleteCategory(id: number) {
        clearMessages()

        try {
            await deleteCategory(id)
            setCategories((prev) => prev.filter((c) => c.id !== id))
            setSuccessMessage("Category deleted successfully.")
        } catch (error) {
            setErrorMessage(getCategoryApiErrorMessage(error, "Unable to delete category."))
        }
    }

    async function handleSaveChanges() {
        const name = draft.name.trim()
        const departmentId = draft.departmentId

        if (!name || !departmentId) {
            setErrorMessage("Name and department are required.")
            return
        }

        clearMessages()
        setIsSaving(true)

        try {
            if (selectedCategoryId === null) {
                const created = await createCategory({
                    name,
                    description: draft.description.trim(),
                    departmentId,
                })

                setCategories((prev) => [created, ...prev])
                setSuccessMessage("Category created successfully.")
            } else {
                const updated = await updateCategory(selectedCategoryId, {
                    name,
                    description: draft.description.trim(),
                    departmentId,
                })

                setCategories((prev) =>
                    prev.map((c) => (c.id === selectedCategoryId ? updated : c)),
                )

                setSuccessMessage("Category updated successfully.")
            }

            resetUpsertState()
            setActiveTab("dashboard")
        } catch (error) {
            setErrorMessage(getCategoryApiErrorMessage(error, "Unable to save category."))
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
            const rows = await parseCategoryCsv(draft.uploadFile)

            if (rows.length === 0) {
                throw new Error("No category rows found in CSV.")
            }

            const result = await bulkCreateCategories(rows)
            setSuccessMessage(`Uploaded ${result.inserted} categories successfully.`)

            const refreshed = await fetchCategories()
            setCategories(refreshed)

            resetUpsertState()
            setActiveTab("dashboard")
        } catch (error) {
            setErrorMessage(getCategoryApiErrorMessage(error, "Unable to complete category bulk upload."))
        } finally {
            setDraft((d) => ({ ...d, isUploading: false }))
        }
    }

    return {
        categories,
        departments,
        selectedCategory,
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
        handleEditCategory,
        handleDeleteCategory,
        handleSaveChanges,
        handleBulkUpload,
    }
}