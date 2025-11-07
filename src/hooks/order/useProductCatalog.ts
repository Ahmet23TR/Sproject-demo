"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { fetchActiveProducts, Product, fetchProductsByIds, fetchClientProducts, fetchClientProductsByIds } from "../../services/catalogService";
import { fetchCategories, Category } from "../../services/productService";
import { PaginationInfo } from "../../types/data";
import { getFavorites, addFavorite, removeFavorite } from "../../services/favoriteService";
import { getApiErrorMessage } from "../../utils/errorHandler";
import { useAuth } from "../../context/AuthContext";

export const useProductCatalog = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { token } = useAuth();
    
    // URL'den sayfa numarasını, kategori ID'sini ve arama terimini al
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const selectedCategoryId = searchParams.get("category") || null;
    const searchTerm = searchParams.get("search") || null;
    
    const [products, setProducts] = useState<Product[]>([]);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]); // Tüm favori ürünler
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favoriteProductIds, setFavoriteProductIds] = useState<Set<string>>(new Set());
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [searchInputValue, setSearchInputValue] = useState(searchTerm || ""); // Search input value

    // Favori ürünleri yükleme fonksiyonu
    const loadFavoriteProducts = useCallback(async (favoriteIds: Set<string>) => {
        if (favoriteIds.size > 0) {
            try {
                const favoriteProductsData = token 
                    ? await fetchClientProductsByIds(Array.from(favoriteIds), token)
                    : await fetchProductsByIds(Array.from(favoriteIds));
                setFavoriteProducts(favoriteProductsData);
            } catch (error) {
                console.error('Favorites could not be loaded:', error);
            }
        }
    }, [token]);

    // Kategorileri ve favorileri yükle
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Kategorileri yükle
                const categoriesData = await fetchCategories();
                setCategories(categoriesData);

                // Favorileri yükle
                try {
                    const favoritesData = await getFavorites();
                    const favoriteIds = new Set(favoritesData.map(fav => fav.product.id));
                    setFavoriteProductIds(favoriteIds);
                    
                    // Favori ürünlerin tam bilgilerini çek
                    await loadFavoriteProducts(favoriteIds);
                } catch (favoriteError) {
                    // Favori yüklenemezse (örneğin kullanıcı giriş yapmamışsa) hata vermeden devam et
                    console.warn("Favorites could not be loaded:", favoriteError);
                }
            } catch (error) {
                setError(getApiErrorMessage(error));
            }
        };
        loadInitialData();
    }, [token, loadFavoriteProducts]);

    // URL'deki search parametresi değiştiğinde input değerini güncelle
    useEffect(() => {
        setSearchInputValue(searchTerm || "");
    }, [searchTerm]);

    // Ürünler kategori, sayfa ve arama değişikliğinde yeniden çekilsin
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Backend'den zaten filtrelenmiş ürünleri alıyoruz
                const productsResponse = token 
                    ? await fetchClientProducts(
                        currentPage,
                        16,
                        selectedCategoryId,
                        searchTerm,
                        token
                    )
                    : await fetchActiveProducts(
                        currentPage,
                        16,
                        selectedCategoryId,
                        searchTerm
                    );
                setProducts(productsResponse.data);
                setPagination(productsResponse.pagination);
            } catch (error) {
                setError(getApiErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [currentPage, selectedCategoryId, searchTerm, token]); // Arama değiştiğinde de yeniden çalışır

    const handlePageChange = (
        _event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        // URL'i güncelle
        const params = new URLSearchParams(searchParams);
        params.set("page", value.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    // Kategori değiştiğinde sayfayı da 1'e sıfırlamamız lazım
    const handleCategoryChange = (categoryId: string | null) => {
        // URL'i güncelle ve sayfayı 1'e sıfırla
        const params = new URLSearchParams(searchParams);
        if (categoryId) {
            params.set("category", categoryId);
        } else {
            params.delete("category");
        }
        params.set("page", "1"); // Kategori değiştiğinde sayfa 1'e dön
        router.push(`${pathname}?${params.toString()}`);
        
        // Favori filtresi aktifse kapat
        setShowFavoritesOnly(false);
    };

    // Arama değiştiğinde sayfayı 1'e sıfırlamamız lazım
    const handleSearchChange = (search: string | null) => {
        // URL'i güncelle ve sayfayı 1'e sıfırla
        const params = new URLSearchParams(searchParams);
        if (search && search.trim()) {
            params.set("search", search.trim());
        } else {
            params.delete("search");
        }
        params.set("page", "1"); // Arama değiştiğinde sayfa 1'e dön
        router.push(`${pathname}?${params.toString()}`);
        
        // Favori filtresi aktifse kapat
        setShowFavoritesOnly(false);
    };

    // Favori toggle fonksiyonu
    const toggleFavorite = async (productId: string) => {
        try {
            const isFavorite = favoriteProductIds.has(productId);
            
            if (isFavorite) {
                // Favorilerden kaldır
                await removeFavorite(productId);
                setFavoriteProductIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
                // Favori ürünler listesinden de kaldır
                setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
            } else {
                // Favorilere ekle
                const addedFavorite = await addFavorite(productId);
                setFavoriteProductIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(productId);
                    return newSet;
                });
                
                // Favori ürünler listesine ekle
                // Önce mevcut ürünler arasında ara
                let productToAdd = products.find(p => p.id === productId);
                
                // Eğer mevcut ürünler arasında yoksa, favori servisinden gelen veriyi kullan
                if (!productToAdd && addedFavorite.product) {
                    productToAdd = addedFavorite.product;
                }
                
                if (productToAdd) {
                    setFavoriteProducts(prev => {
                        // Eğer zaten varsa ekleme
                        if (prev.some(p => p.id === productId)) {
                            return prev;
                        }
                        return [...prev, productToAdd!];
                    });
                }
            }
        } catch (error) {
            console.error('Favorite operation failed:', error);
            setError('Favorite operation failed.');
        }
    };

    // Favoriler filtresi toggle fonksiyonu
    const toggleFavoritesFilter = async () => {
        const newShowFavoritesOnly = !showFavoritesOnly;
        setShowFavoritesOnly(newShowFavoritesOnly);
        
        // Eğer favori filtresi aktif hale geliyorsa, favori ürünleri yeniden yükle
        if (newShowFavoritesOnly && favoriteProductIds.size > 0) {
            await loadFavoriteProducts(favoriteProductIds);
        }
    };

    // Görüntülenecek ürünleri belirle
    const displayedProducts = showFavoritesOnly 
        ? favoriteProducts // Favori filtresi aktifken tüm favori ürünleri göster
        : products; // Normal modda mevcut kategori ürünlerini göster

    return {
        products: displayedProducts, // Görüntülenecek ürünler
        allProducts: products, // Tüm ürünler (pagination için)
        categories,
        loading,
        error,
        pagination,
        currentPage,
        selectedCategoryId,
        searchTerm,
        searchInputValue,
        favoriteProductIds,
        showFavoritesOnly,
        setSelectedCategoryId: handleCategoryChange, // Kategori değiştirmek için bu fonksiyonu kullan
        handleSearchChange, // Arama değiştirmek için bu fonksiyonu kullan
        setSearchInputValue, // Search input için
        handlePageChange,
        toggleFavorite,
        toggleFavoritesFilter,
    };
};
