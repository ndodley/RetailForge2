import { useMemo, useState } from "react";
import type { ReviewRecord } from "../../types/store";
import type { FilterSection } from "../../components/common/AdvancedSearchPanel";
import type { StoreProductDto } from "../../api/products";
import type { CategoryDto } from "../../api/categories";
import type { DepartmentDto } from "../../api/departments";

export function useMyReviewFilters(
    reviews: ReviewRecord[],
    products: StoreProductDto[] = [],
    categories: CategoryDto[] = [],
    departments: DepartmentDto[] = []
) {
    const [searchTerm, setSearchTerm] = useState("");
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<"date" | "rating" | "product">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState("all");

    function resetFilters() {
        setSearchTerm("");
        setRatingFilter("all");
        setSortField("date");
        setSortOrder("asc");
        setSelectedDepartment("all");
        setSelectedCategory("all");
        setSelectedProduct("all");
    }

    // productId -> product metadata, so a review can be traced to its department/category
    const productMetaById = useMemo(() => {
        const map = new Map<number, StoreProductDto>();
        products.forEach((p) => map.set(p.id, p));
        return map;
    }, [products]);

    // Categories narrow to the selected department
    const availableCategories = useMemo(() => {
        if (selectedDepartment === "all") return categories;
        return categories.filter((c) => String(c.departmentId) === selectedDepartment);
    }, [categories, selectedDepartment]);

    // Products narrow to dept/category, and only ones you've actually reviewed
    const availableProducts = useMemo(() => {
        const reviewedIds = new Set(reviews.map((r) => r.productId));

        return products.filter((p) => {
            if (!reviewedIds.has(p.id)) return false;
            if (selectedDepartment !== "all" && String(p.departmentId) !== selectedDepartment) return false;
            if (selectedCategory !== "all" && String(p.categoryId) !== selectedCategory) return false;
            return true;
        });
    }, [products, reviews, selectedDepartment, selectedCategory]);

    const filterSections: FilterSection[] = useMemo(
        () => [
            {
                key: "rating",
                title: "Rating",
                type: "radio",
                value: ratingFilter,
                onChange: (v) => setRatingFilter(String(v)),
                options: [
                    { value: "all", label: "All" },
                    { value: "5", label: "5 Stars" },
                    { value: "4", label: "4 Stars" },
                    { value: "3", label: "3 Stars" },
                    { value: "2", label: "2 Stars" },
                    { value: "1", label: "1 Star" },
                ],
            },
            {
                key: "department",
                title: "Department",
                type: "radio",
                value: selectedDepartment,
                onChange: (v) => {
                    setSelectedDepartment(String(v));
                    setSelectedCategory("all");
                    setSelectedProduct("all");
                },
                options: [
                    { value: "all", label: "All Departments" },
                    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
                ],
            },
            {
                key: "category",
                title: "Category",
                type: "radio",
                value: selectedCategory,
                onChange: (v) => {
                    setSelectedCategory(String(v));
                    setSelectedProduct("all");
                },
                options: [
                    { value: "all", label: "All Categories" },
                    ...availableCategories.map((c) => ({ value: String(c.id), label: c.name })),
                ],
            },
            {
                key: "product",
                title: "Product",
                type: "radio",
                value: selectedProduct,
                onChange: (v) => setSelectedProduct(String(v)),
                options: [
                    { value: "all", label: "All Products" },
                    ...availableProducts.map((p) => ({ value: String(p.id), label: p.name })),
                ],
            },
            {
                key: "sort",
                title: "Sort",
                type: "radio",
                value: sortField,
                onChange: (v) => setSortField(String(v) as any),
                options: [
                    { value: "date", label: "Date" },
                    { value: "rating", label: "Rating" },
                    { value: "product", label: "Product Name" },
                ],
            },
            {
                key: "order",
                title: "Order",
                type: "radio",
                value: sortOrder,
                onChange: (v) => setSortOrder(String(v) as any),
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                ],
            },
        ],
        [
            ratingFilter, sortField, sortOrder,
            selectedDepartment, selectedCategory, selectedProduct,
            departments, availableCategories, availableProducts,
        ]
    );

    const visibleReviews = useMemo(() => {
        let filtered = [...reviews];

        const term = searchTerm.trim().toLowerCase();
        if (term) {
            filtered = filtered.filter(
                (r) =>
                    r.productName.toLowerCase().includes(term) ||
                    r.comment.toLowerCase().includes(term) ||
                    String(r.rating).includes(term)
            );
        }

        if (ratingFilter !== "all") {
            filtered = filtered.filter((r) => r.rating === Number(ratingFilter));
        }

        if (selectedProduct !== "all") {
            filtered = filtered.filter((r) => String(r.productId) === selectedProduct);
        } else if (selectedCategory !== "all") {
            filtered = filtered.filter((r) => {
                const meta = productMetaById.get(r.productId);
                return meta ? String(meta.categoryId) === selectedCategory : false;
            });
        } else if (selectedDepartment !== "all") {
            filtered = filtered.filter((r) => {
                const meta = productMetaById.get(r.productId);
                return meta ? String(meta.departmentId) === selectedDepartment : false;
            });
        }

        const multiplier = sortOrder === "asc" ? 1 : -1;

        filtered.sort((a, b) => {
            if (sortField === "rating") return multiplier * (a.rating - b.rating);
            if (sortField === "product")
                return multiplier * a.productName.localeCompare(b.productName);

            return (
                multiplier *
                (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            );
        });

        return filtered;
    }, [
        reviews, searchTerm, ratingFilter, sortField, sortOrder,
        selectedDepartment, selectedCategory, selectedProduct, productMetaById,
    ]);

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleReviews,
        resetFilters,
    };
}