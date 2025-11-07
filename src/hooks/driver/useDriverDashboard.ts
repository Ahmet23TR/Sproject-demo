// src/hooks/useDriverDashboard.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    fetchDriverOrdersByDate,
    updateOrderStatusAsDriver,
    deliverOrderItemPartially,
    cannotDeliverItem,
    fetchDriverOrderPool,
    fetchMyDeliveries,
    claimOrder,
} from "../../services/driverService";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errorHandler";
import { Order, PaginationInfo } from "../../types/data";

export const useDriverDashboard = () => {
    const { token, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Check if user has DRIVER role, if not, don't make API calls
    const hasDriverRole = user?.role === "DRIVER";

    // URL'den sayfa numarasını ve tarihi al
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const selectedDate =
        searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const initialStatusParam = (searchParams.get("status") || "pending") as
        | "all"
        | "pending"
        | "completed";
    const [statusFilter, setStatusFilter] = useState<
        "all" | "pending" | "completed"
    >(initialStatusParam);
    // Legacy daily orders (kept for date/status filters tab if needed)
    const [dailyOrders, setDailyOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);

    // New pool & my deliveries states
    const [activeTab, setActiveTab] = useState<"pool" | "myDeliveries">("pool");
    const [poolOrders, setPoolOrders] = useState<Order[]>([]);
    const [poolPagination, setPoolPagination] = useState<PaginationInfo | null>(
        null
    );
    const [myDeliveries, setMyDeliveries] = useState<Order[]>([]);
    const [myPagination, setMyPagination] = useState<PaginationInfo | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Popup state
    const [popup, setPopup] = useState<{
        open: boolean;
        message: string;
        type: "success" | "error";
    }>({
        open: false,
        message: "",
        type: "success",
    });

    const fetchOrders = useCallback(
        async (page: number) => {
            // Don't make API calls if user doesn't have DRIVER role
            if (!hasDriverRole || !token || !selectedDate) return;

            setLoading(true);
            try {
                // Backend default: only READY_FOR_DELIVERY. Pass status explicitly.
                let statusQuery: string[] | undefined;
                if (statusFilter === "pending") {
                    statusQuery = ["READY_FOR_DELIVERY"];
                } else if (statusFilter === "completed") {
                    statusQuery = [
                        "DELIVERED",
                        "FAILED",
                        "PARTIALLY_DELIVERED",
                    ];
                } else {
                    statusQuery = [
                        "READY_FOR_DELIVERY",
                        "DELIVERED",
                        "FAILED",
                        "PARTIALLY_DELIVERED",
                    ];
                }

                const response = await fetchDriverOrdersByDate(
                    token,
                    selectedDate,
                    page,
                    25,
                    statusQuery
                );
                setDailyOrders(response.data);
                setPagination(response.pagination);
            } catch (error) {
                setError(getApiErrorMessage(error));
            } finally {
                setLoading(false);
            }
        },
        [hasDriverRole, token, selectedDate, statusFilter]
    );

    const fetchPool = useCallback(
        async (page: number) => {
            if (!hasDriverRole || !token) return;
            setLoading(true);
            try {
                const response = await fetchDriverOrderPool(token, page, 20);
                setPoolOrders(response.data);
                setPoolPagination(response.pagination);
            } catch (error) {
                setError(getApiErrorMessage(error));
            } finally {
                setLoading(false);
            }
        },
        [hasDriverRole, token]
    );

    const fetchMine = useCallback(
        async (page: number) => {
            if (!hasDriverRole || !token) return;
            setLoading(true);
            try {
                // Apply date and status filters for My Deliveries
                let statusQuery: string[] | undefined;
                if (statusFilter === "pending") {
                    statusQuery = ["READY_FOR_DELIVERY"];
                } else if (statusFilter === "completed") {
                    statusQuery = [
                        "DELIVERED",
                        "FAILED",
                        "PARTIALLY_DELIVERED",
                    ];
                } else {
                    statusQuery = [
                        "READY_FOR_DELIVERY",
                        "DELIVERED",
                        "FAILED",
                        "PARTIALLY_DELIVERED",
                    ];
                }

                const response = await fetchMyDeliveries(
                    token,
                    page,
                    20,
                    selectedDate,
                    statusQuery
                );

                setMyDeliveries(response.data);
                setMyPagination(response.pagination);
            } catch (error) {
                setError(getApiErrorMessage(error));
            } finally {
                setLoading(false);
            }
        },
        [hasDriverRole, token, selectedDate, statusFilter]
    );

    useEffect(() => {
        if (!hasDriverRole) {
            setLoading(false);
            return;
        }
        // Fetch according to activeTab
        if (activeTab === "pool") {
            fetchPool(currentPage);
        } else if (activeTab === "myDeliveries") {
            // Fetch driver's own deliveries instead of all orders
            fetchMine(currentPage);
        }
    }, [activeTab, fetchPool, fetchMine, hasDriverRole, currentPage]);

    // Separate useEffect for filter changes in My Deliveries
    useEffect(() => {
        if (!hasDriverRole || activeTab !== "myDeliveries") return;
        // When filters change, refresh My Deliveries list
        fetchMine(1); // Reset to page 1 when filters change
    }, [statusFilter, selectedDate, fetchMine, hasDriverRole, activeTab]);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        // URL'i güncelle
        const params = new URLSearchParams(searchParams);
        params.set("page", value.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const setActiveTabAndResetPage = (tab: "pool" | "myDeliveries") => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDateChange = (date: string) => {
        // URL'i güncelle ve sayfayı 1'e sıfırla
        const params = new URLSearchParams(searchParams);
        params.set("date", date);
        params.set("page", "1"); // Tarih değiştiğinde sayfa 1'e dön
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleStatusChange = (next: "all" | "pending" | "completed") => {
        setStatusFilter(next);
        const params = new URLSearchParams(searchParams);
        params.set("status", next);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const filteredOrders = useMemo(() => {
        if (statusFilter === "all") return dailyOrders;
        if (statusFilter === "pending") {
            return dailyOrders.filter(
                (o) => o.deliveryStatus === "READY_FOR_DELIVERY"
            );
        }
        if (statusFilter === "completed") {
            return dailyOrders.filter(
                (o) =>
                    o.deliveryStatus === "DELIVERED" ||
                    o.deliveryStatus === "FAILED" ||
                    o.deliveryStatus === "PARTIALLY_DELIVERED"
            );
        }
        return dailyOrders;
    }, [dailyOrders, statusFilter]);

    const handleUpdateStatus = useCallback(
        async (
            orderId: string,
            status: "DELIVERED" | "FAILED",
            notes: string | null = null
        ) => {
            if (!hasDriverRole || !token) return;

            // Order number'ı bul
            const orderToUpdate =
                myDeliveries.find((o) => o.id === orderId) ||
                dailyOrders.find((o) => o.id === orderId);
            const orderNumber = orderToUpdate?.orderNumber || orderId;

            try {
                const updatedOrder = await updateOrderStatusAsDriver(
                    orderId,
                    status,
                    notes,
                    token
                );

                // Status değişince My Deliveries listesini yeniden çek (filtreleme için)
                if (activeTab === "myDeliveries") {
                    await fetchMine(currentPage);
                } else {
                    // Legacy daily orders için local update
                    setDailyOrders((prev) =>
                        prev.map((o) =>
                            o.id === orderId
                                ? {
                                      ...o,
                                      deliveryStatus:
                                          updatedOrder.deliveryStatus,
                                  }
                                : o
                        )
                    );
                } // Başarılı popup göster
                const successMessage =
                    status === "DELIVERED"
                        ? `Order #${orderNumber} delivered successfully!`
                        : `Order #${orderNumber} marked as failed.`;

                setPopup({
                    open: true,
                    message: successMessage,
                    type: "success",
                });
            } catch (error) {
                const errorMessage = getApiErrorMessage(error);
                setError(errorMessage);

                // Hata popup göster
                setPopup({
                    open: true,
                    message: errorMessage,
                    type: "error",
                });
            }
        },
        [
            hasDriverRole,
            token,
            myDeliveries,
            dailyOrders,
            activeTab,
            fetchMine,
            currentPage,
        ]
    );

    const handleClaimOrder = useCallback(
        async (orderId: string) => {
            if (!hasDriverRole || !token) return;
            try {
                await claimOrder(orderId, token);
                // Refresh both lists
                await Promise.all([
                    fetchPool(activeTab === "pool" ? currentPage : 1),
                    fetchMine(activeTab === "myDeliveries" ? currentPage : 1),
                ]);
                setPopup({
                    open: true,
                    message: "Order claimed successfully.",
                    type: "success",
                });
            } catch (error) {
                const errorMessage = getApiErrorMessage(error);
                setPopup({ open: true, message: errorMessage, type: "error" });
            }
        },
        [hasDriverRole, token, activeTab, currentPage, fetchPool, fetchMine]
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePartialDelivery = async (
        orderItemId: string,
        amount: number,
        notes: string
    ) => {
        if (!hasDriverRole || !token) return;

        try {
            const response = await deliverOrderItemPartially(
                orderItemId,
                amount,
                notes,
                token
            );

            // Local state'i güncelle - sipariş listesini yeniden yükle
            await fetchOrders(currentPage);

            // Başarılı popup göster
            setPopup({
                open: true,
                message: `${amount} pieces delivered successfully!`,
                type: "success",
            });

            return response;
        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);

            setPopup({
                open: true,
                message: errorMessage,
                type: "error",
            });

            throw error;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleCannotDeliver = async (orderItemId: string, notes: string) => {
        if (!hasDriverRole || !token) return;

        try {
            const response = await cannotDeliverItem(orderItemId, notes, token);

            // Local state'i güncelle - sipariş listesini yeniden yükle
            await fetchOrders(currentPage);

            // Başarılı popup göster
            setPopup({
                open: true,
                message: "Item marked as cannot deliver.",
                type: "success",
            });

            return response;
        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);

            setPopup({
                open: true,
                message: errorMessage,
                type: "error",
            });

            throw error;
        }
    };

    // Not used in driver UI anymore; keeping implementation for potential future use
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleQuickDeliver = async (orderItem: unknown) => {
        const item = orderItem as {
            id: string;
            producedQuantity?: number;
            deliveredQuantity?: number;
            quantity: number;
            productionStatus?: string;
        };
        if (!hasDriverRole || !token) return;

        try {
            // Calculate the available quantity to deliver
            const producedQty = item.producedQuantity || 0;
            const actualProducedQty =
                item.productionStatus === "COMPLETED" && producedQty === 0
                    ? item.quantity
                    : producedQty;
            const deliveredQty = item.deliveredQuantity || 0;
            const availableToDeliver = actualProducedQty - deliveredQty;

            if (availableToDeliver <= 0) {
                setPopup({
                    open: true,
                    message: "No items available for delivery.",
                    type: "error",
                });
                return;
            }

            const response = await deliverOrderItemPartially(
                item.id,
                availableToDeliver,
                "Quick delivery - all available items delivered",
                token
            );

            // Local state'i güncelle - sipariş listesini yeniden yükle
            await fetchOrders(currentPage);

            // Başarılı popup göster
            setPopup({
                open: true,
                message: `All ${availableToDeliver} pieces delivered successfully!`,
                type: "success",
            });

            return response;
        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);

            setPopup({
                open: true,
                message: errorMessage,
                type: "error",
            });

            throw error;
        }
    };

    const closePopup = () => {
        setPopup((prev) => ({ ...prev, open: false }));
    };

    return {
        // lists
        poolOrders,
        myDeliveries,
        orders: filteredOrders,
        selectedDate,
        setSelectedDate: handleDateChange,
        statusFilter,
        setStatusFilter: handleStatusChange,
        activeTab,
        setActiveTab: setActiveTabAndResetPage,
        loading,
        error,
        pagination,
        poolPagination,
        myPagination,
        currentPage,
        handleUpdateStatus,
        handleClaimOrder,
        // handlePartialDelivery, // Removed from driver interface
        // handleCannotDeliver,   // Removed from driver interface
        // handleQuickDeliver,    // Removed from driver interface
        handlePageChange,
        popup,
        closePopup,
    };
};
