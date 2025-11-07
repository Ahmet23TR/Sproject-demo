"use client";
import React from "react";
import { Box, Paper, Typography, Tooltip, Chip } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { LoadingButton } from "../../../../components/ui/LoadingButton";
import { Order } from "@/types/data";
import { formatDeliveryStatus } from "../../../../utils/status";
import Divider from "@mui/material/Divider";

interface PoolOrdersListProps {
    orders: Order[];
    onOpenDetail: (orderId: string) => void;
    onClaim: (orderId: string) => void;
}

const PoolOrdersList: React.FC<PoolOrdersListProps> = ({
    orders,
    onOpenDetail,
    onClaim,
}) => {
    if (!orders.length) {
        return (
            <Typography sx={{ mt: 2 }}>
                There are currently no unassigned orders in the pool.
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
                const distinctCount = new Set(
                    (order.items || []).map((it) => it.product?.id || it.id)
                ).size;

                return (
                    <Paper
                        key={order.id}
                        sx={{
                            p: 0,
                            mb: 2,
                            cursor: "pointer",
                            transition: "box-shadow 0.2s",
                            "&:hover": { boxShadow: 4 },
                            borderRadius: 2,
                        }}
                        onClick={() => onOpenDetail(order.id)}>
                        {/* BAŞLIK BÖLÜMÜ: Müşteri ve Ana Eylem */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexDirection: "row",
                                gap: 1,
                                p: { xs: 1.5, sm: 2 },
                                pb: { xs: 1, sm: 1 },
                            }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{
                                    fontSize: { xs: "0.95rem", sm: "1.1rem" },
                                    color: "text.primary",
                                    lineHeight: 1.3,
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

                            <LoadingButton
                                size="small"
                                variant="contained"
                                color="primary"
                                sx={{
                                    minWidth: { xs: "70px", sm: "80px" },
                                    fontWeight: 600,
                                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                    py: { xs: 0.5, sm: 0.75 },
                                    flexShrink: 0,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClaim(order.id);
                                }}>
                                Claim
                            </LoadingButton>
                        </Box>

                        <Divider sx={{ mx: 2 }} />

                        {/* --- KARTIN GÖVDE (BODY) BÖLÜMÜ --- */}
                        <Box
                            sx={{
                                py: { xs: 1.5, sm: 2 },
                                px: { xs: 1.5, sm: 2 },
                            }}>
                            {/* 1. VURGULU ADRES BİLGİSİ */}
                            <Box
                                display="flex"
                                alignItems="flex-start"
                                gap={1}
                                sx={{ mb: { xs: 1, sm: 1.5 } }}>
                                <LocationOnIcon
                                    fontSize="small"
                                    color="action"
                                    sx={{ mt: 0.2, flexShrink: 0 }}
                                />
                                <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    color="text.primary"
                                    sx={{
                                        fontSize: { xs: "0.95rem", sm: "1rem" },
                                        lineHeight: { xs: 1.4, sm: 1.3 },
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitLineClamp: { xs: 2, sm: 1 },
                                        WebkitBoxOrient: "vertical",
                                        textOverflow: "ellipsis",
                                        whiteSpace: {
                                            xs: "normal",
                                            sm: "nowrap",
                                        },
                                        maxWidth: "100%",
                                        flex: 1,
                                    }}>
                                    {order.user?.address ||
                                        "Address not available"}
                                </Typography>
                            </Box>
                            {/* 2. DİĞER DETAY BİLGİLERİ (Daha küçük ve daha az vurgulu) */}
                            <Box
                                display="flex"
                                flexDirection="column"
                                gap={{ xs: 0.3, sm: 0.5 }}
                                sx={{ pl: { xs: 3, sm: 3.5 } }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: {
                                            xs: "0.8rem",
                                            sm: "0.875rem",
                                        },
                                    }}>
                                    Order No: {order.orderNumber}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: {
                                            xs: "0.8rem",
                                            sm: "0.875rem",
                                        },
                                    }}>
                                    Status:{" "}
                                    {order.deliveryStatus
                                        ? formatDeliveryStatus(
                                              order.deliveryStatus
                                          )
                                        : "-"}
                                </Typography>
                                {order.notes && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            fontSize: {
                                                xs: "0.8rem",
                                                sm: "0.875rem",
                                            },
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            textOverflow: "ellipsis",
                                        }}>
                                        Notes: {order.notes}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        {/* --- KARTIN GÖVDE BÖLÜMÜ SONU --- */}

                        <Divider sx={{ mx: 2 }} />

                        {/* ALT BİLGİ BÖLÜMÜ: Metrikler ve Uyarılar */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: { xs: 1.5, sm: 2 },
                                pt: { xs: 1, sm: 2 },
                            }}>
                            <Chip
                                size="small"
                                label={`${distinctCount} items`}
                                variant="outlined"
                                color="primary"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                    borderWidth: 1.5,
                                    height: { xs: 24, sm: 32 },
                                    "& .MuiChip-label": {
                                        px: { xs: 1, sm: 1.5 },
                                    },
                                }}
                            />

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: { xs: 0.5, sm: 1 },
                                }}>
                                {hasUnproducedItems && (
                                    <Tooltip
                                        title="⚠️ Alert: Some items are not yet produced. Check kitchen status before claiming."
                                        arrow
                                        placement="top">
                                        <ErrorOutlineIcon
                                            color="error"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.1rem",
                                                    sm: "1.3rem",
                                                },
                                                cursor: "help",
                                            }}
                                        />
                                    </Tooltip>
                                )}
                                {hasPartialItems && (
                                    <Tooltip
                                        title="Some items produced partially."
                                        arrow
                                        placement="top">
                                        <WarningAmberIcon
                                            color="warning"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.1rem",
                                                    sm: "1.3rem",
                                                },
                                                cursor: "help",
                                            }}
                                        />
                                    </Tooltip>
                                )}
                                {hasCustomerNote && (
                                    <Tooltip
                                        title={`📝 Customer Note: "${order.notes}" - Please read before delivery.`}
                                        arrow
                                        placement="top">
                                        <InfoOutlinedIcon
                                            color="info"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.1rem",
                                                    sm: "1.3rem",
                                                },
                                                cursor: "help",
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                );
            })}
        </Box>
    );
};

export default PoolOrdersList;
