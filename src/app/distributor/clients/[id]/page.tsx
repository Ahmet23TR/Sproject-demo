"use client";
import { Suspense } from "react";
import {
    Box,
    CircularProgress,
    Paper,
    Stack,
    Typography,
    Alert,
    Chip,
    Button,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDistributorClientDetail } from "@/hooks/distributor/useDistributorClientDetail";
import { useDistributorClientOrders } from "@/hooks/distributor/useDistributorClientOrders";
import { DistributorOverviewCard } from "./components/DistributorOverviewCard";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import {
    formatDate,
    formatDateTime,
    formatCurrency,
    getDeliveryStatusChip,
} from "@/app/admin/clients/[id]/components/clientDetailUtils";

export const dynamic = "force-dynamic";

function DistributorClientDetailContent() {
    const params = useParams();
    const clientId = params.id as string;
    const router = useRouter();

    const { user, loading, error, priceListName } =
        useDistributorClientDetail(clientId);
    const {
        orders,
        pagination,
        loading: ordersLoading,
        error: ordersError,
        handlePageChange,
        statusCounts,
    } = useDistributorClientOrders(clientId);

    // Prefer backend aggregates; fall back to client-side rollups.
    const completedOrders = orders.filter(
        (order) =>
            order.deliveryStatus === "DELIVERED" ||
            order.deliveryStatus === "PARTIALLY_DELIVERED"
    );
    const fallbackTotalSpend = completedOrders.reduce(
        (sum, order) => sum + (order.totalAmount ?? 0),
        0
    );
    const totalOrders =
        typeof user?.orderCount === "number"
            ? user.orderCount
            : completedOrders.length;
    const totalSpend =
        typeof user?.totalOrderAmount === "number"
            ? user.totalOrderAmount
            : fallbackTotalSpend;
    const averageOrderValue =
        totalOrders > 0 ? totalSpend / totalOrders : null;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {loading && (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ py: 6 }}>
                    <CircularProgress />
                </Stack>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && user && (
                <Stack spacing={2}>
                    <DistributorOverviewCard
                        user={user}
                        customerSince={formatDate(user.createdAt)}
                        lastOrderDateLabel={
                            orders[0]?.createdAt
                                ? formatDateTime(orders[0].createdAt)
                                : "—"
                        }
                        phoneDisplay={user.phone || "Not provided"}
                        emailDisplay={user.email || "Not provided"}
                        companyDisplay={user.companyName || "Not provided"}
                        addressDisplay={user.address || "Not provided"}
                        priceListName={priceListName}
                        totalSpend={totalSpend}
                        averageOrderValue={averageOrderValue}
                        statCards={[
                            {
                                label: "Total Orders",
                                value: totalOrders || 0,
                                icon: <LocalMallOutlinedIcon />,
                                pillSx: {
                                    backgroundColor:
                                        "rgba(59, 130, 246, 0.12)",
                                    color: "#2563eb",
                                },
                            },
                            {
                                label: "Completed Orders",
                                value: statusCounts.completed,
                                icon: <CheckCircleOutlineRoundedIcon />,
                                pillSx: {
                                    backgroundColor:
                                        "rgba(16, 185, 129, 0.12)",
                                    color: "#047857",
                                },
                            },
                            {
                                label: "In Progress",
                                value: statusCounts.inProgress,
                                icon: <SyncRoundedIcon />,
                                pillSx: {
                                    backgroundColor:
                                        "rgba(14, 165, 233, 0.16)",
                                    color: "#0369a1",
                                },
                            },
                            {
                                label: "Pending",
                                value: statusCounts.pending,
                                icon: <PendingActionsRoundedIcon />,
                                pillSx: {
                                    backgroundColor:
                                        "rgba(234, 179, 8, 0.18)",
                                    color: "#b45309",
                                },
                            },
                            {
                                label: "Cancelled",
                                value: statusCounts.cancelled,
                                icon: <HighlightOffRoundedIcon />,
                                pillSx: {
                                    backgroundColor:
                                        "rgba(248, 113, 113, 0.18)",
                                    color: "#b91c1c",
                                },
                            },
                        ]}
                    />

                    <Paper
                        sx={{
                            p: { xs: 2, md: 3 },
                            borderRadius: 2,
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                        }}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ mb: 1 }}>
                            Orders
                        </Typography>

                        {ordersError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {ordersError}
                            </Alert>
                        )}

                        {ordersLoading ? (
                            <Typography
                                variant="body2"
                                color="text.secondary">
                                Loading orders...
                            </Typography>
                        ) : orders.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary">
                                No orders found.
                            </Typography>
                        ) : (
                            <>
                                <Box sx={{ overflowX: "auto" }}>
                                    <table
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                        }}>
                                        <thead>
                                            <tr>
                                                <th
                                                    style={{
                                                        textAlign: "left",
                                                        padding: "8px",
                                                    }}>
                                                    Order #
                                                </th>
                                                <th
                                                    style={{
                                                        textAlign: "left",
                                                        padding: "8px",
                                                    }}>
                                                    Date
                                                </th>
                                                <th
                                                    style={{
                                                        textAlign: "left",
                                                        padding: "8px",
                                                    }}>
                                                    Status
                                                </th>
                                                <th
                                                    style={{
                                                        textAlign: "left",
                                                        padding: "8px",
                                                    }}>
                                                    Total (AED)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    style={{
                                                        borderTop:
                                                            "1px solid rgba(148,163,184,0.2)",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        router.push(
                                                            `/distributor/orders/${order.id}`
                                                        )
                                                    }>
                                                    <td style={{ padding: "8px" }}>
                                                        {order.orderNumber}
                                                    </td>
                                                    <td style={{ padding: "8px" }}>
                                                        {formatDateTime(
                                                            order.createdAt
                                                        )}
                                                    </td>
                                                    <td style={{ padding: "8px" }}>
                                                        {(() => {
                                                            const chip =
                                                                getDeliveryStatusChip(
                                                                    order.deliveryStatus
                                                                );
                                                            return (
                                                                <Chip
                                                                    label={
                                                                        chip.label
                                                                    }
                                                                    size="small"
                                                                    sx={
                                                                        chip.sx
                                                                    }
                                                                />
                                                            );
                                                        })()}
                                                    </td>
                                                    <td style={{ padding: "8px" }}>
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
                                                            const initial =
                                                                initialRaw ??
                                                                finalRaw ??
                                                                0;
                                                            const final =
                                                                finalRaw ?? 0;
                                                            const different =
                                                                Math.round(
                                                                    (final -
                                                                        initial) *
                                                                        100
                                                                ) !== 0;
                                                            return (
                                                                <>
                                                                    {formatCurrency(
                                                                        final
                                                                    )}
                                                                    {different
                                                                        ? ` (${formatCurrency(
                                                                              initial
                                                                          )})`
                                                                        : null}
                                                                </>
                                                            );
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>

                                {pagination && (
                                    <Box
                                        sx={{
                                            mt: 2,
                                            display: "flex",
                                            justifyContent: "flex-end",
                                        }}>
                                        <Stack
                                            direction="row"
                                            spacing={1}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() =>
                                                    handlePageChange(
                                                        null,
                                                        Math.max(
                                                            1,
                                                            pagination.currentPage -
                                                                1
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    pagination.currentPage <= 1
                                                }
                                                sx={{
                                                    textTransform: "none",
                                                }}>
                                                Prev
                                            </Button>
                                            <Typography
                                                variant="body2"
                                                sx={{ alignSelf: "center" }}>
                                                {pagination.currentPage} /{" "}
                                                {pagination.totalPages || 1}
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() =>
                                                    handlePageChange(
                                                        null,
                                                        pagination.currentPage +
                                                            1
                                                    )
                                                }
                                                disabled={
                                                    !!pagination.totalPages &&
                                                    pagination.currentPage >=
                                                        (pagination.totalPages ||
                                                            0)
                                                }
                                                sx={{
                                                    textTransform: "none",
                                                }}>
                                                Next
                                            </Button>
                                        </Stack>
                                    </Box>
                                )}
                            </>
                        )}
                    </Paper>
                </Stack>
            )}
        </Box>
    );
}

export default function DistributorClientDetailPage() {
    return (
        <ProtectedRoute>
            <Suspense
                fallback={
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "50vh",
                        }}>
                        <CircularProgress />
                    </Box>
                }>
                <DistributorClientDetailContent />
            </Suspense>
        </ProtectedRoute>
    );
}

// Removed local StatCard; DistributorOverviewCard uses AED formatting via shared utils
