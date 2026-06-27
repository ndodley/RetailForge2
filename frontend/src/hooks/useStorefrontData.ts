import { useEffect, useState } from "react"
import { fetchStoreProducts, type StoreProductDto } from "../api/products"
import { fetchCategories, type CategoryDto } from "../api/categories"
import { fetchDepartments, getApiErrorMessage, type DepartmentDto } from "../api/departments"

export function useStorefrontData() {
    const [products, setProducts] = useState<StoreProductDto[]>([])
    const [categories, setCategories] = useState<CategoryDto[]>([])
    const [departments, setDepartments] = useState<DepartmentDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        async function load() {
            setLoading(true)
            setError(null)

            try {
                const [p, c, d] = await Promise.all([
                    fetchStoreProducts(),
                    fetchCategories(),
                    fetchDepartments(),
                ])

                if (!isMounted) return

                setProducts(p)
                setCategories(c)
                setDepartments(d)
            } catch (err) {
                if (!isMounted) return
                setError(getApiErrorMessage(err, "Failed to load storefront data."))
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        void load()
        return () => {
            isMounted = false
        }
    }, [])

    return { products, categories, departments, loading, error }
}
