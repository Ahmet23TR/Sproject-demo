"use client";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { Box, CircularProgress, Alert, Skeleton } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useOrderDetail } from "../../../../hooks/admin/useOrderDetail";
import { useNotifications } from "../../../../hooks/useNotifications";
import { cancelOrderByAdmin } from "../../../../services/orderService";
import { useAuth } from "../../../../context/AuthContext";
import type { Order } from "../../../../types/data";
import { CancelOrderModal } from "../../../../components/admin/CancelOrderModal";
import { OrderDetailHeader } from "./components/OrderDetailHeader";
import { OrderItemList } from "./components/OrderItemList";

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const { order, loading, error, refetch } = useOrderDetail(id as string);
    const { showSuccess, showError } = useNotifications();

    // Cancel order modal state
    const [cancelModalOpen, setCancelModalOpen] = useState(false);

    const canCancelOrder = (currentOrder: Order | null | undefined): boolean => {
        return (
            !!currentOrder &&
            (currentOrder.deliveryStatus === "PENDING" ||
                currentOrder.deliveryStatus === "READY_FOR_DELIVERY")
        );
    };

    const handleCancelOrder = () => {
        setCancelModalOpen(true);
    };

    const handleCancelConfirm = async (orderId: string, notes: string) => {
        if (!token) {
            setTimeout(() => {
                showError("Authentication required");
            }, 100);
            return { success: false, message: "Authentication required" };
        }

        try {
            const result = await cancelOrderByAdmin(orderId, notes, token);

            if (result.success) {
                // Modal'ı kapat
                setCancelModalOpen(false);

                // Notification'ı setTimeout ile geciktir
                setTimeout(() => {
                    showSuccess("Order cancelled successfully");
                }, 100);

                // Refresh the order data
                setTimeout(() => {
                    refetch();
                }, 200);

                return result;
            } else {
                setTimeout(() => {
                    showError(result.message || "Failed to cancel order");
                }, 100);
                return result;
            }
        } catch {
            const errorMessage = "An error occurred while cancelling the order";
            setTimeout(() => {
                showError(errorMessage);
            }, 100);
            return { success: false, message: errorMessage };
        }
    };

    const handleCancelModalClose = () => {
        setCancelModalOpen(false);
    };

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Box
                sx={{
                    backgroundColor: "#f5f6fa",
                    minHeight: "100vh",
                    py: { xs: 2, md: 4 },
                }}>
                <Box
                    sx={{
                        maxWidth: 1280,
                        mx: "auto",
                        px: { xs: 1, sm: 2, md: 4 },
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: 2, md: 4 },
                    }}>
                    {loading && !order ? (
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Skeleton
                                variant="rounded"
                                height={220}
                                sx={{ borderRadius: 4 }}
                            />
                            <Skeleton
                                variant="rounded"
                                height={120}
                                sx={{ borderRadius: 4 }}
                            />
                            <Skeleton
                                variant="rounded"
                                height={120}
                                sx={{ borderRadius: 4 }}
                            />
                        </Box>
                    ) : null}

                    {error && (
                        <Alert severity="error" variant="outlined">
                            {error}
                        </Alert>
                    )}

                    {!loading && !error && !order && (
                        <Alert severity="warning" variant="outlined">
                            Order could not be found.
                        </Alert>
                    )}

                    {order && (
                        <OrderDetailHeader
                            order={order}
                            onCancel={handleCancelOrder}
                            canCancel={canCancelOrder(order)}
                        />
                    )}

                    {order ? (
                        <OrderItemList items={order.items} />
                    ) : loading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                py: 6,
                            }}>
                            <CircularProgress />
                        </Box>
                    ) : null}

                    {/* Cancel Order Modal */}
                    <CancelOrderModal
                        open={cancelModalOpen}
                        onClose={handleCancelModalClose}
                        order={order}
                        onConfirm={handleCancelConfirm}
                    />
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
