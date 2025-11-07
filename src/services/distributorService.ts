import { apiClient } from "./apiClient";
import {
    DistributorDailyClientSummaryResponse,
    DistributorDailyProductSummaryResponse,
    DistributorDailyOrdersResponse,
    PriceListSummary,
    PriceListDetail,
    User,
    PaginationInfo,
} from "../types/data";
import type { Order } from "../types/data";

/**
 * Distributor Service
 * Handles all API calls related to distributor operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const PRICING_BASE = `${API_BASE_URL}/distributor/price-lists`;

const hasOrderProperty = (value: unknown): value is { order: Order } =>
    typeof value === "object" &&
    value !== null &&
    "order" in value &&
    typeof (value as { order: unknown }).order === "object";

const hasDataOrderProperty = (value: unknown): value is { data: Order } =>
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    typeof (value as { data: unknown }).data === "object";

const hasNestedUserData = (
    value: unknown
): value is { data: User[]; pagination: PaginationInfo } =>
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    "pagination" in value &&
    Array.isArray((value as { data: unknown }).data);

/**
 * Fetches the daily client summary for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise with the daily client summary data
 */
export const getDailyClientSummary = async (
    date: string
): Promise<DistributorDailyClientSummaryResponse> => {
    const response =
        await apiClient.get<DistributorDailyClientSummaryResponse>(
            `/distributor/daily-client-summary?date=${date}`
        );
    return response;
};

/**
 * Fetches the daily product summary for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise with the daily product summary data
 */
export const getDailyProductsSummary = async (
    date: string
): Promise<DistributorDailyProductSummaryResponse> => {
    const response =
        await apiClient.get<DistributorDailyProductSummaryResponse>(
            `/distributor/daily-product-summary?date=${date}`
        );
    return response;
};

/**
 * Fetches the daily orders for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise with the daily orders data
 */
export const getDailyOrders = async (
    date: string
): Promise<DistributorDailyOrdersResponse> => {
    const response = await apiClient.get<DistributorDailyOrdersResponse>(
        `/distributor/daily-orders?date=${date}`
    );
    return response;
};

/**
 * Fetches a single order detail for distributor
 * API: GET /distributor/orders/:id
 */
export const fetchDistributorOrderDetail = async (
    orderId: string,
    token: string
): Promise<Order> => {
    const response = await apiClient.get<Order | { data?: Order; order?: Order }>(
        `${API_BASE_URL}/distributor/orders/${encodeURIComponent(orderId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (hasOrderProperty(response)) {
        return response.order;
    }
    if (hasDataOrderProperty(response)) {
        return response.data;
    }
    return response as Order;
};

// --- Distributor Price List Management ---

/**
 * Fetches all price lists owned by the authenticated distributor
 * @param token - Distributor JWT token
 * @returns Promise with array of price list summaries
 */
export const fetchDistributorPriceLists = async (
    token: string
): Promise<PriceListSummary[]> => {
    const response = await apiClient.get<
        PriceListSummary[] | { data: PriceListSummary[] }
    >(PRICING_BASE, { headers: { Authorization: `Bearer ${token}` } });

    // Type guard to check if response has data property
    if (response && typeof response === "object" && "data" in response) {
        return (response as { data: PriceListSummary[] }).data;
    }
    return response as PriceListSummary[];
};

/**
 * Creates a new price list for the distributor
 * @param payload - Price list creation payload
 * @param token - Distributor JWT token
 * @returns Promise with created price list
 */
export const createDistributorPriceList = async (
    payload: { name: string; type?: string; isDefault?: boolean },
    token: string
): Promise<PriceListSummary> => {
    const response = await apiClient.post<
        PriceListSummary | { data: PriceListSummary }
    >(PRICING_BASE, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });

    // Type guard to check if response has data property
    if (response && typeof response === "object" && "data" in response) {
        return (response as { data: PriceListSummary }).data;
    }
    return response as PriceListSummary;
};

/**
 * Fetches detailed information about a specific price list
 * @param id - Price list ID
 * @param token - Distributor JWT token
 * @returns Promise with price list details
 */
export const fetchDistributorPriceListDetail = async (
    id: string,
    token: string
): Promise<PriceListDetail> => {
    const url = `${PRICING_BASE}/${encodeURIComponent(id)}`;
    const response = await apiClient.get<
        PriceListDetail | { data: PriceListDetail }
    >(url, { headers: { Authorization: `Bearer ${token}` } });

    // Type guard to check if response has data property
    if (response && typeof response === "object" && "data" in response) {
        return (response as { data: PriceListDetail }).data;
    }
    return response as PriceListDetail;
};

/**
 * Updates prices in a price list
 * @param id - Price list ID
 * @param items - Array of price updates
 * @param token - Distributor JWT token
 * @returns Promise with updated price list details
 */
export const updateDistributorPriceListItems = async (
    id: string,
    items: Array<{ optionItemId: string; price?: number; multiplier?: number }>,
    token: string
): Promise<{ message?: string } & PriceListDetail> => {
    const response = await apiClient.put<
        PriceListDetail | { data: PriceListDetail }
    >(
        `${PRICING_BASE}/${encodeURIComponent(id)}`,
        { items },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    // Type guard to check if response has data property
    if (response && typeof response === "object" && "data" in response) {
        return (response as { data: PriceListDetail }).data;
    }
    return response as { message?: string } & PriceListDetail;
};

/**
 * Sets a price list as default for the distributor
 * @param id - Price list ID
 * @param token - Distributor JWT token
 * @returns Promise with updated price list details
 */
export const setDistributorPriceListDefault = async (
    id: string,
    token: string
): Promise<PriceListDetail> => {
    const response = await apiClient.put<
        PriceListDetail | { data: PriceListDetail }
    >(`${PRICING_BASE}/${encodeURIComponent(id)}/set-default`, undefined, {
        headers: { Authorization: `Bearer ${token}` },
    });

    // Type guard to check if response has data property
    if (response && typeof response === "object" && "data" in response) {
        return (response as { data: PriceListDetail }).data;
    }
    return response as PriceListDetail;
};

/**
 * Deletes a price list
 * @param id - Price list ID
 * @param token - Distributor JWT token
 * @returns Promise with deletion result
 */
export const deleteDistributorPriceList = async (
    id: string,
    token: string
): Promise<{
    message?: string;
    data?: {
        reassignedUsersCount?: number;
        reassignedUsers?: Array<{
            id: string;
            email: string;
            name: string;
            surname: string;
        }>;
        defaultPriceListId?: string;
    };
}> => {
    return await apiClient.delete<{
        message?: string;
        data?: {
            reassignedUsersCount?: number;
            reassignedUsers?: Array<{
                id: string;
                email: string;
                name: string;
                surname: string;
            }>;
            defaultPriceListId?: string;
        };
    }>(`${PRICING_BASE}/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// --- Distributor Client Management ---

/**
 * Fetches all clients for the distributor
 * @param token - Distributor JWT token
 * @param page - Page number (optional)
 * @param limit - Items per page (optional)
 * @returns Promise with paginated client list
 */
export const fetchDistributorClients = async (
    token: string,
    page?: number,
    limit?: number
): Promise<{ data: User[]; pagination: PaginationInfo }> => {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));

    const url = `/distributor/clients${params.toString() ? `?${params.toString()}` : ""}`;
    
    const response = await apiClient.get<{
        data: { data: User[]; pagination: PaginationInfo } | User[];
        pagination?: PaginationInfo;
    }>(url, { headers: { Authorization: `Bearer ${token}` } });

    // Handle different response formats
    if (response && typeof response === "object" && "data" in response) {
        if (hasNestedUserData(response.data)) {
            return {
                data: response.data.data,
                pagination: response.data.pagination,
            };
        }
        if (Array.isArray(response.data) && response.pagination) {
            return {
                data: response.data,
                pagination: response.pagination,
            };
        }
    }

    // Fallback
    return {
        data: [],
        pagination: {
            totalItems: 0,
            totalPages: 0,
            currentPage: page || 1,
            pageSize: limit || 10,
        },
    };
};

/**
 * Updates a client's price list
 * @param clientId - Client user ID
 * @param priceListId - Price list ID to assign (null to remove)
 * @param token - Distributor JWT token
 * @returns Promise with updated user
 */
export const updateClientPriceList = async (
    clientId: string,
    priceListId: string | null,
    token: string
): Promise<User> => {
    const response = await apiClient.put<User | { data: User }>(
        `/distributor/clients/${encodeURIComponent(clientId)}/price-list`,
        { priceListId },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    // Type guard to check if response has data property
    if (response && typeof response === "object" && "data" in response) {
        return (response as { data: User }).data;
    }
    return response as User;
};

/**
 * Fetches the admin price list assigned to the distributor
 * @param token - Distributor JWT token
 * @returns Promise with admin price list details
 */
export const fetchDistributorAdminPriceList = async (
    token: string
): Promise<PriceListDetail> => {
    const response = await apiClient.get<
        PriceListDetail | { data: PriceListDetail }
    >(`${PRICING_BASE}/admin-price-list`, { 
        headers: { Authorization: `Bearer ${token}` } 
    });

    // Type guard to check if response has data property
    if (response && typeof response === "object" && "data" in response) {
        return (response as { data: PriceListDetail }).data;
    }
    return response as PriceListDetail;
};

export const distributorService = {
    getDailyClientSummary,
    getDailyProductsSummary,
    getDailyOrders,
    fetchDistributorOrderDetail,
    fetchDistributorPriceLists,
    createDistributorPriceList,
    fetchDistributorPriceListDetail,
    updateDistributorPriceListItems,
    setDistributorPriceListDefault,
    deleteDistributorPriceList,
    fetchDistributorAdminPriceList,
    fetchDistributorClients,
    updateClientPriceList,
};
