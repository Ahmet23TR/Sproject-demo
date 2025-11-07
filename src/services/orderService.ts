import { apiClient } from "./apiClient";
import { Order, PaginatedResponse, PaginationInfo } from "../types/data";
import { DashboardStats } from "../types/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Yeni sipariş oluştururken gönderilecek payload'un tipi
export interface CreateOrderItemPayload {
    productId: string;
    quantity: number;
    selectedOptionItemIds: string[];
}

export interface CreateOrderPayload {
    items: CreateOrderItemPayload[];
    notes?: string | null;
    attachmentUrl?: string | null;
}

// Backend filtreleme için yeni interface
export interface OrderFilterParams {
    // Pagination
    page?: number;
    limit?: number;

    // Status Filtering
    status?:
        | "PENDING"
        | "READY_FOR_DELIVERY"
        | "DELIVERED"
        | "FAILED"
        | "CANCELLED"
        | "PARTIALLY_DELIVERED";

    // Date Filtering
    dateFilter?:
        | "TODAY"
        | "THIS_WEEK"
        | "LAST_WEEK"
        | "THIS_MONTH"
        | "LAST_MONTH"
        | "THIS_YEAR"
        | "LAST_YEAR"
        | "CUSTOM";

    // Custom Date Range
    startDate?: string; // Format: YYYY-MM-DD
    endDate?: string; // Format: YYYY-MM-DD

    // Amount range filtering (optional, backend-supported if available)
    minAmount?: number; // Minimum order total
    maxAmount?: number; // Maximum order total

    // Search
    search?: string;

    // Sorting
    sortBy?: "createdAt" | "orderNumber" | "totalAmount" | "customerName";
    sortOrder?: "asc" | "desc";
}

// Yeni backend response format
export interface OrdersResponse {
    data: Order[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        pageSize: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    filters?: {
        appliedFilters: {
            status?: string;
            dateFilter?: string;
            startDate?: string;
            endDate?: string;
            search?: string;
        };
        availableFilters: {
            statuses: Array<{
                value: string;
                label: string;
                count: number;
            }>;
        };
    };
}

/**
 * Yeni backend filtreleme sistemi ile siparişleri çeker
 */
export const fetchAllOrders = async (
    token: string,
    filters?: OrderFilterParams
): Promise<OrdersResponse> => {
    try {
        const params = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }

        const url = `${API_BASE_URL}/admin/orders${
            params.toString() ? `?${params.toString()}` : ""
        }`;

        const data = await apiClient.get<OrdersResponse>(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Belirli bir siparişin detayını çeker.
 * API'nin doğrudan order objesi döndürdüğünü varsayıyoruz.
 */
export const fetchOrderDetail = async (
    orderId: string,
    token: string
): Promise<Order> => {
    try {
        const data = await apiClient.get<Order | { order: Order }>(
            `${API_BASE_URL}/orders/${orderId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return (data as { order: Order })?.order ?? (data as Order);
    } catch (error) {
        throw error;
    }
};

/**
 * Müşterinin kendi siparişlerini çeker - Sayfalandırma desteği ile.
 * API'nin { data: [...], pagination: {...} } yapısında cevap döndürdüğünü varsayıyoruz.
 */
export const fetchMyOrders = async (
    token: string,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResponse<Order>> => {
    try {
        const data = await apiClient.get<PaginatedResponse<Order>>(
            `${API_BASE_URL}/orders`,
            {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit },
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Yeni bir sipariş oluşturur ve oluşturulan siparişi geri döner.
 */
export const createOrder = async (
    orderData: CreateOrderPayload,
    token: string
): Promise<Order> => {
    try {
        const data = await apiClient.post<Order | { order: Order }>(
            `${API_BASE_URL}/orders`,
            orderData,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return (data as { order: Order })?.order ?? (data as Order);
    } catch (error) {
        throw error;
    }
};

/**
 * Belirli bir kullanıcının siparişlerini çeker - Sayfalandırma desteği ile.
 */
export const fetchOrdersByUserId = async (
    userId: string,
    token: string,
    page: number = 1,
    limit: number = 10
): Promise<{ order: Order[]; pagination: PaginationInfo }> => {
    try {
        const raw = await apiClient.get<
            | PaginatedResponse<Order>
            | { order: Order[]; pagination?: PaginationInfo }
            | { orders: Order[]; pagination?: PaginationInfo }
            | Order[]
            | { data: Order[]; pagination?: PaginationInfo }
        >(`${API_BASE_URL}/admin/orders/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit },
        });

        // Normalize various possible response shapes to a single return shape
        let orders: Order[] = [];
        let pagination: PaginationInfo = {
            totalItems: 0,
            totalPages: 0,
            currentPage: page,
            pageSize: limit,
        };

        // Case 1: Array response
        if (Array.isArray(raw)) {
            orders = raw;
            pagination = {
                totalItems: orders.length,
                totalPages: Math.max(1, Math.ceil(orders.length / limit)),
                currentPage: page,
                pageSize: limit,
            };
        }
        // Case 2: { data: [...], pagination }
        else if (
            raw &&
            typeof raw === "object" &&
            "data" in raw &&
            Array.isArray((raw as { data: unknown }).data)
        ) {
            const dataResponse = raw as {
                data: Order[];
                pagination?: PaginationInfo;
            };
            orders = dataResponse.data;
            if (dataResponse.pagination) {
                pagination = dataResponse.pagination;
            } else {
                pagination = {
                    totalItems: orders.length,
                    totalPages: Math.max(1, Math.ceil(orders.length / limit)),
                    currentPage: page,
                    pageSize: limit,
                };
            }
        }
        // Case 3: { order: [...], pagination }
        else if (
            raw &&
            typeof raw === "object" &&
            "order" in raw &&
            Array.isArray((raw as { order: unknown }).order)
        ) {
            const orderResponse = raw as {
                order: Order[];
                pagination?: PaginationInfo;
            };
            orders = orderResponse.order;
            if (orderResponse.pagination) {
                pagination = orderResponse.pagination;
            } else {
                pagination = {
                    totalItems: orders.length,
                    totalPages: Math.max(1, Math.ceil(orders.length / limit)),
                    currentPage: page,
                    pageSize: limit,
                };
            }
        }
        // Case 4: { orders: [...], pagination }
        else if (
            raw &&
            typeof raw === "object" &&
            "orders" in raw &&
            Array.isArray((raw as { orders: unknown }).orders)
        ) {
            const ordersResponse = raw as {
                orders: Order[];
                pagination?: PaginationInfo;
            };
            orders = ordersResponse.orders;
            if (ordersResponse.pagination) {
                pagination = ordersResponse.pagination;
            } else {
                pagination = {
                    totalItems: orders.length,
                    totalPages: Math.max(1, Math.ceil(orders.length / limit)),
                    currentPage: page,
                    pageSize: limit,
                };
            }
        }
        // Fallback: unknown structure → empty
        else {
            orders = [];
            pagination = {
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
                pageSize: limit,
            };
        }

        return { order: orders, pagination };
    } catch (error) {
        // If the API returns an error (like 404 for no orders), return empty result
        if (
            (error as { response?: { status?: number } })?.response?.status ===
            404
        ) {
            return {
                order: [],
                pagination: {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: 1,
                    pageSize: limit,
                },
            };
        }
        throw error;
    }
};

/**
 * Admin dashboard istatistiklerini çeker.
 * API: GET /api/admin/dashboard-stats
 */
export const fetchAdminDashboardStats = async (
    token: string
): Promise<DashboardStats> => {
    try {
        const data = await apiClient.get<DashboardStats>(
            `${API_BASE_URL}/admin/dashboard-stats`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Müşterinin kendi siparişlerini getirir (client endpoint)
 */
export const getClientOrders = async (
    token: string,
    page: number = 1,
    limit: number = 10
): Promise<{ data: Order[]; pagination: PaginationInfo }> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        const url = `${API_BASE_URL}/client/orders?${params.toString()}`;

        const response = await apiClient.get<{
            data: Order[];
            pagination: PaginationInfo;
        }>(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response;
    } catch (error) {
        console.error("Error fetching client orders:", error);
        throw error;
    }
};

/**
 * Distributor/Admin: get orders for a specific client (paginated)
 * API: GET /api/distributor/clients/:id/orders
 */
export const fetchDistributorClientOrders = async (
    clientId: string,
    token: string,
    page: number = 1,
    limit: number = 10
): Promise<{ data: Order[]; pagination: PaginationInfo }> => {
    try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        const url = `${API_BASE_URL}/distributor/clients/${clientId}/orders?${params.toString()}`;
        const response = await apiClient.get<{
            data: Order[];
            pagination: PaginationInfo;
        }>(url, { headers: { Authorization: `Bearer ${token}` } });
        return response;
    } catch {
        // 404 or empty fallbacks
        return {
            data: [],
            pagination: {
                totalItems: 0,
                totalPages: 0,
                currentPage: 1,
                pageSize: limit,
            },
        };
    }
};

/**
 * Kullanıcının en son siparişini getirir (client için)
 */
export const getLastOrder = async (): Promise<Order | null> => {
    try {
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null;
        if (!token) {
            return null;
        }

        const response = await getClientOrders(token, 1, 1);
        return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
        console.error("Error fetching last order:", error);
        return null;
    }
};

/**
 * Admin sipariş iptal etme işlemi
 * API: PUT /admin/orders/:orderId/cancel
 * Sadece PENDING ve READY_FOR_DELIVERY durumundaki siparişleri iptal edebilir
 */
export const cancelOrderByAdmin = async (
    orderId: string,
    notes: string,
    token: string
): Promise<{ success: boolean; message: string; order?: Order }> => {
    try {
        const payload = { notes };

        if (!apiClient["client"]) {
            return await apiClient.put<
                { success: boolean; message: string; order?: Order }
            >(`${API_BASE_URL}/admin/orders/${orderId}/cancel`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }

        const response = await apiClient["client"].put(
            `${API_BASE_URL}/admin/orders/${orderId}/cancel`,
            payload,
            {
                headers: { Authorization: `Bearer ${token}` },
                transformResponse: [(data) => data],
            }
        );

        const responseData =
            typeof response.data === "string"
                ? JSON.parse(response.data)
                : response.data;

        if (responseData && responseData.success === true) {
            return {
                success: true,
                message: responseData.message || "Order cancelled successfully",
                order: responseData.data,
            };
        }
        if (responseData && responseData.success === false) {
            return {
                success: false,
                message: responseData.message || "Failed to cancel order",
                order: undefined,
            };
        }
        return {
            success: false,
            message: "Unexpected response format from server",
            order: undefined,
        };
    } catch (error: unknown) {
        const err = error as { message?: string };
        // API client'dan gelen normalize edilmiş hata
        if (err.message) {
            throw new Error(err.message);
        }
        throw error;
    }
};
