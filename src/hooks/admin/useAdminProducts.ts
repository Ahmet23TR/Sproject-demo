"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    fetchAdminProducts,
    Product,
    PaginatedResponse,
} from "../../services/productService";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errorHandler";

export const useAdminProducts = () => {
    const { token } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const scrollPositionRef = useRef<number>(0);

    // URL'den sayfa numarasını, kategori ID'sini ve arama terimini al
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const selectedCategoryId = searchParams.get("category") || null;
    const searchTerm = searchParams.get("search") || null;

    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<
        PaginatedResponse<Product>["pagination"] | null
    >(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [searchInputValue, setSearchInputValue] = useState(searchTerm || ""); // Search input value

    // Scroll pozisyonunu kaydet
    const saveScrollPosition = useCallback(() => {
        if (typeof window !== 'undefined') {
            scrollPositionRef.current = window.scrollY;
        }
    }, []);

    // Scroll pozisyonunu geri yükle
    const restoreScrollPosition = useCallback(() => {
        if (typeof window !== 'undefined' && scrollPositionRef.current > 0) {
            setTimeout(() => {
                window.scrollTo(0, scrollPositionRef.current);
            }, 100);
        }
    }, []);

    // Veriyi yeniden çekmek için bir fonksiyon
    const refetchProducts = useCallback(
        async (
            page: number = currentPage,
            categoryId: string | null = selectedCategoryId,
            search: string | null = searchTerm,
            preserveScroll: boolean = false
        ) => {
            if (!token) return; // Token yoksa fetch etme
            
            if (preserveScroll) {
                saveScrollPosition();
            }
            
            setLoading(true);
            try {
                const response = await fetchAdminProducts(
                    token,
                    page,
                    12,
                    categoryId,
                    search
                );
                setProducts(response.data);
                setPagination(response.pagination);
                setError(""); // Başarılı olursa hatayı temizle
                
                if (preserveScroll) {
                    restoreScrollPosition();
                }
            } catch (error) {
                setError(getApiErrorMessage(error));
            } finally {
                setLoading(false);
            }
        },
        [token, currentPage, selectedCategoryId, searchTerm, saveScrollPosition, restoreScrollPosition]
    );

    // URL'deki search parametresi değiştiğinde input değerini güncelle
    useEffect(() => {
        setSearchInputValue(searchTerm || "");
    }, [searchTerm]);

    useEffect(() => {
        if (!token) return; // Token yoksa fetch etme
        refetchProducts(currentPage, selectedCategoryId, searchTerm);
    }, [token, currentPage, selectedCategoryId, searchTerm, refetchProducts]);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        // URL'i güncelle
        const params = new URLSearchParams(searchParams);
        params.set("page", value.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

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
    };

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
    };

    // Token tekrar gelirse hata state'ini temizle ve ürünleri tekrar çek
    useEffect(() => {
        if (token && error) {
            setError("");
            refetchProducts(currentPage, selectedCategoryId, searchTerm);
        }
    }, [token, error, currentPage, selectedCategoryId, searchTerm, refetchProducts]);

    // Modal state yönetimi
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isOptionsModalOpen, setOptionsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );

    const handleOpenCreateModal = () => setCreateModalOpen(true);

    const handleOpenEditModal = (product: Product) => {
        setSelectedProduct(product);
        setEditModalOpen(true);
    };

    const handleOpenOptionsModal = (product: Product) => {
        setSelectedProduct(product);
        setOptionsModalOpen(true);
    };

    const handleCloseModals = () => {
        setCreateModalOpen(false);
        setEditModalOpen(false);
        setOptionsModalOpen(false);
        setSelectedProduct(null);
    };

    // Tek bir ürünü güncelle (ör: aktiflik değiştiğinde tam listeyi çekmeden güncelle)
    const updateProductInList = (updatedProduct: Product) => {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
            )
        );
    };

    // Sadece belirli bir ürünü backend'den güncelle (loading state'ini tetiklemez)
    const refreshSingleProduct = useCallback(
        async (productId: string, preserveScroll: boolean = false) => {
            if (!token) return;
            
            if (preserveScroll) {
                saveScrollPosition();
            }
            
            try {
                const response = await fetchAdminProducts(
                    token,
                    currentPage,
                    12,
                    selectedCategoryId,
                    searchTerm
                );
                setProducts(response.data);
                setPagination(response.pagination);
                
                if (preserveScroll) {
                    restoreScrollPosition();
                }
            } catch (error) {
                // Hata durumunda sessizce devam et
                console.error("Product could not be updated:", error);
            }
        },
        [token, currentPage, selectedCategoryId, searchTerm, saveScrollPosition, restoreScrollPosition]
    );

    return {
        products,
        loading,
        error,
        pagination,
        currentPage,
        selectedCategoryId,
        searchTerm,
        searchInputValue,
        refetchProducts,
        updateProductInList,
        refreshSingleProduct,
        handlePageChange,
        handleCategoryChange, // Yeni eklenen kategori değişim handler'ı
        handleSearchChange, // Yeni eklenen arama değişim handler'ı
        setSearchInputValue, // Search input için
        modalState: {
            isCreateModalOpen,
            isEditModalOpen,
            isOptionsModalOpen,
            selectedProduct,
        },
        modalActions: {
            handleOpenCreateModal,
            handleOpenEditModal,
            handleOpenOptionsModal,
            handleCloseModals,
        },
    };
};
