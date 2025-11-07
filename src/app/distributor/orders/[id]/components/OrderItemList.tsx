"use client";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Order } from "@/types/data";

interface DistributorOrderItemListProps {
    items: Order["items"];
}

const TableShell = styled(TableContainer)(({ theme }) => ({
    borderRadius: 24,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    boxShadow: "0px 20px 40px rgba(15, 23, 42, 0.05)",
    backgroundColor: theme.palette.common.white,
}));

const headCellSx = {
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
    color: "#64748b",
    borderBottom: "1px solid rgba(148, 163, 184, 0.3)",
    py: 2.5,
};

const bodyCellSx = {
    borderBottomColor: "rgba(148,163,184,0.12)",
    fontSize: "0.95rem",
    color: "#1f2937",
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

export const DistributorOrderItemList = ({ items }: DistributorOrderItemListProps) => {
    const toNum = (value: unknown): number | undefined => {
        if (value === null || value === undefined) return undefined;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    };
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f2937", fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                Items
            </Typography>
            <TableShell sx={{ width: "100%" }}>
                <Table sx={{ width: "100%" }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "rgba(248, 250, 252, 0.96)" }}>
                            <TableCell sx={{ ...headCellSx }}>Product</TableCell>
                            <TableCell sx={{ ...headCellSx, display: { xs: "none", sm: "table-cell" } }}>Options</TableCell>
                            <TableCell sx={{ ...headCellSx, display: { xs: "none", md: "table-cell" } }}>Unit Price</TableCell>
                            <TableCell sx={headCellSx}>Qty</TableCell>
                            <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => {
                            const selectedOptionsText = item.selectedOptions
                                ?.map((opt) => opt.optionItem?.name)
                                .filter(Boolean)
                                .join(", ") || "—";

                            const unitPrice =
                                toNum(item.finalRetailUnitPrice) ??
                                toNum(item.retailUnitPrice) ??
                                toNum(item.initialRetailUnitPrice) ??
                                toNum(item.unitPrice) ??
                                ((toNum(item.finalRetailTotalPrice) ?? toNum(item.retailTotalPrice) ?? toNum(item.initialRetailTotalPrice) ?? toNum(item.totalPrice) ?? 0) / (item.quantity || 1));

                            const qty = item.quantity;
                            const produced = toNum(item.producedQuantity);
                            const delivered = toNum(item.deliveredQuantity);

                            // Initial price: original order price
                            const initialTotal = toNum(item.initialRetailTotalPrice) ??
                                toNum(item.retailTotalPrice) ??
                                toNum(item.totalPrice) ??
                                (unitPrice * qty);

                            // Final price: consider production/delivery status
                            const finalTotalRaw = toNum(item.finalRetailTotalPrice);
                            let finalTotal: number;

                            // Pre-calc statuses to decide if backend 0 should be ignored
                            const isCompleted = item.productionStatus === "COMPLETED";
                            const isPartiallyCompleted = item.productionStatus === "PARTIALLY_COMPLETED";
                            const isFailed = item.deliveryStatus === "FAILED" || item.productionStatus === "CANCELLED";

                            const backendFinalUsable = finalTotalRaw !== undefined && !(
                                finalTotalRaw === 0 && (
                                    isCompleted ||
                                    isPartiallyCompleted ||
                                    (typeof produced === "number" && produced > 0) ||
                                    (typeof delivered === "number" && delivered > 0)
                                )
                            );

                            if (backendFinalUsable) {
                                // Use backend provided final price if available and sensible
                                finalTotal = finalTotalRaw as number;
                            } else {
                                // Calculate based on delivered/produced quantity
                                // Prefer produced quantity, fallback to delivered quantity
                                // Use > 0 check to properly handle kısmi üretim
                                let effectiveQty: number | null = null;
                                if (produced !== undefined && produced > 0) {
                                    effectiveQty = produced;
                                } else if (delivered !== undefined && delivered > 0) {
                                    effectiveQty = delivered;
                                }

                                if (isFailed) {
                                    // Explicitly failed/cancelled: final = 0
                                    finalTotal = 0;
                                } else if (effectiveQty !== null && effectiveQty > 0) {
                                    // Has delivered/produced quantity: calculate based on that
                                    finalTotal = unitPrice * effectiveQty;
                                } else if (isCompleted) {
                                    // Completed but no quantity info: assume full production
                                    finalTotal = toNum(item.retailTotalPrice) ??
                                        toNum(item.totalPrice) ??
                                        (unitPrice * qty);
                                } else if (isPartiallyCompleted && effectiveQty === null) {
                                    // Partially completed but no quantity: use retailTotalPrice or fallback to initial
                                    finalTotal = toNum(item.retailTotalPrice) ??
                                        toNum(item.totalPrice) ??
                                        initialTotal;
                                } else {
                                    // Default (includes pending with no qty): show initial until qty available
                                    finalTotal = toNum(item.retailTotalPrice) ??
                                        toNum(item.totalPrice) ??
                                        initialTotal;
                                }
                            }

                            const different = initialTotal !== undefined && Math.round((finalTotal - initialTotal) * 100) !== 0;

                            return (
                                <TableRow key={item.id} hover>
                                    <TableCell sx={bodyCellSx}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                                            {item.product?.name ?? "Unnamed product"}
                                        </Typography>
                                        {/* Show options on mobile */}
                                        <Box sx={{ display: { xs: "block", sm: "none" }, mt: 0.5 }}>
                                            {selectedOptionsText !== "—" && (
                                                <Typography variant="caption" sx={{ color: "#475569", fontSize: "0.7rem" }}>
                                                    {selectedOptionsText}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, display: { xs: "none", sm: "table-cell" } }}>
                                        <Typography variant="body2" sx={{ color: "#475569", fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                                            {selectedOptionsText}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, display: { xs: "none", md: "table-cell" } }}>
                                        <Typography sx={{ fontSize: { md: "0.875rem" } }}>{formatCurrency(unitPrice)}</Typography>
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Typography sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>{qty}</Typography>
                                        {(() => {
                                            const showDelivered = typeof delivered === "number" && delivered > 0 && delivered < qty;
                                            const showProduced = typeof produced === "number" && produced > 0 && produced < qty && !showDelivered;
                                            const isNotProduced =
                                                !(typeof produced === "number" && produced > 0) &&
                                                !(typeof delivered === "number" && delivered > 0) &&
                                                item.productionStatus !== "COMPLETED" &&
                                                item.deliveryStatus !== "FAILED" &&
                                                item.deliveryStatus !== "PARTIAL";

                                            if (showDelivered) {
                                                return (
                                                    <Typography variant="caption" sx={{ display: "block", color: "#f97316", mt: 0.5, fontSize: "0.7rem" }}>
                                                        Delivered: {delivered}
                                                    </Typography>
                                                );
                                            }
                                            if (showProduced) {
                                                return (
                                                    <Typography variant="caption" sx={{ display: "block", color: "#d97706", mt: 0.5, fontSize: "0.7rem" }}>
                                                        Produced: {produced}
                                                    </Typography>
                                                );
                                            }
                                            if (isNotProduced) {
                                                return (
                                                    <Typography variant="caption" sx={{ display: "block", color: "#EF4444", mt: 0.5, fontSize: "0.7rem" }}>
                                                        Not produced
                                                    </Typography>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, textAlign: "right" }}>
                                        <Typography variant="body2" color="#1f2937" sx={{ fontWeight: 600, fontSize: { xs: "0.85rem", md: "0.95rem" }, textAlign: "right" }}>
                                            {formatCurrency(finalTotal)}
                                        </Typography>
                                        {different && (
                                            <Typography component="span" sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, ml: 1 }}>
                                                ({formatCurrency(initialTotal)})
                                            </Typography>
                                        )}
                                        {/* Show delivered quantity if partial */}
                                        {item.deliveryStatus === "PARTIAL" && typeof delivered === "number" && (
                                            <Typography variant="caption" sx={{ display: "block", color: "#f97316", mt: 0.5, fontSize: "0.7rem" }}>
                                                Delivered: {delivered} / {qty}
                                            </Typography>
                                        )}
                                        {/* Show unit price on mobile */}
                                        <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.65rem", display: { xs: "block", md: "none" }, mt: 0.5 }}>
                                            @{formatCurrency(unitPrice)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableShell>
        </Box>
    );
};
