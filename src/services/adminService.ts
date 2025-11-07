import { apiClient } from "./apiClient";
import axios from "axios";
import { ProductionItem } from "../services/chefService";
import type {
    PriceListSummary,
    PriceListDetail,
    ProductGroup,
    User,
    AdminAnalyticsDashboardResponse,
    AdminAnalyticsOrdersQuery,
    AdminAnalyticsOrdersResponse,
    AdminAnalyticsCustomersQuery,
    AdminAnalyticsCustomersResponse,
    AdminAnalyticsProductionQuery,
    AdminAnalyticsProductionResponse,
    AdminAnalyticsFinancialsQuery,
    AdminAnalyticsFinancialsResponse,
    AnalyticsCacheStats,
    AnalyticsTestDataResponse,
    CustomerSummary,
    // New customer analytics types
    CustomerKPIQuery,
    CustomerKPIMetrics,
    TopCustomersQuery,
    TopCustomerData,
    AcquisitionTrendQuery,
    AcquisitionTrendData,
    EnhancedCustomersQuery,
    EnhancedCustomerData,
    AtRiskCustomersQuery,
    AtRiskCustomersResponse,
} from "@/types/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Admin için, tamamlanan ve tamamlanmayan tüm üretim listesini çeker.
 * @param token Admin kullanıcısının JWT token'ı
 * @param date YYYY-MM-DD formatında tarih (opsiyonel)
 */
export const fetchAdminProductionListAll = async (
    token: string,
    date?: string
): Promise<ProductionItem[]> => {
    try {
        let url = `${API_BASE_URL}/admin/production-list/all`;
        if (date) {
            url += `?date=${encodeURIComponent(date)}`;
        }
        const response = await apiClient.get<
            ProductionItem[] | { productionList: ProductionItem[] }
        >(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Type guard to check if response has productionList property
        if (
            response &&
            typeof response === "object" &&
            "productionList" in response
        ) {
            return (
                (response as { productionList: ProductionItem[] })
                    .productionList ?? []
            );
        }
        return (response as ProductionItem[]) ?? [];
    } catch (error) {
        throw error;
    }
};

// --- Pricing Admin API ---
const PRICING_BASE = `${API_BASE_URL}/admin/price-lists`;

export const fetchPriceLists = async (
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

// --- Admin Analytics ---
const ANALYTICS_BASE = `/admin/analytics`;

export const getAdminAnalyticsDashboard = async (
    token: string
): Promise<AdminAnalyticsDashboardResponse> => {
    return await apiClient.get<AdminAnalyticsDashboardResponse>(
        `${ANALYTICS_BASE}/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

export const getAdminCustomerSummary = async (
    token: string
): Promise<CustomerSummary> => {
    const response = await apiClient.get<
        CustomerSummary | { data: CustomerSummary }
    >(`${ANALYTICS_BASE}/customers/summary`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    // Type guard to check if response has data property
    if (response && typeof response === "object" && "data" in response) {
        return (response as { data: CustomerSummary }).data;
    }
    return response as CustomerSummary;
};

export const getAdminAnalyticsOrders = async (
    query: AdminAnalyticsOrdersQuery,
    token: string
): Promise<AdminAnalyticsOrdersResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);
    if (query.status) params.set("status", query.status);
    const url = `${ANALYTICS_BASE}/orders${
        params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await apiClient.get<AdminAnalyticsOrdersResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    // Backend response format'ına göre normalize et
    if (response.data && Array.isArray(response.data)) {
        // Eğer data array ise ve pagination ayrıysa
        return {
            data: response.data,
            pagination: response.pagination || {
                totalItems: 0,
                totalPages: 1,
                currentPage: query.page || 1,
                pageSize: query.limit || 20,
            },
        } as AdminAnalyticsOrdersResponse;
    }

    return response as AdminAnalyticsOrdersResponse;
};

export const getAdminAnalyticsCustomers = async (
    query: AdminAnalyticsCustomersQuery,
    token: string
): Promise<AdminAnalyticsCustomersResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    const url = `${ANALYTICS_BASE}/customers${
        params.toString() ? `?${params.toString()}` : ""
    }`;
    return await apiClient.get<AdminAnalyticsCustomersResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const getAdminAnalyticsProduction = async (
    query: AdminAnalyticsProductionQuery,
    token: string
): Promise<AdminAnalyticsProductionResponse> => {
    const params = new URLSearchParams();
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);
    if (query.productGroup) params.set("productGroup", query.productGroup);
    if (query.categoryId) params.set("categoryId", query.categoryId);
    const url = `${ANALYTICS_BASE}/production${
        params.toString() ? `?${params.toString()}` : ""
    }`;
    return await apiClient.get<AdminAnalyticsProductionResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createAnalyticsTestData = async (
    count: number | undefined,
    token: string
): Promise<AnalyticsTestDataResponse | void> => {
    const params = new URLSearchParams();
    if (typeof count === "number" && !Number.isNaN(count)) {
        params.set("count", String(count));
    }
    const url = `${ANALYTICS_BASE}/test/create-data${
        params.toString() ? `?${params.toString()}` : ""
    }`;
    return await apiClient.post<AnalyticsTestDataResponse>(url, undefined, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const getAnalyticsCacheStats = async (
    token: string
): Promise<AnalyticsCacheStats> => {
    return await apiClient.get<AnalyticsCacheStats>(
        `${ANALYTICS_BASE}/cache/stats`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
};

export const clearAnalyticsCache = async (
    token: string
): Promise<{ cleared?: boolean; message?: string } | void> => {
    return await apiClient.post<{ cleared?: boolean; message?: string }>(
        `${ANALYTICS_BASE}/cache/clear`,
        undefined,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
};

export const fetchProductionAnalyticsStream = async (
    query: AdminAnalyticsProductionQuery,
    token: string
): Promise<Response> => {
    const params = new URLSearchParams();
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);
    if (query.productGroup) params.set("productGroup", query.productGroup);
    if (query.categoryId) params.set("categoryId", query.categoryId);
    const url = `${ANALYTICS_BASE}/production/stream${
        params.toString() ? `?${params.toString()}` : ""
    }`;

    return await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getAdminAnalyticsFinancials = async (
    query: AdminAnalyticsFinancialsQuery,
    token: string
): Promise<AdminAnalyticsFinancialsResponse> => {
    const params = new URLSearchParams();
    params.set("timeframe", query.timeframe);
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);
    const url = `${ANALYTICS_BASE}/financials?${params.toString()}`;
    return await apiClient.get<AdminAnalyticsFinancialsResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createPriceList = async (
    payload: { name: string; isDefault?: boolean },
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

export const fetchPriceListDetail = async (
    id: string,
    token: string
): Promise<PriceListDetail> => {
    // Support alias path `/admin/pricing/:id` if backend exposes it, but default to price-lists
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

export const updatePriceListItems = async (
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

export const setPriceListDefault = async (
    id: string,
    token: string
): Promise<PriceListDetail> => {
    const response = await apiClient.patch<
        PriceListDetail | { data: PriceListDetail }
    >(`${PRICING_BASE}/${encodeURIComponent(id)}/default`, undefined, {
        headers: { Authorization: `Bearer ${token}` },
    });

    // Type guard to check if response has data property
    if (response && typeof response === "object" && "data" in response) {
        return (response as { data: PriceListDetail }).data;
    }
    return response as PriceListDetail;
};

export const deletePriceList = async (
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

// --- Chef Management ---

/**
 * Admin tarafından tüm şefleri listeler.
 * @param token Admin kullanıcısının JWT token'ı
 */
export const getAllChefs = async (token: string): Promise<User[]> => {
    try {
        const data = await apiClient.get<{ chefs: User[] }>(
            `${API_BASE_URL}/admin/chefs`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data.chefs;
    } catch (error) {
        throw error;
    }
};

/**
 * Admin tarafından şefin ürün grubunu günceller.
 * @param chefId Şefin ID'si
 * @param productGroup Yeni ürün grubu
 * @param token Admin kullanıcısının JWT token'ı
 */
export const updateChefProductGroupByAdmin = async (
    chefId: string,
    productGroup: ProductGroup,
    token: string
): Promise<User> => {
    try {
        const data = await apiClient.put<User>(
            `${API_BASE_URL}/admin/chefs/${chefId}/product-group`,
            { productGroup },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Admin tarafından şefin ürün grubunu getirir.
 * @param chefId Şefin ID'si
 * @param token Admin kullanıcısının JWT token'ı
 */
export const getChefProductGroupByAdmin = async (
    chefId: string,
    token: string
): Promise<{ productGroup: ProductGroup }> => {
    try {
        const data = await apiClient.get<{ productGroup: ProductGroup }>(
            `${API_BASE_URL}/admin/chefs/${chefId}/product-group`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

// --- Export API Functions ---

export interface ExportStatsResponse {
    orderCount: number;
    itemCount: number;
    estimatedSizeKB: number;
    estimatedTimeSeconds: number;
    canExport: boolean;
    willCache: boolean;
}

export interface ExportRequest {
    startDate?: string;
    endDate?: string;
    status?: string;
    format: "csv";
}

export interface ExportResponse {
    cached?: boolean;
    downloadUrl?: string;
    recommendedMethod?: "direct" | "async";
}

export interface AsyncExportResponse {
    jobId: string;
    recommendedMethod: "direct" | "async";
}

export interface ExportJobStatus {
    status: "idle" | "queued" | "processing" | "completed" | "failed";
    progress: number;
    downloadUrl?: string;
}

/**
 * Get export statistics for orders
 */
export const getOrdersExportStats = async (
    params: {
        startDate?: string;
        endDate?: string;
        status?: string;
    },
    token: string
): Promise<ExportStatsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.status) queryParams.append("status", params.status);

    const response = await apiClient.get<ExportStatsResponse>(
        `/admin/analytics/orders/export/stats?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
};

/**
 * Export orders directly (for smaller datasets)
 */
export const exportOrdersDirect = async (
    request: ExportRequest,
    token: string
): Promise<unknown> => {
    // Use axios directly for file download to handle blob responses properly
    const response = await axios.post(
        `${API_BASE_URL}/admin/analytics/orders/export`,
        request,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            responseType: "blob", // This is important for file downloads
        }
    );
    return response.data;
};

/**
 * Create async export job (for larger datasets)
 */
export const createAsyncOrdersExport = async (
    request: ExportRequest,
    token: string
): Promise<AsyncExportResponse> => {
    const response = await apiClient.post<AsyncExportResponse>(
        `/admin/analytics/orders/export-async`,
        request,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
};

/**
 * Get async export job status
 */
export const getExportJobStatus = async (
    jobId: string,
    token: string
): Promise<ExportJobStatus> => {
    const response = await apiClient.get<ExportJobStatus>(
        `/admin/analytics/orders/export-status/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
};

// ========================================
// ENHANCED CUSTOMER ANALYTICS FUNCTIONS
// ========================================

/**
 * Get KPI metrics for customer dashboard cards
 */
export const getCustomerKPIMetrics = async (
    query: CustomerKPIQuery = {},
    token: string
): Promise<CustomerKPIMetrics> => {
    const params = new URLSearchParams();
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);

    const url = `${ANALYTICS_BASE}/customers/kpi${
        params.toString() ? `?${params.toString()}` : ""
    }`;

    return await apiClient.get<CustomerKPIMetrics>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

/**
 * Get top customers for bar chart
 */
export const getTopCustomers = async (
    query: TopCustomersQuery = {},
    token: string
): Promise<TopCustomerData[]> => {
    const params = new URLSearchParams();
    if (query.limit) params.set("limit", String(query.limit));

    const url = `${ANALYTICS_BASE}/customers/top${
        params.toString() ? `?${params.toString()}` : ""
    }`;

    return await apiClient.get<TopCustomerData[]>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

/**
 * Get new customer acquisition trend for line chart
 */
export const getCustomerAcquisitionTrend = async (
    query: AcquisitionTrendQuery = {},
    token: string
): Promise<AcquisitionTrendData[]> => {
    const params = new URLSearchParams();
    if (query.months) params.set("months", String(query.months));

    const url = `${ANALYTICS_BASE}/customers/acquisition-trend${
        params.toString() ? `?${params.toString()}` : ""
    }`;

    return await apiClient.get<AcquisitionTrendData[]>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

/**
 * Get enhanced customer table data with pagination and search
 */
export const getEnhancedCustomers = async (
    query: EnhancedCustomersQuery = {},
    token: string
): Promise<{
    data: EnhancedCustomerData[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);
    if (query.search) params.set("search", query.search);

    const url = `${ANALYTICS_BASE}/customers/enhanced${
        params.toString() ? `?${params.toString()}` : ""
    }`;

    return await apiClient.get<{
        data: EnhancedCustomerData[];
        pagination: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            pageSize: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
    }>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

/**
 * Get at-risk customers who haven't ordered recently
 */
export const getAtRiskCustomers = async (
    query: AtRiskCustomersQuery = {},
    token: string
): Promise<AtRiskCustomersResponse> => {
    const params = new URLSearchParams();
    if (query.daysThreshold)
        params.set("daysThreshold", String(query.daysThreshold));
    if (query.limit) params.set("limit", String(query.limit));

    const url = `${ANALYTICS_BASE}/customers/at-risk${
        params.toString() ? `?${params.toString()}` : ""
    }`;

    return await apiClient.get<AtRiskCustomersResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
