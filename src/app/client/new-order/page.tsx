// src/app/client/new-order/page.tsx
"use client";
import ProtectedRoute from "../../../components/ProtectedRoute";
import {
    Box,
    Grid,
    CircularProgress,
    Alert,
    TextField,
    Button,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { Suspense, useState, useCallback, useMemo, useEffect } from "react";
import { useProductCatalog } from "../../../hooks/order/useProductCatalog";
import { Product } from "../../../services/catalogService";
import { CategoryFilters } from "../../../components/CategoryFilters";
import { ProductCatalogView } from "./components/ProductList";
import { ProductListView } from "./components/ProductListView";
import { ViewToggle } from "./components/ViewToggle";
import { ShoppingCart } from "./components/ShoppingCart";
import ProductConfiguratorModal from "../../../components/ProductConfiguratorModal";
import PaginationComponent from "../../../components/PaginationComponent";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { StickyCartFooter } from "./components/StickyCartFooter";
import { CartDrawer } from "./components/CartDrawer";
import { useTheme } from "@mui/material/styles";

export const dynamic = "force-dynamic";

function NewOrderContent() {
    const { user } = useAuth();
    const {
        products,
        categories,
        loading,
        error,
        pagination,
        selectedCategoryId,
        searchInputValue,
        favoriteProductIds,
        showFavoritesOnly,
        setSelectedCategoryId,
        handleSearchChange,
        setSearchInputValue,
        handlePageChange,
        toggleFavorite,
        toggleFavoritesFilter,
    } = useProductCatalog();
    const { cart } = useCart();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

    // Modal state management stays on main page
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );
    const [isConfiguratorOpen, setConfiguratorOpen] = useState(false);

    // View state management
    const [currentView, setCurrentView] = useState<"catalog" | "list">(
        "catalog"
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        if (isDesktop && isDrawerOpen) {
            setIsDrawerOpen(false);
        }
    }, [isDesktop, isDrawerOpen]);

    const handleProductSelect = useCallback((product: Product) => {
        setSelectedProduct(product);
        setConfiguratorOpen(true);
    }, []);

    const cartItemCount = useMemo(
        () => cart.reduce((total, item) => total + item.quantity, 0),
        [cart]
    );

    const cartTotalPrice = useMemo(
        () =>
            cart.reduce((total, item) => {
                if (typeof item.totalPrice === "number") {
                    return total + item.totalPrice;
                }
                if (typeof item.unitPrice === "number") {
                    return total + item.unitPrice * item.quantity;
                }
                return total;
            }, 0),
        [cart]
    );

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 4 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "background.default",
                p: { xs: 2, md: 4 },
                pb: { xs: 12, md: 4 },
            }}>
                {/* Admin kullanıcısı için bilgilendirme mesajı */}
                {user?.role === "ADMIN" && (
                    <Alert
                        severity="info"
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            backgroundColor: "info.light",
                            "& .MuiAlert-icon": {
                                color: "info.main",
                            },
                        }}>
                        <Typography variant="body2" fontWeight={500}>
                            You are viewing this page as an admin user. This
                            page is designed for client users.
                        </Typography>
                    </Alert>
                )}

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, lg: 8 }}>
                        {/* Modern Search Interface */}
                        <Box
                            mb={4}
                            sx={{
                                position: "relative",
                                maxWidth: 600,
                            }}>
                            <TextField
                                placeholder="Search for delicious items..."
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
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <SearchIcon
                                            sx={{
                                                color: "text.secondary",
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                    endAdornment: searchInputValue && (
                                        <Button
                                            variant="contained"
                                            onClick={() =>
                                                handleSearchChange(
                                                    searchInputValue || null
                                                )
                                            }
                                            sx={{
                                                minWidth: "auto",
                                                px: 2,
                                                py: 1,
                                                backgroundColor:
                                                    "secondary.main",
                                                color: "black",
                                                "&:hover": {
                                                    backgroundColor:
                                                        "secondary.dark",
                                                },
                                            }}>
                                            Search
                                        </Button>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "background.paper",
                                        borderRadius: 3,
                                        height: 56,
                                        "& fieldset": {
                                            borderColor: "grey.200",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "primary.main",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "primary.main",
                                            borderWidth: 2,
                                        },
                                    },
                                    "& .MuiInputBase-input": {
                                        fontSize: "1rem",
                                        "&::placeholder": {
                                            color: "text.secondary",
                                            opacity: 0.8,
                                        },
                                    },
                                }}
                            />
                        </Box>

                        <CategoryFilters
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            onSelectCategory={setSelectedCategoryId}
                            showFavoritesOnly={showFavoritesOnly}
                            onToggleFavorites={toggleFavoritesFilter}
                        />
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                            mt={4}>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{
                                    color: "text.primary",
                                    fontSize: { xs: "1.5rem", md: "1.75rem" },
                                }}>
                                Products
                            </Typography>
                            <ViewToggle
                                view={currentView}
                                onViewChange={setCurrentView}
                            />
                        </Box>

                        {currentView === "catalog" ? (
                            <ProductCatalogView
                                products={products}
                                onProductSelect={handleProductSelect}
                                favoriteProductIds={favoriteProductIds}
                                onToggleFavorite={toggleFavorite}
                            />
                        ) : (
                            <ProductListView
                                products={products}
                                onProductSelect={handleProductSelect}
                                favoriteProductIds={favoriteProductIds}
                                onToggleFavorite={toggleFavorite}
                            />
                        )}

                        {/* Pagination control from backend - only show when favorites filter is not active */}
                        {pagination &&
                            pagination.totalPages > 1 &&
                            !showFavoritesOnly && (
                                <PaginationComponent
                                    pagination={pagination}
                                    onPageChange={handlePageChange}
                                />
                            )}
                    </Grid>
                    {isDesktop && (
                        <Grid size={{ xs: 12, lg: 4 }}>
                            <ShoppingCart variant="page" />
                        </Grid>
                    )}
                </Grid>

                {!isDesktop && (
                    <>
                        <StickyCartFooter
                            itemCount={cartItemCount}
                            totalPrice={cartTotalPrice}
                            onClick={() => setIsDrawerOpen(true)}
                        />
                        <CartDrawer
                            open={isDrawerOpen}
                            onClose={() => setIsDrawerOpen(false)}
                        />
                    </>
                )}

                <ProductConfiguratorModal
                    open={isConfiguratorOpen}
                    onClose={() => setConfiguratorOpen(false)}
                    product={selectedProduct}
                />
        </Box>
    );
}

export default function NewOrderPage() {
    return (
        <ProtectedRoute requiredRole="CLIENT">
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
                <NewOrderContent />
            </Suspense>
        </ProtectedRoute>
    );
}
