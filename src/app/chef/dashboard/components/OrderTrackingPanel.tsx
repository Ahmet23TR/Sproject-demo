import React from "react";
import { Paper, Typography, Box, Stack } from "@mui/material";
import { Order, PaginationInfo, ProductGroup } from "../../../../types/data";
import { OrderAccordion } from "./OrderAccordion";
import PaginationComponent from "../../../../components/PaginationComponent";

interface OrderTrackingPanelProps {
    orders: Order[];
    expandedOrderId: string | null;
    onAccordionToggle: (orderId: string) => void;
    onComplete: (itemId: string) => void;
    onCancel: (item: Order["items"][0]) => void;
    onPartial: (item: Order["items"][0]) => void;
    isSubmitting: boolean;
    pagination?: PaginationInfo;
    onPageChange?: (event: React.ChangeEvent<unknown>, value: number) => void;
    showPaginationInfo?: boolean;
    chefProductGroup?: ProductGroup | null;
}

export const OrderTrackingPanel: React.FC<OrderTrackingPanelProps> = ({
    orders,
    expandedOrderId,
    onAccordionToggle,
    onComplete,
    onCancel,
    onPartial,
    isSubmitting,
    pagination,
    onPageChange,
    showPaginationInfo = true,
    chefProductGroup,
}) => (
    <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
        <Typography
            variant="h6"
            fontWeight={700}
            gutterBottom
            sx={{ mb: 2, fontSize: "16px" }}>
            Order Tracking
        </Typography>
        <Box sx={{ height: { xs: 400, md: "60vh" }, overflow: "auto" }}>
            <Stack spacing={2}>
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <OrderAccordion
                            key={order.id}
                            order={order}
                            isExpanded={expandedOrderId === order.id}
                            onToggle={() => onAccordionToggle(order.id)}
                            onComplete={onComplete}
                            onCancel={onCancel}
                            onPartial={onPartial}
                            updatingItemId={isSubmitting ? "loading" : null}
                            detailsMaxHeight={220}
                            chefProductGroup={chefProductGroup}
                        />
                    ))
                ) : (
                    <Typography sx={{ mt: 2 }}>No orders to track.</Typography>
                )}
            </Stack>
        </Box>
        {pagination && onPageChange && (
            <PaginationComponent
                pagination={pagination}
                onPageChange={onPageChange}
                showInfo={showPaginationInfo}
            />
        )}
    </Paper>
);
