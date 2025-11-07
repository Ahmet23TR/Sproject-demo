"use client";
import { useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { Box, CircularProgress } from "@mui/material";
import { useAdminDashboard } from "../../../hooks/admin/useAdminDashboard";
import { KPICards } from "./components/KPICards";
import { ProductGroupRevenueChart } from "./components/MarketingChart";
import { SummaryChart } from "./components/SummaryChart";
import { RecentOrders } from "./components/RecentOrders";
import { ProductionSummary } from "./components/ProductionSummary";
import { ProductionDetailsModal } from "./components/ProductionDetailsModal";

export default function AdminDashboardPage() {
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    const {
        loading,
        error,
        totalCustomerCount,
        todaysTotalRevenue,
        totalOrderCount,
        pendingOrderCount,
        completedOrderCount,
        charts,
        recentOrders,
        salesGrowthPercentage,
        customerGrowthPercentage,
        completedGrowthPercentage,
        groupedProductionList,
    } = useAdminDashboard();

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Box
                sx={{
                    bgcolor: "#F5F5F5",
                    minHeight: "100vh",
                    py: { xs: 2, sm: 2.5, md: 4 },
                    px: { xs: 2, sm: 2.5, md: 3 },
                }}>
                <Box
                    maxWidth={1400}
                    mx="auto"
                    sx={{
                        width: '100%',
                    }}
                >
                    {/* KPI Cards - Üst sıra */}
                    <Box sx={{ mb: { xs: 3, md: 4 } }}>
                        <KPICards
                            totalCustomerCount={totalCustomerCount}
                            todaysTotalRevenue={todaysTotalRevenue || 0}
                            totalOrderCount={totalOrderCount}
                            pendingOrderCount={pendingOrderCount}
                            completedOrderCount={completedOrderCount}
                            salesGrowthPercentage={salesGrowthPercentage}
                            customerGrowthPercentage={customerGrowthPercentage}
                            completedGrowthPercentage={
                                completedGrowthPercentage
                            }
                        />
                    </Box>

                    {/* Middle Section */}
                    <Box
                        display="grid"
                        gridTemplateColumns={{
                            xs: "1fr",
                            md: "1fr 1fr",
                            lg: "350px 1fr"
                        }}
                        gap={{ xs: 2, sm: 2.5, md: 3 }}
                        mb={{ xs: 3, md: 4 }}>
                        {/* Product Group Revenue Chart */}
                        <ProductGroupRevenueChart
                            data={(() => {
                                const raw = (charts?.revenueByGroupToday ?? []).map((item) => ({
                                    group: item.group,
                                    amount: typeof item.amount === "number" ? item.amount : Number(item.amount) || 0,
                                }));
                                const sum = raw.reduce((s, r) => s + (r.amount || 0), 0);
                                const kpi = Number(todaysTotalRevenue || 0);
                                if (sum > 0 && kpi > 0 && Math.abs(sum - kpi) > 0.01) {
                                    const factor = kpi / sum;
                                    return raw.map((r) => ({ ...r, amount: Math.max(0, r.amount * factor) }));
                                }
                                return raw;
                            })()}
                        />

                        {/* Summary Chart */}
                        <SummaryChart
                            data={{
                                last7DaysRevenue:
                                    (charts?.last7DaysRevenue ?? []).map(
                                        (point) => ({
                                            ...point,
                                            revenue: Math.max(
                                                0,
                                                typeof point.revenue === "number"
                                                    ? point.revenue
                                                    : Number(point.revenue) || 0
                                            ),
                                        })
                                    ),
                                last30DaysRevenue:
                                    (charts?.last30DaysRevenue ?? []).map(
                                        (point) => ({
                                            ...point,
                                            revenue: Math.max(
                                                0,
                                                typeof point.revenue === "number"
                                                    ? point.revenue
                                                    : Number(point.revenue) || 0
                                            ),
                                        })
                                    ),
                                last3MonthsRevenue:
                                    (charts?.last3MonthsRevenue ?? []).map(
                                        (point) => ({
                                            ...point,
                                            revenue: Math.max(
                                                0,
                                                typeof point.revenue === "number"
                                                    ? point.revenue
                                                    : Number(point.revenue) || 0
                                            ),
                                        })
                                    ),
                            }}
                        />
                    </Box>

                    {/* Final Section */}
                    <Box
                        display="grid"
                        gridTemplateColumns={{
                            xs: "1fr",
                            lg: "2fr 1fr"
                        }}
                        gap={{ xs: 2, sm: 2.5, md: 3 }}>
                        {/* Recent Orders */}
                        <RecentOrders orders={recentOrders} loading={loading} />

                        {/* Production Summary */}
                        <Box
                            sx={{
                                bgcolor: "#FFFFFF",
                                borderRadius: { xs: 2, md: 3 },
                                p: { xs: 2, sm: 2.5, md: 3 },
                                border: "1px solid",
                                borderColor: "rgba(0, 0, 0, 0.06)",
                                boxShadow: "0 4px 20px rgba(17, 24, 39, 0.06)",
                            }}>
                            {loading ? (
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    py={3}>
                                    <CircularProgress
                                        size={24}
                                        sx={{ color: "#C9A227" }}
                                    />
                                </Box>
                            ) : error ? (
                                <Box color="error.main" py={3}>
                                    {error}
                                </Box>
                            ) : (
                                <ProductionSummary
                                    groupedList={groupedProductionList}
                                    onViewDetails={() =>
                                        setDetailsModalOpen(true)
                                    }
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Production Details Modal */}
                    <ProductionDetailsModal
                        open={detailsModalOpen}
                        onClose={() => setDetailsModalOpen(false)}
                        groupedList={groupedProductionList}
                    />
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
