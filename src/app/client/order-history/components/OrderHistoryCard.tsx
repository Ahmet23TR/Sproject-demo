"use client";
import {
    Card,
    CardContent,
    CardActions,
    Box,
    Typography,
    Chip,
    Button,
    Divider,
    styled,
} from "@mui/material";
import { Order } from "../../../../types/data";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface OrderHistoryCardProps {
    order: Order;
    onReorder: (order: Order) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    border: `1px solid ${theme.palette.divider}`,
    "&:hover": {
        boxShadow: theme.shadows[4],
        transform: "translateY(-2px)",
    },
}));

const CardHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
}));

const DetailRow = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    "&:last-child": {
        marginBottom: 0,
    },
}));

export const OrderHistoryCard = ({
    order,
    onReorder,
}: OrderHistoryCardProps) => {
    const router = useRouter();

    const formatOrderNumber = (orderNumber: number) => {
        return `#ORD-${orderNumber.toString().padStart(6, "0")}`;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy");
        } catch {
            return dateString;
        }
    };

    const formatPrice = (price: number | null | undefined) => {
        if (price === null || price === undefined) {
            return "AED 0.00";
        }
        return new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    const getItemsCount = (order: Order) => {
        const uniqueProducts = new Set(
            order.items.map((item) => item.product?.id)
        );
        return uniqueProducts.size;
    };

    const getUnifiedStatusChip = (order: Order) => {
        // Check for various failure conditions
        const hasCancelledItems = order.items.some(
            (item) => item.productionStatus === "CANCELLED"
        );
        const hasPartialItems = order.items.some(
            (item) => item.productionStatus === "PARTIALLY_COMPLETED"
        );
        const isPartiallyDelivered =
            order.deliveryStatus === "PARTIALLY_DELIVERED";
        const isDeliveryFailed = order.deliveryStatus === "FAILED";
        const isCancelled = order.deliveryStatus === "CANCELLED";
        const isCompleted = order.deliveryStatus === "DELIVERED";

        let label: string;
        let color: "success" | "warning" | "error" | "info" | "default";

        if (isCompleted) {
            label = "Delivered";
            color = "success";
        } else if (isDeliveryFailed) {
            label = "Failed";
            color = "error";
        } else if (isCancelled) {
            label = "Cancelled";
            color = "error";
        } else if (isPartiallyDelivered || hasPartialItems) {
            label = "Partial";
            color = "warning";
        } else if (hasCancelledItems) {
            label = "Issues";
            color = "warning";
        } else {
            label = "Pending";
            color = "info";
        }

        return (
            <Chip label={label} color={color} size="small" variant="outlined" />
        );
    };

    const handleCardClick = (event: React.MouseEvent) => {
        // Don't navigate if clicking on the reorder button
        if ((event.target as HTMLElement).closest("button")) {
            return;
        }
        router.push(`/client/order-history/${order.id}`);
    };

    const handleReorderClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        onReorder(order);
    };

    return (
        <StyledCard onClick={handleCardClick}>
            <CardContent>
                <CardHeader>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                        {formatOrderNumber(order.orderNumber)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {formatDate(order.createdAt)}
                    </Typography>
                </CardHeader>

                <Divider sx={{ mb: 2 }} />

                <Box>
                    <DetailRow>
                        <Typography variant="body2" color="text.secondary">
                            Status:
                        </Typography>
                        {getUnifiedStatusChip(order)}
                    </DetailRow>

                    <DetailRow>
                        <Typography variant="body2" color="text.secondary">
                            Items:
                        </Typography>
                        <Typography variant="body2">
                            {getItemsCount(order)}{" "}
                            {getItemsCount(order) === 1 ? "item" : "items"}
                        </Typography>
                    </DetailRow>

                    <DetailRow>
                        <Typography variant="body2" color="text.secondary">
                            Total:
                        </Typography>
                        <Typography
                            variant="body1"
                            fontWeight={700}
                            color="text.primary">
                            {formatPrice(
                                order.finalRetailTotalAmount ??
                                    order.initialRetailTotalAmount ??
                                    0
                            )}
                        </Typography>
                    </DetailRow>
                </Box>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={handleReorderClick}
                    sx={{
                        height: 44,
                        fontWeight: 600,
                        borderColor: "secondary.main",
                        color: "secondary.main",
                        "&:hover": {
                            borderColor: "secondary.dark",
                            backgroundColor: "secondary.main",
                            color: "white",
                        },
                    }}>
                    Reorder
                </Button>
            </CardActions>
        </StyledCard>
    );
};
