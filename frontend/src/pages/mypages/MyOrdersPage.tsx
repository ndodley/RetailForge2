import { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import "./MyOrdersPage.css";

import Layout from "../../components/common/Layout";
import AdvancedSearchPanel from "../../components/common/AdvancedSearchPanel";
import { useAuth } from "../../hooks/useAuth";
import { useMyOrders } from "../../hooks/orders/useMyOrders";
import { useMyOrderFilters } from "../../hooks/orders/useMyOrderFilters";
import { usePagination } from "../../hooks/usePagination";
import MyOrderTable from "../../components/tables/order/MyOrderTable";
import type { OrderRecord } from "../../types/store";
import {useMyReviews} from "../../hooks/reviews/useMyReviews.ts";
import {useMyReviewFilters} from "../../hooks/reviews/useMyReviewFilters.ts";

const PAGE_SIZE = 6;

function MyOrdersPage() {
    const {user, loading} = useAuth();
    const location = useLocation();

    const {
        orders,
        isLoading,
        isSaving,
        errorMessage,
        successMessage,
        clearMessages,
        handleUpdateOrder,
        handleDeleteOrder,
    } = useMyOrders();

    const {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleOrders,
        resetFilters,
    } = useMyOrderFilters(orders);

    const [filtersOpen, setFiltersOpen] = useState(false);

    const {
        setPage,
        safePage,
        totalPages,
        pagedItems,
    } = usePagination(visibleOrders, PAGE_SIZE);

}