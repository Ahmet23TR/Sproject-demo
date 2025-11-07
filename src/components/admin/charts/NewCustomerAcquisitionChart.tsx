import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import type { AcquisitionTrendData } from "@/types/data";

interface NewCustomerAcquisitionChartProps {
    data: AcquisitionTrendData[];
    loading?: boolean;
    title?: string;
    useAreaChart?: boolean;
}

export const NewCustomerAcquisitionChart: React.FC<
    NewCustomerAcquisitionChartProps
> = ({
    data,
    loading = false,
    title = "New Customer Acquisition Trend",
    useAreaChart = false,
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

    // Convert data to chart format with short month names
    const chartData = data.map((item) => {
        const date = new Date(`${item.month}-01`);
        const shortMonthName = date.toLocaleDateString("tr-TR", {
            month: "short",
            year: "2-digit",
        });

        return {
            month: item.month,
            monthName: shortMonthName,
            fullMonthName: item.monthName,
            newCustomers: item.newCustomers,
        };
    });

    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: Array<{
            payload: { fullMonthName: string; newCustomers: number };
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
                        {data.fullMonthName}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>New Customers:</strong> {data.newCustomers}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    const maxValue = Math.max(...chartData.map((item) => item.newCustomers));
    const averageValue = Math.round(
        chartData.reduce((sum, item) => sum + item.newCustomers, 0) /
            chartData.length
    );

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    mb: 2,
                }}>
                <Typography variant="h6" fontWeight={600}>
                    {title}
                </Typography>
                <Box sx={{ textAlign: "right" }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block">
                        Avg: {averageValue} / Max: {maxValue}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ width: "100%", height: 350, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {useAreaChart ? (
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                            }}>
                            <defs>
                                <linearGradient
                                    id="colorNewCustomers"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="#2563eb"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#2563eb"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                opacity={0.3}
                            />
                            <XAxis dataKey="monthName" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="newCustomers"
                                stroke="#2563eb"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorNewCustomers)"
                            />
                        </AreaChart>
                    ) : (
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                            }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                opacity={0.3}
                            />
                            <XAxis dataKey="monthName" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="newCustomers"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{ fill: "#2563eb", strokeWidth: 2, r: 5 }}
                                activeDot={{
                                    r: 7,
                                    stroke: "#2563eb",
                                    strokeWidth: 2,
                                }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </Box>

            <Box
                sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                <Typography variant="caption" color="text.secondary">
                    * Last {chartData.length} months new customer acquisition
                    trend
                </Typography>
                {chartData.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                        Total:{" "}
                        {chartData.reduce(
                            (sum, item) => sum + item.newCustomers,
                            0
                        )}{" "}
                        new customers
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};
