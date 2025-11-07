import React from "react";
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Skeleton,
} from "@mui/material";
import {
    PeopleOutline,
    PersonAddOutlined,
    ShoppingCartOutlined,
    RepeatOutlined,
} from "@mui/icons-material";
import type { CustomerKPIMetrics } from "@/types/data";

interface CustomerKPICardsProps {
    data: CustomerKPIMetrics | null;
    loading?: boolean;
}

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: string;
    loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    icon,
    color = "#2563eb",
    loading = false,
}) => {
    return (
        <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="start">
                    <Box flex={1}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom>
                            {title}
                        </Typography>
                        {loading ? (
                            <Skeleton variant="text" width="80%" height={40} />
                        ) : (
                            <Typography
                                variant="body1"
                                fontSize={18}
                                fontWeight={700}
                                color={color}
                                gutterBottom>
                                {typeof value === "number" && value > 999
                                    ? `${(value / 1000).toFixed(1)}K`
                                    : value}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography
                                variant="caption"
                                color="text.secondary">
                                {loading ? (
                                    <Skeleton variant="text" width="60%" />
                                ) : (
                                    subtitle
                                )}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: `${color}15`,
                            color: color,
                        }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export const CustomerKPICards: React.FC<CustomerKPICardsProps> = ({
    data,
    loading = false,
}) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const kpiCards = [
        {
            title: "Total Active Customers",
            value: data?.totalActiveCustomers || 0,
            subtitle: data ? `${data.periodInfo.totalOrders} total orders` : "",
            icon: <PeopleOutline fontSize="large" />,
            color: "#2563eb",
        },
        {
            title: "New Customer Count",
            value: data?.newCustomers || 0,
            subtitle:
                data?.totalActiveCustomers && data?.newCustomers
                    ? `${Math.round(
                          (data.newCustomers / data.totalActiveCustomers) * 100
                      )}% growth rate`
                    : "",
            icon: <PersonAddOutlined fontSize="large" />,
            color: "#059669",
        },
        {
            title: "Average Order Value",
            value: data
                ? formatCurrency(data.averageOrderValue)
                : formatCurrency(0),
            subtitle: data
                ? `${formatCurrency(
                      data.periodInfo.totalRevenue
                  )} total revenue`
                : "",
            icon: <ShoppingCartOutlined fontSize="large" />,
            color: "#dc2626",
        },
        {
            title: "Order Frequency",
            value: data ? `${data.orderFrequency.toFixed(1)}x` : "0x",
            subtitle: "Average orders per customer",
            icon: <RepeatOutlined fontSize="large" />,
            color: "#7c3aed",
        },
    ];

    return (
        <Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "repeat(1, 1fr)",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                    },
                    gap: 3,
                }}>
                {kpiCards.map((card, index) => (
                    <KPICard
                        key={index}
                        title={card.title}
                        value={card.value}
                        subtitle={card.subtitle}
                        icon={card.icon}
                        color={card.color}
                        loading={loading}
                    />
                ))}
            </Box>

            {data && !loading && (
                <Paper
                    elevation={1}
                    sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: "#f8fafc",
                        border: "1px solid",
                        borderColor: "divider",
                    }}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Analysis Summary:</strong> During this period,{" "}
                        {data.totalActiveCustomers} active customers placed a
                        total of {data.periodInfo.totalOrders} orders generating{" "}
                        {formatCurrency(data.periodInfo.totalRevenue)}
                        in revenue. You acquired {data.newCustomers} new
                        customers and received an average of{" "}
                        {data.orderFrequency.toFixed(1)} orders per customer.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};
