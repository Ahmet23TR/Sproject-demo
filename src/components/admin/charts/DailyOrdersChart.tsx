import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export type DailyOrdersPoint = {
    date: string; // YYYY-MM-DD
    label: string; // e.g., 26 Sep
    count: number;
};

interface DailyOrdersChartProps {
    data: DailyOrdersPoint[];
    loading?: boolean;
    title?: string;
}

export const DailyOrdersChart: React.FC<DailyOrdersChartProps> = ({
    data,
    loading = false,
    title = "Daily Orders",
}) => {
    if (loading) {
        return (
            <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    {title}
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                    <Typography color="text.secondary">Loading chart...</Typography>
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
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                    <Typography color="text.secondary">No orders in selected range</Typography>
                </Box>
            </Paper>
        );
    }

    const maxValue = Math.max(...data.map((d) => d.count));
    const total = data.reduce((sum, d) => sum + d.count, 0);

    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: Array<{ payload: DailyOrdersPoint }>;
    }) => {
        if (active && payload && payload.length) {
            const row = payload[0].payload;
            return (
                <Box sx={{ bgcolor: "background.paper", p: 2, border: 1, borderColor: "divider", borderRadius: 1, boxShadow: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {row.label}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Orders: {row.count}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                    {title}
                </Typography>
                <Box sx={{ textAlign: "right" }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Total: {total} · Max: {maxValue}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="label" fontSize={12} />
                        <YAxis allowDecimals={false} fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default DailyOrdersChart;

