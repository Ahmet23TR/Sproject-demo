"use client";
import React, { Suspense, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useChefDashboard } from "../../../hooks/chef/useChefDashboard";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Grid,
    Paper,
    Snackbar,
    Alert as MuiAlert,
    // useTheme,
} from "@mui/material";
import { ProductionSummaryTable } from "./components/ProductionSummaryTable";
import { OrderTrackingPanel } from "./components/OrderTrackingPanel";
import { DetailedSummaryModal } from "./components/DetailedSummaryModal";
import type { Order } from "@/types/data";

export const dynamic = "force-dynamic";

function ChefDashboardContent() {
    const {
        groupedProductionList,
        orders,
        loading,
        error,
        handleStatusUpdate,
        chefProductGroup,
        handlePartialProduce,
        getRemainingForItem,
        pagination,
        handlePageChange,
    } = useChefDashboard();

    // const theme = useTheme();
    // Temporary fix for MUI useMediaQuery issue
    const fullScreen = false; // useMediaQuery(theme.breakpoints.down("sm"));

    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [summaryModalOpen, setSummaryModalOpen] = useState(false);
    const [cancelDialog, setCancelDialog] = useState<{
        open: boolean;
        item: Order["items"][0] | null;
        reason: string;
    }>({ open: false, item: null, reason: "" });

    const [partialDialog, setPartialDialog] = useState<{
        open: boolean;
        item: Order["items"][0] | null;
        amount: string;
        notes: string;
        errors: { amount?: string; notes?: string };
    }>({ open: false, item: null, amount: "", notes: "", errors: {} });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    const handleAccordionToggle = (orderId: string) => {
        setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
    };

    const openCancelModal = (item: Order["items"][0]) => {
        setCancelDialog({ open: true, item, reason: "" });
    };

    const handleCancelSubmit = async () => {
        if (!cancelDialog.item || !cancelDialog.reason) return;
        setIsSubmitting(true);
        await handleStatusUpdate(
            cancelDialog.item.id,
            "CANCELLED",
            cancelDialog.reason
        );
        setIsSubmitting(false);
        setCancelDialog({ open: false, item: null, reason: "" });
        setToast({
            open: true,
            message: "Item cancelled",
            severity: "success",
        });
    };

    const openPartialModal = (item: Order["items"][0]) => {
        setPartialDialog({
            open: true,
            item,
            amount: "",
            notes: "",
            errors: {},
        });
    };

    const validatePartial = (
        amountStr: string,
        notes: string,
        item: Order["items"][0]
    ) => {
        const errors: { amount?: string; notes?: string } = {};
        const amount = Number(amountStr);
        const totalQty = item?.quantity ?? 0;
        const produced = item?.producedQuantity ?? 0;
        const remaining = Math.max(0, totalQty - produced);

        if (!Number.isFinite(amount) || amount <= 0) {
            errors.amount = "Invalid amount";
        } else if (amount >= remaining) {
            errors.amount =
                "Produced amount cannot be greater than or equal to remaining amount.";
        }

        if (!notes || notes.trim().length < 5) {
            errors.notes = "Notes must be at least 5 characters long.";
        }
        return errors;
    };

    const handlePartialSubmit = async () => {
        const item = partialDialog.item;
        if (!item) return;
        const errors = validatePartial(
            partialDialog.amount,
            partialDialog.notes,
            item
        );
        if (Object.keys(errors).length > 0) {
            setPartialDialog((prev) => ({ ...prev, errors }));
            return;
        }
        setIsSubmitting(true);
        const res = await handlePartialProduce(
            item.id,
            Number(partialDialog.amount),
            partialDialog.notes
        );
        setIsSubmitting(false);
        if (res?.ok) {
            setPartialDialog({
                open: false,
                item: null,
                amount: "",
                notes: "",
                errors: {},
            });
            setToast({
                open: true,
                message: "Partial production saved",
                severity: "success",
            });
        } else {
            setToast({
                open: true,
                message: "Partial production failed",
                severity: "error",
            });
        }
    };

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
        <>
        <Box
            sx={{
                bgcolor: "#f5f6fa",
                minHeight: "100vh",
                py: { xs: 4, md: 2 },
            }}>
                <Box maxWidth={1200} mx="auto" px={2}>
                    {/* Production Summary and Filter */}
                    {/* <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ flex: 1 }}>
                            Production Summary
                        </Typography>
                    </Box> */}

                    {/* Production Summary Table and Order Tracking */}
                    <Grid container spacing={3} alignItems="stretch">
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
                                <Box
                                    sx={{
                                        height: { xs: 400, md: "70vh" },
                                        overflow: "auto",
                                    }}>
                                    <ProductionSummaryTable
                                        groupedList={groupedProductionList}
                                        onClick={() =>
                                            setSummaryModalOpen(true)
                                        }
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                        {/* Order Tracking */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <OrderTrackingPanel
                                orders={orders}
                                expandedOrderId={expandedOrderId}
                                onAccordionToggle={handleAccordionToggle}
                                onComplete={async (id) => {
                                    setIsSubmitting(true);
                                    await handleStatusUpdate(id, "COMPLETED");
                                    setIsSubmitting(false);
                                    setToast({
                                        open: true,
                                        message: "Item completed",
                                        severity: "success",
                                    });
                                }}
                                onCancel={openCancelModal}
                                onPartial={openPartialModal}
                                isSubmitting={isSubmitting}
                                pagination={pagination ?? undefined}
                                onPageChange={handlePageChange}
                                chefProductGroup={chefProductGroup}
                            />
                        </Grid>
                    </Grid>
                </Box>
        </Box>

        {/* Cancel Dialog */}
            <Dialog
                open={cancelDialog.open}
                onClose={() =>
                    setCancelDialog({ open: false, item: null, reason: "" })
                }>
                <DialogTitle>Production Failed - Enter Reason</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        type="text"
                        fullWidth
                        value={cancelDialog.reason}
                        onChange={(e) =>
                            setCancelDialog((p) => ({
                                ...p,
                                reason: e.target.value,
                            }))
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setCancelDialog({
                                open: false,
                                item: null,
                                reason: "",
                            })
                        }>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCancelSubmit}
                        color="error"
                        variant="contained"
                        disabled={!cancelDialog.reason || isSubmitting}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Partial Dialog - responsive and stable */}
            <Dialog
                open={partialDialog.open}
                onClose={() =>
                    setPartialDialog({
                        open: false,
                        item: null,
                        amount: "",
                        notes: "",
                        errors: {},
                    })
                }
                fullWidth
                maxWidth="sm"
                fullScreen={fullScreen}>
                <DialogTitle>Partial Production</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        {/* Stats */}
                        {partialDialog.item && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{ p: 1.5, borderRadius: 1.5 }}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary">
                                            Remaining
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight={700}>
                                            {getRemainingForItem(
                                                partialDialog.item
                                            )}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{ p: 1.5, borderRadius: 1.5 }}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary">
                                            Produced
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight={700}>
                                            {partialDialog.item
                                                .producedQuantity ?? 0}{" "}
                                            / {partialDialog.item.quantity}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </>
                        )}

                        {/* Amount input */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                autoFocus
                                fullWidth
                                label="Produced Amount"
                                type="number"
                                value={partialDialog.amount}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setPartialDialog((p) => ({
                                        ...p,
                                        amount: v,
                                        errors: {
                                            ...p.errors,
                                            amount: undefined,
                                        },
                                    }));
                                }}
                                inputProps={{ min: 1 }}
                                error={!!partialDialog.errors.amount}
                                helperText={partialDialog.errors.amount || " "}
                                FormHelperTextProps={{ sx: { minHeight: 20 } }}
                            />
                        </Grid>

                        {/* Notes */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Description / Reason"
                                type="text"
                                multiline
                                minRows={3}
                                value={partialDialog.notes}
                                onChange={(e) =>
                                    setPartialDialog((p) => ({
                                        ...p,
                                        notes: e.target.value,
                                        errors: {
                                            ...p.errors,
                                            notes: undefined,
                                        },
                                    }))
                                }
                                error={!!partialDialog.errors.notes}
                                helperText={partialDialog.errors.notes || " "}
                                FormHelperTextProps={{ sx: { minHeight: 20 } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setPartialDialog({
                                open: false,
                                item: null,
                                amount: "",
                                notes: "",
                                errors: {},
                            })
                        }>
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePartialSubmit}
                        variant="contained"
                        disabled={isSubmitting}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Detailed Summary Modal */}
            <DetailedSummaryModal
                open={summaryModalOpen}
                onClose={() => setSummaryModalOpen(false)}
                groupedList={groupedProductionList}
            />

            {/* Toast */}
            <Snackbar
                open={toast.open}
                autoHideDuration={2500}
                onClose={() => setToast((p) => ({ ...p, open: false }))}>
                <MuiAlert
                    onClose={() => setToast((p) => ({ ...p, open: false }))}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: "100%" }}>
                    {toast.message}
                </MuiAlert>
            </Snackbar>
        </>
    );
}

export default function ChefDashboardPage() {
    return (
        <ProtectedRoute requiredRole="CHEF">
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
                <ChefDashboardContent />
            </Suspense>
        </ProtectedRoute>
    );
}
