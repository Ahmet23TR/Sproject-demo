"use client";
import { Box, Typography, Card, CardContent } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CancelIcon from "@mui/icons-material/Cancel";
import type {
    ProductGroup,
    AdminAnalyticsProductionResponse,
} from "@/types/data";

interface ProductionKPICardsProps {
    mostPopularProduct: {
        productId: string;
        productName: string;
        orderCount: number;
    } | null;
    highestRevenueProduct: {
        productId: string;
        productName: string;
        totalRevenue: number;
    } | null;
    cancellationRate: number;
    loading?: boolean;
    cardFilter?: ProductGroup | "";
    allData?: AdminAnalyticsProductionResponse | null;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

// Helper function to calculate filtered KPIs
const calculateFilteredKPIs = (
    data: AdminAnalyticsProductionResponse | null,
    filter: ProductGroup | ""
) => {
    if (!data || !data.byProduct) {
        return {
            mostPopularProduct: null,
            highestRevenueProduct: null,
            cancellationRate: 0,
        };
    }

    // Filter products by the selected group
    const filteredProducts = filter
        ? data.byProduct.filter((product) => product.group === filter)
        : data.byProduct;

    if (filteredProducts.length === 0) {
        return {
            mostPopularProduct: null,
            highestRevenueProduct: null,
            cancellationRate: 0,
        };
    }

    // Calculate most popular product
    const mostPopularProduct = filteredProducts.reduce((prev, current) => {
        return current.ordered > prev.ordered ? current : prev;
    });

    // Calculate highest revenue product
    const highestRevenueProduct = filteredProducts.reduce((prev, current) => {
        return current.totalRevenue > prev.totalRevenue ? current : prev;
    });

    // Calculate cancellation rate
    const totalOrdered = filteredProducts.reduce(
        (sum, product) => sum + product.ordered,
        0
    );
    const totalCancelled = filteredProducts.reduce(
        (sum, product) => sum + product.cancelled,
        0
    );
    const cancellationRate =
        totalOrdered > 0 ? (totalCancelled / totalOrdered) * 100 : 0;

    return {
        mostPopularProduct: {
            productId: mostPopularProduct.productId,
            productName: mostPopularProduct.productName,
            orderCount: mostPopularProduct.ordered,
        },
        highestRevenueProduct: {
            productId: highestRevenueProduct.productId,
            productName: highestRevenueProduct.productName,
            totalRevenue: highestRevenueProduct.totalRevenue,
        },
        cancellationRate,
    };
};

export const ProductionKPICards = ({
    mostPopularProduct,
    highestRevenueProduct,
    cancellationRate,
    loading = false,
    cardFilter = "",
    allData = null,
}: ProductionKPICardsProps) => {
    // Use filtered KPIs if card filter is applied and allData is available
    const kpis =
        cardFilter && allData
            ? calculateFilteredKPIs(allData, cardFilter)
            : {
                  mostPopularProduct,
                  highestRevenueProduct,
                  cancellationRate,
              };
    if (loading) {
        return (
            <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
                gap={2}
                mb={3}>
                {[1, 2, 3].map((i) => (
                    <Card key={i} sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                    width={40}
                                    height={40}
                                    bgcolor="#f5f5f5"
                                    borderRadius="50%"
                                />
                                <Box flex={1}>
                                    <Box
                                        height={14}
                                        bgcolor="#f5f5f5"
                                        borderRadius={1}
                                        mb={1}
                                    />
                                    <Box
                                        height={10}
                                        bgcolor="#f5f5f5"
                                        borderRadius={1}
                                        width="60%"
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    }

    return (
        <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
            gap={2}
            mb={3}>
            {/* Most Popular Product */}
            <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb" }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                bgcolor: "#3b82f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                            }}>
                            <TrendingUpIcon fontSize="small" />
                        </Box>
                        <Box flex={1}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                gutterBottom>
                                Most Popular Product
                            </Typography>
                            {kpis.mostPopularProduct ? (
                                <>
                                    <Typography
                                        variant="body1"
                                        fontWeight={600}
                                        noWrap>
                                        {kpis.mostPopularProduct.productName}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="primary">
                                        {kpis.mostPopularProduct.orderCount}{" "}
                                        orders
                                    </Typography>
                                </>
                            ) : (
                                <Typography
                                    variant="caption"
                                    color="text.secondary">
                                    No data available
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Highest Revenue Product */}
            <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb" }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                bgcolor: "#10b981",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                            }}>
                            <AttachMoneyIcon fontSize="small" />
                        </Box>
                        <Box flex={1}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                gutterBottom>
                                Highest Revenue
                            </Typography>
                            {kpis.highestRevenueProduct ? (
                                <>
                                    <Typography
                                        variant="body1"
                                        fontWeight={600}
                                        color="success.main">
                                        {formatCurrency(
                                            kpis.highestRevenueProduct
                                                .totalRevenue
                                        )}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        noWrap
                                        title={
                                            kpis.highestRevenueProduct
                                                .productName
                                        }>
                                        {kpis.highestRevenueProduct.productName}
                                    </Typography>
                                </>
                            ) : (
                                <Typography
                                    variant="caption"
                                    color="text.secondary">
                                    No data available
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Cancellation Rate */}
            <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb" }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                bgcolor:
                                    kpis.cancellationRate > 10
                                        ? "#ef4444"
                                        : "#f97316",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                            }}>
                            <CancelIcon fontSize="small" />
                        </Box>
                        <Box flex={1}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                gutterBottom>
                                Cancellation Rate
                            </Typography>
                            <Typography
                                variant="body1"
                                fontWeight={600}
                                color={
                                    kpis.cancellationRate > 10
                                        ? "error.main"
                                        : "warning.main"
                                }>
                                %{kpis.cancellationRate.toFixed(1)}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary">
                                {kpis.cancellationRate > 10
                                    ? "High risk"
                                    : kpis.cancellationRate > 5
                                    ? "Medium risk"
                                    : "Low risk"}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
