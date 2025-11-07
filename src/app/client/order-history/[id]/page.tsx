"use client";
import React from "react";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { Box, Typography, CircularProgress, Alert, Divider, List, Chip, Button, Card, CardHeader, CardContent, CardActions } from "@mui/material";
import { useOrderDetail } from "../../../../hooks/order/useOrderDetail";
import type { Order } from "../../../../types/data";
import { useReorder } from "../../../../hooks/order/useReorder";
import { calculateOrderItemPrices } from "../../../../utils/price";


const getUnitDisplay = (unit: string) => {
    switch (unit) {
        case "KG": return "kg";
        case "PIECE": return "pc";
        case "TRAY": return "tray";
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

const UnifiedStatusChip = ({ order }: { order: Order }) => {
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
        color = 'default';
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

    return <Chip size="medium" label={label} color={color} />;
};

export default function OrderDetailPage() {
    const { order, loading, error } = useOrderDetail();
    const { reorder } = useReorder();

    return (
        <ProtectedRoute requiredRole="CLIENT">
            <Box maxWidth={900} mx="auto" my={{ xs: 3, md: 6 }} px={2}>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : !order ? (
                    <Alert severity="warning">Order not found.</Alert>
                ) : (
                    <Card elevation={0} sx={{ backgroundColor: '#FFFFFF', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <CardHeader
                            title={
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        Order #{order.orderNumber}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                                    </Typography>
                                </Box>
                            }
                            action={<UnifiedStatusChip order={order} />}
                            sx={{ pb: 0, '& .MuiCardHeader-action': { alignSelf: 'flex-start', mt: 0.5 } }}
                        />

                        <CardContent>
                            {(order.deliveryStatus === 'DELIVERED' || order.deliveryStatus === 'PARTIALLY_DELIVERED') && order.deliveredAt && (
                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                    <Typography variant="body2" fontWeight={600}>Delivered At:</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(order.deliveredAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            )}
                            {(order.deliveryStatus === 'FAILED' || order.deliveryStatus === 'CANCELLED') && order.deliveryNotes && (
                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                    <Typography variant="body2" fontWeight={600} color="error.main">Reason:</Typography>
                                    <Typography variant="body2" color="error.main">{order.deliveryNotes}</Typography>
                                </Box>
                            )}

                            {order.notes && (
                                <Alert severity="warning" sx={{ my: 2 }}>
                                    <strong>Order Note:</strong> {order.notes}
                                </Alert>
                            )}

                            {order.attachmentUrl && (
                                <Box mt={1} mb={2}>
                                    {order.attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" mb={1}>
                                                Order Document:
                                            </Typography>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={order.attachmentUrl}
                                                alt="Order Document"
                                                style={{
                                                    maxWidth: 300,
                                                    maxHeight: 200,
                                                    objectFit: 'contain',
                                                    borderRadius: 8,
                                                    border: '1px solid #E5E7EB',
                                                    display: 'block',
                                                    marginBottom: 8
                                                }}
                                            />
                                            <Button
                                                component="a"
                                                variant="outlined"
                                                color="secondary"
                                                href={order.attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="small"
                                                sx={{ borderColor: 'secondary.main', color: 'secondary.main' }}
                                            >
                                                View Full Size
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Button
                                            component="a"
                                            variant="outlined"
                                            color="secondary"
                                            href={order.attachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ borderColor: 'secondary.main', color: 'secondary.main' }}
                                        >
                                            View Document
                                        </Button>
                                    )}
                                </Box>
                            )}

                            {/* Items as structured rows with dividers */}
                            <List dense disablePadding sx={{ mt: 0.5 }}>
                                {order.items.map((item, idx) => {
                                    const selectedOptionsText = item.selectedOptions?.map(opt => opt.optionItem.name).join(', ');
                                    // Prefer retail snapshots for CLIENT role; fallback to legacy calculator
                                    const retailUnit = item.retailUnitPrice;
                                    const retailTotal = item.retailTotalPrice;
                                    const { unitPrice, totalPrice } = retailUnit !== undefined && retailTotal !== undefined
                                        ? { unitPrice: retailUnit, totalPrice: retailTotal }
                                        : calculateOrderItemPrices(item);
                                    return (
                                        <React.Fragment key={item.id}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr auto',
                                                    gap: 2,
                                                    alignItems: 'center',
                                                    py: 1.5,
                                                }}
                                            >
                                                {/* Left: product info */}
                                                <Box>
                                                    <Typography variant="body1" fontWeight={600}>{item.product?.name}</Typography>
                                                    {selectedOptionsText ? (
                                                        <Typography variant="body2" color="text.secondary">( {selectedOptionsText} )</Typography>
                                                    ) : null}
                                                </Box>

                                                {/* Right: price info */}
                                                <Box textAlign="right">
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.quantity} {getUnitDisplay(item.product?.unit || '')} x {formatPrice(unitPrice)} / {getUnitDisplay(item.product?.unit || '')}
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={600}>
                                                        {formatPrice(totalPrice)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {idx < (order.items.length - 1) && <Divider />}
                                        </React.Fragment>
                                    );
                                })}
                            </List>

                            <Divider sx={{ my: 2 }} />

                            {/* Totals: original vs final; if equal, show single total */}
                            {(() => {
                                // Client-facing: retail totals
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
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6" fontWeight={700}>Total Amount</Typography>
                                            <Typography variant="h5" fontWeight={800} color="primary.main">{formatPrice(finalAmount)}</Typography>
                                        </Box>
                                    );
                                }
                                return (
                                    <>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1" color="text.secondary">Original Amount</Typography>
                                            <Typography variant="h6" fontWeight={500} color="text.secondary" sx={{ textDecoration: 'line-through' }}>{formatPrice(initialAmount)}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">Final Invoice Amount</Typography>
                                            <Typography variant="h5" fontWeight={800} color="primary.main">{formatPrice(finalAmount)}</Typography>
                                        </Box>
                                    </>
                                );
                            })()}
                        </CardContent>

                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                onClick={(e) => { e.stopPropagation(); if (order) reorder(order); }}
                                sx={{ fontWeight: 600 }}
                            >
                                Reorder
                            </Button>
                        </CardActions>
                    </Card>
                )}
            </Box>
        </ProtectedRoute>
    );
}
