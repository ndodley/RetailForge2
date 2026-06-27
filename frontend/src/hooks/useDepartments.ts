import { useEffect, useMemo, useState } from "react"
import {
    bulkCreateDepartments,
    createDepartment,
    deleteDepartment as deleteDepartmentRequest,
    fetchDepartments,
    getApiErrorMessage,
    updateDepartment as updateDepartmentRequest,
    type DepartmentDto,
} from "../api/departments"

import type { DepartmentRecord, DepartmentStatus } from "../types/store"
import { parseDepartmentCsv } from "../util/departmentCsv"

const defaultStatus: DepartmentStatus = "active"
const defaultDescription =
    "Departments are used to group categories and products."
const defaultManager = "Unassigned"
const defaultFeaturedProduct = "No featured product yet"

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

function toDepartmentRecord(department: DepartmentDto): DepartmentRecord {
    return {
        id: department.id,
        name: department.name,
        slug: slugify(department.name),
        description: defaultDescription,
        categoryCount: 0,
        productCount: 0,
        featuredProduct: defaultFeaturedProduct,
        manager: defaultManager,
        updatedAt: new Date().toISOString().slice(0, 10),
        status: defaultStatus,
    }
}

export function useDepartments() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "upsert">("dashboard")
    const [departments, setDepartments] = useState<DepartmentRecord[]>([])
    const [selectedDepartmentId, setSelectedDepartmentId] =
        useState<number | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const [draft, setDraft] = useState({
        name: "",
        uploadFile: null as File | null,
        uploadFileName: "",
        isUploading: false,
    })

    const selectedDepartment = useMemo(
        () => departments.find((d) => d.id === selectedDepartmentId) ?? null,
        [departments, selectedDepartmentId],
    )

    useEffect(() => {
        async function loadDepartments() {
            setIsLoading(true)
            setErrorMessage("")

            try {
                const response = await fetchDepartments()
                setDepartments(response.map(toDepartmentRecord))
            } catch (error) {
                setDepartments([])
                setErrorMessage(
                    getApiErrorMessage(
                        error,
                        "Unable to load departments from the backend.",
                    ),
                )
            } finally {
                setIsLoading(false)
            }
        }

        void loadDepartments()
    }, [])

    function clearMessages() {
        setErrorMessage("")
        setSuccessMessage("")
    }

    function resetUpsertState() {
        setSelectedDepartmentId(null)
        setDraft({
            name: "",
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })
    }

    async function reloadDepartments() {
        const response = await fetchDepartments()
        setDepartments(response.map(toDepartmentRecord))
    }

    function handleEditDepartment(departmentId: number) {
        clearMessages()
        const departmentToEdit = departments.find(
            (department) => department.id === departmentId,
        )
        setSelectedDepartmentId(departmentId)
        setDraft({
            name: departmentToEdit?.name ?? "",
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })
        setActiveTab("upsert")
    }

    async function handleDeleteDepartment(departmentId: number) {
        clearMessages()

        try {
            await deleteDepartmentRequest(departmentId)
            setDepartments((currentDepartments) =>
                currentDepartments.filter(
                    (department) => department.id !== departmentId,
                ),
            )

            if (selectedDepartmentId === departmentId) {
                setSelectedDepartmentId(null)
            }

            setSuccessMessage("Department deleted successfully.")
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(error, "Unable to delete the department."),
            )
        }
    }

    async function handleSaveChanges() {
        const trimmedName = draft.name.trim()

        if (!trimmedName) {
            setErrorMessage("Department name is required.")
            return
        }

        clearMessages()
        setIsSaving(true)

        try {
            if (selectedDepartmentId === null) {
                const createdDepartment = toDepartmentRecord(
                    await createDepartment({ name: trimmedName }),
                )
                setDepartments((currentDepartments) => [
                    createdDepartment,
                    ...currentDepartments,
                ])
                setSelectedDepartmentId(createdDepartment.id)
                setSuccessMessage("Department created successfully.")
            } else {
                const updatedDepartment = toDepartmentRecord(
                    await updateDepartmentRequest(selectedDepartmentId, {
                        name: trimmedName,
                    }),
                )

                setDepartments((currentDepartments) =>
                    currentDepartments.map((department) =>
                        department.id === selectedDepartmentId
                            ? updatedDepartment
                            : department,
                    ),
                )

                setSuccessMessage("Department updated successfully.")
            }

            resetUpsertState()
            setActiveTab("dashboard")
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(error, "Unable to save the department."),
            )
        } finally {
            setIsSaving(false)
        }
    }

    async function handleBulkUpload() {
        if (!draft.uploadFile) {
            setErrorMessage("Select a CSV file before confirming upload.")
            return
        }

        clearMessages()
        setDraft((d) => ({ ...d, isUploading: true }))

        try {
            const rows = await parseDepartmentCsv(draft.uploadFile)

            if (rows.length === 0) {
                throw new Error("No department rows were found in the CSV file.")
            }

            const result = await bulkCreateDepartments(rows)
            await reloadDepartments()
            resetUpsertState()
            setActiveTab("dashboard")
            setSuccessMessage(
                `Uploaded ${result.inserted} department${
                    result.inserted === 1 ? "" : "s"
                } successfully.`,
            )
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    "Unable to complete the bulk upload.",
                ),
            )
        } finally {
            setDraft((d) => ({ ...d, isUploading: false }))
        }
    }

    return {
        departments,
        selectedDepartment,
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
        handleEditDepartment,
        handleDeleteDepartment,
        handleSaveChanges,
        handleBulkUpload,
    }
}
