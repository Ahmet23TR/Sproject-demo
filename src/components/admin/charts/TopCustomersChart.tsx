import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { TopCustomerData } from "@/types/data";

interface TopCustomersChartProps {
    data: TopCustomerData[];
    loading?: boolean;
    title?: string;
}

export const TopCustomersChart: React.FC<TopCustomersChartProps> = ({
    data,
    loading = false,
    title = "Top 10 Customers by Total Spending",
}) => {
    if (loading) {
        return (
            <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    {title}
                </Typography>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight={300}>
                    <Typography color="text.secondary">
                        Graphic is loading...
                    </Typography>
                </Box>
            </Paper>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    {title}
                </Typography>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight={300}>
                    <Typography color="text.secondary">
                        No customer data available yet
                    </Typography>
                </Box>
            </Paper>
        );
    }

    // Convert data to chart format
    const chartData = data.map((customer, index) => ({
        name:
            customer.customerName.length > 15
                ? `${customer.customerName.substring(0, 15)}...`
                : customer.customerName,
        fullName: customer.customerName,
        companyName: customer.companyName,
        totalSpending: customer.totalSpending,
        orderCount: customer.orderCount,
        aov: customer.averageOrderValue,
        color: `hsl(${210 + index * 15}, 70%, ${60 - index * 2}%)`,
    }));

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: Array<{
            payload: {
                fullName: string;
                companyName: string;
                totalSpending: number;
                orderCount: number;
                aov: number;
            };
        }>;
    }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box
                    sx={{
                        bgcolor: "background.paper",
                        p: 2,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        boxShadow: 2,
                    }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {data.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {data.companyName}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Total Spending:</strong>{" "}
                        {formatCurrency(data.totalSpending)}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Order Count:</strong> {data.orderCount}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Average Order Value:</strong>{" "}
                        {formatCurrency(data.aov)}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
                {title}
            </Typography>
            <Box sx={{ width: "100%", height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                        }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                            interval={0}
                        />
                        <YAxis tickFormatter={formatCurrency} fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="totalSpending" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2, display: "block" }}>
                * Data represents total spending by top customers.
            </Typography>
        </Paper>
    );
};
