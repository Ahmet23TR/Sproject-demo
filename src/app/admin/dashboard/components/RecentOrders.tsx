"use client";
import { Box, Typography, List, ListItem, Avatar, Chip } from "@mui/material";
import { Order } from "@/types/data";

type ExtendedOrder = Order & {
    finalWholesaleTotalAmount?: number | null;
    initialWholesaleTotalAmount?: number | null;
};

interface RecentOrdersProps {
    orders: Order[];
    loading: boolean;
}

const getStatusColor = (deliveryStatus: string) => {
    switch (deliveryStatus) {
        case 'DELIVERED':
            return '#16A34A'; // Green
        case 'PENDING':
            return '#F59E0B'; // Yellow/Orange
        case 'PARTIALLY_DELIVERED':
            return '#3B82F6'; // Blue
        case 'READY_FOR_DELIVERY':
            return '#8B5CF6'; // Purple
        case 'CANCELLED':
        case 'FAILED':
            return '#EF4444'; // Red
        default:
            return '#9CA3AF'; // Gray
    }
};

const getStatusLabel = (deliveryStatus: string) => {
    switch (deliveryStatus) {
        case 'DELIVERED':
            return 'Completed';
        case 'PENDING':
            return 'Pending';
        case 'PARTIALLY_DELIVERED':
            return 'Partial';
        case 'READY_FOR_DELIVERY':
            return 'Ready';
        case 'CANCELLED':
            return 'Cancelled';
        case 'FAILED':
            return 'Failed';
        default:
            return 'Unknown';
    }
};

const selectOrderAmount = (order: ExtendedOrder) => {
    return (
        order.finalWholesaleTotalAmount ??
        order.initialWholesaleTotalAmount ??
        order.finalTotalAmount ??
        order.initialTotalAmount ??
        null
    );
};

const formatPrice = (amount?: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const RecentOrders = ({ orders, loading }: RecentOrdersProps) => {
    if (loading) {
        return (
            <Box
                sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: { xs: 2, md: 3 },
                    boxShadow: '0 4px 20px rgba(17, 24, 39, 0.06)',
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.06)',
                    p: { xs: 2, sm: 2.5, md: 3 },
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 600,
                        color: '#111827',
                        fontSize: '16px',
                        mb: 2,
                    }}
                >
                    Recent Orders
                </Typography>
                <Box display="flex" justifyContent="center" py={3}>
                    <Typography color="text.secondary">Loading orders...</Typography>
                </Box>
            </Box>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Box
                sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: { xs: 2, md: 3 },
                    boxShadow: '0 20px 60px rgba(17, 24, 39, 0.08)',
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    p: { xs: 2, sm: 3, md: 4 },
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 600,
                        color: '#111827',
                        mb: 3,
                    }}
                >
                    Recent Orders
                </Typography>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                    <Typography color="text.secondary" mb={1}>No Orders Yet?</Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Add products to your store and start selling to see orders here.
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                bgcolor: '#FFFFFF',
                borderRadius: { xs: 2, md: 3 },
                boxShadow: '0 4px 20px rgba(17, 24, 39, 0.06)',
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.06)',
                p: { xs: 2, sm: 2.5, md: 3 },
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 600,
                        color: '#111827',
                        fontSize: { xs: '14px', sm: '15px', md: '16px' },
                    }}
                >
                    Recent Orders
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: '#9CA3AF',
                        fontSize: { xs: '11px', sm: '12px' },
                    }}
                >
                    Last 7 Days
                </Typography>
            </Box>

            <Box sx={{ maxHeight: { xs: 400, sm: 350, md: 320 }, overflowY: 'auto' }}>
                <List sx={{ p: 0 }}>
                    {orders.map((order, index) => (
                        <ListItem
                            key={order.id}
                            sx={{
                                p: 0,
                                mb: index < orders.length - 1 ? 2 : 0,
                                '&:last-child': {
                                    mb: 0,
                                },
                            }}
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                width="100%"
                                sx={{
                                    p: { xs: 1.5, sm: 2 },
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'rgba(0, 0, 0, 0.04)',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        borderColor: 'rgba(201, 162, 39, 0.3)',
                                        bgcolor: 'rgba(201, 162, 39, 0.02)',
                                    },
                                }}
                            >
                                {/* User Avatar */}
                                <Avatar
                                    sx={{
                                        bgcolor: 'rgba(201, 162, 39, 0.1)',
                                        color: '#C9A227',
                                        width: { xs: 40, sm: 44, md: 48 },
                                        height: { xs: 40, sm: 44, md: 48 },
                                        fontSize: { xs: '14px', sm: '15px', md: '16px' },
                                        fontWeight: 600,
                                        mr: { xs: 1.5, sm: 2 },
                                    }}
                                >
                                    {order.user?.name?.charAt(0)}{order.user?.surname?.charAt(0)}
                                </Avatar>

                                {/* Order Info */}
                                <Box flex={1}>
                                    {/* Top Row: User Name and Date */}
                                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={{ xs: 0.5, sm: 1 }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                                fontWeight: 600,
                                                color: '#111827',
                                                fontSize: { xs: '14px', sm: '15px', md: '16px' },
                                            }}
                                        >
                                            {order.user?.name} {order.user?.surname}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                                color: '#9CA3AF',
                                                fontSize: { xs: '10px', sm: '11px', md: '12px' },
                                                display: { xs: 'none', sm: 'block' },
                                            }}
                                        >
                                            {formatDate(order.createdAt)}
                                        </Typography>
                                    </Box>

                                    {/* Bottom Row: Order Number, Amount and Status */}
                                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={{ xs: 1, sm: 0 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#9CA3AF',
                                                fontSize: { xs: '12px', sm: '13px', md: '14px' },
                                            }}
                                        >
                                            Order #{order.orderNumber}
                                        </Typography>

                                        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5, md: 2 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                                    fontWeight: 600,
                                                    color: '#111827',
                                                    fontSize: { xs: '13px', sm: '14px', md: '15px' },
                                                }}
                                            >
                                            {formatPrice(selectOrderAmount(order))}
                                            </Typography>
                                            <Chip
                                                label={getStatusLabel(order.deliveryStatus)}
                                                size="small"
                                                sx={{
                                                    bgcolor: getStatusColor(order.deliveryStatus),
                                                    color: '#FFFFFF',
                                                    fontWeight: 600,
                                                    fontSize: { xs: '10px', sm: '11px' },
                                                    height: { xs: '22px', sm: '24px', md: '26px' },
                                                    '& .MuiChip-label': {
                                                        px: { xs: 1, sm: 1.5 },
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </Box>

        </Box>
    );
};
