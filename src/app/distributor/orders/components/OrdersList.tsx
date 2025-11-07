"use client";
import { useState } from "react";
import { Box, Typography, Pagination, Tooltip } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import type { Order } from "@/types/data";

interface OrdersListProps {
    orders: Order[];
    onOrderClick?: (orderId: string) => void;
}

const ITEMS_PER_PAGE = 20;

const toNumber = (value: unknown): number | undefined => {
    if (value === null || value === undefined) {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

interface OrderCardProps {
    order: Order;
    index: number;
}

const OrderCard = ({ order, index }: OrderCardProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Box
            sx={{
                p: 3,
                borderBottom: "1px solid #E5E7EB",
                "&:hover": {
                    bgcolor: "#F9FAFB",
                },
                "&:last-child": {
                    borderBottom: "none",
                },
            }}
        >
            {/* Header Row */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                {/* Order Number & Customer */}
                <Box>
                    <Box
                        sx={{ display: "flex", alignItems: "baseline", gap: 1 }}
                    >
                        <Typography
                            sx={{
                                color: "#9CA3AF",
                                fontSize: "13px",
                                fontWeight: 600,
                            }}
                        >
                            #{index + 1}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 600,
                                color: "#111827",
                                fontSize: "18px",
                            }}
                        >
                            Order #{order.orderNumber}
                        </Typography>
                    </Box>
                    {order.user && (
                        <Typography
                            sx={{
                                color: "#6B7280",
                                fontSize: "14px",
                                mt: 0.5,
                            }}
                        >
                            {order.user.name} {order.user.surname} •{" "}
                            {order.user.companyName}
                        </Typography>
                    )}
                </Box>

                {/* Amount: show final, and if different show (initial) */}
                <Box sx={{ textAlign: "right" }}>
                    {(() => {
                        const initialRaw =
                            order.initialRetailTotalAmount ??
                            order.initialTotalAmount;
                        const finalRaw =
                            order.finalRetailTotalAmount ??
                            order.finalTotalAmount ??
                            order.totalAmount ??
                            initialRaw ??
                            0;

                        const initial = initialRaw ?? finalRaw ?? 0;
                        const final = finalRaw ?? 0;
                        const different = Math.round((final - initial) * 100) !== 0;

                        return (
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontWeight: 700,
                                    color: "#C9A227",
                                    fontSize: "18px",
                                }}
                            >
                                {formatCurrency(final)}
                                {different && (
                                    <Typography
                                        component="span"
                                        sx={{
                                            color: "#6B7280",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            ml: 1,
                                        }}
                                    >
                                        ( {formatCurrency(initial)} )
                                    </Typography>
                                )}
                            </Typography>
                        );
                    })()}
                </Box>
            </Box>

            {/* Order Items */}
            <Box
                sx={{
                    bgcolor: "#F9FAFB",
                    borderRadius: 2,
                    p: 2,
                }}
            >
                {order.items.map((item, itemIndex) => (
                    <Box
                        key={item.id}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            py: 1,
                            borderBottom:
                                itemIndex < order.items.length - 1
                                    ? "1px solid #E5E7EB"
                                    : "none",
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                <Typography
                                    sx={{
                                        color: "#111827",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {item.product?.name || "Unknown Product"}
                                </Typography>
                                {(() => {
                                    const produced = item.producedQuantity ?? undefined;
                                    const delivered = item.deliveredQuantity ?? undefined;
                                    const qty = item.quantity ?? 0;
                                    const deliveryStatus = item.deliveryStatus ?? undefined;
                                    const isPartial =
                                        deliveryStatus === "PARTIAL" ||
                                        (typeof delivered === "number" && delivered > 0 && delivered < qty) ||
                                        (typeof produced === "number" && produced > 0 && produced < qty);
                                    // Red icon: show only for explicit failure or clearly not produced (no produced qty and not delivered/partial)
                                    const isFailed = deliveryStatus === "FAILED";
                                    const isClearlyNotProduced =
                                        typeof produced === "number" && produced === 0 &&
                                        deliveryStatus !== "DELIVERED" && deliveryStatus !== "PARTIAL";
                                    const isNotProduced = isFailed || isClearlyNotProduced;

                                    if (!(isPartial || isNotProduced)) return null;

                                    return (
                                        <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                                            {isPartial && (
                                                <Tooltip title={`Produced: ${(produced ?? delivered ?? 0)} / ${qty}`} arrow>
                                                    <WarningAmberRoundedIcon sx={{ fontSize: 16, color: "#D97706" }} />
                                                </Tooltip>
                                            )}
                                            {isNotProduced && (
                                                <Tooltip title={isFailed ? "Undelivered" : "Not produced"} arrow>
                                                    <ErrorOutlineRoundedIcon sx={{ fontSize: 16, color: "#DC2626", ml: isPartial ? 0.75 : 0 }} />
                                                </Tooltip>
                                            )}
                                        </Box>
                                    );
                                })()}
                            </Box>
                            {(() => {
                                const produced = (item.producedQuantity as number | undefined) ?? undefined;
                                const delivered = item.deliveredQuantity ?? undefined;
                                const qty = item.quantity ?? 0;
                                const deliveryStatus = item.deliveryStatus ?? undefined;
                                const isPartial =
                                    deliveryStatus === "PARTIAL" ||
                                    (typeof delivered === "number" && delivered > 0 && delivered < qty) ||
                                    (typeof produced === "number" && produced > 0 && produced < qty);
                                const isNotProduced =
                                    deliveryStatus === "FAILED" ||
                                    (typeof delivered === "number" && delivered === 0) ||
                                    (typeof produced === "number" && produced === 0) ||
                                    item.productionStatus === "PENDING";

                                // Get unit price for calculations
                                const unitPrice =
                                    toNumber(item.finalRetailUnitPrice) ??
                                    toNumber(item.retailUnitPrice) ??
                                    toNumber(item.initialRetailUnitPrice) ??
                                    (toNumber(item.finalRetailTotalPrice) ??
                                        toNumber(item.retailTotalPrice) ??
                                        toNumber(item.totalPrice) ??
                                        0) /
                                        (qty || 1);

                            // Initial price: original order price
                                const itemInitialRaw = toNumber(item.initialRetailTotalPrice);
                                const itemInitial = itemInitialRaw ??
                                    toNumber(item.retailTotalPrice) ??
                                    toNumber(item.totalPrice) ??
                                    (unitPrice * qty);

                            // Final price: consider production/delivery status
                                const itemFinalRaw = toNumber(item.finalRetailTotalPrice);
                                let itemFinal: number;

                                if (itemFinalRaw !== undefined) {
                                    // Use backend provided final price if available
                                    itemFinal = itemFinalRaw;
                                } else {
                                    // Check production status first
                                    const isCompleted = item.productionStatus === "COMPLETED";
                                    const isPartiallyCompleted = item.productionStatus === "PARTIALLY_COMPLETED";
                                    const isFailed = item.deliveryStatus === "FAILED" || item.productionStatus === "CANCELLED";
                                    const isPending = item.productionStatus === "PENDING";

                                    // Calculate based on delivered/produced quantity
                                    // Prefer delivered quantity, fallback to produced quantity
                                    // Use > 0 check to properly handle kısmi üretim
                                    let effectiveQty: number | null = null;
                                    if (delivered !== undefined && delivered > 0) {
                                        effectiveQty = delivered;
                                    } else if (produced !== undefined && produced > 0) {
                                        effectiveQty = produced;
                                    }

                                    if (isFailed || (isPending && effectiveQty === null)) {
                                        // Explicitly failed or pending with no production: final = 0
                                        itemFinal = 0;
                                    } else if (effectiveQty !== null && effectiveQty > 0) {
                                        // Has delivered/produced quantity: calculate based on that
                                        itemFinal = unitPrice * effectiveQty;
                                    } else if (isCompleted) {
                                        // Completed but no quantity info: assume full production
                                        itemFinal = toNumber(item.retailTotalPrice) ??
                                            toNumber(item.totalPrice) ??
                                            (unitPrice * qty);
                                    } else if (isPartiallyCompleted && effectiveQty === null) {
                                        // Partially completed but no quantity: use retailTotalPrice or fallback to initial
                                        itemFinal = toNumber(item.retailTotalPrice) ??
                                            toNumber(item.totalPrice) ??
                                            itemInitial;
                                    } else {
                                        // Default: use retailTotalPrice or fallback to calculated initial
                                        itemFinal = toNumber(item.retailTotalPrice) ??
                                            toNumber(item.totalPrice) ??
                                            itemInitial;
                                    }
                                }

                                const delta = itemFinal - itemInitial;
                                const different = Math.round(delta * 100) !== 0;

                                if (!(isPartial || isNotProduced) || !different) return null;

                            })()}
                            {item.selectedOptions &&
                                item.selectedOptions.length > 0 && (
                                    <Typography
                                        sx={{
                                            color: "#6B7280",
                                            fontSize: "12px",
                                            mt: 0.25,
                                        }}
                                    >
                                        {item.selectedOptions
                                            .map(
                                                (opt) =>
                                                    opt.optionItem?.name ||
                                                    "Unknown"
                                            )
                                            .join(", ")}
                                    </Typography>
                                )}
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 2,
                                minWidth: "150px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#6B7280",
                                    fontSize: "13px",
                                }}
                            >
                                {item.retailUnitPrice} × {item.quantity}
                            </Typography>
                            {(() => {
                                const unitPrice =
                                    toNumber(item.finalRetailUnitPrice) ??
                                    toNumber(item.retailUnitPrice) ??
                                    toNumber(item.initialRetailUnitPrice) ??
                                    (toNumber(item.finalRetailTotalPrice) ??
                                        toNumber(item.retailTotalPrice) ??
                                        toNumber(item.totalPrice) ??
                                        0) /
                                        (item.quantity || 1);

                                // Get quantities
                                const qty = item.quantity ?? 0;
                                const produced = toNumber(item.producedQuantity) ?? undefined;
                                const delivered = toNumber(item.deliveredQuantity) ?? undefined;

                                // Initial price: original order price
                                const itemInitialRaw = toNumber(item.initialRetailTotalPrice);
                                const itemInitial = itemInitialRaw ??
                                    toNumber(item.retailTotalPrice) ??
                                    toNumber(item.totalPrice) ??
                                    (unitPrice * qty);

                                // Final price: consider production/delivery status
                                const itemFinalRaw = toNumber(item.finalRetailTotalPrice);
                                let itemFinal: number;

                                if (itemFinalRaw !== undefined) {
                                    // Use backend provided final price if available
                                    itemFinal = itemFinalRaw;
                                } else {
                                    // Check production status first
                                    const itemDeliveryStatus = item.deliveryStatus ?? undefined;
                                    const isCompleted = item.productionStatus === "COMPLETED";
                                    const isPartiallyCompleted = item.productionStatus === "PARTIALLY_COMPLETED";
                                    const isFailed = itemDeliveryStatus === "FAILED" || item.productionStatus === "CANCELLED";
                                    const isPending = item.productionStatus === "PENDING";

                                    // Calculate based on delivered/produced quantity
                                    // Prefer delivered quantity, fallback to produced quantity
                                    // Use > 0 check to properly handle kısmi üretim
                                    let effectiveQty: number | null = null;
                                    if (delivered !== undefined && delivered > 0) {
                                        effectiveQty = delivered;
                                    } else if (produced !== undefined && produced > 0) {
                                        effectiveQty = produced;
                                    }

                                    if (isFailed || (isPending && effectiveQty === null)) {
                                        // Explicitly failed or pending with no production: final = 0
                                        itemFinal = 0;
                                    } else if (effectiveQty !== null && effectiveQty > 0) {
                                        // Has delivered/produced quantity: calculate based on that
                                        itemFinal = unitPrice * effectiveQty;
                                    } else if (isCompleted) {
                                        // Completed but no quantity info: assume full production
                                        itemFinal = toNumber(item.retailTotalPrice) ??
                                            toNumber(item.totalPrice) ??
                                            (unitPrice * qty);
                                    } else if (isPartiallyCompleted && effectiveQty === null) {
                                        // Partially completed but no quantity: use retailTotalPrice or fallback to initial
                                        itemFinal = toNumber(item.retailTotalPrice) ??
                                            toNumber(item.totalPrice) ??
                                            itemInitial;
                                    } else {
                                        // Default: use retailTotalPrice or fallback to calculated initial
                                        itemFinal = toNumber(item.retailTotalPrice) ??
                                            toNumber(item.totalPrice) ??
                                            itemInitial;
                                    }
                                }

                                const itemDifferent = Math.round((itemFinal - itemInitial) * 100) !== 0;
                                return (
                                    <Typography
                                        sx={{
                                            color: "#111827",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {formatCurrency(itemFinal)}
                                        {itemDifferent && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: "#6B7280",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    ml: 1,
                                                }}
                                            >
                                                ( {formatCurrency(itemInitial)} )
                                            </Typography>
                                        )}
                                    </Typography>
                                );
                            })()}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Notes */}
            {order.notes && (
                <Box sx={{ mt: 2 }}>
                    <Typography
                        sx={{
                            color: "#6B7280",
                            fontSize: "13px",
                            fontStyle: "italic",
                        }}
                    >
                        Note: {order.notes}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export const OrdersList = ({ orders, onOrderClick }: OrdersListProps) => {
    const [currentPage, setCurrentPage] = useState(1);

    if (orders.length === 0) {
        return (
            <Box
                sx={{
                    p: 8,
                    textAlign: "center",
                    border: "2px dashed #E5E7EB",
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        color: "#9CA3AF",
                        fontSize: { xs: "16px", sm: "18px" },
                        fontWeight: 500,
                    }}
                >
                    No orders found for this date
                </Typography>
            </Box>
        );
    }

    // Calculate pagination
    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentOrders = orders.slice(startIndex, endIndex);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setCurrentPage(value);
        // Scroll to top of the list
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <Box>
            <Box
                sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2.5,
                        borderBottom: "1px solid #E5E7EB",
                        bgcolor: "#F9FAFB",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 600,
                            color: "#111827",
                            fontSize: { xs: "18px", sm: "20px" },
                        }}
                    >
                        Orders ({orders.length})
                    </Typography>
                    {totalPages > 1 && (
                        <Typography
                            sx={{
                                color: "#6B7280",
                                fontSize: "14px",
                            }}
                        >
                            Page {currentPage} of {totalPages}
                        </Typography>
                    )}
                </Box>

                {/* Orders List */}
                {currentOrders.map((order, index) => (
                    <Box
                        key={order.id}
                        onClick={() => onOrderClick?.(order.id)}
                        sx={{ cursor: onOrderClick ? "pointer" : "default" }}
                    >
                        <OrderCard
                            order={order}
                            index={startIndex + index}
                        />
                    </Box>
                ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                    }}
                >
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        sx={{
                            "& .MuiPaginationItem-root": {
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 600,
                            },
                            "& .Mui-selected": {
                                bgcolor: "#C9A227 !important",
                                color: "#FFFFFF",
                                "&:hover": {
                                    bgcolor: "#B89020 !important",
                                },
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};
