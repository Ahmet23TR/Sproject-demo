import { apiClient } from "./apiClient";
import { PaginationInfo } from "@/types/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Sayfalandırma için tip tanımı ekliyoruz
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}

// Ürün istatistikleri için tip tanımı
export interface ProductStatistics {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    topSellingProduct?: {
        id: string;
        name: string;
        salesCount: number;
    };
    topSellingProductByRevenue?: {
        id: string;
        name: string;
        totalRevenue: number;
    };
}

export interface Category {
    id: string;
    name: string;
}

export interface OptionItem {
    id: string;
    name: string;
    priceAdjustment?: number; // priceAdjustment (yeni sistem)
    price?: number; // price (eski sistem - API uyumluluğu için, artık number)
    multiplier?: string | number; // Backend'den gelen multiplier (string olabilir)
}

export interface OptionGroup {
    id: string;
    name: string;
    isRequired: boolean;
    allowMultiple: boolean;
    items: OptionItem[];
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    unit: "PIECE" | "KG" | "TRAY";
    categoryId: string | null;
    category: Category | null;
    optionGroups: OptionGroup[];
    productGroup: "SWEETS" | "BAKERY";
    basePrice: number; // Base price eklendi
}

export interface ProductPayload {
    name: string;
    description?: string;
    categoryId?: string;
    unit?: "PIECE" | "KG" | "TRAY";
    imageUrl?: string | null;
    isActive?: boolean;
    productGroup: "SWEETS" | "BAKERY";
}

export interface OptionGroupPayload {
    name: string;
    isRequired?: boolean;
    allowMultiple?: boolean;
}

export interface OptionItemPayload {
    name: string;
    price?: number; // Backend API'nin beklediği alan
    multiplier?: number; // Multiplier desteği
}

/**
 * Tüm aktif ürünleri ve detaylarını çeker.
 */
export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const data = await apiClient.get<Product[] | { data: Product[] }>(
            `${API_BASE_URL}/products`
        );
        // apiClient already unwraps envelopes; keep fallback for older endpoints
        return Array.isArray(data)
            ? data
            : (data as { data?: Product[] })?.data ?? [];
    } catch (error) {
        throw error;
    }
};

/**
 * Tüm kategorileri çeker.
 */
export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const data = await apiClient.get<
            { categories: Category[] } | Category[]
        >(`${API_BASE_URL}/products/categories`);
        return Array.isArray(data)
            ? data
            : (data as { categories: Category[] }).categories || [];
    } catch (error) {
        throw error;
    }
};

/**
 * Admin için, bir ürünün tüm detaylarını (opsiyon grupları dahil) çeker.
 */
export const fetchAdminProductDetail = async (
    productId: string,
    token: string
): Promise<Product> => {
    try {
        const data = await apiClient.get<Product | { product: Product }>(
            `${API_BASE_URL}/admin/products/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return (data as { product?: Product })?.product ?? (data as Product);
    } catch (error) {
        throw error;
    }
};

/**
 * Admin için, tüm ürünleri (aktif+pasif) ve silinmemiş olanları çeker - Sayfalandırma, kategori filtreleme ve arama desteği ile.
 * @param token Admin JWT token
 * @param page Sayfa numarası
 * @param limit Sayfa başına kayıt sayısı
 * @param categoryId Opsiyonel kategori ID'si - null ise tüm kategoriler
 * @param search Opsiyonel arama terimi - ürün adında arama yapar
 */
export const fetchAdminProducts = async (
    token: string,
    page: number = 1,
    limit: number = 12,
    categoryId: string | null = null,
    search: string | null = null
): Promise<PaginatedResponse<Product>> => {
    try {
        const params: {
            page: number;
            limit: number;
            categoryId?: string;
            search?: string;
        } = {
            page,
            limit,
        };
        if (categoryId) {
            params.categoryId = categoryId;
        }
        if (search && search.trim()) {
            params.search = search.trim();
        }

        // apiClient unwraps { success, data, meta.pagination } into { data, pagination }
        const data = await apiClient.get<
            | PaginatedResponse<Product>
            | {
                  data: Product[];
                  pagination: PaginatedResponse<Product>["pagination"];
              }
        >(`${API_BASE_URL}/admin/products`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });
        if (
            Array.isArray(
                (data as { data?: Product[]; pagination?: PaginationInfo })
                    ?.data
            ) &&
            (data as { data?: Product[]; pagination?: PaginationInfo })
                ?.pagination
        ) {
            return data as PaginatedResponse<Product>;
        }
        return data as PaginatedResponse<Product>;
    } catch (error) {
        throw error;
    }
};

/**
 * Yeni bir ürün oluşturur.
 */
export const createProduct = async (
    payload: ProductPayload,
    token: string
): Promise<Product> => {
    try {
        const data = await apiClient.post<Product>(
            `${API_BASE_URL}/admin/products`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data as Product;
    } catch (error) {
        throw error;
    }
};

/**
 * Mevcut bir ürünü günceller.
 */
export const updateProduct = async (
    productId: string,
    payload: ProductPayload,
    token: string
): Promise<Product> => {
    try {
        const data = await apiClient.put<Product>(
            `${API_BASE_URL}/admin/products/${productId}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data as Product;
    } catch (error) {
        throw error;
    }
};

/**
 * Bir ürünün aktiflik durumunu günceller.
 */
export const updateProductActiveStatus = async (
    productId: string,
    isActive: boolean,
    token: string
): Promise<Product> => {
    try {
        const data = await apiClient.put<Product>(
            `${API_BASE_URL}/admin/products/${productId}`,
            { isActive },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data as Product;
    } catch (error) {
        throw error;
    }
};

/**
 * Bir ürüne yeni bir opsiyon grubu ekler.
 */
export const createOptionGroup = async (
    productId: string,
    data: OptionGroupPayload,
    token: string
): Promise<OptionGroup> => {
    try {
        const created = await apiClient.post<OptionGroup>(
            `${API_BASE_URL}/admin/products/${productId}/option-groups`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return created as OptionGroup;
    } catch (error) {
        throw error;
    }
};

/**
 * Bir opsiyon grubunu siler.
 */
export const deleteOptionGroup = async (
    groupId: string,
    token: string
): Promise<void> => {
    try {
        await apiClient.delete(
            `${API_BASE_URL}/admin/products/option-groups/${groupId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Bir opsiyon grubuna yeni bir opsiyon kalemi ekler.
 */
export const createOptionItem = async (
    groupId: string,
    data: OptionItemPayload,
    token: string
): Promise<OptionItem> => {
    try {
        const created = await apiClient.post<OptionItem>(
            `${API_BASE_URL}/admin/products/option-groups/${groupId}/items`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return created as OptionItem;
    } catch (error) {
        throw error;
    }
};

/**
 * Bir opsiyon kalemini siler.
 */
export const deleteOptionItem = async (
    itemId: string,
    token: string
): Promise<void> => {
    try {
        await apiClient.delete(
            `${API_BASE_URL}/admin/products/option-items/${itemId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Bir ürünü (soft delete) siler.
 */
export const deleteProduct = async (
    productId: string,
    token: string
): Promise<void> => {
    try {
        await apiClient.delete(`${API_BASE_URL}/admin/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Uploads a product image to our backend.
 * @param productId The ID of the product.
 * @param file The image file to upload.
 * @param token The user's auth token.
 * @returns The updated product with new image URL
 */
export const uploadProductImage = async (
    productId: string,
    file: File,
    token: string
): Promise<Product> => {
    const formData = new FormData();
    formData.append("productImage", file); // 'productImage' must match the backend middleware

    const response = await apiClient.post<Product>(
        `${API_BASE_URL}/admin/products/${productId}/image`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    // The apiClient already handles the envelope unwrapping
    // Backend returns: { success: true, message: "...", data: Product }
    // apiClient unwraps it to just return the Product
    return response as Product;
};

/**
 * Deletes a product image from our backend.
 * @param productId The ID of the product.
 * @param token The user's auth token.
 * @returns The updated product with imageUrl set to null
 */
export const deleteProductImage = async (
    productId: string,
    token: string
): Promise<Product> => {
    const response = await apiClient.delete<Product>(
        `${API_BASE_URL}/admin/products/${productId}/image`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    // The apiClient already handles the envelope unwrapping
    // Backend returns: { success: true, message: "...", data: Product }
    // apiClient unwraps it to just return the Product with imageUrl: null
    return response as Product;
};

/**
 * Ürün istatistiklerini getirir.
 */
export const fetchProductStatistics = async (
    token: string
): Promise<ProductStatistics> => {
    try {
        const response = await apiClient.get(
            `${API_BASE_URL}/admin/products/statistics`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        // API direkt ProductStatistics formatında döndürüyor
        const responseData = response as ProductStatistics;

        // Response validation - API direkt data döndürüyor
        if (
            responseData &&
            typeof responseData.totalProducts === "number" &&
            typeof responseData.activeProducts === "number" &&
            typeof responseData.inactiveProducts === "number"
        ) {
            return {
                totalProducts: responseData.totalProducts,
                activeProducts: responseData.activeProducts,
                inactiveProducts: responseData.inactiveProducts,
                topSellingProduct: responseData.topSellingProduct || null,
                topSellingProductByRevenue:
                    responseData.topSellingProductByRevenue || null,
            } as ProductStatistics;
        }

        // Eğer wrapper format varsa (alternatif)
        const wrappedResponse = response as {
            success?: boolean;
            data?: ProductStatistics;
        };

        if (wrappedResponse.success && wrappedResponse.data) {
            const data = wrappedResponse.data;
            return {
                totalProducts: data.totalProducts,
                activeProducts: data.activeProducts,
                inactiveProducts: data.inactiveProducts,
                topSellingProduct: data.topSellingProduct || null,
                topSellingProductByRevenue:
                    data.topSellingProductByRevenue || null,
            } as ProductStatistics;
        }

        // Hiçbiri değilse hata fırlat
        throw new Error("Invalid response format from API");
    } catch (error: unknown) {
        console.error("Error fetching product statistics:", error);

        // API error response'u varsa daha detaylı mesaj
        const apiError = error as {
            response?: {
                data?: {
                    message?: string;
                };
            };
            message?: string;
        };

        if (
            apiError.response &&
            apiError.response.data &&
            apiError.response.data.message
        ) {
            throw new Error(apiError.response.data.message);
        }

        // Network error veya başka bir hata
        if (apiError.message) {
            throw new Error(apiError.message);
        }

        throw new Error(
            "Unable to fetch product statistics. Please try again later."
        );
    }
};
