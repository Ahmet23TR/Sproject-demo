"use client";
import { useMemo } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";
import { Box, Typography } from "@mui/material";
import type {
    ProductGroup,
    AdminAnalyticsProductionResponse,
} from "@/types/data";

interface GroupRevenueDistributionChartProps {
    data: Array<{
        group: ProductGroup;
        totalRevenue: number;
        ordered: number;
        produced: number;
        cancelled: number;
    }>;
    loading?: boolean;
    cardFilter?: ProductGroup | "";
    allData?: AdminAnalyticsProductionResponse | null;
}

// Define group colors
const GROUP_COLORS = {
    SWEETS: "#ff6b6b",
    BAKERY: "#4ecdc4",
};

// Product colors for when showing individual products
const PRODUCT_COLORS = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#ffeaa7",
    "#fab1a0",
    "#e17055",
    "#a29bfe",
    "#fd79a8",
    "#fdcb6e",
];

const GROUP_LABELS = {
    SWEETS: "Sweets",
    BAKERY: "Bakery Products",
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: {
            group: ProductGroup;
            totalRevenue: number;
            percentage: number;
            name?: string;
            ordered?: number;
        };
    }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <Box
                sx={{
                    bgcolor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 1,
                    p: 1.5,
                    boxShadow: 2,
                    maxWidth: 200,
                }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                    {data.name || GROUP_LABELS[data.group]}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mb: 0.5 }}>
                    Revenue: AED {data.totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Share: {data.percentage.toFixed(1)}%
                </Typography>
                {data.ordered && (
                    <Typography variant="caption" color="text.secondary">
                        Orders: {data.ordered}
                    </Typography>
                )}
            </Box>
        );
    }
    return null;
};

export const GroupRevenueDistributionChart = ({
    data,
    loading = false,
    cardFilter = "",
    allData = null,
}: GroupRevenueDistributionChartProps) => {
    // Calculate filtered data based on card filter
    const filteredData = useMemo(() => {
        if (!cardFilter || !allData || !allData.byProduct) {
            return data;
        }

        // When filter is applied, show product distribution within that group
        const filteredProducts = allData.byProduct.filter(
            (product) => product.group === cardFilter
        );

        // Convert to chart format showing top 5 products + "Others" category
        const sortedProducts = filteredProducts
            .filter((product) => product.totalRevenue > 0)
            .sort((a, b) => b.totalRevenue - a.totalRevenue);

        const top5Products = sortedProducts.slice(0, 5);
        const otherProducts = sortedProducts.slice(5);
        const othersRevenue = otherProducts.reduce(
            (sum, product) => sum + product.totalRevenue,
            0
        );

        const productData = top5Products.map((product) => ({
            group: product.group,
            totalRevenue: product.totalRevenue,
            ordered: product.ordered,
            produced: product.produced,
            cancelled: product.cancelled,
            name: product.productName,
        }));

        // Add "Others" category if there are more than 5 products
        if (othersRevenue > 0) {
            productData.push({
                group: cardFilter,
                totalRevenue: othersRevenue,
                ordered: otherProducts.reduce((sum, p) => sum + p.ordered, 0),
                produced: otherProducts.reduce((sum, p) => sum + p.produced, 0),
                cancelled: otherProducts.reduce(
                    (sum, p) => sum + p.cancelled,
                    0
                ),
                name: `Others (${otherProducts.length} products)`,
            });
        }

        return productData;
    }, [data, cardFilter, allData]);
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
                        : "No data to display"}
                </Typography>
            </Box>
        );
    }

    // Calculate total revenue and add percentage
    const totalRevenue = filteredData.reduce(
        (sum, item) => sum + item.totalRevenue,
        0
    );
    const chartData = filteredData
        .filter((item) => item.totalRevenue > 0) // Filter out zero values
        .map((item, index) => {
            let itemName: string;

            if (cardFilter) {
                // For product data when filtered
                const productName =
                    "name" in item && typeof item.name === "string"
                        ? item.name
                        : "Unknown Product";
                itemName =
                    productName.length > 15
                        ? productName.substring(0, 15) + "..."
                        : productName;
            } else {
                // For group data when not filtered
                itemName =
                    GROUP_LABELS[item.group as keyof typeof GROUP_LABELS];
            }

            return {
                ...item,
                name: itemName,
                percentage: (item.totalRevenue / totalRevenue) * 100,
                color: cardFilter
                    ? PRODUCT_COLORS[index % PRODUCT_COLORS.length]
                    : GROUP_COLORS[item.group as keyof typeof GROUP_COLORS],
            };
        });

    return (
        <Box height={320}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy={cardFilter ? "40%" : "50%"}
                        labelLine={false}
                        outerRadius={cardFilter ? 100 : 100}
                        fill="#8884d8"
                        dataKey="totalRevenue">
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    entry.color ||
                                    PRODUCT_COLORS[
                                        index % PRODUCT_COLORS.length
                                    ]
                                }
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{
                            fontSize: cardFilter ? "12px" : "12px",
                            lineHeight: "1.2",
                        }}
                        iconType="circle"
                        formatter={(value) => (
                            <span
                                style={{
                                    color: "#374151",
                                    fontSize: cardFilter ? "12px" : "12px",
                                }}>
                                {cardFilter && value.length > 18
                                    ? `${value.substring(0, 18)}...`
                                    : value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
};
