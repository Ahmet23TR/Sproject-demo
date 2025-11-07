"use client";
import { Box, Typography } from "@mui/material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export function RevenueChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
    const formatted = data.map((d) => ({ ...d, date: new Date(d.date).toLocaleDateString() }));
    return (
        <Box bgcolor="#fff" borderRadius={3} boxShadow="0 2px 12px rgba(0,0,0,0.04)" p={3}>
            <Typography variant="h6" fontWeight={700} mb={2}>Last 7 Days Revenue</Typography>
            <Box width="100%" height={280}>
                <ResponsiveContainer>
                    <LineChart data={formatted} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip<number, string>
                            formatter={(value) =>
                                new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "AED",
                                }).format(Number(value))
                            }
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#27AE60" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}

