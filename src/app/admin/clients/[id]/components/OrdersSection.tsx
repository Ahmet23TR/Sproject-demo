"use client";
import type React from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import PaginationComponent from "../../../../../components/PaginationComponent";
import type { Order, PaginationInfo } from "@/types/data";
import { formatCurrency, formatDateTime, getDeliveryStatusChip, getOrderTotal } from "./clientDetailUtils";
import { OrderCard } from "./OrderCard";

interface OrdersSectionProps {
    orders: Order[];
    loading: boolean;
    error: string | null;
    search: string;
    onSearchChange: (value: string) => void;
    pagination: PaginationInfo | null;
    showPagination: boolean;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

export const OrdersSection = ({
    orders,
    loading,
    error,
    search,
    onSearchChange,
    pagination,
    showPagination,
    onPageChange,
}: OrdersSectionProps) => {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Orders already come paginated from the hook
    const displayedOrders = orders;

    return (
        <Paper
            sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                border: "1px solid rgba(148, 163, 184, 0.2)",
                boxShadow: "0px 8px 20px rgba(15, 23, 42, 0.08)",
            }}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                mb={2.5}>
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: "#111827" }}>
                        Recent Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {pagination && pagination.totalPages > 1
                            ? `Showing ${displayedOrders.length} of ${pagination.totalItems} orders (page ${pagination.currentPage} of ${pagination.totalPages})`
                            : `Showing ${displayedOrders.length} orders`
                        }
                    </Typography>
                </Box>
                {/* <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                        size="small"
                        sx={{ border: "1px solid rgba(148, 163, 184, 0.35)", borderRadius: 2 }}>
                        <FilterListIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        sx={{ border: "1px solid rgba(148, 163, 184, 0.35)", borderRadius: 2 }}>
                        <IosShareIcon fontSize="small" />
                    </IconButton>
                </Stack> */}
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2} alignItems={{ xs: "stretch", md: "center" }}>
                <TextField
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search orders by number or status"
                    fullWidth
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        backgroundColor: "#f8fafc",
                        borderRadius: 2,
                        "& fieldset": {
                            border: "1px solid rgba(148, 163, 184, 0.4)",
                        },
                    }}
                />
                <Button
                    variant="outlined"
                    color="inherit"
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        borderColor: "rgba(148, 163, 184, 0.35)",
                    }}>
                    Search
                </Button>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress size={28} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : orders.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    {search ? "No orders match your search." : "This customer has no orders yet."}
                </Alert>
            ) : (
                <>
                    {/* Mobile Card View */}
                    {isMobile ? (
                        <Stack spacing={2}>
                            {displayedOrders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </Stack>
                    ) : (
                        /* Desktop Table View */
                        <TableContainer sx={{
                            overflowX: "auto",
                            "&::-webkit-scrollbar": {
                                height: 8,
                            },
                            "&::-webkit-scrollbar-track": {
                                backgroundColor: "#f1f5f9",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "#cbd5e1",
                                borderRadius: 4,
                            },
                        }}>
                            <Table sx={{ minWidth: 700 }}>
                                <TableHead>
                                    <TableRow>
                                        {/* <TableCell padding="checkbox">
                                            <Checkbox size="small" disabled sx={{ color: "#94a3b8" }} />
                                        </TableCell> */}
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>Order #</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>Placed At</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>Items</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>Status</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>Order Total</TableCell>
                                        {/* <TableCell align="right">Action</TableCell> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayedOrders.map((order) => {
                                        const { label, sx } = getDeliveryStatusChip(order.deliveryStatus);
                                        return (
                                            <TableRow
                                                key={order.id}
                                                hover
                                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                sx={{
                                                    cursor: "pointer",
                                                    "&:hover": { backgroundColor: "rgba(241, 245, 249, 0.6)" },
                                                }}>
                                                {/* <TableCell padding="checkbox">
                                                    <Checkbox size="small" disabled sx={{ color: "#94a3b8" }} />
                                                </TableCell> */}
                                                <TableCell sx={{ whiteSpace: "nowrap" }}>#{order.orderNumber ?? "—"}</TableCell>
                                                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateTime(order.createdAt)}</TableCell>
                                                <TableCell>{order.items?.length ?? 0}</TableCell>
                                                <TableCell>
                                                    <Chip size="small" label={label} sx={{ ...sx, fontSize: "0.8125rem" }} />
                                                </TableCell>
                                                <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>{formatCurrency(getOrderTotal(order))}</TableCell>
                                                {/* <TableCell align="right">
                                                    <Button
                                                        variant="text"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            router.push(`/admin/orders/${order.id}`);
                                                        }}
                                                        sx={{ textTransform: "none", fontWeight: 600 }}>
                                                        View
                                                    </Button>
                                                </TableCell> */}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {showPagination && pagination && pagination.totalPages > 1 && !search.trim() && (
                        <Box mt={3}>
                            <PaginationComponent
                                pagination={pagination}
                                onPageChange={onPageChange}
                            />
                        </Box>
                    )}
                </>
            )}
        </Paper>
    );
};
