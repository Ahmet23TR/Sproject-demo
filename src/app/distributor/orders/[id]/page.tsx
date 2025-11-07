"use client";
import { Box, CircularProgress, Alert } from "@mui/material";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDistributorOrderDetail } from "@/hooks/distributor/useDistributorOrderDetail";
import { DistributorOrderDetailHeader } from "./components/OrderDetailHeader";
import { DistributorOrderItemList } from "./components/OrderItemList";

export default function DistributorOrderDetailPage() {
    const { order, loading, error } = useDistributorOrderDetail();

    return (
        <ProtectedRoute requiredRole="DISTRIBUTOR">
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && !loading && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {!loading && !error && order && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <DistributorOrderDetailHeader order={order} />
                        <DistributorOrderItemList items={order.items} />
                    </Box>
                )}
            </Box>
        </ProtectedRoute>
    );
}


