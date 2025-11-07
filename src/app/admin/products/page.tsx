"use client";
import ProtectedRoute from "../../../components/ProtectedRoute";
import {
    Box,
    Typography,
    Button,
    Snackbar,
    Alert,
    TextField,
    Paper,
    Menu,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { Suspense } from "react";
import { useAdminProducts } from "../../../hooks/admin/useAdminProducts";
import { ProductFormModal } from "./components/ProductFormModal";
import { CategoriesModal } from "./components/CategoriesModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    fetchCategories,
    Category,
    updateProductActiveStatus,
    Product,
} from "../../../services/productService";
import PaginationComponent from "../../../components/PaginationComponent";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ProductStatisticsPanel } from "../../../components/admin/ProductStatisticsPanel";
import { ViewModeSelector } from "../../../components/admin/ViewModeSelector";
import { OptimizedProductCardView } from "../../../components/admin/OptimizedProductCardView";
import { ProductTableView } from "../../../components/admin/ProductTableView";
import { useProductStatistics } from "../../../hooks/admin/useProductStatistics";
import { useViewMode } from "../../../hooks/admin/useViewMode";
import { useAuth } from "../../../context/AuthContext";
import { useAdminCategories } from "@/hooks/admin/useAdminCategories";

export const dynamic = "force-dynamic";

function AdminProductsContent() {
    const router = useRouter();
    const { token } = useAuth();
    const {
        products,
        loading,
        error,
        pagination,
        currentPage,
        selectedCategoryId,
        searchTerm,
        searchInputValue,
        handlePageChange,
        handleCategoryChange,
        handleSearchChange,
        setSearchInputValue,
        modalState,
        modalActions,
        refetchProducts,
    } = useAdminProducts();

    // Kategori listesi için state
    const [categories, setCategories] = useState<Category[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Category dropdown için state
    const [categoryMenuAnchor, setCategoryMenuAnchor] =
        useState<null | HTMLElement>(null);
    const isCategoryMenuOpen = Boolean(categoryMenuAnchor);

    // İstatistikler için hook
    const {
        statistics,
        loading: statsLoading,
        error: statsError,
    } = useProductStatistics();

    // Görünüm modu için hook
    const { viewMode, setViewMode } = useViewMode("card");

    // Categories modal & actions
    const {
        categories: adminCategories,
        isModalOpen: isCategoriesModalOpen,
        openModal: openCategoriesModal,
        closeModal: closeCategoriesModal,
        creating: creatingCategory,
        updating: updatingCategory,
        deleting: deletingCategory,
        create: createCategory,
        update: updateCategory,
        remove: removeCategory,
        refresh: refreshCategories,
    } = useAdminCategories();

    useEffect(() => {
        fetchCategories().then(setCategories);
    }, []);

    // Toggle product active status - Optimized version
    const handleToggleProductStatus = async (product: Product) => {
        if (!token) return;

        const newStatus = !product.isActive;

        try {
            // 1. Önce UI'ı güncelle (Optimistic update)
            // Bu kısım useAdminProducts hook'unda products state'ini güncelleyecek
            // şimdilik API çağrısını yapalım

            // 2. API çağrısı
            await updateProductActiveStatus(product.id, newStatus, token);

            // 3. Sadece istatistikleri yenile, ürün listesini değil
            // refetchProducts yerine daha hafif bir güncelleme yapabiliriz
            refetchProducts(currentPage, selectedCategoryId, searchTerm, false);

            // 4. Başarı mesajı
            setSuccessMessage(
                `Product ${newStatus ? "activated" : "deactivated"
                } successfully!`
            );
        } catch (error) {
            console.error("Error toggling product status:", error);

            // Hata durumunda listeyi yenile (API'dan gerçek durumu al)
            refetchProducts(currentPage, selectedCategoryId, searchTerm, false);
            setSuccessMessage(
                "Error updating product status. Please try again."
            );
        }
    };

    // Backend'den gelen ürünler zaten filtrelenmiş durumda, ekstra frontend filtrelemesi gerekmez

    return (
        <Box
            sx={{
                p: { xs: 2, md: 4 },
                backgroundColor: "#FAFBFC",
                minHeight: "100vh",
            }}>
                {/* Statistics Panel */}
                <ProductStatisticsPanel
                    statistics={statistics}
                    loading={statsLoading}
                    error={statsError}
                />

                {/* Header Section */}
                <Box sx={{ mb: 3 }}>
                    {/* Controls Bar */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            mb: 3,
                            gap: 2,
                            minWidth: 0, // Allow flexbox to shrink
                        }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                flexShrink: 0,
                                minWidth: 0,
                            }}>
                            {/* Search */}
                            <Box display="flex" gap={1} alignItems="center">
                                <TextField
                                    label="Search products"
                                    variant="outlined"
                                    value={searchInputValue}
                                    onChange={(e) =>
                                        setSearchInputValue(e.target.value)
                                    }
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            handleSearchChange(
                                                searchInputValue || null
                                            );
                                        }
                                    }}
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: "white",
                                        },
                                        width: {
                                            xs: "120px",
                                            sm: "160px",
                                            md: "180px",
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() =>
                                        handleSearchChange(
                                            searchInputValue || null
                                        )
                                    }
                                    size="small"
                                    sx={{
                                        minWidth: "40px",
                                        width: "40px",
                                        height: "40px",
                                        padding: 0,
                                    }}>
                                    <SearchIcon />
                                </Button>
                            </Box>
                            {/* Category Filter Dropdown */}
                            <Button
                                variant="outlined"
                                onClick={(e) =>
                                    setCategoryMenuAnchor(e.currentTarget)
                                }
                                endIcon={<ExpandMoreIcon />}
                                startIcon={<FilterListIcon />}
                                size="small"
                                sx={{
                                    backgroundColor: "white",
                                    color: "#374151",
                                    borderColor: "#D1D5DB",
                                    "&:hover": {
                                        backgroundColor: "#F9FAFB",
                                        borderColor: "#9CA3AF",
                                    },
                                    height: "40px",
                                    width: {
                                        xs: "160px",
                                        sm: "180px",
                                        md: "210px",
                                    },
                                    minWidth: {
                                        xs: "160px",
                                        sm: "180px",
                                        md: "210px",
                                    },
                                    maxWidth: {
                                        xs: "160px",
                                        sm: "180px",
                                        md: "210px",
                                    },
                                    justifyContent: "space-between",
                                    "& .MuiButton-startIcon": {
                                        marginRight: "8px",
                                        flexShrink: 0,
                                    },
                                    "& .MuiButton-endIcon": {
                                        marginLeft: "8px",
                                        flexShrink: 0,
                                    },
                                }}>
                                <Box
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        flex: 1,
                                        textAlign: "left",
                                        minWidth: 0,
                                    }}>
                                    {selectedCategoryId
                                        ? categories.find(
                                            (c) => c.id === selectedCategoryId
                                        )?.name || "Category"
                                        : "All Categories"}
                                </Box>
                            </Button>
                            <Menu
                                anchorEl={categoryMenuAnchor}
                                open={isCategoryMenuOpen}
                                onClose={() => setCategoryMenuAnchor(null)}
                                MenuListProps={{
                                    "aria-labelledby": "category-button",
                                }}
                                sx={{
                                    "& .MuiPaper-root": {
                                        borderRadius: "8px",
                                        border: "1px solid #E5E7EB",
                                        boxShadow:
                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                        minWidth: "200px",
                                    },
                                }}>
                                <MenuItem
                                    onClick={() => {
                                        handleCategoryChange(null);
                                        setCategoryMenuAnchor(null);
                                    }}
                                    selected={selectedCategoryId === null}
                                    sx={{
                                        fontWeight:
                                            selectedCategoryId === null
                                                ? 500
                                                : 400,
                                    }}>
                                    All Categories
                                </MenuItem>
                                {categories.map((category) => (
                                    <MenuItem
                                        key={category.id}
                                        onClick={() => {
                                            handleCategoryChange(category.id);
                                            setCategoryMenuAnchor(null);
                                        }}
                                        selected={
                                            selectedCategoryId === category.id
                                        }
                                        sx={{
                                            fontWeight:
                                                selectedCategoryId ===
                                                    category.id
                                                    ? 600
                                                    : 400,
                                        }}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Menu>
                            {/* View Mode Selector */}
                            <ViewModeSelector
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                            />{" "}
                            {/* Manage Categories Button */}
                            <Button
                                variant="outlined"
                                onClick={openCategoriesModal}
                                size="small"
                                sx={{
                                    height: "40px",
                                    backgroundColor: "white",
                                    color: "#374151",
                                    borderColor: "#D1D5DB",
                                    "&:hover": {
                                        backgroundColor: "#F9FAFB",
                                        borderColor: "#9CA3AF",
                                    },
                                    px: { xs: 2, sm: 3 },
                                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Manage Categories
                            </Button>
                            {/* Add New Product Button */}
                            <Button
                                variant="contained"
                                onClick={modalActions.handleOpenCreateModal}
                                size="small"
                                sx={{
                                    height: "40px",
                                    backgroundColor: "#C9A227",
                                    color: "#000000",
                                    fontWeight: 600,
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(201,162,39,0.2)",
                                    "&:hover": {
                                        backgroundColor: "#E0C097",
                                        boxShadow:
                                            "0 4px 8px rgba(201,162,39,0.3)",
                                        transform: "translateY(-1px)",
                                    },
                                    transition: "all 0.2s ease-in-out",
                                    px: { xs: 2, sm: 3 },
                                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                    whiteSpace: "nowrap",
                                }}>
                                Add New Product
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Main Content */}
                {/* Products Content */}
                <Paper
                    sx={{
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        backgroundColor: "white",
                        overflow: "hidden",
                    }}>
                    <Box sx={{ p: 3 }}>
                        <Suspense fallback={<div>Loading...</div>}>
                            {viewMode === "card" ? (
                                <OptimizedProductCardView
                                    products={products}
                                    onViewProduct={(product) => {
                                        // Ürün detay sayfasına yönlendirme
                                        router.push(
                                            `/admin/products/${product.id}`
                                        );
                                    }}
                                />
                            ) : (
                                <ProductTableView
                                    products={products}
                                    onToggleStatus={handleToggleProductStatus}
                                    onView={(product) => {
                                        // Ürün detay sayfasına yönlendirme
                                        router.push(
                                            `/admin/products/${product.id}`
                                        );
                                    }}
                                />
                            )}
                        </Suspense>

                        {/* Loading/Error States */}
                        {loading && (
                            <Box display="flex" justifyContent="center" py={4}>
                                <Typography>Loading products...</Typography>
                            </Box>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                </Paper>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 3,
                        }}>
                        <PaginationComponent
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    </Box>
                )}

                {/* Modals */}
                <CategoriesModal
                    open={isCategoriesModalOpen}
                    onClose={closeCategoriesModal}
                    categories={adminCategories}
                    creating={creatingCategory}
                    updating={updatingCategory}
                    deleting={deletingCategory}
                    onCreate={async (p) => {
                        await createCategory(p);
                        await refreshCategories();
                        // keep category dropdown in sync
                        fetchCategories().then(setCategories);
                    }}
                    onUpdate={async (id, p) => {
                        await updateCategory(id, p);
                        await refreshCategories();
                        fetchCategories().then(setCategories);
                    }}
                    onDelete={async (id) => {
                        await removeCategory(id);
                        await refreshCategories();
                        fetchCategories().then(setCategories);
                    }}
                />
                <ProductFormModal
                    open={modalState.isCreateModalOpen}
                    onClose={modalActions.handleCloseModals}
                    onSuccess={(updatedProduct) => {
                        if (updatedProduct) {
                            // Refresh list when new product is added (preserve scroll position)
                            refetchProducts(
                                currentPage,
                                selectedCategoryId,
                                searchTerm,
                                true
                            );
                            setSuccessMessage("Product successfully added!");
                        }
                    }}
                    productToEdit={null}
                />

                {/* Success Message */}
                <Snackbar
                    open={!!successMessage}
                    autoHideDuration={6000}
                    onClose={() => setSuccessMessage(null)}>
                    <Alert
                        onClose={() => setSuccessMessage(null)}
                        severity="success"
                        sx={{ width: "100%" }}>
                        {successMessage}
                    </Alert>
                </Snackbar>
        </Box>
    );
}

export default function AdminProductsPage() {
    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Suspense
                fallback={
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "50vh",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                }
            >
                <AdminProductsContent />
            </Suspense>
        </ProtectedRoute>
    );
}
