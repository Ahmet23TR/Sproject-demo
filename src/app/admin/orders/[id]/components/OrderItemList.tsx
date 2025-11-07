"use client";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Order } from "../../../../../types/data";
import { calculateOrderItemPrices } from "../../../../../utils/price";

interface OrderItemListProps {
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

const productionStatusCopy: Record<
    string,
    {
        label: string;
        color: "default" | "primary" | "success" | "error" | "info" | "warning";
    }
> = {
    COMPLETED: { label: "Completed", color: "success" },
    PENDING: { label: "In production", color: "warning" },
    PARTIALLY_COMPLETED: { label: "Partial", color: "info" },
    CANCELLED: { label: "Failed", color: "error" },
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

const getUnitDisplay = (unit?: string) => {
    switch (unit) {
        case "KG":
            return "kg";
        case "PIECE":
            return "pcs";
        case "TRAY":
            return "tray";
        default:
            return unit ?? "";
    }
};

export const OrderItemList = ({ items }: OrderItemListProps) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f2937", fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                Items
            </Typography>
            <TableShell>
                <Table sx={{ minWidth: { xs: "100%", md: 960 } }}>
                    <TableHead>
                        <TableRow
                            sx={{
                                backgroundColor: "rgba(248, 250, 252, 0.96)",
                            }}>
                            <TableCell sx={{ ...headCellSx, width: { xs: "40%", md: "28%" } }}>
                                Product
                            </TableCell>
                            <TableCell sx={{ ...headCellSx, width: "16%", display: { xs: "none", sm: "table-cell" } }}>
                                Options
                            </TableCell>
                            <TableCell sx={{ ...headCellSx, width: "10%", display: { xs: "none", md: "table-cell" } }}>
                                Unit Price
                            </TableCell>
                            <TableCell sx={{ ...headCellSx, width: { xs: "20%", md: "8%" } }}>
                                Qty
                            </TableCell>
                            <TableCell sx={{ ...headCellSx, width: { xs: "30%", md: "10%" } }}>
                                Total
                            </TableCell>
                            <TableCell sx={{ ...headCellSx, width: "14%", display: { xs: "none", lg: "table-cell" } }}>
                                Producer
                            </TableCell>
                            <TableCell sx={{ ...headCellSx, width: { xs: "10%", md: "14%" } }}>
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => {
                            const selectedOptionsText =
                                item.selectedOptions
                                    ?.map((opt) => opt.optionItem.name)
                                    .join(", ") ?? "—";
                            // Prefer wholesale snapshots for admin; fallback to legacy calculator
                            const fallback = calculateOrderItemPrices(item);
                            const unitPrice = item.wholesaleUnitPrice ?? fallback.unitPrice;
                            const totalPrice = item.wholesaleTotalPrice ?? fallback.totalPrice;
                            const productionMeta = productionStatusCopy[
                                item.productionStatus
                            ] ?? {
                                label: item.productionStatus,
                                color: "default" as const,
                            };
                            return (
                                <TableRow key={item.id} hover>
                                    <TableCell sx={bodyCellSx}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ fontWeight: 600, fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                                            {item.product?.name ??
                                                "Unnamed product"}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#94a3b8", fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
                                            Unit:{" "}
                                            {getUnitDisplay(item.product?.unit)}
                                        </Typography>
                                        {/* Show options on mobile */}
                                        <Box sx={{ display: { xs: "block", sm: "none" }, mt: 0.5 }}>
                                            {selectedOptionsText !== "—" && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "#475569", fontSize: "0.7rem" }}>
                                                    {selectedOptionsText}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, display: { xs: "none", sm: "table-cell" } }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#475569", fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                                            {selectedOptionsText}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, display: { xs: "none", md: "table-cell" } }}>
                                        <Typography sx={{ fontSize: { md: "0.875rem" } }}>
                                            {formatCurrency(unitPrice)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Typography sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                                            {item.quantity}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Typography
                                            variant="body2"
                                            color="#1f2937"
                                            sx={{ fontWeight: 600, fontSize: { xs: "0.85rem", md: "0.95rem" } }}>
                                            {formatCurrency(totalPrice)}
                                        </Typography>
                                        {/* Show unit price on mobile */}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#94a3b8",
                                                fontSize: "0.65rem",
                                                display: { xs: "block", md: "none" }
                                            }}>
                                            @{formatCurrency(unitPrice)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, display: { xs: "none", lg: "table-cell" } }}>
                                        {item.processedByUser ? (
                                            <Box>
                                                <Typography variant="body2">
                                                    {item.processedByUser.name}{" "}
                                                    {
                                                        item.processedByUser
                                                            .surname
                                                    }
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "#94a3b8",
                                                    fontStyle: "italic",
                                                }}>
                                                Not assigned
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Chip
                                            label={productionMeta.label}
                                            color={productionMeta.color}
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                borderRadius: 12,
                                                fontSize: { xs: "0.65rem", md: "0.75rem" },
                                                height: { xs: 20, md: 24 },
                                            }}
                                        />
                                        {item.productionStatus ===
                                            "PARTIALLY_COMPLETED" &&
                                            item.producedQuantity !==
                                            undefined && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: "block",
                                                        color: "#f97316",
                                                        mt: 0.75,
                                                        fontSize: { xs: "0.65rem", md: "0.75rem" },
                                                    }}>
                                                    Produced:{" "}
                                                    {item.producedQuantity}{" "}
                                                    {getUnitDisplay(
                                                        item.product?.unit
                                                    )}
                                                </Typography>
                                            )}
                                        {item.productionNotes && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: "block",
                                                    color: "#ef4444",
                                                    mt: 0.5,
                                                    fontSize: { xs: "0.65rem", md: "0.75rem" },
                                                }}>
                                                Note: {item.productionNotes}
                                            </Typography>
                                        )}
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
