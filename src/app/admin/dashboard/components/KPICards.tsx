"use client";
import { Box, Typography, IconButton } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    change?: string;
    changeType?: 'positive' | 'negative';
    hasDropdown?: boolean;
    unit?: string;
}

const KPICard = ({
    title,
    value,
    subtitle,
    change,
    changeType = 'positive',
    hasDropdown = false,
    unit
}: KPICardProps) => {
    const formatValue = (val: string | number) => {
        if (typeof val === 'number') {
            if (unit === 'currency') {
                return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "AED",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                }).format(val);
            }
            return val.toLocaleString();
        }
        return val;
    };

    return (
        <Box
            sx={{
                bgcolor: '#FFFFFF',
                borderRadius: { xs: 2, md: 3 },
                p: { xs: 2, sm: 2.5, md: 3 },
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 20px rgba(17, 24, 39, 0.06)',
                position: 'relative',
            }}
        >
            {/* Header with title and dropdown */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#9CA3AF',
                            fontSize: '14px',
                            fontWeight: 500,
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                {hasDropdown && (
                    <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                        <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            {/* Main value */}
            <Typography
                variant="h4"
                sx={{
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 700,
                    color: '#111827',
                    fontSize: { xs: '22px', sm: '24px', md: '28px' },
                    mb: 1,
                }}
            >
                {formatValue(value)}
            </Typography>

            {/* Subtitle and change */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
                {subtitle && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#9CA3AF',
                            fontSize: '12px',
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
                {change && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: changeType === 'positive' ? '#16A34A' : '#EF4444',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}
                    >
                        {change}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

interface KPICardsProps {
    totalCustomerCount: number;
    todaysTotalRevenue?: number;
    totalOrderCount: number;
    pendingOrderCount: number;
    completedOrderCount: number;
    salesGrowthPercentage?: string;
    customerGrowthPercentage?: string;
    completedGrowthPercentage?: string;
}

export const KPICards = ({
    totalCustomerCount,
    todaysTotalRevenue,
    totalOrderCount,
    pendingOrderCount,
    completedOrderCount,
    salesGrowthPercentage,
    customerGrowthPercentage,
    completedGrowthPercentage,
}: KPICardsProps) => {
    return (
        <Box
            display="grid"
            gridTemplateColumns={{
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)',
            }}
            gap={{ xs: 2, sm: 2.5, md: 3 }}
        >
            {/* Sales */}
            <KPICard
                title="Sales"
                value={todaysTotalRevenue || 0}
                unit="currency"
                change={salesGrowthPercentage || "+0.00%"}
                changeType={salesGrowthPercentage?.startsWith('+') ? "positive" : "negative"}

            />

            {/* Customers */}
            <KPICard
                title="Customers"
                value={totalCustomerCount}
                change={customerGrowthPercentage || "+0.00%"}
                changeType={customerGrowthPercentage?.startsWith('+') ? "positive" : "negative"}

            />

            {/* All Orders */}
            <KPICard
                title="All Orders"
                value={totalOrderCount}

            />

            {/* Pending */}
            <KPICard
                title="Pending"
                value={pendingOrderCount}
            />

            {/* Completed */}
            <KPICard
                title="Completed"
                value={completedOrderCount}
                change={completedGrowthPercentage || "+0.00%"}
                changeType={completedGrowthPercentage?.startsWith('+') ? "positive" : "negative"}
            />
        </Box>
    );
};
