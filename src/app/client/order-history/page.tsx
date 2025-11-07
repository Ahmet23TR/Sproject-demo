"use client";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { Box, CircularProgress, Alert, Pagination } from "@mui/material";
import { useOrderHistory } from "../../../hooks/order/useOrderHistory";
import { OrderHistoryTable } from "./components/OrderHistoryTable";
import { InactiveProductsModal } from "../../../components/InactiveProductsModal";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function ClientOrderHistoryContent() {
    const {
        orders,
        loading,
        error,
        pagination,
        currentPage,
        // Original handlers
        handlePageChange,
        handleReorder,
        showInactiveModal,
        inactiveProducts,
        activeItems,
        handleProceedWithActive,
        handleCloseInactiveModal,
    } = useOrderHistory();

    return (
        <>
            <Box maxWidth={1200} mx="auto" my={{ xs: 3, md: 6 }} px={2}>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={10}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        <OrderHistoryTable
                            orders={orders}
                            onReorder={handleReorder}
                        />

                        {pagination && pagination.totalPages > 1 && (
                            <Box display="flex" justifyContent="center" mt={4}>
                                <Pagination
                                    count={pagination.totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Box>

            {/* Inactive Products Modal */}
            <InactiveProductsModal
                open={showInactiveModal}
                onClose={handleCloseInactiveModal}
                inactiveProducts={inactiveProducts}
                activeProductsCount={activeItems.length}
                onProceedWithActive={handleProceedWithActive}
            />
        </>
    );
}

export default function MyOrdersPage() {
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
                <ClientOrderHistoryContent />
            </Suspense>
        </ProtectedRoute>
    );
}
