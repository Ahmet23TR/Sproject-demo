"use client";
import React, { Suspense, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDriverDashboard } from "../../../hooks/driver/useDriverDashboard";
import { Box, CircularProgress, Alert, Tabs, Tab } from "@mui/material";
import OrderDetailModal from "./components/OrderDetailModal";

import { fetchDriverOrderDetail } from "@/services/driverService";
import SuccessPopup from "@/components/SuccessPopup";
import { Order } from "@/types/data";
import FiltersBar from "./components/FiltersBar";
import OrdersList from "./components/OrdersList";
import PoolOrdersList from "./components/PoolOrdersList";
import PaginationComponent from "@/components/PaginationComponent";
import FailReasonDialog from "./components/FailReasonDialog";

export const dynamic = "force-dynamic";

function DriverDashboardContent() {
    const {
        // lists
        poolOrders,
        myDeliveries,
        statusFilter,
        setStatusFilter,
        activeTab,
        setActiveTab,
        loading,
        error,
        pagination,
        poolPagination,
        myPagination,
        handleUpdateStatus,
        handleClaimOrder,
        handlePageChange,
        popup,
        closePopup,
    } = useDriverDashboard();

    const [failModalOpen, setFailModalOpen] = useState(false);
    const [failReason, setFailReason] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [detailOrder, setDetailOrder] = useState<Order | null>(null);

    const statusTabValue =
        statusFilter === "all" ? 0 : statusFilter === "pending" ? 1 : 2;

    const openFailModal = (orderId: string) => {
        setSelectedOrderId(orderId);
        setFailReason("");
        setFailModalOpen(true);
    };
    const handleFailSubmit = async () => {
        if (!selectedOrderId || !failReason) return;
        await handleUpdateStatus(selectedOrderId, "FAILED", failReason);
        setFailModalOpen(false);
        // Fail işlemi sonrası detail modal'ı da kapat (sipariş listeden çıkacak)
        setDetailModalOpen(false);
        setDetailOrder(null);
        setDetailError(null);
    };

    const handleOpenDetail = async (orderId: string) => {
        setDetailModalOpen(true);
        setDetailLoading(true);
        setDetailError(null);
        setDetailOrder(null);
        try {
            // Get token from context or localStorage (example: localStorage)
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Session not found");
            const order = await fetchDriverOrderDetail(orderId, token);
            setDetailOrder(order);
        } catch (err: unknown) {
            setDetailError((err as Error)?.message || "Could not get details");
        } finally {
            setDetailLoading(false);
        }
    };
    const handleCloseDetail = () => {
        setDetailModalOpen(false);
        setDetailOrder(null);
        setDetailError(null);
    };

    return (
        <>
            <Box
                sx={{
                    bgcolor: "#f5f6fa",
                    minHeight: "100vh",
                    py: { xs: 4, md: 2 },
                }}>
                <Box maxWidth={1100} mx="auto" px={2}>
                    {/* New top-level tabs for Pool vs My Deliveries */}
                    <Tabs
                        value={activeTab === "pool" ? 0 : 1}
                        onChange={(_, v) =>
                            setActiveTab(v === 0 ? "pool" : "myDeliveries")
                        }
                        sx={{ mt: 1, mb: 2 }}>
                        <Tab label="Pool Orders" />
                        <Tab label="My Deliveries" />
                    </Tabs>

                    {/* Keep status filters only for My Deliveries view */}
                    {activeTab === "myDeliveries" && (
                        <FiltersBar
                            tabValue={statusTabValue}
                            onChangeTab={(newValue) => {
                                if (newValue === 0) setStatusFilter("all");
                                if (newValue === 1) setStatusFilter("pending");
                                if (newValue === 2)
                                    setStatusFilter("completed");
                            }}
                        />
                    )}
                    {loading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 10,
                            }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ m: 4 }}>
                            {error}
                        </Alert>
                    ) : activeTab === "pool" ? (
                        <>
                            <PoolOrdersList
                                orders={poolOrders}
                                onOpenDetail={handleOpenDetail}
                                onClaim={handleClaimOrder}
                            />
                            {poolPagination && (
                                <PaginationComponent
                                    pagination={poolPagination}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <OrdersList
                                orders={myDeliveries}
                                onOpenDetail={handleOpenDetail}
                                onDelivered={(orderId) =>
                                    handleUpdateStatus(orderId, "DELIVERED")
                                }
                                onOpenFail={openFailModal}
                            />
                            {(myPagination || pagination) && (
                                <PaginationComponent
                                    pagination={(myPagination || pagination)!}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </Box>
            </Box>

            {/* Delivery Failed Modal */}
            <FailReasonDialog
                open={failModalOpen}
                reason={failReason}
                onChangeReason={setFailReason}
                onClose={() => setFailModalOpen(false)}
                onSave={handleFailSubmit}
            />
            <OrderDetailModal
                open={detailModalOpen}
                onClose={handleCloseDetail}
                loading={detailLoading}
                error={detailError}
                order={detailOrder}
                {...(activeTab === "myDeliveries"
                    ? {
                        onDelivered: async (orderId: string) => {
                            await handleUpdateStatus(orderId, "DELIVERED");
                        },
                        onOpenFail: (orderId: string) => {
                            setSelectedOrderId(orderId);
                            setFailModalOpen(true);
                        },
                    }
                    : {})}
            />

            {/* Success/Error Popup */}
            <SuccessPopup
                open={popup.open}
                message={popup.message}
                type={popup.type}
                onClose={closePopup}
            />
        </>
    );
}

export default function DriverDashboardPage() {
    return (
        <ProtectedRoute requiredRole="DRIVER">
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
                <DriverDashboardContent />
            </Suspense>
        </ProtectedRoute>
    );
}
