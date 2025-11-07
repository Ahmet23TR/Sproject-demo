"use client";
import { Box, CircularProgress, Alert, Paper } from "@mui/material";
import { useDistributorOrders } from "@/hooks/distributor/useDistributorOrders";
import { OrdersHeader } from "./components/OrdersHeader";
import { OrdersSummary } from "./components/OrdersSummary";
import { OrdersList } from "./components/OrdersList";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

/**
 * Distributor Daily Orders Page
 * Displays daily orders list for distribution planning
 */
function DistributorOrdersContent() {
    const router = useRouter();
    const {
        selectedDate,
        data,
        loading,
        error,
        goToPreviousDay,
        goToNextDay,
        goToToday,
    } = useDistributorOrders();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#F5F5F5",
                p: { xs: 2, sm: 3, md: 4 },
            }}
        >
            {/* Loading State */}
            {loading && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "400px",
                    }}
                >
                    <CircularProgress
                        sx={{
                            color: "#C9A227",
                        }}
                    />
                </Box>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert
                    severity="error"
                    sx={{
                        borderRadius: 2,
                        mb: 3,
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Orders Display */}
            {!loading && !error && data && (
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: "#FFFFFF",
                        borderRadius: 3,
                        p: { xs: 3, sm: 4, md: 6 },
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 4px 20px rgba(17, 24, 39, 0.08)",
                    }}
                >
                    {/* Header with Date Navigation */}
                    <OrdersHeader
                        selectedDate={selectedDate}
                        onPreviousDay={goToPreviousDay}
                        onNextDay={goToNextDay}
                        onToday={goToToday}
                    />

                    {/* Summary Stats */}
                    <OrdersSummary
                        totalOrders={data.summary.totalOrders}
                        totalAmount={data.summary.totalAmount}
                    />

                    {/* Orders List */}
                    <OrdersList
                        orders={data.orders}
                        onOrderClick={(orderId) => router.push(`/distributor/orders/${orderId}`)}
                    />
                </Paper>
            )}
        </Box>
    );
}

export default function DistributorOrdersPage() {
    return (
        <ProtectedRoute requiredRole="DISTRIBUTOR">
            <DistributorOrdersContent />
        </ProtectedRoute>
    );
}

