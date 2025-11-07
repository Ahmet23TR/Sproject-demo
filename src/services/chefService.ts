import { apiClient } from "./apiClient";
import {
    Order as ChefOrder,
    OrderItem,
    PaginatedResponse,
    ProductGroup,
} from "../types/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Şefin üretim özet listesi için veri tipi.
 */
export interface ProductionItem {
    productName: string;
    variantName: string;
    total: number;
    unit: "PIECE" | "KG" | "TRAY";
    productGroup: ProductGroup;
}

/**
 * O gün üretilecek tüm ürünlerin toplu listesini API'den çeker.
 * @param token Şef kullanıcısının JWT token'ı
 */
export const fetchChefProductionList = async (
    token: string
): Promise<ProductionItem[]> => {
    try {
        const data = await apiClient.get<
            ProductionItem[] | { productionList: ProductionItem[] }
        >(`${API_BASE_URL}/chef/production-list`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return (
            (data as { productionList: ProductionItem[] })?.productionList ??
            (data as ProductionItem[]) ??
            []
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Şefin görmesi için o günkü tüm siparişleri detaylarıyla çeker - Sayfalandırma desteği ile.
 * @param token Şef kullanıcısının JWT token'ı
 * @param page Sayfa numarası
 * @param limit Sayfa başına kayıt sayısı
 */
export const fetchChefOrdersOfToday = async (
    token: string,
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<ChefOrder>> => {
    try {
        const data = await apiClient.get<PaginatedResponse<ChefOrder>>(
            `${API_BASE_URL}/chef/orders`,
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

export const fetchTodayOrders = async (
    token: string,
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<ChefOrder>> => {
    const data = await apiClient.get<PaginatedResponse<ChefOrder>>(
        `${API_BASE_URL}/chef/orders`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit },
        }
    );
    return data;
};

export const fetchAllOrders = async (
    token: string,
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<ChefOrder>> => {
    const data = await apiClient.get<PaginatedResponse<ChefOrder>>(
        `${API_BASE_URL}/chef/orders/all`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit },
        }
    );
    return data;
};

/**
 * Belirli bir güne ait üretim özetini API'den çeker.
 * @param token Şef kullanıcısının JWT token'ı
 * @param date YYYY-MM-DD formatında tarih (opsiyonel)
 */
export const fetchChefProductionListByDate = async (
    token: string,
    date?: string
): Promise<ProductionItem[]> => {
    try {
        let url = `${API_BASE_URL}/chef/production-list`;
        if (date) {
            url += `?date=${encodeURIComponent(date)}`;
        }
        const data = await apiClient.get<
            ProductionItem[] | { productionList: ProductionItem[] }
        >(url, { headers: { Authorization: `Bearer ${token}` } });
        return (
            (data as { productionList: ProductionItem[] })?.productionList ??
            (data as ProductionItem[]) ??
            []
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Belirli bir güne ait siparişleri API'den çeker - Sayfalandırma desteği ile.
 * @param token Şef kullanıcısının JWT token'ı
 * @param date YYYY-MM-DD formatında tarih (opsiyonel)
 * @param page Sayfa numarası
 * @param limit Sayfa başına kayıt sayısı
 */
export const fetchChefOrdersByDate = async (
    token: string,
    date?: string,
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<ChefOrder>> => {
    try {
        const params: { page: number; limit: number; date?: string } = {
            page,
            limit,
        };
        if (date) {
            params.date = date;
        }
        const data = await apiClient.get<PaginatedResponse<ChefOrder>>(
            `${API_BASE_URL}/chef/orders`,
            { headers: { Authorization: `Bearer ${token}` }, params }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Bir sipariş kaleminin üretim durumunu günceller (Tamamlandı / İptal Edildi).
 * @param orderItemId Güncellenecek sipariş kaleminin ID'si
 * @param payload Güncellenecek veriler { status, notes }
 * @param token Şef kullanıcısının JWT token'ı
 */
export const updateOrderItemStatus = async (
    orderItemId: string,
    payload: {
        status: "COMPLETED" | "CANCELLED" | "PARTIALLY_COMPLETED";
        notes: string | null;
    },
    token: string
): Promise<OrderItem> => {
    try {
        const data = await apiClient.put<OrderItem | { orderItem: OrderItem }>(
            `${API_BASE_URL}/chef/order-items/${orderItemId}/status`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return (
            (data as { orderItem: OrderItem })?.orderItem ?? (data as OrderItem)
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Bir sipariş kaleminde kısmi üretim (Partial) gerçekleştirir.
 * @param orderItemId Güncellenecek sipariş kaleminin ID'si
 * @param payload { amount, notes }
 * @param token Şef kullanıcısının JWT token'ı
 */
export const produceOrderItem = async (
    orderItemId: string,
    payload: { amount: number; notes: string },
    token: string
): Promise<OrderItem> => {
    try {
        const trimmedNotes = (payload.notes || "").trim();
        const body: Record<string, unknown> = {
            amount: payload.amount,
            // For backend variants that expect a different key name
            notes: trimmedNotes,
        };
        const data = await apiClient.put<OrderItem | { orderItem: OrderItem }>(
            `${API_BASE_URL}/chef/order-items/${orderItemId}/produce`,
            body,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return (
            (data as { orderItem: OrderItem })?.orderItem ?? (data as OrderItem)
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Şefin ürün grubuna göre üretim listesini getirir.
 * @param token Şef kullanıcısının JWT token'ı
 * @param date YYYY-MM-DD formatında tarih (opsiyonel, default: bugün)
 */
export const fetchChefProductionListByGroup = async (
    token: string,
    date?: string
): Promise<ProductionItem[]> => {
    try {
        let url = `${API_BASE_URL}/chef/production-list-by-group`;
        if (date) {
            url += `?date=${encodeURIComponent(date)}`;
        }

        const data = await apiClient.get<
            | {
                  success: boolean;
                  message: string;
                  data: { productionList: ProductionItem[] };
              }
            | { productionList: ProductionItem[] }
        >(url, { headers: { Authorization: `Bearer ${token}` } });

        // Handle both response formats
        let result: ProductionItem[] = [];
        if ("data" in data && data.data?.productionList) {
            result = data.data.productionList;
        } else if ("productionList" in data) {
            result = data.productionList;
        }

        return result;
    } catch (error) {
        throw error;
    }
};
