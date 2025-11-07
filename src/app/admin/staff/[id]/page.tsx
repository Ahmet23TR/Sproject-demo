"use client";
import { Suspense, useRef, useState, useMemo } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUserDetail } from "@/hooks/admin/useUserDetail";
import { useAdminPricing } from "@/hooks/admin/useAdminPricing";
import { EditUserForm } from "../../../../components/admin/EditUserForm";
import { AdminChangePasswordModal } from "../../../../components/admin/AdminChangePasswordModal";
import { DeleteUserConfirmationModal } from "../../../../components/admin/DeleteUserConfirmationModal";
import type { User } from "@/types/data";
// import { StaffHeader } from "./components/StaffHeader";
import { StaffOverviewCard } from "./components/StaffOverviewCard";

export const dynamic = "force-dynamic";

const detailCardSx = {
    borderRadius: 2,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    backgroundColor: "white",
    boxShadow: "0px 8px 18px rgba(15, 23, 42, 0.08)",
};

const dangerCardSx = {
    ...detailCardSx,
    border: "1px solid rgba(248, 113, 113, 0.45)",
};

const formatDate = (value?: string | null) => {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatProductGroupLabel = (
    role: User["role"],
    productGroup?: User["productGroup"]
) => {
    if (role !== "CHEF") {
        return "Not applicable";
    }
    if (!productGroup) {
        return "Not set";
    }
    return productGroup === "SWEETS" ? "Sweets" : "Bakery";
};

function StaffDetailContent() {
    const params = useParams();
    const userId = params.id as string;

    const {
        user,
        loading,
        error,
        currentUser,
        formState,
        isUpdating,
        updateSuccess,
        updateError,
        isDirty,
        handleFormChange,
        handleFormSubmit,
        handlePriceListChange,
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
    } = useUserDetail(userId);

    const { lists: priceLists } = useAdminPricing();

    // Filter to only show admin price lists (not distributor price lists)
    const adminPriceLists = useMemo(() => {
        return priceLists.filter((pl) => !pl.distributorId);
    }, [priceLists]);

    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const editSectionRef = useRef<HTMLDivElement | null>(null);

    const handleDeleteConfirm = () => {
        setDeleteModalOpen(false);
        handleDeleteUser();
    };

    const handleCopyStaffId = async () => {
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
                    Staff member is being deleted, please wait...
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
                Staff member not found.
            </Alert>
        );
    }

    if (user.role === "CLIENT") {
        return (
            <Alert severity="error" sx={{ m: 4 }}>
                This user is a client. Please use the client management page.
            </Alert>
        );
    }

    const staffSince = formatDate(user.createdAt);
    const phoneDisplay = user.phone ?? "Not provided";
    const emailDisplay = user.email ?? "Not provided";
    const addressDisplay = user.address ?? "Not provided";
    const productGroupLabel = formatProductGroupLabel(
        user.role,
        user.productGroup
    );

    return (
        <>
            <Box
                sx={{
                    backgroundColor: "#f5f6fa",
                    minHeight: "100vh",
                    py: { xs: 3, sm: 4, md: 6 },
                }}>
                <Box
                    sx={{
                        maxWidth: 1280,
                        mx: "auto",
                        px: { xs: 2, md: 4 },
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: 2, sm: 2.5, md: 3 },
                    }}>
                    {/* <StaffHeader
                        fullName={fullName}
                        roleLabel={roleLabel}
                        isActive={user.isActive}
                        isActivating={isActivating}
                        onToggleStatus={user.isActive ? handleDeactivate : handleActivate}
                        onEditClick={handleScrollToEdit}
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

                    <StaffOverviewCard
                        user={user}
                        staffSince={staffSince}
                        phoneDisplay={phoneDisplay}
                        emailDisplay={emailDisplay}
                        addressDisplay={addressDisplay}
                        productGroupLabel={productGroupLabel}
                        copiedId={copiedId}
                        onCopyStaffId={handleCopyStaffId}
                        onToggleStatus={
                            user.isActive ? handleDeactivate : handleActivate
                        }
                        isActivating={isActivating}
                        toggleLabel={user.isActive ? "Deactivate" : "Activate"}
                    />

                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="stretch">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box ref={editSectionRef}>
                                <EditUserForm
                                    user={user}
                                    formState={formState}
                                    isUpdating={isUpdating}
                                    updateError={updateError}
                                    isDirty={isDirty}
                                    onFormChange={handleFormChange}
                                    onFormSubmit={handleFormSubmit}
                                    priceLists={adminPriceLists}
                                    onPriceListChange={handlePriceListChange}
                                    isActivating={isActivating}
                                    activationError={activationError}
                                    onActivate={handleActivate}
                                    onDeactivate={handleDeactivate}
                                    currentUser={currentUser as User}
                                    isChangingRole={isChangingRole}
                                    roleChangeError={roleChangeError}
                                    roleChangeSuccess={roleChangeSuccess}
                                    onRoleChange={handleRoleChange}
                                    cardSx={detailCardSx}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }} height="100%">
                                <Card sx={detailCardSx}>
                                    <CardHeader title="Security" />
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            mb={2}>
                                            Reset or assign a new password for
                                            this staff member.
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            fullWidth
                                            onClick={() =>
                                                setPasswordModalOpen(true)
                                            }
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 600,
                                            }}>
                                            Change Password
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card sx={dangerCardSx}>
                                    <CardHeader
                                        title="Delete Staff Member"
                                        titleTypographyProps={{
                                            color: "error.main",
                                        }}
                                    />
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            mb={2}>
                                            This will permanently remove the
                                            staff member from the system. This
                                            action cannot be undone.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            fullWidth
                                            onClick={() =>
                                                setDeleteModalOpen(true)
                                            }
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 600,
                                            }}>
                                            Delete Staff Member
                                        </Button>
                                        {deleteError && (
                                            <Alert
                                                severity="error"
                                                sx={{ mt: 2 }}>
                                                {deleteError}
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

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

export default function StaffDetailPage() {
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
                <StaffDetailContent />
            </Suspense>
        </ProtectedRoute>
    );
}
