import { apiClient } from "./apiClient";

// API adresi, .env dosyasından okunacak.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Sayfalandırma için tip tanımı
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}

// ==============================================================================
//  TİP TANIMLARI (TYPE DEFINITIONS)
//  Bu servisin ihtiyaç duyduğu tipleri, başka dosyalara bağımlı olmadan burada tanımlıyoruz.
// ==============================================================================

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

// Bu servis sadece ürün listesi çektiği için, Product tipini productService ile uyumlu şekilde tanımlıyoruz.
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

// ==============================================================================
//  API FONKSİYONLARI (API FUNCTIONS)
// ==============================================================================

/**
 * Müşterinin görmesi için tüm aktif ürünleri API'den çeker - Sayfalandırma, kategori filtreleme ve arama desteği ile.
 * @param page Sayfa numarası
 * @param limit Sayfa başına kayıt sayısı
 * @param categoryId Opsiyonel kategori ID'si - null ise tüm kategoriler
 * @param search Opsiyonel arama terimi - ürün adında arama yapar
 * @returns {Promise<PaginatedResponse<Product>>} Sayfalandırılmış ürün verisi
 */
export const fetchActiveProducts = async (
    page: number = 1,
    limit: number = 16,
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

        const data = await apiClient.get<PaginatedResponse<Product>>(
            `${API_BASE_URL}/products`,
            { params }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Tüm ürün kategorilerini API'den çeker.
 * @returns {Promise<Category[]>} Kategori dizisi
 */
export const fetchAllCategories = async (): Promise<Category[]> => {
    try {
        const data = await apiClient.get<
            Category[] | { categories: Category[] }
        >(`${API_BASE_URL}/products/categories`);
        return Array.isArray(data)
            ? data
            : (data as { categories: Category[] }).categories || [];
    } catch (error) {
        throw error;
    }
};

/**
 * Belirli ürün ID'leri için ürün bilgilerini API'den çeker.
 * @param productIds Ürün ID'leri dizisi
 * @returns {Promise<Product[]>} Ürün dizisi
 */
export const fetchProductsByIds = async (
    productIds: string[]
): Promise<Product[]> => {
    try {
        if (productIds.length === 0) {
            return [];
        }

        // Backend'de bu endpoint varsa kullan, yoksa fallback stratejisi
        try {
            // Önce backend'de /products/by-ids endpoint'ini dene
            const data = await apiClient.post<Product[]>(
                `${API_BASE_URL}/products/by-ids`,
                { productIds }
            );
            return data;
        } catch {
            // Tüm ürünleri çek (sayfa boyutunu büyük tut)
            const allProductsResponse = await fetchActiveProducts(
                1,
                1000,
                null,
                null
            );
            const allProducts = allProductsResponse.data;
            // Sadece istenen ID'lere sahip ürünleri filtrele
            const filteredProducts = allProducts.filter((product) =>
                productIds.includes(product.id)
            );
            return filteredProducts;
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Client için ürünleri client-specific pricing ile çeker
 * @param page Sayfa numarası
 * @param limit Sayfa başına kayıt sayısı
 * @param categoryId Opsiyonel kategori ID'si - null ise tüm kategoriler
 * @param search Opsiyonel arama terimi - ürün adında arama yapar
 * @param token Client token - client pricing için gerekli
 * @returns {Promise<PaginatedResponse<Product>>} Sayfalandırılmış ürün verisi
 */
export const fetchClientProducts = async (
    page: number = 1,
    limit: number = 16,
    categoryId: string | null = null,
    search: string | null = null,
    token: string
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

        const data = await apiClient.get<PaginatedResponse<Product>>(
            `${API_BASE_URL}/client/products`,
            {
                params,
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return data;
    } catch {
        // Client endpoint mevcut değilse fallback olarak normal endpoint'i token ile kullan
        console.warn(
            "Client products endpoint not available, falling back to products endpoint"
        );

        const fallbackData = await apiClient.get<PaginatedResponse<Product>>(
            `${API_BASE_URL}/products`,
            {
                params: {
                    page,
                    limit,
                    ...(categoryId && { categoryId }),
                    ...(search && search.trim() && { search: search.trim() }),
                },
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return fallbackData;
    }
};

/**
 * Client için belirli ürün ID'leri için client-specific pricing ile ürün bilgilerini çeker
 * @param productIds Ürün ID'leri dizisi
 * @param token Client token - client pricing için gerekli
 * @returns {Promise<Product[]>} Ürün dizisi
 */
export const fetchClientProductsByIds = async (
    productIds: string[],
    token: string
): Promise<Product[]> => {
    try {
        if (productIds.length === 0) {
            return [];
        }

        // Client-specific endpoint'i dene
        try {
            const data = await apiClient.post<Product[]>(
                `${API_BASE_URL}/client/products/by-ids`,
                { productIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data;
        } catch {
            // Client endpoint mevcut değilse fallback olarak normal endpoint'i token ile kullan
            console.warn(
                "Client products by-ids endpoint not available, falling back to products by-ids endpoint"
            );
            const fallbackData = await apiClient.post<Product[]>(
                `${API_BASE_URL}/products/by-ids`,
                { productIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return fallbackData;
        }
    } catch (error) {
        throw error;
    }
};
