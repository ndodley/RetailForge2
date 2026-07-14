import { useMemo, useState } from "react";
import type { ReviewRecord } from "../../types/store";
import type { FilterSection } from "../../components/common/AdvancedSearchPanel";

export function useMyReviewFilters(reviews: ReviewRecord[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<"date" | "rating" | "product">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    function resetFilters() {
        setSearchTerm("");
        setRatingFilter("all");
        setSortField("date");
        setSortOrder("asc");
    }

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
        [ratingFilter, sortField, sortOrder]
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
    }, [reviews, searchTerm, ratingFilter, sortField, sortOrder]);

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleReviews,
        resetFilters,
    };
}
