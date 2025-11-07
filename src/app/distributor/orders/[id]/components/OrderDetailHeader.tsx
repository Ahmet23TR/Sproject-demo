"use client";
import { Box, Typography, Chip, Paper, Grid, Button, Divider } from "@mui/material";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import { styled } from "@mui/material/styles";
import type { Order } from "@/types/data";

interface DistributorOrderDetailHeaderProps {
    order: Order;
}

const InfoCard = styled(Paper)(({ theme }) => ({
    borderRadius: 24,
    padding: theme.spacing(2),
    [theme.breakpoints.up("md")]: { padding: theme.spacing(3) },
    backgroundColor: theme.palette.common.white,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    boxShadow: "0px 16px 32px rgba(15, 23, 42, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    height: "100%",
}));

const deliveryStatusMeta: Record<string, { label: string; color: "default" | "primary" | "success" | "error" | "info" | "warning" }> = {
    READY_FOR_DELIVERY: { label: "Ready for delivery", color: "info" },
    DELIVERED: { label: "Delivered", color: "success" },
    FAILED: { label: "Failed", color: "error" },
    CANCELLED: { label: "Cancelled", color: "error" },
    PENDING: { label: "Pending", color: "warning" },
    PARTIALLY_DELIVERED: { label: "Partially delivered", color: "info" },
};

const productionStatusMeta: Record<string, { label: string; color: "default" | "primary" | "success" | "error" | "info" | "warning" }> = {
    COMPLETED: { label: "Production completed", color: "success" },
    PENDING: { label: "In production", color: "warning" },
    PARTIALLY_COMPLETED: { label: "Partially produced", color: "info" },
    CANCELLED: { label: "Production failed", color: "error" },
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

const calculateTotals = (order: Order) => {
    const initialRetail = order.initialRetailTotalAmount;
    const finalRetail = order.finalRetailTotalAmount;
    // Fallback: sum item retail totals when order-level snapshots missing
    const fallback = order.items.reduce((sum: number, item) => {
        const total =
            item.finalRetailTotalPrice ??
            item.retailTotalPrice ??
            item.initialRetailTotalPrice ??
            item.wholesaleTotalPrice ??
            item.totalPrice ??
            0;
        return sum + Number(total || 0);
    }, 0);

    const initial = initialRetail ?? fallback;
    const final = finalRetail ?? fallback;
    return { initial, final };
};

export const DistributorOrderDetailHeader = ({ order }: DistributorOrderDetailHeaderProps) => {
    const deliveryMeta =
        deliveryStatusMeta[order.deliveryStatus] ?? ({ label: order.deliveryStatus, color: "default" as const } as const);

    const getProductionMeta = () => {
        if (order.deliveryStatus === "CANCELLED" || order.deliveryStatus === "FAILED") return productionStatusMeta["CANCELLED"];
        if (order.deliveryStatus === "PARTIALLY_DELIVERED" && order.productionStatus !== "COMPLETED") return productionStatusMeta["PARTIALLY_COMPLETED"];
        if (order.deliveryStatus === "DELIVERED" && order.productionStatus) return productionStatusMeta["COMPLETED"];
        return order.productionStatus
            ? productionStatusMeta[order.productionStatus] ?? ({ label: order.productionStatus, color: "default" as const } as const)
            : null;
    };
    const productionMeta = getProductionMeta();
    const totals = calculateTotals(order);
    const sameAmount = Math.abs(totals.initial - totals.final) < 0.005;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper sx={{ borderRadius: 1, p: { xs: 3, md: 4 }, backgroundColor: "#fff", border: "1px solid rgba(148, 163, 184, 0.22)", boxShadow: "0px 24px 48px rgba(15, 23, 42, 0.08)" }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: 3 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1f2937" }}>
                            Order #{order.orderNumber}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 0.5 }}>
                            <Chip label={deliveryMeta.label} color={deliveryMeta.color} sx={{ fontWeight: 700, borderRadius: 2 }} />
                            {productionMeta && (
                                <Chip label={productionMeta.label} color={productionMeta.color} variant="outlined" sx={{ fontWeight: 600, borderRadius: 2 }} />
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ color: "#64748b", mt: 1.5 }}>
                            Placed on {new Date(order.createdAt).toLocaleString("en-US", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <InfoCard elevation={0}>
                        <Chip icon={<PersonRoundedIcon />} label="Customer" color="primary" sx={{ alignSelf: "flex-start", borderRadius: 2, fontWeight: 700 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1rem", md: "1.25rem" } }}>
                            {order.user ? `${order.user.name ?? ""} ${order.user.surname ?? ""}`.trim() || "Unnamed customer" : "Guest"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            {order.user?.email ?? "No email"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            {order.user?.companyName ? `Company: ${order.user.companyName}` : "Company not set"}
                        </Typography>
                    </InfoCard>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <InfoCard elevation={0}>
                        <Chip icon={<StorefrontRoundedIcon />} label="Delivery" color="secondary" sx={{ alignSelf: "flex-start", borderRadius: 2, fontWeight: 700 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            {order.user?.address ? "Delivery address" : "Address pending"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", minHeight: { xs: 32, md: 42 }, fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            {order.user?.address ?? "No delivery address provided"}
                        </Typography>
                        {order.deliveryNotes && (
                            <Typography variant="body2" sx={{ color: "#ef4444" }}>
                                Delivery note: {order.deliveryNotes}
                            </Typography>
                        )}
                        {order.deliveredByUser && (
                            <Typography variant="body2" sx={{ color: "#6366f1" }}>
                                Delivered by {order.deliveredByUser.name} {order.deliveredByUser.surname}
                                {order.deliveredAt ? ` · ${new Date(order.deliveredAt).toLocaleString("en-US")}` : ""}
                            </Typography>
                        )}
                    </InfoCard>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <InfoCard elevation={0}>
                        <Chip icon={<LocalShippingRoundedIcon />} label="Logistics" color="info" sx={{ alignSelf: "flex-start", borderRadius: 2, fontWeight: 700 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            Delivery status
                        </Typography>
                        <Chip label={deliveryMeta.label} color={deliveryMeta.color} size="small" sx={{ fontWeight: 700, borderRadius: 12, alignSelf: "flex-start" }} />
                        {productionMeta && (
                            <Chip label={productionMeta.label} color={productionMeta.color} size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: 12, alignSelf: "flex-start" }} />
                        )}
                        {order.notes && (
                            <Typography variant="body2" sx={{ color: "#f97316" }}>
                                Customer note: {order.notes}
                            </Typography>
                        )}
                    </InfoCard>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <InfoCard elevation={0}>
                        <Chip icon={<PaymentsRoundedIcon />} label="Invoice" color="success" sx={{ alignSelf: "flex-start", borderRadius: 2, fontWeight: 700 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            Total amount
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "#16a34a", fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                            {formatCurrency(totals.final)}
                        </Typography>
                        {!sameAmount && (
                            <Typography variant="body2" sx={{ color: "#94a3b8", textDecoration: "line-through" }}>
                                {formatCurrency(totals.initial)}
                            </Typography>
                        )}
                        {order.attachmentUrl && (
                            <Button component="a" href={order.attachmentUrl} target="_blank" rel="noopener noreferrer" variant="outlined" size="small" sx={{ alignSelf: "flex-start", borderRadius: 2, textTransform: "none" }}>
                                View attachment
                            </Button>
                        )}
                    </InfoCard>
                </Grid>
            </Grid>

            {order.notes && (
                <InfoCard elevation={0} sx={{ flexDirection: "row", alignItems: "flex-start", gap: 2 }}>
                    <NotesRoundedIcon color="warning" sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Customer note
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#475569" }}>
                            {order.notes}
                        </Typography>
                    </Box>
                </InfoCard>
            )}

            {!order.notes && <Divider sx={{ my: 1 }} />}
        </Box>
    );
};

