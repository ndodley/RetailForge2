import { useEffect, useMemo, useState } from "react"
import categoryAdminApi from "../api/categoryAdmin"
import {
    fetchDepartments,
    getApiErrorMessage,
    type DepartmentDto,
} from "../api/departments"
import { parseCategoryCsv } from "../util/categoryCsv"

export interface CategoryRecord {
    id: number
    name: string
    description: string
    departmentId: number | null
    departmentName: string | null
}

export interface DraftState {
    name: string
    description: string
    departmentId: string
    uploadFile: File | null
    uploadFileName: string
    isUploading: boolean
}

type CategoryTab = "dashboard" | "upsert"

function toCategoryRecord(category: any): CategoryRecord {
    return {
        id: category.id,
        name: category.name,
        description: category.description,
        departmentId: category.departmentId,
        departmentName: category.departmentName,
    }
}

export function useCategories() {
    const [activeTab, setActiveTab] = useState<CategoryTab>("dashboard")
    const [categories, setCategories] = useState<CategoryRecord[]>([])
    const [departments, setDepartments] = useState<DepartmentDto[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const [draft, setDraft] = useState<DraftState>({
        name: "",
        description: "",
        departmentId: "",
        uploadFile: null,
        uploadFileName: "",
        isUploading: false,
    })

    const selectedCategory = useMemo(
        () => categories.find((c) => c.id === selectedCategoryId) ?? null,
        [categories, selectedCategoryId],
    )

    // Load categories + departments
    useEffect(() => {
        async function load() {
            setIsLoading(true)
            try {
                const [catRes, deptRes] = await Promise.all([
                    categoryAdminApi.fetchCategories(),
                    fetchDepartments(),
                ])
                setCategories(catRes.map(toCategoryRecord))
                setDepartments(deptRes)
            } catch (err) {
                setErrorMessage(getApiErrorMessage(err, "Unable to load categories."))
            } finally {
                setIsLoading(false)
            }
        }
        load()
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
            departmentId: "",
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })
    }

    async function reloadCategories() {
        const res = await categoryAdminApi.fetchCategories()
        setCategories(res.map(toCategoryRecord))
    }

    function handleEditCategory(id: number) {
        clearMessages()
        const c = categories.find((x) => x.id === id)
        setSelectedCategoryId(id)
        setDraft({
            name: c?.name ?? "",
            description: c?.description ?? "",
            departmentId: c?.departmentId ? String(c.departmentId) : "",
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })
        setActiveTab("upsert")
    }

    async function handleDeleteCategory(id: number) {
        clearMessages()
        try {
            await categoryAdminApi.deleteCategory(id)
            setCategories((prev) => prev.filter((c) => c.id !== id))
            if (selectedCategoryId === id) resetUpsertState()
            setSuccessMessage("Category deleted successfully.")
        } catch (err) {
            setErrorMessage(getApiErrorMessage(err, "Unable to delete category."))
        }
    }

    async function handleSaveChanges() {
        const name = draft.name.trim()
        const desc = draft.description.trim()
        const deptId = Number.parseInt(draft.departmentId, 10)

        if (!name) return setErrorMessage("Category name is required.")
        if (!desc) return setErrorMessage("Category description is required.")
        if (!Number.isFinite(deptId)) return setErrorMessage("Department is required.")

        clearMessages()
        setIsSaving(true)

        try {
            const payload = { name, description: desc, departmentId: deptId }

            if (selectedCategoryId === null) {
                const created = toCategoryRecord(await categoryAdminApi.createCategory(payload))
                setCategories((prev) => [created, ...prev])
                setSuccessMessage("Category created successfully.")
            } else {
                const updated = toCategoryRecord(
                    await categoryAdminApi.updateCategory(selectedCategoryId, payload),
                )
                setCategories((prev) =>
                    prev.map((c) => (c.id === selectedCategoryId ? updated : c)),
                )
                setSuccessMessage("Category updated successfully.")
            }

            resetUpsertState()
            setActiveTab("dashboard")
        } catch (err) {
            setErrorMessage(getApiErrorMessage(err, "Unable to save category."))
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
                setErrorMessage("CSV contains no valid rows.")
                return
            }

            const result = await categoryAdminApi.bulkCreateCategories(rows)
            await reloadCategories()

            setDraft({
                name: "",
                description: "",
                departmentId: "",
                uploadFile: null,
                uploadFileName: "",
                isUploading: false,
            })

            setActiveTab("dashboard")
            setSuccessMessage(
                `Uploaded ${result.inserted} categor${result.inserted === 1 ? "y" : "ies"} successfully.`,
            )
        } catch (err) {
            setErrorMessage(getApiErrorMessage(err, "Bulk upload failed."))
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
