import { apiClient } from "./apiClient";
import { Order as DriverOrder, PaginatedResponse } from "../types/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ==============================================================================
//  API FONKSİYONLARI (API FUNCTIONS)
// ==============================================================================

/**
 * Giriş yapmış şoför için o gün teslim edilecek siparişleri çeker - Sayfalandırma desteği ile.
 * @param token Şoför kullanıcısının JWT token'ı
 * @param page Sayfa numarası
 * @param limit Sayfa başına kayıt sayısı
 * @returns {Promise<PaginatedResponse<DriverOrder>>} Sayfalandırılmış teslim edilecek siparişler
 */
export const fetchDriverOrdersOfToday = async (
    token: string,
    page: number = 1,
    limit: number = 25
): Promise<PaginatedResponse<DriverOrder>> => {
    try {
        const data = await apiClient.get<PaginatedResponse<DriverOrder>>(
            `${API_BASE_URL}/driver/orders`,
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
 * Şoförün bir siparişin teslimat durumunu güncellemesini sağlar.
 * @param orderId Güncellenecek siparişin ID'si
 * @param payload { status: 'DELIVERED' | 'FAILED', notes?: string }
 * @param token Şoförün JWT token'ı
 */
export const updateOrderStatusAsDriver = async (
    orderId: string,
    status: "DELIVERED" | "FAILED",
    notes: string | null,
    token: string
): Promise<DriverOrder> => {
    const data = await apiClient.put<
        { updatedOrder: DriverOrder } | DriverOrder
    >(
        `${API_BASE_URL}/driver/orders/${orderId}/status`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return (
        (data as { updatedOrder: DriverOrder })?.updatedOrder ??
        (data as DriverOrder)
    );
};

export const fetchTodayDeliveries = async (
    token: string
): Promise<DriverOrder[]> => {
    const data = await apiClient.get<{ orders: DriverOrder[] } | DriverOrder[]>(
        `${API_BASE_URL}/driver/orders`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return (
        (data as { orders: DriverOrder[] })?.orders ??
        (data as DriverOrder[]) ??
        []
    );
};

export const fetchAllDeliveries = async (
    token: string
): Promise<DriverOrder[]> => {
    const data = await apiClient.get<{ orders: DriverOrder[] } | DriverOrder[]>(
        `${API_BASE_URL}/driver/orders/all`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return (
        (data as { orders: DriverOrder[] })?.orders ??
        (data as DriverOrder[]) ??
        []
    );
};

/**
 * Belirli bir güne ait şoför siparişlerini API'den çeker - Sayfalandırma desteği ile.
 * @param token Şoförün JWT token'ı
 * @param date YYYY-MM-DD formatında tarih (opsiyonel)
 * @param page Sayfa numarası
 * @param limit Sayfa başına kayıt sayısı
 */
export const fetchDriverOrdersByDate = async (
    token: string,
    date?: string,
    page: number = 1,
    limit: number = 25,
    status?: string | string[]
): Promise<PaginatedResponse<DriverOrder>> => {
    // Build params with support for repeated 'status' query keys
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (date) params.set("date", date);
    if (status) {
        if (Array.isArray(status)) {
            status.forEach((s) => params.append("status", s));
        } else {
            params.set("status", status);
        }
    }
    const data = await apiClient.get<PaginatedResponse<DriverOrder>>(
        `${API_BASE_URL}/driver/orders`,
        { headers: { Authorization: `Bearer ${token}` }, params }
    );
    return data;
};

/**
 * Teslimata hazır ve henüz sahibi olmayan siparişleri (havuzu) çeker.
 */
export const fetchDriverOrderPool = async (
    token: string,
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<DriverOrder>> => {
    const data = await apiClient.get<PaginatedResponse<DriverOrder>>(
        `${API_BASE_URL}/driver/orders/pool`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit },
        }
    );
    return data;
};

/**
 * Giriş yapmış şoförün üstlendiği siparişleri çeker.
 */
export const fetchMyDeliveries = async (
    token: string,
    page: number = 1,
    limit: number = 20,
    date?: string,
    status?: string | string[]
): Promise<PaginatedResponse<DriverOrder>> => {
    // Build params with support for date and status filters
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (date) params.set("date", date);
    if (status) {
        if (Array.isArray(status)) {
            status.forEach((s) => params.append("status", s));
        } else {
            params.set("status", status);
        }
    }

    const data = await apiClient.get<PaginatedResponse<DriverOrder>>(
        `${API_BASE_URL}/driver/orders/my-deliveries`,
        { headers: { Authorization: `Bearer ${token}` }, params }
    );

    return data;
};
/**
 * Bir şoförün havuzdaki bir siparişi üstlenmesini sağlar.
 */
export const claimOrder = async (
    orderId: string,
    token: string
): Promise<DriverOrder> => {
    const data = await apiClient.put<DriverOrder>(
        `${API_BASE_URL}/driver/orders/${orderId}/claim`,
        undefined,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
};

/**
 * Şoförün bir siparişin detayını çekmesini sağlar.
 * @param orderId Detayı çekilecek siparişin ID'si
 * @param token Şoförün JWT token'ı
 * @returns {Promise<DriverOrder>} Sipariş detayları
 */
export const fetchDriverOrderDetail = async (
    orderId: string,
    token: string
): Promise<DriverOrder> => {
    const data = await apiClient.get<DriverOrder | { order: DriverOrder }>(
        `${API_BASE_URL}/driver/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return (data as { order: DriverOrder })?.order ?? (data as DriverOrder);
};

/**
 * Şoförün bir sipariş kalemi için kısmi teslimat yapmasını sağlar.
 * @param orderItemId Teslimat yapılacak sipariş kaleminin ID'si
 * @param amount Teslim edilecek adet
 * @param notes Teslimat notu (zorunlu, min 5 karakter)
 * @param token Şoförün JWT token'ı
 * @returns {Promise<any>} Güncellenmiş sipariş kalemi
 */
export const deliverOrderItemPartially = async (
    orderItemId: string,
    amount: number,
    notes: string,
    token: string
): Promise<unknown> => {
    try {
        const data = await apiClient.put(
            `${API_BASE_URL}/driver/order-items/${orderItemId}/deliver`,
            { amount, notes },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Şoförün bir sipariş kalemini "teslim edilemez" olarak işaretlemesini sağlar.
 * @param orderItemId Teslim edilemeyen sipariş kaleminin ID'si
 * @param notes Teslim edilememe sebebi (zorunlu, min 5 karakter)
 * @param token Şoförün JWT token'ı
 * @returns {Promise<any>} Güncellenmiş sipariş kalemi
 */
export const cannotDeliverItem = async (
    orderItemId: string,
    notes: string,
    token: string
): Promise<unknown> => {
    try {
        const data = await apiClient.put(
            `${API_BASE_URL}/driver/order-items/${orderItemId}/cannot-deliver`,
            { notes },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};
