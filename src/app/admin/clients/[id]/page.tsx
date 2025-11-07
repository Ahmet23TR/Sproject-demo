"use client";
import { Suspense, useMemo, useState } from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUserDetail } from "@/hooks/admin/useUserDetail";
import { useAdminPricing } from "@/hooks/admin/useAdminPricing";
import { AdminChangePasswordModal } from "../../../../components/admin/AdminChangePasswordModal";
import { DeleteUserConfirmationModal } from "../../../../components/admin/DeleteUserConfirmationModal";
// import { ClientHeader } from "./components/ClientHeader";
import { CustomerOverviewCard } from "./components/CustomerOverviewCard";
import { OrdersSection } from "./components/OrdersSection";
import { EditCustomerModal } from "./components/EditCustomerModal";
import {
    formatDate,
    formatDateTime,
    getCompletedOrders,
    calculateCompletedOrdersTotal,
} from "./components/clientDetailUtils";

export const dynamic = "force-dynamic";

function ClientDetailContent() {
    const params = useParams();
    const userId = params.id as string;

    const {
        user,
        orders,
        pagination,
        loading,
        error,
        currentUser,
        formState,
        isUpdating,
        updateSuccess,
        updateError,
        isDirty,
        handleFormChange,
        handlePriceListChange,
        handleFormSubmit,
        isActivating,
        activationError,
        handleActivate,
        handleDeactivate,
        isChangingRole,
        roleChangeError,
        roleChangeSuccess,
        handleRoleChange,
        isDeleting,
        deleteError,
        deleteSuccess,
        handleDeleteUser,
        handlePageChange,
    } = useUserDetail(userId);

    const { lists: priceLists } = useAdminPricing();

    // Filter to only show admin price lists (not distributor price lists)
    const adminPriceLists = useMemo(() => {
        return priceLists.filter((pl) => !pl.distributorId);
    }, [priceLists]);

    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [orderSearch, setOrderSearch] = useState("");
    const [copiedId, setCopiedId] = useState(false);

    const handleDeleteConfirm = () => {
        setDeleteModalOpen(false);
        handleDeleteUser();
    };

    const totalOrders = useMemo(() => {
        // Backend artık orderCount'u da doğru hesaplıyor (includeStats=true ile)
        // Öncelikle backend değerini kullan, fallback olarak manuel hesaplama yap
        if (typeof user?.orderCount === "number") {
            return user.orderCount;
        }

        // Fallback: Manuel hesaplama (backend değeri yoksa)
        const completedOrders = getCompletedOrders(orders || []);
        return completedOrders.length;
    }, [user?.orderCount, orders]);

    const totalSpend = useMemo(() => {
        // Backend artık totalOrderAmount'u doğru hesaplıyor (DELIVERED + PARTIALLY_DELIVERED)
        // Öncelikle backend değerini kullan, fallback olarak manuel hesaplama yap
        if (typeof user?.totalOrderAmount === "number") {
            return user.totalOrderAmount;
        }

        // Fallback: Manuel hesaplama (backend değeri yoksa)
        // Bu geçici olarak çalışacak, backend düzeltilene kadar
        return calculateCompletedOrdersTotal(orders || []);
    }, [user?.totalOrderAmount, orders]);

    const averageOrderValue = useMemo(() => {
        if (!totalOrders) {
            return null;
        }
        return totalSpend / totalOrders;
    }, [totalSpend, totalOrders]);

    const sortedOrders = useMemo(() => {
        const list = [...(orders || [])];
        return list.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const query = orderSearch.trim().toLowerCase();
        if (!query) {
            return sortedOrders;
        }
        return sortedOrders.filter((order) => {
            const orderNumber = order.orderNumber
                ? String(order.orderNumber).toLowerCase()
                : "";
            const status = order.deliveryStatus
                ? order.deliveryStatus.toLowerCase()
                : "";
            return orderNumber.includes(query) || status.includes(query);
        });
    }, [sortedOrders, orderSearch]);

    const orderStats = useMemo(() => {
        const stats = {
            all: totalOrders || 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            cancelled: 0,
        };

        sortedOrders.forEach((order) => {
            const status = order.deliveryStatus;
            if (status === "DELIVERED") {
                stats.completed += 1;
            } else if (status === "CANCELLED") {
                stats.cancelled += 1;
            } else if (
                status === "READY_FOR_DELIVERY" ||
                status === "PARTIALLY_DELIVERED"
            ) {
                stats.inProgress += 1;
            } else {
                stats.pending += 1;
            }
        });

        return stats;
    }, [sortedOrders, totalOrders]);

    const lastOrder = sortedOrders[0];
    const lastOrderDateLabel = lastOrder
        ? formatDateTime(lastOrder.createdAt)
        : "—";
    const customerSince = formatDate(user?.createdAt);

    const address = user?.address || "Not provided";
    const phoneDisplay = user?.phone || "Not provided";
    const emailDisplay = user?.email || "Not provided";
    const companyDisplay = user?.companyName || "Not provided";

    const handleCopyId = async () => {
        if (
            !user?.id ||
            typeof navigator === "undefined" ||
            !navigator.clipboard
        ) {
            return;
        }
        try {
            await navigator.clipboard.writeText(user.id);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        } catch {
            setCopiedId(false);
        }
    };

    const statCards = useMemo(
        () => [
            {
                label: "All Orders",
                value: orderStats.all,
                icon: <LocalMallOutlinedIcon fontSize="small" />,
                pillSx: {
                    backgroundColor: "rgba(59, 130, 246, 0.12)",
                    color: "#2563eb",
                },
            },
            {
                label: "Completed",
                value: orderStats.completed,
                icon: <CheckCircleOutlineRoundedIcon fontSize="small" />,
                pillSx: {
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    color: "#047857",
                },
            },
            {
                label: "In Progress",
                value: orderStats.inProgress,
                icon: <SyncRoundedIcon fontSize="small" />,
                pillSx: {
                    backgroundColor: "rgba(14, 165, 233, 0.16)",
                    color: "#0369a1",
                },
            },
            {
                label: "Pending",
                value: orderStats.pending,
                icon: <PendingActionsRoundedIcon fontSize="small" />,
                pillSx: {
                    backgroundColor: "rgba(234, 179, 8, 0.18)",
                    color: "#b45309",
                },
            },
            {
                label: "Cancelled",
                value: orderStats.cancelled,
                icon: <HighlightOffRoundedIcon fontSize="small" />,
                pillSx: {
                    backgroundColor: "rgba(248, 113, 113, 0.18)",
                    color: "#b91c1c",
                },
            },
        ],
        [orderStats]
    );

    const showPagination = Boolean(
        pagination && pagination.totalPages > 1 && !orderSearch
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    if (isDeleting) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="60vh">
                <CircularProgress sx={{ mb: 3 }} />
                <Typography variant="h6" color="text.secondary">
                    Client is being deleted, please wait...
                </Typography>
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

    if (!user) {
        return (
            <Alert severity="warning" sx={{ m: 4 }}>
                Client not found.
            </Alert>
        );
    }

    if (user.role !== "CLIENT") {
        return (
            <Alert severity="error" sx={{ m: 4 }}>
                This user is not a client. Please use the appropriate staff
                management page.
            </Alert>
        );
    }

    return (
        <>
            <Box
                sx={{
                    backgroundColor: "#f5f6fa",
                    minHeight: "100vh",
                    py: { xs: 4, md: 6 },
                }}>
                <Box
                    sx={{
                        maxWidth: 1280,
                        mx: "auto",
                        px: { xs: 2, md: 4 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}>
                    {/* <ClientHeader
                        fullName={`${user.name} ${user.surname}`}
                        isActive={user.isActive}
                        isActivating={isActivating}
                        onEditClick={() => setEditModalOpen(true)}
                        onToggleStatus={
                            user.isActive ? handleDeactivate : handleActivate
                        }
                    /> */}

                    <Stack spacing={1.2}>
                        {updateSuccess && (
                            <Alert severity="success">{updateSuccess}</Alert>
                        )}
                        {deleteSuccess && (
                            <Alert severity="success">{deleteSuccess}</Alert>
                        )}
                        {activationError && (
                            <Alert severity="error">{activationError}</Alert>
                        )}
                        {updateError && (
                            <Alert severity="error">{updateError}</Alert>
                        )}
                        {roleChangeError && (
                            <Alert severity="error">{roleChangeError}</Alert>
                        )}
                        {roleChangeSuccess && (
                            <Alert severity="success">
                                {roleChangeSuccess}
                            </Alert>
                        )}
                    </Stack>

                    <CustomerOverviewCard
                        user={user}
                        customerSince={customerSince}
                        lastOrderDateLabel={lastOrderDateLabel}
                        phoneDisplay={phoneDisplay}
                        emailDisplay={emailDisplay}
                        companyDisplay={companyDisplay}
                        addressDisplay={address}
                        totalSpend={totalSpend}
                        averageOrderValue={averageOrderValue}
                        statCards={statCards}
                        copiedId={copiedId}
                        onCopyCustomerId={handleCopyId}
                        onEditClick={() => setEditModalOpen(true)}
                        onToggleStatus={
                            user.isActive ? handleDeactivate : handleActivate
                        }
                        isActivating={isActivating}
                        toggleLabel={user.isActive ? "Deactivate" : "Activate"}
                    />

                    <OrdersSection
                        orders={filteredOrders}
                        loading={loading}
                        error={error}
                        search={orderSearch}
                        onSearchChange={setOrderSearch}
                        pagination={pagination}
                        showPagination={showPagination}
                        onPageChange={handlePageChange}
                    />
                </Box>
            </Box>

            <EditCustomerModal
                open={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                user={user}
                formState={formState}
                isUpdating={isUpdating}
                updateError={updateError}
                isDirty={isDirty}
                onFormChange={handleFormChange}
                onFormSubmit={handleFormSubmit}
                isActivating={isActivating}
                activationError={activationError}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                currentUser={currentUser}
                isChangingRole={isChangingRole}
                roleChangeError={roleChangeError}
                roleChangeSuccess={roleChangeSuccess}
                onRoleChange={handleRoleChange}
                priceLists={adminPriceLists}
                onPriceListChange={handlePriceListChange}
                onChangePassword={() => setPasswordModalOpen(true)}
                onDeleteCustomer={() => setDeleteModalOpen(true)}
                deleteError={deleteError}
            />

            <AdminChangePasswordModal
                open={isPasswordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                userId={userId}
            />
            <DeleteUserConfirmationModal
                open={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                user={user}
                loading={isDeleting}
            />
        </>
    );
}

export default function ClientDetailPage() {
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
                <ClientDetailContent />
            </Suspense>
        </ProtectedRoute>
    );
}
