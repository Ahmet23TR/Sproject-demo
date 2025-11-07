"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAdminOrders } from "../../../hooks/admin/useAdminOrders";
import { useAdminOrdersSummary } from "../../../hooks/admin/useAdminOrdersSummary";
import { OrderFilterParams } from "../../../services/orderService";
import { Box, useMediaQuery, useTheme, CircularProgress } from "@mui/material";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import {
    OrdersSummaryCards,
    type OrdersSummaryItem,
} from "./components/OrdersSummaryCards";
import { OrdersTable } from "./components/OrdersTable";
import { OrdersCardView } from "./components/OrdersCardView";
import { MobileOrdersToolbar } from "./components/MobileOrdersToolbar";
import PaginationComponent from "../../../components/PaginationComponent";
import { CancelOrderModal } from "../../../components/admin/CancelOrderModal";
import { useNotifications } from "../../../hooks/useNotifications";
import type { Order } from "../../../types/data";

export const dynamic = "force-dynamic";

// Summary KPI helpers removed on operational page

type StatusFilterKey =
    | "ALL"
    | "PENDING"
    | "READY_FOR_DELIVERY"
    | "DELIVERED"
    | "FAILED"
    | "CANCELLED"
    | "PARTIALLY_DELIVERED";

type DateFilterKey =
    | "ALL"
    | "TODAY"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "THIS_YEAR"
    | "LAST_YEAR"
    | "CUSTOM";

type FilterOption<T extends string> = { label: string; value: T };

const statusOptions: FilterOption<StatusFilterKey>[] = [
    { label: "All", value: "ALL" },
    { label: "Pending Delivery", value: "PENDING" },
    { label: "Ready for Delivery", value: "READY_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Partially Delivered", value: "PARTIALLY_DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Failed", value: "FAILED" },
];

// Removed summary KPI utilities

function AdminOrdersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Removed summary date filter on operational page

    // Initialize table filters from URL parameters
    const [searchQuery, setSearchQuery] = useState(
        () => searchParams.get("search") || ""
    );
    const [statusFilter, setStatusFilter] = useState<StatusFilterKey>(
        () => (searchParams.get("status") as StatusFilterKey) || "ALL"
    );
    const [dateFilter, setDateFilter] = useState<DateFilterKey>(
        () => (searchParams.get("dateFilter") as DateFilterKey) || "ALL"
    );
    const [customDateRange, setCustomDateRange] = useState<{
        start: Date;
        end: Date;
    } | null>(() => {
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        if (startDate && endDate) {
            return {
                start: new Date(startDate),
                end: new Date(endDate),
            };
        }
        return null;
    });
    const [currentPage, setCurrentPage] = useState(() => {
        const page = searchParams.get("page");
        return page ? parseInt(page, 10) || 1 : 1;
    });
    const [pageSize] = useState(10);

    // Sorting state (synced with URL)
    const [sortBy, setSortBy] = useState<OrderFilterParams["sortBy"]>(
        () =>
            (searchParams.get("sortBy") as OrderFilterParams["sortBy"]) ||
            "createdAt"
    );
    const [sortOrder, setSortOrder] = useState<OrderFilterParams["sortOrder"]>(
        () =>
            (searchParams.get("sortOrder") as OrderFilterParams["sortOrder"]) ||
            "desc"
    );

    // Amount range filter
    const [minAmount, setMinAmount] = useState<number | null>(() => {
        const v = searchParams.get("minAmount");
        return v !== null && v !== "" ? Number(v) : null;
    });
    const [maxAmount, setMaxAmount] = useState<number | null>(() => {
        const v = searchParams.get("maxAmount");
        return v !== null && v !== "" ? Number(v) : null;
    });

    // Cancel order modal state
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

    const { showSuccess, showError } = useNotifications();

    // Build filters object for backend
    const filters = useMemo(() => {
        const filterObj: OrderFilterParams = {};

        // Pagination
        filterObj.page = currentPage;
        filterObj.limit = pageSize;

        // Status filter
        if (statusFilter !== "ALL") {
            filterObj.status = statusFilter;
        }

        // Date filter
        if (dateFilter !== "ALL") {
            if (dateFilter === "CUSTOM" && customDateRange) {
                filterObj.dateFilter = "CUSTOM";
                filterObj.startDate = customDateRange.start
                    .toISOString()
                    .split("T")[0];
                filterObj.endDate = customDateRange.end
                    .toISOString()
                    .split("T")[0];
            } else {
                filterObj.dateFilter = dateFilter;
            }
        }

        // Search filter
        if (searchQuery.trim()) {
            filterObj.search = searchQuery.trim();
        }

        // Amount range
        if (minAmount !== null && !Number.isNaN(minAmount)) {
            filterObj.minAmount = minAmount;
        }
        if (maxAmount !== null && !Number.isNaN(maxAmount)) {
            filterObj.maxAmount = maxAmount;
        }

        // Sorting
        filterObj.sortBy = sortBy;
        filterObj.sortOrder = sortOrder;

        return filterObj;
    }, [
        searchQuery,
        statusFilter,
        dateFilter,
        customDateRange,
        currentPage,
        pageSize,
        sortBy,
        sortOrder,
        minAmount,
        maxAmount,
    ]);

    // Separate hooks for summary cards and table data
    // Summary KPI hook removed for this page

    const { orders, loading, pagination, cancelOrder } =
        useAdminOrders(filters);

    // Removed KPI summary items on operational page

    const handleCustomDateRange = (startDate: Date, endDate: Date) => {
        // Validate and swap dates if needed
        let validStart = startDate;
        let validEnd = endDate;

        if (startDate > endDate) {
            validStart = endDate;
            validEnd = startDate;
        }

        setCustomDateRange({ start: validStart, end: validEnd });
        setDateFilter("CUSTOM" as DateFilterKey);
        setCurrentPage(1);

        updateURL(
            {
                dateFilter: "CUSTOM",
                startDate: validStart.toISOString().split("T")[0],
                endDate: validEnd.toISOString().split("T")[0],
                page: 1,
            },
            { method: "silent" }
        );
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
        updateURL({ search: value, page: 1 }, { method: "silent" });
    };

    const handleStatusChange = (status: string) => {
        setStatusFilter(status as StatusFilterKey);
        setCurrentPage(1);
        updateURL({ status: status, page: 1 }, { method: "silent" });
    };

    const handleDateChange = (dateRange: DateFilterKey) => {
        setDateFilter(dateRange);
        setCurrentPage(1);

        if (dateRange !== "CUSTOM") {
            setCustomDateRange(null);
            updateURL(
                {
                    dateFilter: dateRange,
                    startDate: null,
                    endDate: null,
                    page: 1,
                },
                { method: "silent" }
            );
        }
    };

    const handleSortChange = (
        newSortBy: NonNullable<OrderFilterParams["sortBy"]>,
        newSortOrder: NonNullable<OrderFilterParams["sortOrder"]>
    ) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setCurrentPage(1);
        updateURL(
            { sortBy: newSortBy, sortOrder: newSortOrder, page: 1 },
            { method: "silent" }
        );
    };

    const handleAmountRangeChange = (
        min: number | null,
        max: number | null
    ) => {
        setMinAmount(min ?? null);
        setMaxAmount(max ?? null);
        setCurrentPage(1);
        updateURL(
            {
                minAmount: min ?? null,
                maxAmount: max ?? null,
                page: 1,
            },
            { method: "silent" }
        );
    };

    // URL update helper
    const updateURL = (
        newFilters: Record<string, string | number | null>,
        options?: { method?: "push" | "replace" | "silent"; scroll?: boolean }
    ) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === null || value === "" || value === "ALL") {
                params.delete(key);
            } else {
                params.set(key, value.toString());
            }
        });

        const newUrl = `${pathname}?${params.toString()}`;
        const method = options?.method ?? "push";
        const scroll = options?.scroll ?? false;
        if (method === "silent") {
            if (typeof window !== "undefined") {
                window.history.replaceState(window.history.state, "", newUrl);
            }
        } else if (method === "replace") {
            router.replace(newUrl, { scroll });
        } else {
            router.push(newUrl, { scroll });
        }
    };

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setCurrentPage(value);
        updateURL({ page: value }, { method: "silent" });
    };

    const handleView = (orderId: string) => {
        router.push(`/admin/orders/${orderId}`);
    };

    const handleCancelConfirm = async (orderId: string, notes: string) => {
        try {
            const result = await cancelOrder(orderId, notes);

            if (result.success) {
                // Modal'ı kapat
                setCancelModalOpen(false);
                setOrderToCancel(null);

                // Notification'ı setTimeout ile geciktir
                setTimeout(() => {
                    showSuccess("Order cancelled successfully");
                }, 100);

                return result;
            } else {
                // Hata durumunda modal'ı kapatma
                setTimeout(() => {
                    showError(result.message || "Failed to cancel order");
                }, 100);

                return result;
            }
        } catch {
            const errorMessage = "An error occurred while cancelling the order";

            setTimeout(() => {
                showError(errorMessage);
            }, 100);

            return { success: false, message: errorMessage };
        }
    };

    const handleCancelModalClose = () => {
        setCancelModalOpen(false);
        setOrderToCancel(null);
    };

    // KPI summary for "This Week"
    const { orders: weeklyOrders, loading: summaryLoading } =
        useAdminOrdersSummary("THIS_WEEK");

    const summaryItems: OrdersSummaryItem[] = useMemo(() => {
        const total = weeklyOrders.length;
        const delivered = weeklyOrders.filter(
            (o) => o.deliveryStatus === "DELIVERED"
        ).length;
        const partial = weeklyOrders.filter(
            (o) => o.deliveryStatus === "PARTIALLY_DELIVERED"
        ).length;
        const cancelledFailed = weeklyOrders.filter(
            (o) =>
                o.deliveryStatus === "CANCELLED" ||
                o.deliveryStatus === "FAILED"
        ).length;
        return [
            {
                id: "total",
                label: "All Orders",
                value: total,
                chipLabel: "This Week",
                icon: <ShoppingBagRoundedIcon />,
            },
            {
                id: "delivered",
                label: "Delivered",
                value: delivered,
                chipLabel: "Completed",
                chipColor: "success",
                icon: <TaskAltRoundedIcon />,
            },
            {
                id: "partial",
                label: "Partially Delivered",
                value: partial,
                chipLabel: "Logistics",
                chipColor: "info",
                icon: <ShoppingCartRoundedIcon />,
            },
            {
                id: "exceptions",
                label: "Cancelled / Failed",
                value: cancelledFailed,
                chipLabel: "Alerts",
                chipColor: "error",
                icon: <CancelRoundedIcon />,
            },
        ];
    }, [weeklyOrders]);

    return (
        <Box
            sx={{
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
                p: { xs: 1, sm: 2 },
            }}>
                <Box
                    sx={{
                        maxWidth: "1200px",
                        mx: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: 2, md: 4 },
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                        }}></Box>

                    {/* Weekly KPI summary cards */}
                    <OrdersSummaryCards
                        items={summaryItems}
                        loading={summaryLoading}
                        dense
                        mdColumns={4}
                    />

                    {!loading && (
                        <Box>
                            {isMobile ? (
                                <>
                                    <MobileOrdersToolbar
                                        statusOptions={statusOptions}
                                        statusValue={statusFilter}
                                        onStatusChange={handleStatusChange}
                                        searchQuery={searchQuery}
                                        onSearchChange={handleSearchChange}
                                        dateValue={dateFilter}
                                        onDateChange={handleDateChange}
                                        onCustomDateRange={handleCustomDateRange}
                                        startDateStr={
                                            dateFilter === "CUSTOM" && customDateRange
                                                ? customDateRange.start
                                                    .toISOString()
                                                    .split("T")[0]
                                                : ""
                                        }
                                        endDateStr={
                                            dateFilter === "CUSTOM" && customDateRange
                                                ? customDateRange.end
                                                    .toISOString()
                                                    .split("T")[0]
                                                : ""
                                        }
                                        minAmount={minAmount}
                                        maxAmount={maxAmount}
                                        onAmountRangeChange={handleAmountRangeChange}
                                    />
                                    <OrdersCardView
                                        orders={orders}
                                        onView={handleView}
                                    />
                                </>
                            ) : (
                                <OrdersTable
                                    orders={orders}
                                    onView={handleView}
                                    // Integrated toolbar props
                                    statusOptions={statusOptions}
                                    statusValue={statusFilter}
                                    onStatusChange={handleStatusChange}
                                    searchQuery={searchQuery}
                                    onSearchChange={handleSearchChange}
                                    // Filter popover props
                                    dateValue={dateFilter}
                                    onDateChange={handleDateChange}
                                    onCustomDateRange={handleCustomDateRange}
                                    startDateStr={
                                        dateFilter === "CUSTOM" && customDateRange
                                            ? customDateRange.start
                                                .toISOString()
                                                .split("T")[0]
                                            : ""
                                    }
                                    endDateStr={
                                        dateFilter === "CUSTOM" && customDateRange
                                            ? customDateRange.end
                                                .toISOString()
                                                .split("T")[0]
                                            : ""
                                    }
                                    minAmount={minAmount}
                                    maxAmount={maxAmount}
                                    onAmountRangeChange={handleAmountRangeChange}
                                    // Sorting
                                    sortBy={sortBy || "createdAt"}
                                    sortOrder={sortOrder || "desc"}
                                    onSortChange={handleSortChange}
                                />
                            )}
                        </Box>
                    )}

                    {pagination &&
                        orders.length > 0 &&
                        pagination.totalPages > 1 && (
                            <PaginationComponent
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                        )}

                    {/* Cancel Order Modal */}
                    <CancelOrderModal
                        open={cancelModalOpen}
                        onClose={handleCancelModalClose}
                        order={orderToCancel}
                        onConfirm={handleCancelConfirm}
                    />
                </Box>
        </Box>
    );
}

export default function AdminOrdersPage() {
    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Suspense
                fallback={
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "50vh",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                }
            >
                <AdminOrdersContent />
            </Suspense>
        </ProtectedRoute>
    );
}
