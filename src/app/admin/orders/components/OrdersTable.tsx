"use client";
import { useMemo, useState } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Button,
    TextField,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    Divider,
    Popover,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowDropUpRoundedIcon from "@mui/icons-material/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import { Order } from "../../../../types/data";
import { DatePickerField } from "../../../../components/DatePickerField";

type SortBy = "createdAt" | "orderNumber" | "totalAmount" | "customerName";
type SortOrder = "asc" | "desc";
type DateFilterKey =
    | "ALL"
    | "TODAY"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "THIS_YEAR"
    | "LAST_YEAR"
    | "CUSTOM";

interface OrdersTableProps {
    orders: Order[];
    onView: (orderId: string) => void;
    // Integrated toolbar props
    statusOptions: Array<{ label: string; value: string }>;
    statusValue: string;
    onStatusChange: (value: string) => void;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    // Filter popover inputs
    dateValue: DateFilterKey; // e.g., 'ALL' | 'CUSTOM' | 'THIS_WEEK'
    onDateChange: (key: DateFilterKey) => void;
    onCustomDateRange: (start: Date, end: Date) => void;
    startDateStr?: string;
    endDateStr?: string;
    minAmount?: number | null;
    maxAmount?: number | null;
    onAmountRangeChange: (min: number | null, max: number | null) => void;
    // Sorting state
    sortBy: SortBy;
    sortOrder: SortOrder;
    onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
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

export const OrdersTable = ({
    orders,
    onView,
    statusOptions,
    statusValue,
    onStatusChange,
    searchQuery,
    onSearchChange,
    onDateChange,
    onCustomDateRange,
    startDateStr = "",
    endDateStr = "",
    minAmount = null,
    maxAmount = null,
    onAmountRangeChange,
    sortBy,
    sortOrder,
    onSortChange,
}: OrdersTableProps) => {
    const totalsMap = useMemo(() => {
        const map = new Map<string, { initial: number; final: number }>();
        orders.forEach((order) => {
            map.set(order.id, calculateTotals(order));
        });
        return map;
    }, [orders]);

    // Filter popover state
    const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
    const [minInput, setMinInput] = useState<string>(
        minAmount != null ? String(minAmount) : ""
    );
    const [maxInput, setMaxInput] = useState<string>(
        maxAmount != null ? String(maxAmount) : ""
    );
    const [startInput, setStartInput] = useState<string>(startDateStr ?? "");
    const [endInput, setEndInput] = useState<string>(endDateStr ?? "");

    const handleOpenFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
        setFilterAnchor(e.currentTarget);
        setMinInput(minAmount != null ? String(minAmount) : "");
        setMaxInput(maxAmount != null ? String(maxAmount) : "");
        setStartInput(startDateStr || "");
        setEndInput(endDateStr || "");
    };
    const handleCloseFilter = () => setFilterAnchor(null);

    const applyFilter = () => {
        const min =
            minInput !== "" && !isNaN(Number(minInput))
                ? Number(minInput)
                : null;
        const max =
            maxInput !== "" && !isNaN(Number(maxInput))
                ? Number(maxInput)
                : null;
        onAmountRangeChange(min, max);

        if (startInput && endInput) {
            const start = new Date(startInput);
            const end = new Date(endInput);

            // Validate date range: swap if start > end
            if (start > end) {
                onCustomDateRange(end, start);
            } else {
                onCustomDateRange(start, end);
            }
        } else if (!startInput && !endInput) {
            onDateChange("ALL");
        }
        handleCloseFilter();
    };

    const resetFilter = () => {
        setMinInput("");
        setMaxInput("");
        setStartInput("");
        setEndInput("");
        // Apply immediate clear
        onAmountRangeChange(null, null);
        onDateChange("ALL");
    };

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                borderRadius: 2,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                overflow: "hidden",
                boxShadow: "0px 20px 36px rgba(15, 23, 42, 0.05)",
            }}>
            {/* Integrated toolbar inside the same container */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    alignItems: { xs: "stretch", md: "center" },
                    justifyContent: "space-between",
                    px: 2,
                    pt: 2,
                    pb: 1,
                    backgroundColor: "#f9fafb",
                    mb: 1,
                }}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1f2937", mb: { xs: 1, md: 0 } }}>
                    Customer Orders
                </Typography>
                <Box sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    alignItems: "center",
                    width: { xs: "100%", md: "auto" }
                }}>
                    <TextField
                        size="small"
                        placeholder="Search"
                        value={searchQuery ?? ""}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 240 } }}
                    />
                    <FormControl size="small" sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 180 } }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusValue}
                            onChange={(e) =>
                                onStatusChange(e.target.value as string)
                            }
                            label="Status"
                            IconComponent={KeyboardArrowDownIcon}
                            sx={{ borderRadius: 2 }}>
                            {statusOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListRoundedIcon />}
                        onClick={handleOpenFilter}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            width: { xs: "100%", sm: "auto" }
                        }}>
                        Filter
                    </Button>
                </Box>
            </Box>
            <Popover
                open={Boolean(filterAnchor)}
                anchorEl={filterAnchor}
                onClose={handleCloseFilter}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{ sx: { p: 2, width: 340, borderRadius: 2 } }}>
                <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#374151" }}>
                    Filter
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusValue}
                        label="Status"
                        onChange={(e) =>
                            onStatusChange(e.target.value as string)
                        }
                        IconComponent={KeyboardArrowDownIcon}>
                        {statusOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                    <TextField
                        label="Min"
                        size="small"
                        type="number"
                        value={minInput}
                        onChange={(e) => setMinInput(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    AED
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                    <TextField
                        label="Max"
                        size="small"
                        type="number"
                        value={maxInput}
                        onChange={(e) => setMaxInput(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    AED
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                    <DatePickerField
                        label="From"
                        value={startInput}
                        onChange={setStartInput}
                        size="small"
                        fullWidth
                    />
                    <DatePickerField
                        label="To"
                        value={endInput}
                        onChange={setEndInput}
                        size="small"
                        fullWidth
                    />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                    }}>
                    <Button
                        variant="text"
                        onClick={resetFilter}
                        sx={{ textTransform: "none" }}>
                        Reset
                    </Button>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            onClick={handleCloseFilter}
                            sx={{ textTransform: "none" }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={applyFilter}
                            sx={{ textTransform: "none" }}>
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Popover>
            <Divider />
            <Box sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: { xs: 650, md: 960 } }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "rgb(248, 250, 252)" }}>
                            <SortableHeadCell
                                label="Customer Name"
                                active={sortBy === "customerName"}
                                order={sortOrder}
                                onClick={() =>
                                    onSortChange(
                                        "customerName",
                                        sortBy === "customerName" &&
                                            sortOrder === "asc"
                                            ? "desc"
                                            : "asc"
                                    )
                                }
                            />
                            <SortableHeadCell
                                label="Order Date"
                                active={sortBy === "createdAt"}
                                order={sortOrder}
                                onClick={() =>
                                    onSortChange(
                                        "createdAt",
                                        sortBy === "createdAt" &&
                                            sortOrder === "asc"
                                            ? "desc"
                                            : "asc"
                                    )
                                }
                            />
                            <SortableHeadCell
                                label="Tracking ID"
                                active={sortBy === "orderNumber"}
                                order={sortOrder}
                                onClick={() =>
                                    onSortChange(
                                        "orderNumber",
                                        sortBy === "orderNumber" &&
                                            sortOrder === "asc"
                                            ? "desc"
                                            : "asc"
                                    )
                                }
                            />
                            <SortableHeadCell
                                label="Order Total"
                                active={sortBy === "totalAmount"}
                                order={sortOrder}
                                onClick={() =>
                                    onSortChange(
                                        "totalAmount",
                                        sortBy === "totalAmount" &&
                                            sortOrder === "asc"
                                            ? "desc"
                                            : "asc"
                                    )
                                }
                            />
                            <TableCell sx={{ ...headCellSx }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => {
                            const totals = totalsMap.get(order.id)!;
                            const deliveryMeta = deliveryStatusCopy[
                                order.deliveryStatus
                            ] ?? {
                                label: order.deliveryStatus,
                                color: "default" as const,
                            };

                            const sameAmount =
                                Math.abs(totals.initial - totals.final) < 0.005;
                            const amountDisplay = sameAmount
                                ? formatCurrency(totals.final)
                                : `${formatCurrency(
                                    totals.final
                                )} (${formatCurrency(totals.initial)})`;

                            const customerName = order.user
                                ? `${order.user.name ?? ""} ${order.user.surname ?? ""
                                    }`.trim() || order.user.email
                                : "—";

                            const handleRowClick = (e: React.MouseEvent) => {
                                // Prevent row click when clicking on action buttons
                                if ((e.target as HTMLElement).closest("button")) {
                                    e.stopPropagation();
                                    return;
                                }
                                onView(order.id);
                            };

                            const orderDate = new Date(
                                order.createdAt
                            ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            });

                            return (
                                <TableRow
                                    key={order.id}
                                    hover
                                    onClick={handleRowClick}
                                    sx={{
                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(93, 111, 241, 0.04)",
                                        },
                                        cursor: "pointer",
                                    }}>
                                    <TableCell
                                        sx={{
                                            borderBottomColor:
                                                "rgba(148,163,184,0.15)",
                                        }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 600,
                                                color: "#1f2937",
                                            }}>
                                            {customerName || "Unknown"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#4b5563" }}>
                                            {orderDate}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "#6b7280",
                                                    fontSize: "0.875rem",
                                                }}>
                                                #{order.orderNumber}
                                            </Typography>
                                            <Button
                                                size="small"
                                                sx={{
                                                    minWidth: "auto",
                                                    p: 0.5,
                                                    color: "#6b7280",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "rgba(0, 0, 0, 0.04)",
                                                    },
                                                }}>
                                                📋
                                            </Button>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 600,
                                                color: "#1f2937",
                                            }}>
                                            {amountDisplay}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Chip
                                            label={deliveryMeta.label}
                                            color={deliveryMeta.color}
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                borderRadius: 12,
                                                fontSize: "0.75rem",
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ textAlign: "center", py: 8 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No orders found matching your filters
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Try adjusting your search or filter criteria
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Box>
        </TableContainer>
    );
};

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
    borderBottomColor: "rgba(148,163,184,0.15)",
    fontSize: "0.95rem",
    color: "#1f2937",
};

// Small helper for sortable header cells
function SortableHeadCell({
    label,
    active,
    order,
    onClick,
}: {
    label: string;
    active: boolean;
    order: SortOrder;
    onClick: () => void;
}) {
    return (
        <TableCell
            onClick={onClick}
            sx={{
                ...headCellSx,
                userSelect: "none",
                cursor: "pointer",
                color: active ? "#374151" : headCellSx.color,
            }}>
            <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                {label}
                {active ? (
                    order === "asc" ? (
                        <ArrowDropUpRoundedIcon fontSize="small" />
                    ) : (
                        <ArrowDropDownRoundedIcon fontSize="small" />
                    )
                ) : null}
            </Box>
        </TableCell>
    );
}
