"use client";
import {
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { useRouter } from "next/navigation";
import type { Order } from "@/types/data";
import { formatCurrency, formatDateTime, getDeliveryStatusChip, getOrderTotal } from "./clientDetailUtils";

interface OrderCardProps {
    order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
    const router = useRouter();
    const { label, sx } = getDeliveryStatusChip(order.deliveryStatus);

    return (
        <Card
            onClick={() => router.push(`/admin/orders/${order.id}`)}
            sx={{
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.06)",
                "&:hover": {
                    boxShadow: "0px 8px 20px rgba(15, 23, 42, 0.12)",
                    transform: "translateY(-2px)",
                },
                "&:active": {
                    transform: "translateY(0)",
                },
            }}>
            <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                    {/* Header: Order Number and Status */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}>
                        <Typography
                            fontWeight={700}
                            sx={{
                                fontSize: "1rem",
                                color: "#111827",
                            }}>
                            #{order.orderNumber ?? "—"}
                        </Typography>
                        <Chip
                            size="small"
                            label={label}
                            sx={{
                                ...sx,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                            }}
                        />
                    </Stack>

                    {/* Order Details */}
                    <Stack spacing={1.2}>
                        {/* Date */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <CalendarTodayOutlinedIcon
                                sx={{
                                    fontSize: "0.9rem",
                                    color: "#6b7280",
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: "0.8rem",
                                    color: "#374151",
                                }}>
                                {formatDateTime(order.createdAt)}
                            </Typography>
                        </Stack>

                        {/* Items Count */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <LocalMallOutlinedIcon
                                sx={{
                                    fontSize: "0.9rem",
                                    color: "#6b7280",
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: "0.8rem",
                                    color: "#374151",
                                }}>
                                {order.items?.length ?? 0} {order.items?.length === 1 ? "item" : "items"}
                            </Typography>
                        </Stack>

                        {/* Total Amount */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                                mt: 1,
                                pt: 1.5,
                                borderTop: "1px solid rgba(148, 163, 184, 0.15)",
                            }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <PaymentsOutlinedIcon
                                    sx={{
                                        fontSize: "0.9rem",
                                        color: "#6b7280",
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: "0.75rem",
                                        color: "#6b7280",
                                    }}>
                                    Order Total
                                </Typography>
                            </Stack>
                            <Typography
                                sx={{
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    color: "#111827",
                                }}>
                                {formatCurrency(getOrderTotal(order))}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

