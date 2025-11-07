import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    Chip,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { LoadingButton } from "../../../../components/ui/LoadingButton";
import CloseIcon from "@mui/icons-material/Close";
// import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { Order, OrderItem } from "@/types/data";

interface OrderDetailModalProps {
    open: boolean;
    onClose: () => void;
    loading: boolean;
    error?: string | null;
    order?: Order | null;
    onDelivered?: (orderId: string) => Promise<void>;
    onOpenFail?: (orderId: string) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
    open,
    onClose,
    loading,
    error,
    order,
    onDelivered,
    onOpenFail,
}) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleDelivered = async () => {
        if (!order || !onDelivered) return;
        setIsProcessing(true);
        await onDelivered(order.id);
        setIsProcessing(false);
        onClose();
    };

    const handleOpenFail = () => {
        if (!order || !onOpenFail) return;
        onOpenFail(order.id);
        // Detail modal açık kalmalı, sadece FailReasonDialog açılacak
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={isMobile ? false : "lg"}
            fullWidth={!isMobile}
            fullScreen={isMobile}
            sx={{
                "& .MuiDialog-paper": {
                    margin: isMobile ? 0 : 2,
                    width: isMobile ? "100%" : "auto",
                    height: isMobile ? "100%" : "auto",
                    maxHeight: isMobile ? "100%" : "90vh",
                    minWidth: isMobile ? "auto" : "700px",
                },
            }}>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: "absolute",
                    top: isMobile ? 12 : 8,
                    right: isMobile ? 12 : 8,
                    width: isMobile ? 44 : 40,
                    height: isMobile ? 44 : 40,
                    zIndex: 1,
                }}>
                <CloseIcon fontSize={isMobile ? "medium" : "small"} />
            </IconButton>
            <DialogTitle
                sx={{
                    pr: isMobile ? 7 : 6, // Close button için yer bırak
                    py: isMobile ? 2 : 2,
                    fontSize: isMobile ? "1.1rem" : "1.5rem",
                    fontWeight: 600,
                }}>
                Order Details
            </DialogTitle>
            <DialogContent
                sx={{
                    px: isMobile ? 2 : 4,
                    py: isMobile ? 1 : 3,
                }}>
                {loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight={200}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : order ? (
                    <Box>
                        <Typography
                            variant={isMobile ? "body1" : "h6"}
                            fontWeight={700}
                            gutterBottom
                            sx={{
                                fontSize: isMobile ? "1rem" : "1.25rem",
                                mb: isMobile ? 1 : 1.5,
                            }}>
                            Order No: {order.orderNumber}
                        </Typography>
                        <Typography
                            variant={isMobile ? "body2" : "subtitle1"}
                            gutterBottom
                            sx={{
                                fontSize: isMobile ? "0.9rem" : "1.1rem",
                                mb: isMobile ? 1 : 1.5,
                            }}>
                            <b>Customer:</b> {order.user?.companyName}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.primary"
                            gutterBottom
                            sx={{
                                fontSize: isMobile ? "0.85rem" : "1rem",
                                lineHeight: 1.5,
                                mb: isMobile ? 1 : 2,
                            }}>
                            <b>Address:</b> {order.user?.address}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            gutterBottom>
                            Products:
                        </Typography>
                        <Box sx={{ pl: isMobile ? 0 : 1 }}>
                            {order.items?.map((item: OrderItem) => {
                                const producedQty = item.producedQuantity || 0;

                                // Calculate actual produced quantity for deliverable calculation
                                const actualProducedQty =
                                    item.productionStatus === "COMPLETED" &&
                                        producedQty === 0
                                        ? item.quantity
                                        : producedQty;
                                const isFullyDelivered =
                                    item.deliveryStatus === "DELIVERED";
                                // const hasAvailableStock = availableToDeliver > 0;

                                // Fix: Consider item as produced if status is COMPLETED or PARTIALLY_COMPLETED, even if quantity is 0
                                const isProduced =
                                    producedQty > 0 ||
                                    item.productionStatus === "COMPLETED" ||
                                    item.productionStatus ===
                                    "PARTIALLY_COMPLETED";
                                const isNotProduced = !isProduced;

                                return (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            mb: isMobile ? 1.5 : 3,
                                            p: isMobile ? 1.5 : 3,
                                            border: "1px solid #e0e0e0",
                                            borderRadius: 1,
                                        }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                mb: isMobile ? 1.5 : 1,
                                                flexDirection: isMobile
                                                    ? "column"
                                                    : "row",
                                                gap: isMobile ? 1 : 0,
                                            }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    gap: 4,
                                                }}>
                                                <Typography
                                                    variant={
                                                        isMobile
                                                            ? "body2"
                                                            : "h6"
                                                    }
                                                    sx={{
                                                        fontWeight: "bold",
                                                        fontSize: isMobile
                                                            ? "0.9rem"
                                                            : "1.1rem",
                                                        lineHeight: 1.3,
                                                    }}>
                                                    {item.product?.name}
                                                </Typography>
                                                {item.selectedOptions?.length >
                                                    0 && (
                                                        <Typography
                                                            fontSize={
                                                                isMobile ? 12 : 14
                                                            }
                                                            color="text.secondary"
                                                            sx={{
                                                                lineHeight: 1.2,
                                                            }}>
                                                            (
                                                            {item.selectedOptions
                                                                .map(
                                                                    (opt) =>
                                                                        opt
                                                                            .optionItem
                                                                            ?.name
                                                                )
                                                                .join(", ")}
                                                            )
                                                        </Typography>
                                                    )}
                                            </div>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: isMobile ? 0.5 : 1,
                                                    flexWrap: "wrap",
                                                    justifyContent: isMobile
                                                        ? "flex-start"
                                                        : "flex-end",
                                                    mt: isMobile ? 0 : 0,
                                                }}>
                                                {item.productionStatus ===
                                                    "COMPLETED" && (
                                                        <Chip
                                                            label="Production Completed"
                                                            color="success"
                                                            size="small"
                                                        />
                                                    )}
                                                {item.productionStatus ===
                                                    "PARTIALLY_COMPLETED" && (
                                                        <Chip
                                                            label="Partial Production"
                                                            color="warning"
                                                            size="small"
                                                        />
                                                    )}
                                                {(item.productionStatus ===
                                                    "PENDING" ||
                                                    item.productionStatus ===
                                                    "CANCELLED") &&
                                                    isNotProduced && (
                                                        <Chip
                                                            label="Not Produced"
                                                            color="error"
                                                            size="small"
                                                        />
                                                    )}
                                                {isFullyDelivered && (
                                                    <Chip
                                                        label="Delivery Completed"
                                                        color="primary"
                                                        size="small"
                                                    />
                                                )}
                                                {item.deliveryStatus ===
                                                    "PARTIAL" && (
                                                        <Chip
                                                            label="Partial Delivery"
                                                            color="info"
                                                            size="small"
                                                        />
                                                    )}
                                                {item.deliveryStatus ===
                                                    "FAILED" && (
                                                        <Chip
                                                            label="Cannot Deliver"
                                                            color="error"
                                                            size="small"
                                                        />
                                                    )}
                                            </Box>
                                        </Box>
                                        {/* {item.selectedOptions?.length > 0 && (
                                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                                Seçenekler:
                                            </Typography>
                                        )} */}
                                        {/* RESPONSIVE YAPILANDIRILMIŞ VERİ GÖSTERİMİ */}
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: isMobile
                                                    ? "1fr 1fr" // Mobile: ORDERED ve PRODUCED
                                                    : "1fr 1fr 1fr", // Desktop: ORDERED, PRODUCED, PREPARED BY
                                                gap: isMobile ? 2 : 4,
                                                mb: 2,
                                                p: isMobile ? 1.5 : 3,
                                                backgroundColor: "grey.50",
                                                borderRadius: 1,
                                                border: "1px solid",
                                                borderColor: "grey.200",
                                            }}>
                                            {/* 1. SÜTUN: SİPARİŞ EDİLEN */}
                                            <Box sx={{ textAlign: "center" }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "text.secondary",
                                                        fontWeight: 600,
                                                        letterSpacing: "0.5px",
                                                        display: "block",
                                                        mb: isMobile ? 0.5 : 1,
                                                        fontSize: isMobile
                                                            ? "0.7rem"
                                                            : "0.85rem",
                                                    }}>
                                                    ORDERED
                                                </Typography>
                                                <Typography
                                                    variant={
                                                        isMobile
                                                            ? "body1"
                                                            : "h5"
                                                    }
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: "text.primary",
                                                        fontSize: isMobile
                                                            ? "0.95rem"
                                                            : "1.3rem",
                                                        lineHeight: 1.2,
                                                    }}>
                                                    {item.quantity}{" "}
                                                    {item.product?.unit ||
                                                        "pieces"}
                                                </Typography>
                                            </Box>

                                            {/* 2. SÜTUN: ÜRETİLEN (Her zaman görünür) */}
                                            <Box sx={{ textAlign: "center" }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "text.secondary",
                                                        fontWeight: 600,
                                                        letterSpacing: "0.5px",
                                                        display: "block",
                                                        mb: isMobile ? 0.5 : 1,
                                                        fontSize: isMobile
                                                            ? "0.7rem"
                                                            : "0.85rem",
                                                    }}>
                                                    PRODUCED
                                                </Typography>
                                                <Typography
                                                    variant={
                                                        isMobile
                                                            ? "body1"
                                                            : "h5"
                                                    }
                                                    sx={{
                                                        fontWeight: 700,
                                                        color:
                                                            actualProducedQty >=
                                                                item.quantity
                                                                ? "success.main"
                                                                : "warning.main",
                                                        fontSize: isMobile
                                                            ? "0.95rem"
                                                            : "1.3rem",
                                                        lineHeight: 1.2,
                                                    }}>
                                                    {actualProducedQty}{" "}
                                                    {item.product?.unit ||
                                                        "pieces"}
                                                </Typography>
                                            </Box>

                                            {/* 3. SÜTUN: ÜRETEN ŞEF (Desktop Only) */}
                                            {!isMobile && (
                                                <Box
                                                    sx={{
                                                        textAlign: "center",
                                                    }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "text.secondary",
                                                            fontWeight: 600,
                                                            letterSpacing:
                                                                "0.5px",
                                                            display: "block",
                                                            mb: 1,
                                                            fontSize: "0.85rem",
                                                        }}>
                                                        PREPARED BY
                                                    </Typography>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: "text.primary",
                                                            fontSize: "1.1rem",
                                                            lineHeight: 1.3,
                                                        }}>
                                                        {item.processedByUser
                                                            ? `${item.processedByUser.name} ${item.processedByUser.surname}`
                                                            : "Not Assigned"}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>{" "}
                                        {item.deliveredByUser && (
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ mb: 1 }}>
                                                Delivered by:{" "}
                                                {item.deliveredByUser.name}{" "}
                                                {item.deliveredByUser.surname}
                                            </Typography>
                                        )}
                                        {item.productionNotes && (
                                            <Alert
                                                severity="info"
                                                sx={{
                                                    mb: 1,
                                                    fontSize: isMobile
                                                        ? "0.75rem"
                                                        : "0.8rem",
                                                    py: isMobile ? 0.5 : 1,
                                                }}>
                                                <strong>
                                                    Production Notes:
                                                </strong>{" "}
                                                {item.productionNotes}
                                            </Alert>
                                        )}
                                        {item.deliveryNotes && (
                                            <Alert
                                                severity="info"
                                                sx={{
                                                    mb: 1,
                                                    fontSize: isMobile
                                                        ? "0.75rem"
                                                        : "0.8rem",
                                                    py: isMobile ? 0.5 : 1,
                                                }}>
                                                <strong>Delivery Notes:</strong>{" "}
                                                {item.deliveryNotes}
                                            </Alert>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        {/*                         <Typography variant="body2" gutterBottom>
                            <b>Delivery Status:</b>{" "}
                            {order.deliveryStatus === "DELIVERED"
                                ? "Delivered"
                                : order.deliveryStatus === "FAILED"
                                    ? "Delivery Failed"
                                    : order.deliveryStatus === "PARTIALLY_DELIVERED"
                                        ? "Partially Delivered"
                                        : order.deliveryStatus === "READY_FOR_DELIVERY"
                                            ? "Ready for Delivery"
                                            : "Pending"}
                        </Typography>
                        {order.deliveredByUser && (
                            <Typography variant="body2" gutterBottom>
                                <b>Delivered by:</b>{" "}
                                {order.deliveredByUser.name}{" "}
                                {order.deliveredByUser.surname}
                            </Typography>
                        )} */}
                        {order.notes && (
                            <Alert
                                severity="info"
                                sx={{
                                    mt: 2,
                                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                                    py: isMobile ? 1 : 1.5,
                                }}>
                                <b>Customer Notes:</b> {order.notes}
                            </Alert>
                        )}
                    </Box>
                ) : (
                    <Typography>Details not found.</Typography>
                )}
            </DialogContent>
            <DialogActions
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isMobile ? "center" : "space-between",
                    flexWrap: "wrap",
                    gap: isMobile ? 2 : 2,
                    pt: isMobile ? 2 : 3,
                    pb: isMobile ? 2 : 2,
                    px: isMobile ? 2 : 4,
                }}>
                {order &&
                    onDelivered &&
                    onOpenFail &&
                    !loading &&
                    !error &&
                    order.deliveryStatus === "READY_FOR_DELIVERY" ? (
                    <Box
                        display="flex"
                        gap={isMobile ? 2 : 1}
                        flexDirection={isMobile ? "column" : "row"}
                        width={isMobile ? "100%" : "auto"}>
                        <LoadingButton
                            variant="contained"
                            onClick={handleDelivered}
                            color="success"
                            loading={isProcessing}
                            loadingLabel="Delivering..."
                            fullWidth={isMobile}
                            size={isMobile ? "large" : "medium"}
                            sx={{
                                minHeight: isMobile ? 48 : 36,
                                fontSize: isMobile ? "1rem" : "0.875rem",
                                fontWeight: 600,
                            }}>
                            Delivered
                        </LoadingButton>
                        <LoadingButton
                            variant="outlined"
                            onClick={handleOpenFail}
                            color="error"
                            disabled={isProcessing}
                            fullWidth={isMobile}
                            size={isMobile ? "large" : "medium"}
                            sx={{
                                minHeight: isMobile ? 48 : 36,
                                fontSize: isMobile ? "1rem" : "0.875rem",
                                fontWeight: 600,
                                borderColor: "error.main",
                                backgroundColor: "error.main",
                                color: "white",
                                "&:hover": {
                                    borderColor: "error.dark",
                                    backgroundColor: "error.light",
                                    color: "error.dark",
                                },
                            }}>
                            Failed
                        </LoadingButton>
                    </Box>
                ) : null}
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailModal;
