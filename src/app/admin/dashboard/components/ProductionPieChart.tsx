"use client";
import { Box, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#27AE60", "#2D9CDB", "#F2994A", "#9B51E0", "#EB5757"];

export function ProductionPieChart({ data }: { data: Array<{ group: string; total?: number; amount?: number }> }) {
    const chartData = data.map((d) => ({ name: d.group, value: (d.amount ?? d.total ?? 0) }));
    return (
        <Box bgcolor="#fff" borderRadius={3} boxShadow="0 2px 12px rgba(0,0,0,0.04)" p={3}>
            <Typography variant="h6" fontWeight={700} mb={2}>Today&apos;s Revenue by Group</Typography>
            <Box width="100%" height={280}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100} label>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip<number, string>
                            formatter={(value) =>
                                new Intl.NumberFormat(undefined, {
                                    style: "currency",
                                    currency: "AED",
                                    maximumFractionDigits: 2,
                                }).format(Number(value) || 0)
                            }
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}

