"use client";
import { Box, Typography, Card, CardContent, Divider, List, ListItem, ListItemText, Button, Chip, Stack } from '@mui/material';
import { Order } from '../../../../types/data';
import { useRouter } from 'next/navigation';
import { calculateOrderItemPrices } from '../../../../utils/price';

interface PastOrderCardProps {
    order: Order;
    onReorder: (order: Order) => void;
}

export const PastOrderCard = ({ order, onReorder }: PastOrderCardProps) => {
    const router = useRouter();
    const getUnitDisplay = (unit: string) => {
        switch (unit) {
            case 'KG': return 'kg';
            case 'PIECE': return 'pc';
            case 'TRAY': return 'tray';
            default: return unit;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    };

    const getUnifiedStatusChip = (order: Order) => {
        // Check for various failure conditions
        const hasCancelledItems = order.items.some(item => item.productionStatus === 'CANCELLED');
        const hasPartialItems = order.items.some(item => item.productionStatus === 'PARTIALLY_COMPLETED');
        const isPartiallyDelivered = order.deliveryStatus === 'PARTIALLY_DELIVERED';
        const isDeliveryFailed = order.deliveryStatus === 'FAILED';
        const isCancelled = order.deliveryStatus === 'CANCELLED';
        const isCompleted = order.deliveryStatus === 'DELIVERED';

        let label: string;
        let color: 'success' | 'warning' | 'error' | 'info' | 'default';

        if (isCompleted) {
            label = 'Completed';
            color = 'success';
        } else if (isDeliveryFailed) {
            label = 'Delivery Failed';
            color = 'error';
        } else if (isCancelled) {
            label = 'Cancelled';
            color = 'error';
        } else if (isPartiallyDelivered) {
            label = 'Partially Delivered';
            color = 'info';
        } else if (hasCancelledItems) {
            label = 'Partially Available';
            color = 'info';
        } else if (hasPartialItems) {
            label = 'Partially Fulfilled';
            color = 'warning';
        } else {
            label = 'Pending';
            color = 'warning';
        }

        return <Chip size="small" label={label} color={color} />;
    };

    return (
        <Card
            onClick={() => router.push(`/client/order-history/${order.id}`)}
            sx={{ borderRadius: 2, boxShadow: 1, width: '100%', cursor: 'pointer' }}
        >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    gap={1}
                    mb={1.5}
                >
                    <Typography variant="h6" fontWeight={600}>
                        #{order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                    </Typography>
                </Box>

                {order.notes && (
                    <Typography variant="body2" sx={{ my: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <span style={{ fontWeight: 600 }}>Your Order Note:</span> {order.notes}
                    </Typography>
                )}

                <Divider />

                {/* Status section */}
                <Box mt={2} mb={1.5}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight={600}>Status:</Typography>
                            {getUnifiedStatusChip(order)}
                        </Box>
                        {(order.deliveryStatus === 'DELIVERED' || order.deliveryStatus === 'PARTIALLY_DELIVERED') && order.deliveredAt && (
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" fontWeight={600}>Delivered At:</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {new Date(order.deliveredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                        )}
                        {(order.deliveryStatus === 'FAILED' || order.deliveryStatus === 'CANCELLED') && order.deliveryNotes && (
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" fontWeight={600} color="error.main">Reason:</Typography>
                                <Typography variant="body2" color="error.main">
                                    {order.deliveryNotes}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </Box>

                <List dense disablePadding sx={{ my: 1 }}>
                    {order.items.slice(0, 3).map(item => {
                        const selectedOptionsText = item.selectedOptions?.map(opt => opt.optionItem.name).join(', ');
                    const retailUnit = item.retailUnitPrice;
                    const retailTotal = item.retailTotalPrice;
                    const { unitPrice, totalPrice } = retailUnit !== undefined && retailTotal !== undefined
                        ? { unitPrice: retailUnit, totalPrice: retailTotal }
                        : calculateOrderItemPrices(item);
                        return (
                            <ListItem key={item.id} disableGutters>
                                <ListItemText
                                    primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography component="span" fontWeight={600}>
                                                {item.quantity} {getUnitDisplay(item.product?.unit || '')} x {item.product?.name}
                                            </Typography>
                                            <Box textAlign="right">
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatPrice(unitPrice)} / {getUnitDisplay(item.product?.unit || '')}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {formatPrice(totalPrice)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    }
                                    secondary={selectedOptionsText ? `( ${selectedOptionsText} )` : null}
                                    secondaryTypographyProps={{ color: 'primary.main', sx: { fontStyle: 'italic' } }}
                                />
                            </ListItem>
                        );
                    })}
                    {order.items.length > 3 && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', textAlign: 'right', mt: 1 }}
                        >
                            ...and {order.items.length - 3} more products
                        </Typography>
                    )}
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Totals: show both if differ, otherwise a single total */}
                {(() => {
                    const fallback = order.items.reduce((sum, item) => {
                        const unit = item.retailUnitPrice ?? item.unitPrice ?? 0;
                        const total = item.retailTotalPrice ?? item.totalPrice ?? unit * (item.quantity || 0);
                        return sum + Number(total || 0);
                    }, 0);
                    const initialAmount = order.initialRetailTotalAmount ?? fallback;
                    const finalAmount = order.finalRetailTotalAmount ?? fallback;
                    const same = Math.abs(initialAmount - finalAmount) < 0.005;
                    if (same) {
                        return (
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" fontWeight={700}>Total Amount</Typography>
                                <Typography variant="h6" fontWeight={700} color="primary.main">{formatPrice(finalAmount)}</Typography>
                            </Box>
                        );
                    }
                    return (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1" color="text.secondary">Original Amount</Typography>
                                <Typography variant="h6" fontWeight={500} color="text.secondary" sx={{ textDecoration: 'line-through' }}>{formatPrice(initialAmount)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={2}>
                                <Typography variant="h6" fontWeight={700} color="primary.main">Final Invoice Amount</Typography>
                                <Typography variant="h5" fontWeight={700} color="primary.main">{formatPrice(finalAmount)}</Typography>
                            </Box>
                        </>
                    );
                })()}

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={(e) => { e.stopPropagation(); onReorder(order); }}
                    sx={{ fontWeight: 600 }}
                >
                    Reorder
                </Button>
            </CardContent>
        </Card>
    );
};
