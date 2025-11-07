"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { fetchMyOrders } from "../../services/orderService";
import { getApiErrorMessage } from "../../utils/errorHandler";
import type { Order } from "../../types/data";

export const useOrderHistory = () => {
    const { token } = useAuth();
    const { loadCartFromOrder, loadActiveItemsToCart } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL'den sayfa numarasını al
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Inactive products modal state
    const [showInactiveModal, setShowInactiveModal] = useState(false);
    const [inactiveProducts, setInactiveProducts] = useState<
        Array<{
            id: string;
            name: string;
            quantity: number;
            unit: string;
        }>
    >([]);
    const [activeItems, setActiveItems] = useState<
        Array<{
            productId: string;
            quantity: number;
            selectedOptions?: Array<{
                optionItem: {
                    id: string;
                };
            }>;
        }>
    >([]);

    // Filter orders based on current filters
    const filteredOrders = useMemo(() => {
        let filtered = [...allOrders];

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => {
                const hasCancelledItems = order.items.some(
                    (item) => item.productionStatus === "CANCELLED"
                );
                const hasPartialItems = order.items.some(
                    (item) => item.productionStatus === "PARTIALLY_COMPLETED"
                );
                const isPartiallyDelivered =
                    order.deliveryStatus === "PARTIALLY_DELIVERED";
                const isDeliveryFailed = order.deliveryStatus === "FAILED";
                const isCancelled = order.deliveryStatus === "CANCELLED";
                const isCompleted = order.deliveryStatus === "DELIVERED";

                switch (statusFilter) {
                    case "delivered":
                        return isCompleted;
                    case "failed":
                        return isDeliveryFailed;
                    case "cancelled":
                        return isCancelled;
                    case "partial":
                        return isPartiallyDelivered || hasPartialItems;
                    case "pending":
                        return (
                            !isCompleted &&
                            !isDeliveryFailed &&
                            !isCancelled &&
                            !isPartiallyDelivered &&
                            !hasPartialItems &&
                            !hasCancelledItems
                        );
                    default:
                        return true;
                }
            });
        }

        // Filter by search query (order number)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((order) => {
                const orderNum = `#ORD-${order.orderNumber
                    .toString()
                    .padStart(6, "0")}`.toLowerCase();
                return (
                    orderNum.includes(query) ||
                    order.orderNumber.toString().includes(query)
                );
            });
        }

        // Filter by date range
        if (startDate) {
            filtered = filtered.filter((order) => {
                const orderDate = new Date(order.createdAt)
                    .toISOString()
                    .split("T")[0];
                return orderDate >= startDate;
            });
        }

        if (endDate) {
            filtered = filtered.filter((order) => {
                const orderDate = new Date(order.createdAt)
                    .toISOString()
                    .split("T")[0];
                return orderDate <= endDate;
            });
        }

        return filtered;
    }, [allOrders, statusFilter, searchQuery, startDate, endDate]);

    // Paginate filtered orders locally
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        return filteredOrders.slice(startIndex, endIndex);
    }, [filteredOrders, currentPage]);

    // Update pagination info based on filtered results
    const filteredPagination = useMemo(() => {
        const totalItems = filteredOrders.length;
        const totalPages = Math.ceil(totalItems / 10);

        return {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: 10,
        };
    }, [filteredOrders.length, currentPage]);

    const refetchOrders = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Fetch all orders without pagination for client-side filtering
            const response = await fetchMyOrders(token, 1, 1000);
            setAllOrders(response.data);
        } catch (error) {
            setError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        refetchOrders();
    }, [refetchOrders]);

    const handleReorder = async (order: Order) => {
        try {
            const result = await loadCartFromOrder(order);

            // Eğer deaktive ürünler varsa modal'ı göster
            if (result && result.inactiveItems.length > 0) {
                setInactiveProducts(result.inactiveItems);
                setActiveItems(result.activeItems);
                setShowInactiveModal(true);
            } else {
                // Tüm ürünler aktifse direkt yönlendir
                router.push("/client/new-order");
            }
        } catch {
            // console.error("Cart could not be updated:", error);
        }
    };

    const handleProceedWithActive = async () => {
        try {
            await loadActiveItemsToCart(activeItems);
            setShowInactiveModal(false);
            router.push("/client/new-order");
        } catch {
            // console.error("Active products could not be added to cart:", error);
        }
    };

    const handleCloseInactiveModal = () => {
        setShowInactiveModal(false);
        setInactiveProducts([]);
        setActiveItems([]);
    };

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        // URL'i güncelle
        const params = new URLSearchParams(searchParams);
        params.set("page", value.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setStatusFilter("all");
        setSearchQuery("");
        setStartDate("");
        setEndDate("");
        // Reset to page 1 when clearing filters
        const params = new URLSearchParams(searchParams);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    return {
        orders: paginatedOrders,
        loading,
        error,
        pagination: filteredPagination,
        currentPage,
        // Filter states and handlers
        statusFilter,
        searchQuery,
        startDate,
        endDate,
        setStatusFilter,
        setSearchQuery,
        setStartDate,
        setEndDate,
        handleClearFilters,
        // Original handlers
        handlePageChange,
        handleReorder,
        showInactiveModal,
        inactiveProducts,
        activeItems,
        handleProceedWithActive,
        handleCloseInactiveModal,
    };
};
