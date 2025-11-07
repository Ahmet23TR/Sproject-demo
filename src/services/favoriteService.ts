import { apiClient } from "./apiClient";
import { Product } from "./catalogService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ==============================================================================
//  TİP TANIMLARI (TYPE DEFINITIONS)
// ==============================================================================

export interface FavoriteProduct {
    id: string;
    product: Product;
    addedAt: string;
}

export interface AddFavoritePayload {
    productId: string;
}

export interface FavoriteResponse {
    success: boolean;
    data?: FavoriteProduct;
    message: string;
}

export interface FavoritesListResponse {
    success: boolean;
    data: FavoriteProduct[];
    message: string;
}

export interface FavoriteCheckResponse {
    success: boolean;
    isFavorite: boolean;
}

export interface FavoriteCountResponse {
    success: boolean;
    count: number;
}

// ==============================================================================
//  YARDIMCI FONKSİYONLAR (HELPER FUNCTIONS)
// ==============================================================================

/**
 * localStorage'dan JWT token'ı alır
 */
const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

/**
 * API istekleri için Authorization header'ı oluşturur
 */
const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==============================================================================
//  API FONKSİYONLARI (API FUNCTIONS)
// ==============================================================================

/**
 * Kullanıcının tüm favori ürünlerini getirir
 * @returns {Promise<FavoriteProduct[]>} Favori ürün listesi
 */
export const getFavorites = async (): Promise<FavoriteProduct[]> => {
    try {
        const data = await apiClient.get<
            FavoritesListResponse | FavoriteProduct[]
        >(`${API_BASE_URL}/favorites`, { headers: getAuthHeaders() });
        return Array.isArray(data)
            ? data
            : (data as FavoritesListResponse).data;
    } catch (error) {
        throw error;
    }
};

/**
 * Bir ürünü favorilere ekler
 * @param productId - Favorilere eklenecek ürünün ID'si
 * @returns {Promise<FavoriteProduct>} Eklenen favori ürün
 */
export const addFavorite = async (
    productId: string
): Promise<FavoriteProduct> => {
    try {
        const payload: AddFavoritePayload = { productId };
        const data = await apiClient.post<FavoriteProduct | FavoriteResponse>(
            `${API_BASE_URL}/favorites`,
            payload,
            { headers: getAuthHeaders() }
        );
        const favorite =
            (data as FavoriteResponse)?.data ?? (data as FavoriteProduct);
        if (!favorite) throw new Error("Favorite addition failed");
        return favorite as FavoriteProduct;
    } catch (error) {
        throw error;
    }
};

/**
 * Bir ürünü favorilerden kaldırır
 * @param productId - Favorilerden kaldırılacak ürünün ID'si
 */
export const removeFavorite = async (productId: string): Promise<void> => {
    try {
        await apiClient.delete(`${API_BASE_URL}/favorites/${productId}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Bir ürünün favori durumunu kontrol eder
 * @param productId - Kontrol edilecek ürünün ID'si
 * @returns {Promise<boolean>} Ürünün favori olup olmadığı
 */
export const checkFavoriteStatus = async (
    productId: string
): Promise<boolean> => {
    try {
        const data = await apiClient.get<
            FavoriteCheckResponse | { isFavorite: boolean }
        >(`${API_BASE_URL}/favorites/check/${productId}`, {
            headers: getAuthHeaders(),
        });
        return (
            (data as { isFavorite: boolean }).isFavorite ??
            (data as FavoriteCheckResponse).isFavorite
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Kullanıcının toplam favori sayısını getirir
 * @returns {Promise<number>} Toplam favori sayısı
 */
export const getFavoriteCount = async (): Promise<number> => {
    try {
        const data = await apiClient.get<
            FavoriteCountResponse | { count: number }
        >(`${API_BASE_URL}/favorites/count`, { headers: getAuthHeaders() });
        return (
            (data as { count: number }).count ??
            (data as FavoriteCountResponse).count
        );
    } catch (error) {
        throw error;
    }
};
