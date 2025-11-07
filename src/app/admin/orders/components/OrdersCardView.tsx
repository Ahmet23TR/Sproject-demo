"use client";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    Divider,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import { Order } from "../../../../types/data";

interface OrdersCardViewProps {
    orders: Order[];
    onView: (orderId: string) => void;
}

const deliveryStatusCopy: Record<
    string,
    {
        label: string;
        color: "default" | "primary" | "success" | "error" | "info" | "warning";
    }
> = {
    READY_FOR_DELIVERY: { label: "Ready", color: "info" },
    DELIVERED: { label: "Delivered", color: "success" },
    FAILED: { label: "Failed", color: "error" },
    CANCELLED: { label: "Cancelled", color: "error" },
    PENDING: { label: "Pending", color: "warning" },
    PARTIALLY_DELIVERED: { label: "Partial", color: "info" },
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

const calculateTotals = (order: Order) => {
    const fallback = order.items.reduce((sum: number, item) => {
        const unit = item.wholesaleUnitPrice ?? item.unitPrice ?? 0;
        const total = item.wholesaleTotalPrice ?? item.totalPrice ?? unit * (item.quantity ?? 0);
        return sum + Number(total || 0);
    }, 0);
    const initial = order.initialWholesaleTotalAmount ?? fallback;
    const final = order.finalWholesaleTotalAmount ?? fallback;
    return { initial, final };
};

export const OrdersCardView = ({ orders, onView }: OrdersCardViewProps) => {
    if (orders.length === 0) {
        return (
            <Box
                sx={{
                    textAlign: "center",
                    py: 8,
                    px: 2,
                }}>
                <Typography variant="body1" color="text.secondary">
                    No orders found matching your filters
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your search or filter criteria
                </Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            {orders.map((order) => {
                const totals = calculateTotals(order);
                const deliveryMeta = deliveryStatusCopy[order.deliveryStatus] ?? {
                    label: order.deliveryStatus,
                    color: "default" as const,
                };

                const customerName = order.user
                    ? `${order.user.name ?? ""} ${order.user.surname ?? ""}`.trim() ||
                    order.user.email
                    : "—";

                const orderDate = new Date(order.createdAt).toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }
                );

                return (
                    <Card
                        key={order.id}
                        onClick={() => onView(order.id)}
                        sx={{
                            cursor: "pointer",
                            borderRadius: 2,
                            border: "1px solid rgba(148, 163, 184, 0.22)",
                            boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.04)",
                            transition: "all 0.2s",
                            "&:hover": {
                                boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.08)",
                                transform: "translateY(-2px)",
                            },
                        }}>
                        <CardContent sx={{ p: 2 }}>
                            {/* Header with status */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 2,
                                }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 600,
                                            color: "#1f2937",
                                            mb: 0.5,
                                        }}>
                                        {customerName}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: "#6b7280" }}>
                                        #{order.orderNumber}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={deliveryMeta.label}
                                    color={deliveryMeta.color}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        borderRadius: 12,
                                        fontSize: "0.7rem",
                                    }}
                                />
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Details */}
                            <Stack spacing={1}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}>
                                    <PersonRoundedIcon
                                        sx={{ fontSize: 16, color: "#6b7280" }}
                                    />
                                    <Typography variant="body2" sx={{ color: "#4b5563" }}>
                                        {order.user?.companyName || "—"}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}>
                                    <CalendarTodayRoundedIcon
                                        sx={{ fontSize: 16, color: "#6b7280" }}
                                    />
                                    <Typography variant="body2" sx={{ color: "#4b5563" }}>
                                        {orderDate}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}>
                                    <ReceiptRoundedIcon
                                        sx={{ fontSize: 16, color: "#6b7280" }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#4b5563",
                                            fontWeight: 600,
                                        }}>
                                        {formatCurrency(totals.final)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                );
            })}
        </Stack>
    );
};
