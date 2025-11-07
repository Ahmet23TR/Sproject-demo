"use client";
import { Box, Typography, IconButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Proje renk paletine uygun renkler
const COLORS = ["#C9A227", "#E0C097", "#111827", "#9CA3AF"];

interface ProductGroupData {
    group: string;
    amount: number;
}

interface ProductGroupRevenueChartProps {
    data?: ProductGroupData[];
}

export const ProductGroupRevenueChart = ({ data = [] }: ProductGroupRevenueChartProps) => {
    const chartData = data.map((d) => ({ name: d.group, value: d.amount }));
    const hasData = chartData.length > 0 && chartData.some(item => item.value > 0);

    return (
        <Box
            sx={{
                bgcolor: '#FFFFFF',
                borderRadius: { xs: 2, md: 3 },
                p: { xs: 2, sm: 2.5, md: 3 },
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 20px rgba(17, 24, 39, 0.06)',
                height: 'fit-content',
                minHeight: { xs: 300, sm: 340, md: 360 },
            }}
        >
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={{ xs: 2, md: 3 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 600,
                        color: '#111827',
                        fontSize: { xs: '14px', sm: '15px', md: '16px' },
                    }}
                >
                    Today&apos;s Revenue by Group
                </Typography>
                <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Chart */}
            <Box
                sx={{
                    width: '100%',
                    height: { xs: 220, sm: 250, md: 280 },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ value }) => `AED ${new Intl.NumberFormat('en-US').format(Number(value) || 0)}`}
                                labelLine={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip<number, string>
                                formatter={(value) => [
                                    `AED ${new Intl.NumberFormat('en-US').format(Number(value) || 0)}`,
                                    'Revenue'
                                ]}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => `${value}`}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#9CA3AF',
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '14px',
                                fontWeight: 500,
                                mb: 1,
                            }}
                        >
                            No Revenue Data
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '12px',
                                textAlign: 'center',
                            }}
                        >
                            No orders have been placed today
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
