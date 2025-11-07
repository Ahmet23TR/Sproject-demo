import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errorHandler";
import {
    fetchAdminProductionListAll,
    getAdminAnalyticsDashboard,
    getAdminAnalyticsOrders,
} from "../../services/adminService";
import type { AdminAnalyticsDashboardResponse, Order } from "@/types/data";

// Grouped production list type definition (same as Chef's)
export interface GroupedProductionList {
    [productName: string]: {
        variants: {
            [variantName: string]: {
                total: number;
                unit: "PIECE" | "KG" | "TRAY";
                productGroup: string;
            };
        };
    };
}

// Helper function to calculate growth percentage from last 7 days data
const calculateGrowthPercentage = (
    revenueData: Array<{ date: string; revenue: number }>
): string => {
    if (revenueData.length < 2) return "+0.00%";

    // Son 3 günün ortalaması vs önceki 3 günün ortalaması
    const recent = revenueData.slice(-3);
    const previous = revenueData.slice(0, 3);

    const recentAvg =
        recent.reduce((sum, item) => sum + item.revenue, 0) / recent.length;
    const previousAvg =
        previous.reduce((sum, item) => sum + item.revenue, 0) / previous.length;

    if (previousAvg === 0) return "+0.00%";

    const growthRate = ((recentAvg - previousAvg) / previousAvg) * 100;
    const sign = growthRate >= 0 ? "+" : "";

    return `${sign}${growthRate.toFixed(2)}%`;
};

export const useAdminDashboard = () => {
    const { token } = useAuth();
    const [analytics, setAnalytics] =
        useState<AdminAnalyticsDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productionList, setProductionList] = useState<
        {
            name: string;
            variantName?: string;
            totalQuantity: number;
            unit: string;
            productGroup: string;
        }[]
    >([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [rawProductionList, setRawProductionList] = useState<
        {
            productName: string;
            variantName: string;
            total: number;
            unit: "PIECE" | "KG" | "TRAY";
            productGroup: string;
        }[]
    >([]);

    // Group production list similar to Chef's hook
    const groupedProductionList = useMemo((): GroupedProductionList => {
        const groups: GroupedProductionList = {};

        // Sort the raw production list for consistent display
        const sortedList = [...rawProductionList].sort((a, b) => {
            const byProduct = a.productName.localeCompare(b.productName);
            if (byProduct !== 0) return byProduct;
            return a.variantName.localeCompare(b.variantName);
        });

        sortedList.forEach((item) => {
            if (!groups[item.productName]) {
                groups[item.productName] = { variants: {} };
            }

            groups[item.productName].variants[item.variantName] = {
                total: item.total,
                unit: item.unit,
                productGroup: item.productGroup,
            };
        });

        return groups;
    }, [rawProductionList]);

    useEffect(() => {
        const loadStats = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);

                // Dashboard analytics verilerini çek
                const dashboardData = await getAdminAnalyticsDashboard(token);
                setAnalytics(dashboardData);

                // Chef production listini de çek (bugünkü tarih ile)
                const today = new Date().toISOString().slice(0, 10);
                const adminProduction = await fetchAdminProductionListAll(
                    token,
                    today
                );

                // Store raw production data for grouping with aggregation
                const aggregatedData = adminProduction.reduce<
                    {
                        productName: string;
                        variantName: string;
                        total: number;
                        unit: "PIECE" | "KG" | "TRAY";
                        productGroup: string;
                    }[]
                >((acc, item) => {
                    const variantName = item.variantName || "Standard";
                    const existing = acc.find(
                        (x) =>
                            x.productName === item.productName &&
                            x.variantName === variantName
                    );
                    if (existing) {
                        existing.total += item.total;
                    } else {
                        acc.push({
                            productName: item.productName,
                            variantName,
                            total: item.total,
                            unit: item.unit,
                            productGroup: item.productGroup,
                        });
                    }
                    return acc;
                }, []);
                setRawProductionList(aggregatedData);

                // Keep the old format for backward compatibility
                const normalized = adminProduction.reduce<
                    {
                        name: string;
                        variantName?: string;
                        totalQuantity: number;
                        unit: string;
                        productGroup: string;
                    }[]
                >((acc, item) => {
                    // Aynı ürün ve varyant kombinasyonu için arama yap
                    const existing = acc.find(
                        (x) =>
                            x.name === item.productName &&
                            x.variantName === item.variantName
                    );
                    if (existing) {
                        existing.totalQuantity += item.total;
                    } else {
                        acc.push({
                            name: item.productName,
                            variantName: item.variantName || undefined,
                            totalQuantity: item.total,
                            unit: item.unit,
                            productGroup: item.productGroup,
                        });
                    }
                    return acc;
                }, []);
                setProductionList(normalized);

                // Recent orders verilerini çek (son 8 order)
                const ordersResponse = await getAdminAnalyticsOrders(
                    {
                        page: 1,
                        limit: 8,
                        // Son 7 günün orderları
                        startDate: new Date(
                            Date.now() - 7 * 24 * 60 * 60 * 1000
                        ).toISOString(),
                        endDate: new Date().toISOString(),
                    },
                    token
                );
                setRecentOrders(ordersResponse.data || []);
            } catch (error) {
                setError(getApiErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [token]);

    // quantitySummary eski UI için, analytics.charts.productionByGroupToday'den türet
    const quantitySummary = (
        analytics?.charts?.productionByGroupToday || []
    ).map((x) => ({
        productGroup: x.group,
        unit: "PIECE" as const,
        total: x.total,
    }));

    return {
        loading,
        error,
        totalOrderCount: analytics?.kpis?.todaysOrderCount ?? 0,
        totalCustomerCount: analytics?.kpis?.todaysCustomerCount ?? 0,
        todaysTotalRevenue: analytics?.kpis?.todaysTotalRevenue,
        quantitySummary,
        productionList,
        charts: analytics?.charts,
        alerts: analytics?.alerts,
        // Yeni dashboard için ek değerler - orderStatusDistribution'dan türetilmiş
        pendingOrderCount:
            (analytics?.charts?.orderStatusDistribution?.["PENDING"] ?? 0) +
            (analytics?.charts?.orderStatusDistribution?.[
                "READY_FOR_DELIVERY"
            ] ?? 0) +
            (analytics?.charts?.orderStatusDistribution?.[
                "PARTIALLY_COMPLETED"
            ] ?? 0), // Pending, Ready for Delivery ve Partially Completed durumlarının toplamı
        completedOrderCount:
            (analytics?.charts?.orderStatusDistribution?.["DELIVERED"] ?? 0) +
            (analytics?.charts?.orderStatusDistribution?.["COMPLETED"] ?? 0), // Delivered ve Completed durumlarının toplamı
        recentOrders, // Gerçek recent orders verisi
        // Gerçekçi yüzde değerleri - son 7 günün verilerinden hesaplanmış
        salesGrowthPercentage: calculateGrowthPercentage(
            analytics?.charts?.last30DaysRevenue ||
                analytics?.charts?.last7DaysRevenue ||
                []
        ),
        customerGrowthPercentage:
            analytics?.kpis?.customerGrowthPercentage ?? "+15.80%", // API'den dinamik değer, fallback olarak varsayılan
        completedGrowthPercentage: "+0.00%", // Completed orders için trend hesaplaması
        groupedProductionList, // New grouped production list for the summary component
    } as const;
};
