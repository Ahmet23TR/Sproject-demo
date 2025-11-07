"use client";
import { useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { Box, Typography } from "@mui/material";
import type {
    ProductGroup,
    AdminAnalyticsProductionResponse,
} from "@/types/data";

interface TopSellingProductsChartProps {
    data: Array<{
        productId: string;
        productName: string;
        orderCount: number;
        totalRevenue?: number;
    }>;
    loading?: boolean;
    cardFilter?: ProductGroup | "";
    allData?: AdminAnalyticsProductionResponse | null;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            displayName: string;
            revenue: number;
            orderCount: number;
        };
    }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
            <Box
                sx={{
                    bgcolor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 1,
                    p: 1.5,
                    boxShadow: 2,
                }}>
                <Typography variant="body2" fontWeight={600}>
                    {label}
                </Typography>
                <Typography variant="body2" color="primary">
                    AED {item.revenue ? item.revenue.toLocaleString() : "0"}
                </Typography>
            </Box>
        );
    }
    return null;
};

export const TopSellingProductsChart = ({
    data,
    loading = false,
    cardFilter = "",
    allData = null,
}: TopSellingProductsChartProps) => {
    // Calculate filtered data based on card filter
    const filteredData = useMemo(() => {
        if (!allData || !allData.byProduct) {
            return data;
        }

        if (!cardFilter) {
            // For "All" filter, use all products and sort by revenue
            const allProducts = allData.byProduct
                .map((product) => ({
                    productId: product.productId,
                    productName: product.productName,
                    orderCount: product.ordered,
                    totalRevenue: product.totalRevenue,
                }))
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 10); // Top 10

            return allProducts;
        }

        // Filter products by the selected group
        const filteredProducts = allData.byProduct.filter(
            (product) => product.group === cardFilter
        );

        // Convert to chart format and sort by revenue instead of order count
        const chartProducts = filteredProducts
            .map((product) => ({
                productId: product.productId,
                productName: product.productName,
                orderCount: product.ordered,
                totalRevenue: product.totalRevenue,
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10); // Top 10

        return chartProducts;
    }, [data, cardFilter, allData]);

    // Shorten product names for long titles
    const chartData = filteredData.map((item) => ({
        ...item,
        displayName:
            item.productName.length > 15
                ? item.productName.substring(0, 15) + "..."
                : item.productName,
        revenue: item.totalRevenue || 0,
    }));

    if (loading) {
        return (
            <Box
                height={320}
                display="flex"
                alignItems="center"
                justifyContent="center">
                <Typography color="text.secondary">Loading chart...</Typography>
            </Box>
        );
    }

    if (!filteredData || filteredData.length === 0) {
        return (
            <Box
                height={320}
                display="flex"
                alignItems="center"
                justifyContent="center">
                <Typography color="text.secondary">
                    {cardFilter
                        ? `No data available for ${
                              cardFilter === "BAKERY" ? "Bakery" : "Sweets"
                          } products`
                        : "No data available"}
                </Typography>
            </Box>
        );
    }

    return (
        <Box height={320}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 0,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="displayName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                        tick={{ fill: "#6b7280" }}
                    />
                    <YAxis fontSize={12} tick={{ fill: "#6b7280" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        name="Revenue (AED)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};
