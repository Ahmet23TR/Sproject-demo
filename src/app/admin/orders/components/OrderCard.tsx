"use client";

import {
    Box,
    Typography,
    Avatar,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
} from "@mui/material";
import { Order } from "../../../../types/data";
import { useRouter } from "next/navigation";
import { calculateOrderItemPrices } from "../../../../utils/price";

// Bu bileşen, tek bir sipariş objesini prop olarak alır
interface OrderCardProps {
    order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
    const router = useRouter();

    // Fiyat formatlaması
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price);
    };

    // Status labels
    const deliveryStatusLabels: Record<string, string> = {
        READY_FOR_DELIVERY: "Ready for Delivery",
        DELIVERED: "Delivered",
        FAILED: "Delivery Failed",
        PARTIALLY_DELIVERED: "Partially Delivered",
        CANCELLED: "Cancelled",
        PENDING: "Delivery Pending",
    };
    const productionStatusLabels: Record<string, string> = {
        PENDING: "In Production",
        PARTIALLY_COMPLETED: "Partially Produced",
        COMPLETED: "Completed",
        CANCELLED: "Production Failed",
    };

    const getUnitDisplay = (unit?: string) => {
        switch (unit) {
            case "KG":
                return "kg";
            case "PIECE":
                return "pcs";
            case "TRAY":
                return "tray";
            default:
                return unit || "";
        }
    };

    // Delivery status: If any product is CANCELLED, delivery is considered FAILED
    const hasCancelledItem = order.items.every(
        (item) => item.productionStatus === "CANCELLED"
    );
    const effectiveDeliveryStatus = hasCancelledItem
        ? "CANCELLED"
        : order.deliveryStatus;

    // Function to navigate to order detail page when clicked
    const handleCardClick = () => {
        router.push(`/admin/orders/${order.id}`);
    };

    // debug log removed

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)",
                cursor: "pointer",
                transition: "box-shadow 0.15s, transform 0.15s",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 32px 0 rgba(39,174,96,0.12)",
                },
            }}
            onClick={handleCardClick}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                {/* Delivery status and reason */}
                <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700 }}>
                        {(order.user?.name?.[0] || "X").toUpperCase()}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                        <Typography
                            fontWeight={700}
                            noWrap
                            sx={{ color: "#1B1B1E" }}>
                            {order.user?.name} {order.user?.surname}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap>
                            {order.user?.companyName || order.user?.email}
                        </Typography>
                    </Box>
                    <Typography
                        variant="body2"
                        sx={{ color: "primary.main", fontWeight: 600 }}>
                        {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Chip
                        label={
                            deliveryStatusLabels[effectiveDeliveryStatus] ||
                            effectiveDeliveryStatus
                        }
                        color={
                            effectiveDeliveryStatus === "FAILED" ||
                                effectiveDeliveryStatus === "CANCELLED"
                                ? "error"
                                : effectiveDeliveryStatus === "DELIVERED"
                                    ? "success"
                                    : effectiveDeliveryStatus === "PARTIALLY_DELIVERED"
                                        ? "info"
                                        : "warning"
                        }
                        size="small"
                    />
                    {effectiveDeliveryStatus === "FAILED" &&
                        order.deliveryNotes && (
                            <Typography
                                variant="caption"
                                color="error"
                                sx={{ ml: 1 }}>
                                Reason: {order.deliveryNotes}
                            </Typography>
                        )}
                    <Typography variant="body2" color="text.primary" fontWeight={600} alignContent="right" sx={{ ml: "auto" }}>{order.orderNumber}</Typography>
                </Box>

                {order.notes && (
                    <Typography
                        variant="body2"
                        sx={{
                            my: 2,
                            p: 1.5,
                            bgcolor: "#F8F9FA",
                            borderRadius: 1,
                            border: "1px solid #DEE2E6",
                        }}>
                        <span
                            style={{ color: "primary.main", fontWeight: 600 }}>
                            Customer Note:
                        </span>{" "}
                        {order.notes}
                    </Typography>
                )}

                <Divider sx={{ my: 1 }} />

                <List dense disablePadding>
                    {order.items.slice(0, 3).map((item) => {
                        const selectedOptionsText = item.selectedOptions
                            ?.map((opt) => opt.optionItem.name)
                            .join(", ");
                        const { totalPrice } = calculateOrderItemPrices(item);
                        return (
                            <ListItem
                                key={item.id}
                                sx={{
                                    px: 0,
                                    py: 0.5,
                                    display: "flex",
                                    gap: 2,
                                    alignItems: "center",
                                }}>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            noWrap>
                                            {item.product?.name}
                                        </Typography>
                                    }
                                    secondary={
                                        selectedOptionsText
                                            ? `( ${selectedOptionsText} )`
                                            : null
                                    }
                                    secondaryTypographyProps={{
                                        color: "primary.main",
                                        variant: "caption",
                                        sx: { fontStyle: "italic" },
                                    }}
                                />
                                <Chip
                                    label={`x ${item.quantity}`}
                                    size="small"
                                />
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="success.main"
                                    sx={{
                                        bgcolor: "success.50",
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        minWidth: "fit-content",
                                        textAlign: "center",
                                    }}>
                                    {formatPrice(totalPrice)}
                                </Typography>
                                <Chip
                                    label={
                                        productionStatusLabels[
                                        item.productionStatus
                                        ] || item.productionStatus
                                    }
                                    color={
                                        item.productionStatus === "CANCELLED"
                                            ? "error"
                                            : item.productionStatus ===
                                                "COMPLETED"
                                                ? "success"
                                                : "warning"
                                    }
                                    size="small"
                                />
                                {item.productionStatus === "PARTIALLY_COMPLETED" && (
                                    <Typography
                                        variant="caption"
                                        color="warning.main"
                                        sx={{ ml: 1 }}>
                                        Produced: {item.producedQuantity ?? 0}{" "}
                                        {getUnitDisplay(item.product?.unit)}
                                    </Typography>
                                )}
                                {item.productionStatus === "CANCELLED" &&
                                    item.productionNotes && (
                                        <Typography
                                            variant="caption"
                                            color="error"
                                            sx={{ ml: 1 }}>
                                            Reason: {item.productionNotes}
                                        </Typography>
                                    )}
                                {item.productionStatus === "PARTIALLY_COMPLETED" && (
                                    <Typography
                                        variant="caption"
                                        color="warning.main"
                                        sx={{ ml: 1 }}>
                                        Reason: {item.productionNotes}
                                    </Typography>
                                )}
                            </ListItem>
                        );
                    })}
                    {order.items.length > 3 && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: "block",
                                textAlign: "right",
                                mt: 1,
                            }}>
                            ...and {order.items.length - 3} more products
                        </Typography>
                    )}
                </List>

                {/* Amounts Summary */}
                <Divider sx={{ my: 2 }} />
                    {(() => {
                    const fallback = order.items.reduce((sum: number, item) => {
                        const calc = calculateOrderItemPrices(item);
                        const total = item.wholesaleTotalPrice ?? calc.totalPrice;
                        return sum + Number(total || 0);
                    }, 0);
                    const initialAmount = order.initialWholesaleTotalAmount ?? fallback;
                    const finalAmount = order.finalWholesaleTotalAmount ?? fallback;
                    const same = Math.abs(initialAmount - finalAmount) < 0.005;
                    if (same) {
                        return (
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1" fontWeight={600} color="text.primary">Order Total:</Typography>
                                <Typography variant="h6" fontWeight={700} color="primary.main">{formatPrice(finalAmount)}</Typography>
                            </Box>
                        );
                    }
                    return (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">Original Amount</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>{formatPrice(initialAmount)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                                <Typography variant="body1" fontWeight={700} color="primary.main">Final Invoice</Typography>
                                <Typography variant="h6" fontWeight={700} color="primary.main">{formatPrice(finalAmount)}</Typography>
                            </Box>
                        </Box>
                    );
                })()}
            </CardContent>
        </Card>
    );
};
