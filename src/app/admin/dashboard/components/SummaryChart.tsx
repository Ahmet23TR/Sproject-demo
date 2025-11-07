"use client";
import { useState } from "react";
import { Box, Typography, Button, Menu, MenuItem } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid,
} from "recharts";

interface SummaryChartProps {
    data?: {
        last7DaysRevenue: Array<{ date: string; revenue: number }>;
        last30DaysRevenue: Array<{ date: string; revenue: number }>;
        last3MonthsRevenue: Array<{ date: string; revenue: number }>;
    };
}

export const SummaryChart = ({ data }: SummaryChartProps) => {
    const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '3months'>('7days');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const periodOptions = {
        '7days': 'Last 7 Days',
        '30days': 'Last 30 Days',
        '3months': 'Last 3 Months'
    };

    const handlePeriodClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePeriodClose = () => {
        setAnchorEl(null);
    };

    const handlePeriodSelect = (period: '7days' | '30days' | '3months') => {
        setSelectedPeriod(period);
        setAnchorEl(null);
    };

    // Seçilen periode göre veriyi al
    const getDataForPeriod = () => {
        if (!data) return [];

        switch (selectedPeriod) {
            case '7days':
                return data.last7DaysRevenue || [];
            case '30days':
                return data.last30DaysRevenue || [];
            case '3months':
                return data.last3MonthsRevenue || [];
            default:
                return data.last7DaysRevenue || [];
        }
    };

    // Tarih formatlaması
    const formatDate = (dateStr: string, period: string) => {
        if (period === '3months') {
            // YYYY-Www formatından hafta gösterimini çıkar
            const match = dateStr.match(/^(\d{4})-W(\d{2})$/);
            if (match) {
                return `W${match[2]}`;
            }
            return dateStr;
        } else {
            // YYYY-MM-DD formatı için
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // Gerçek veriyi chart formatına dönüştür
    const rawData = getDataForPeriod();
    const hasData = rawData.length > 0 && rawData.some(item => item.revenue > 0);

    const chartData = rawData.map(item => ({
        date: formatDate(item.date, selectedPeriod),
        value: Math.round(item.revenue), // Tam değeri kullan
        originalValue: item.revenue // Tooltip için orijinal değer
    }));

    return (
        <Box
            sx={{
                bgcolor: '#FFFFFF',
                borderRadius: { xs: 2, md: 3 },
                pt: { xs: 2, sm: 2.5, md: 3 },
                px: { xs: 2, sm: 2.5, md: 3 },
                pb: 1,
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 20px rgba(17, 24, 39, 0.06)',
                height: { xs: 300, sm: 340, md: 360 },
                minHeight: { xs: 300, sm: 340, md: 360 },
            }}
        >
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={{ xs: 2, md: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 600,
                            color: '#111827',
                            fontSize: { xs: '14px', sm: '15px', md: '16px' },
                        }}
                    >
                        Summary
                    </Typography>
                    {/* <Button
                        variant="text"
                        size="small"
                        endIcon={<ExpandMoreIcon fontSize="small" />}
                        sx={{
                            color: '#C9A227',
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 500,
                            minWidth: 'auto',
                            p: 0.5,
                        }}
                    >
                        Sales
                    </Button> */}
                </Box>
                <Button
                    variant="text"
                    size="small"
                    endIcon={<ExpandMoreIcon fontSize="small" />}
                    onClick={handlePeriodClick}
                    sx={{
                        color: '#9CA3AF',
                        textTransform: 'none',
                        fontSize: { xs: '11px', sm: '12px' },
                        fontWeight: 500,
                        minWidth: 'auto',
                        p: { xs: 0.25, sm: 0.5 },
                    }}
                >
                    {periodOptions[selectedPeriod]}
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handlePeriodClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {Object.entries(periodOptions).map(([key, label]) => (
                        <MenuItem
                            key={key}
                            selected={selectedPeriod === key}
                            onClick={() => handlePeriodSelect(key as '7days' | '30days' | '3months')}
                            sx={{ fontSize: '14px' }}
                        >
                            {label}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            {/* Chart */}
            <Box sx={{ width: '100%', height: '80%', overflow: 'hidden' }}>
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 15,
                                left: 5,
                                bottom: 5,
                            }}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#F3F4F6"
                                horizontal={true}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 11,
                                    fill: '#9CA3AF',
                                }}
                                height={25}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 11,
                                    fill: '#9CA3AF',
                                }}
                                tickFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
                                width={50}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const value = payload[0].value;
                                        return (
                                            <Box
                                                sx={{
                                                    bgcolor: '#111827',
                                                    color: '#FFFFFF',
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '12px', mb: 0.5 }}>
                                                    {label}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#C9A227', fontSize: '12px', fontWeight: 600 }}>
                                                    AED {new Intl.NumberFormat('en-US').format(value as number)}
                                                </Typography>
                                            </Box>
                                        );
                                    }
                                    return null;
                                }}
                                cursor={{ fill: 'rgba(201, 162, 39, 0.1)' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#C9A227"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
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
                            No Data Available
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '12px',
                                textAlign: 'center',
                            }}
                        >
                            No revenue data for {periodOptions[selectedPeriod].toLowerCase()}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
