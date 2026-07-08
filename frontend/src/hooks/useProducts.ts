import { useEffect, useState } from "react"
import {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkCreateProducts,
    type ProductAdminDto,
} from "../api/productAdminApi"
import { fetchDepartments } from "../api/departments"
import { fetchCategories } from "../api/categories"
import { getApiErrorMessage } from "../api/departments"
import type { ProductRecord, CategoryRecord } from "../types/store"
import { parseProductCsv } from "../util/productCsv"

export function useProducts() {
    const [products, setProducts] = useState<ProductRecord[]>([])
    const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
    const [categories, setCategories] = useState<CategoryRecord[]>([])

    const [activeTab, setActiveTab] = useState<"dashboard" | "upsert">("dashboard")
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const [draft, setDraft] = useState({
        id: null as number | null,
        name: "",
        brand: "",
        rating: "",
        description: "",
        price: "",
        stock: "",
        categoryId: 0,
        departmentId: 0,
        imagePath: "",
        imageFile: null as File | null,
        uploadFile: null as File | null,
        uploadFileName: "",
        isUploading: false,
    })

    useEffect(() => {
        async function load() {
            setIsLoading(true)
            setErrorMessage("")

            try {
                const [productsRes, deptRes, catRes] = await Promise.all([
                    fetchProducts(),
                    fetchDepartments(),
                    fetchCategories(),
                ])

                setProducts(productsRes.map(mapProductDtoToRecord))
                setDepartments(deptRes)
                setCategories(catRes)
            } catch (error) {
                setErrorMessage(getApiErrorMessage(error, "Unable to load products."))
            } finally {
                setIsLoading(false)
            }
        }

        void load()
    }, [])

    function mapProductDtoToRecord(dto: ProductAdminDto): ProductRecord {
        return {
            id: dto.id,
            name: dto.name,
            brand: dto.brand,
            rating: dto.rating,
            price: dto.price,
            description: dto.description,
            stock: dto.stock,
            imagePath: dto.imagePath,
            categoryId: dto.categoryId,
            categoryName: dto.categoryName,
            departmentId: dto.departmentId,
            departmentName: dto.departmentName,
        }
    }

    function clearMessages() {
        setErrorMessage("")
        setSuccessMessage("")
    }

    function resetUpsertState() {
        setSelectedProductId(null)
        setDraft({
            id: null,
            name: "",
            brand: "",
            rating: "",
            description: "",
            price: "",
            stock: "",
            categoryId: 0,
            departmentId: 0,
            imagePath: "",
            imageFile: null,
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })
    }

    function handleEditProduct(id: number) {
        clearMessages()
        const product = products.find((p) => p.id === id)

        setSelectedProductId(id)
        setDraft({
            id: product?.id || null,
            name: product?.name ?? "",
            brand: product?.brand ?? "",
            rating: String(product?.rating ?? 0),
            description: product?.description ?? "",
            price: String(product?.price ?? 0),
            stock: String(product?.stock ?? 0),
            categoryId: product?.categoryId ?? 0,
            departmentId: product?.departmentId ?? 0,
            imagePath: product?.imagePath ?? "",
            imageFile: null,
            uploadFile: null,
            uploadFileName: "",
            isUploading: false,
        })

        setActiveTab("upsert")
    }

    async function handleDeleteProduct(id: number) {
        clearMessages()

        try {
            await deleteProduct(id)
            setProducts((prev) => prev.filter((p) => p.id !== id))
            setSuccessMessage("Product deleted successfully.")
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to delete product."))
        }
    }

    async function handleSaveChanges() {
        const name = draft.name.trim()
        const categoryId = draft.categoryId
        const price = parseFloat(draft.price)
        const stock = parseInt(draft.stock)

        if (!name || !categoryId) {
            setErrorMessage("Name and category are required.")
            return
        }

        if (isNaN(price) || price < 0) {
            setErrorMessage("Valid price is required.")
            return
        }

        if (isNaN(stock) || stock < 0) {
            setErrorMessage("Valid stock is required.")
            return
        }

        clearMessages()
        setIsSaving(true)

        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("brand", draft.brand.trim())
            formData.append("rating", draft.rating)
            formData.append("description", draft.description.trim())
            formData.append("price", draft.price)
            formData.append("stock", draft.stock)
            formData.append("categoryId", String(categoryId))

            if (draft.imageFile) {
                formData.append("image", draft.imageFile)
            }

            if (selectedProductId === null) {
                const created = await createProduct(formData)
                setProducts((prev) => [mapProductDtoToRecord(created), ...prev])
                setSuccessMessage("Product created successfully.")
            } else {
                const updated = await updateProduct(selectedProductId, formData)
                setProducts((prev) =>
                    prev.map((p) => (p.id === selectedProductId ? mapProductDtoToRecord(updated) : p))
                )
                setSuccessMessage("Product updated successfully.")
            }

            resetUpsertState()
            setActiveTab("dashboard")
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to save product."))
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
            const rows = await parseProductCsv(draft.uploadFile)

            if (rows.length === 0) {
                throw new Error("No product rows found in CSV.")
            }

            const result = await bulkCreateProducts(rows)
            setSuccessMessage(`Uploaded ${result.inserted} products successfully.`)

            const refreshed = await fetchProducts()
            setProducts(refreshed.map(mapProductDtoToRecord))

            resetUpsertState()
            setActiveTab("dashboard")
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to complete bulk upload."))
        } finally {
            setDraft((d) => ({ ...d, isUploading: false }))
        }
    }

    return {
        products,
        departments,
        categories,
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
        handleEditProduct,
        handleDeleteProduct,
        handleSaveChanges,
        handleBulkUpload,
    }
}