"use client";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Typography,
    Box,
    styled,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { Order } from "../../../../types/data";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { OrderHistoryCard } from "./OrderHistoryCard";

interface OrderHistoryTableProps {
    orders: Order[];
    onReorder: (order: Order) => void;
}

// Styled components for better table appearance
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: theme.spacing(1),
    "& .MuiTable-root": {
        minWidth: 700,
    },
    // Mobile responsive
    [theme.breakpoints.down("md")]: {
        "& .MuiTable-root": {
            minWidth: 600,
        },
        "& .hide-on-mobile": {
            display: "none",
        },
    },
    [theme.breakpoints.down("sm")]: {
        "& .MuiTable-root": {
            minWidth: 500,
        },
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(2),
    "&.order-number": {
        fontWeight: 600,
        color: theme.palette.primary.main,
    },
    "&.numeric": {
        textAlign: "right",
    },
    "&.actions": {
        textAlign: "center",
        width: 120,
    },
}));

export const OrderHistoryTable = ({
    orders,
    onReorder,
}: OrderHistoryTableProps) => {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

    const handleRowClick = (orderId: string, event: React.MouseEvent) => {
        // Don't navigate if clicking on the reorder button
        if ((event.target as HTMLElement).closest("button")) {
            return;
        }
        router.push(`/client/order-history/${orderId}`);
    };

    const handleReorderClick = (event: React.MouseEvent, order: Order) => {
        event.stopPropagation();
        onReorder(order);
    };

    if (orders.length === 0) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={8}
                textAlign="center">
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No orders found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    You don&apos;t have any orders yet.
                </Typography>
            </Box>
        );
    }

    // Mobile card view
    if (isMobile) {
        return (
            <Box>
                {orders.map((order) => (
                    <OrderHistoryCard
                        key={order.id}
                        order={order}
                        onReorder={onReorder}
                    />
                ))}
            </Box>
        );
    }

    // Desktop table view
    return (
        <Paper elevation={0}>
            <StyledTableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}>
                                    Order #
                                </Typography>
                            </TableCell>
                            <TableCell className="hide-on-mobile">
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}>
                                    Date
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}>
                                    Status
                                </Typography>
                            </TableCell>
                            <TableCell
                                className="numeric hide-on-mobile"
                                align="right">
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}>
                                    Items
                                </Typography>
                            </TableCell>
                            <TableCell className="numeric" align="right">
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}>
                                    Total
                                </Typography>
                            </TableCell>
                            <TableCell className="actions" align="center">
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}>
                                    Actions
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <StyledTableRow
                                key={order.id}
                                onClick={(event) =>
                                    handleRowClick(order.id, event)
                                }>
                                <StyledTableCell className="order-number">
                                    {formatOrderNumber(order.orderNumber)}
                                </StyledTableCell>
                                <StyledTableCell className="hide-on-mobile">
                                    {formatDate(order.createdAt)}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {getUnifiedStatusChip(order)}
                                </StyledTableCell>
                                <StyledTableCell
                                    className="numeric hide-on-mobile"
                                    align="right">
                                    <Typography variant="body2">
                                        {getItemsCount(order)}{" "}
                                        {getItemsCount(order) === 1
                                            ? "item"
                                            : "items"}
                                    </Typography>
                                </StyledTableCell>
                                <StyledTableCell
                                    className="numeric"
                                    align="right">
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}>
                                        {formatPrice(
                                            order.finalRetailTotalAmount ??
                                                order.initialRetailTotalAmount ??
                                                0
                                        )}
                                    </Typography>
                                </StyledTableCell>
                                <StyledTableCell
                                    className="actions"
                                    align="center">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={(event) =>
                                            handleReorderClick(event, order)
                                        }
                                        sx={{
                                            minWidth: 80,
                                            borderColor: "secondary.main",
                                            color: "secondary.main",
                                            "&:hover": {
                                                borderColor: "secondary.dark",
                                                backgroundColor:
                                                    "secondary.main",
                                                color: "white",
                                            },
                                        }}>
                                        Reorder
                                    </Button>
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </StyledTableContainer>
        </Paper>
    );
};
