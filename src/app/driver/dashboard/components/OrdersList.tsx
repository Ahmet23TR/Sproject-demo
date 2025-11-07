"use client";
import React from "react";
import { Box, Paper, Typography, Tooltip, Chip, Button } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { Order } from "@/types/data";
import Divider from "@mui/material/Divider";

interface OrdersListProps {
    orders: Order[];
    onOpenDetail: (orderId: string) => void;
    onDelivered: (orderId: string) => void;
    onOpenFail: (orderId: string) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({
    orders,
    onOpenDetail,
    onDelivered,
    onOpenFail,
}) => {
    if (!orders.length) {
        return (
            <Typography sx={{ mt: 2 }}>
                No orders found matching these criteria.
            </Typography>
        );
    }

    return (
        <Box
            display="grid"
            gap={{ xs: 1.5, sm: 2 }}
            sx={{ px: { xs: 1, sm: 0 } }}>
            {orders.map((order) => {
                const hasUnproducedItems = order.items?.some(
                    (item) =>
                        item.productionStatus === "PENDING" ||
                        item.productionStatus === "CANCELLED"
                );
                const hasPartialItems = order.items?.some(
                    (item) => item.productionStatus === "PARTIALLY_COMPLETED"
                );
                const hasCustomerNote = !!order.notes;
                // Distinct product count (not total quantity)
                const distinctCount = new Set(
                    (order.items || []).map((it) => it.product?.id || it.id)
                ).size;

                // Duruma göre renk kodlaması
                const getStatusColor = () => {
                    switch (order.deliveryStatus) {
                        case "DELIVERED":
                            return "success.main"; // Yeşil
                        case "FAILED":
                            return "error.main"; // Kırmızı
                        case "PARTIALLY_DELIVERED":
                            return "warning.main"; // Turuncu
                        case "READY_FOR_DELIVERY":
                        default:
                            return "primary.main"; // Mavi
                    }
                };

                // Butonları sadece henüz işaretlenmemiş (READY_FOR_DELIVERY) siparişlerde göster
                const isPending = order.deliveryStatus === "READY_FOR_DELIVERY";

                return (
                    <Paper
                        key={order.id}
                        sx={{
                            position: "relative",
                            p: 0,
                            mb: { xs: 1.5, sm: 2 },
                            cursor: "pointer",
                            transition: "box-shadow 0.2s",
                            "&:hover": { boxShadow: 4 },
                            borderRadius: 2,
                            overflow: "hidden",
                        }}
                        onClick={() => onOpenDetail(order.id)}>
                        {/* DURUM ŞERİDİ - Sol Kenar */}
                        <Box
                            sx={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 4,
                                backgroundColor: getStatusColor(),
                            }}
                        />

                        {/* BAŞLIK BÖLÜMÜ */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: { xs: 1.5, sm: 2 },
                                pb: { xs: 1, sm: 1 },
                                pl: { xs: 2.5, sm: 3 }, // Sol şerit için boşluk
                            }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{
                                    fontSize: { xs: "0.95rem", sm: "1.1rem" },
                                    color: "text.primary",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    flex: 1,
                                    pr: 1,
                                }}>
                                {order.user?.companyName
                                    ? order.user.companyName
                                    : "No Company Information"}
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}>
                                <Chip
                                    size="small"
                                    label={`${distinctCount} items`}
                                    variant="outlined"
                                    color="primary"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: {
                                            xs: "0.7rem",
                                            sm: "0.75rem",
                                        },
                                        borderWidth: 1.5,
                                    }}
                                />
                                {hasUnproducedItems && (
                                    <Tooltip title="⚠️ Some items not yet produced">
                                        <ErrorOutlineIcon
                                            color="error"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.1rem",
                                                    sm: "1.2rem",
                                                },
                                            }}
                                        />
                                    </Tooltip>
                                )}
                                {hasPartialItems && (
                                    <Tooltip title="⚡ Partially completed items">
                                        <WarningAmberIcon
                                            color="warning"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.1rem",
                                                    sm: "1.2rem",
                                                },
                                            }}
                                        />
                                    </Tooltip>
                                )}
                                {hasCustomerNote && (
                                    <Tooltip
                                        title={`📝 Customer Note: "${order.notes}"`}>
                                        <InfoOutlinedIcon
                                            color="info"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.1rem",
                                                    sm: "1.2rem",
                                                },
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ mx: { xs: 1.5, sm: 2 } }} />

                        {/* GÖVDE BÖLÜMÜ - İkon Tabanlı Bilgiler */}
                        <Box
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                pl: { xs: 2.5, sm: 3 },
                            }}>
                            {/* VURGULU ADRES */}
                            <Box
                                display="flex"
                                alignItems="flex-start"
                                gap={1}
                                sx={{ mb: 1 }}>
                                <LocationOnIcon
                                    color="action"
                                    sx={{
                                        fontSize: {
                                            xs: "1.1rem",
                                            sm: "1.2rem",
                                        },
                                        mt: 0.1,
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography
                                    variant="body1"
                                    fontWeight={700}
                                    sx={{
                                        fontSize: { xs: "0.95rem", sm: "1rem" },
                                        color: "text.primary",
                                        lineHeight: 1.4,
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitLineClamp: { xs: 2, sm: 1 },
                                        WebkitBoxOrient: "vertical",
                                        textOverflow: "ellipsis",
                                    }}>
                                    {order.user?.address ||
                                        "Address not available"}
                                </Typography>
                            </Box>

                            {/* SİPARİŞ NUMARASI */}
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                sx={{ opacity: 0.8 }}>
                                <LocalShippingIcon
                                    color="action"
                                    sx={{
                                        fontSize: { xs: "1rem", sm: "1.1rem" },
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: {
                                            xs: "0.8rem",
                                            sm: "0.875rem",
                                        },
                                    }}>
                                    {order.orderNumber}
                                </Typography>
                            </Box>
                        </Box>

                        {/* --- KARTIN ALT (FOOTER) BÖLÜMÜ --- */}
                        <Divider sx={{ my: 1.5 }} />

                        <Box
                            display="flex"
                            justifyContent="space-between" // Sol ve sağdaki öğeleri iki uca yaslar
                            alignItems="center" // Öğeleri dikeyde ortalar
                            sx={{
                                px: { xs: 1.5, sm: 2 },
                                pb: { xs: 1.5, sm: 2 },
                            }} // İçeriye padding
                        >
                            {/* BÖLÜM 1: SOL TARAF (Notlar) */}
                            <Box
                                flex={1}
                                minWidth={0}
                                sx={{ mr: 2, pl: { xs: 1, sm: 1.5 } }}>
                                {" "}
                                {/* Esnek genişlik ve sağa boşluk */}
                                {order.notes ? (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            fontSize: {
                                                xs: "0.75rem",
                                                sm: "0.8rem",
                                            },
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                        }}>
                                        📝 {order.notes}
                                    </Typography>
                                ) : (
                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        sx={{
                                            fontSize: {
                                                xs: "0.75rem",
                                                sm: "0.8rem",
                                            },
                                            fontStyle: "italic",
                                        }}>
                                        No notes
                                    </Typography>
                                )}
                            </Box>

                            {/* BÖLÜM 2: SAĞ TARAF (Aksiyon Butonları) */}
                            <Box display="flex" gap={1}>
                                {isPending && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: {
                                                    xs: "0.75rem",
                                                    sm: "0.8rem",
                                                },
                                                minWidth: {
                                                    xs: "65px",
                                                    sm: "75px",
                                                },
                                                py: 0.4,
                                                borderColor: "error.main",
                                                backgroundColor: "error.main",
                                                color: "white",
                                                "&:hover": {
                                                    borderColor: "error.dark",
                                                    backgroundColor:
                                                        "error.light",
                                                    color: "error.dark",
                                                },
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenFail(order.id);
                                            }}>
                                            Fail
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: {
                                                    xs: "0.75rem",
                                                    sm: "0.8rem",
                                                },
                                                minWidth: {
                                                    xs: "65px",
                                                    sm: "75px",
                                                },
                                                py: 0.4,
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelivered(order.id);
                                            }}>
                                            Done
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                        {/* --- FOOTER BÖLÜMÜ SONU --- */}
                    </Paper>
                );
            })}
        </Box>
    );
};

export default OrdersList;
