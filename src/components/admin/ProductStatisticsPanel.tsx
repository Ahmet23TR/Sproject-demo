// src/components/admin/ProductStatisticsPanel.tsx
import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    Inventory,
    CheckCircle,
    Cancel,
    TrendingUp,
} from "@mui/icons-material";
import { ProductStatistics } from "../../services/productService";

interface ProductStatisticsPanelProps {
    statistics?: ProductStatistics;
    loading?: boolean;
    error?: string | null;
}

export const ProductStatisticsPanel: React.FC<ProductStatisticsPanelProps> = ({
    statistics,
    loading,
    error,
}) => {
    if (loading) {
        return (
            <Box sx={{ mb: 4 }}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={6}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}>
                        <CircularProgress size={40} sx={{ color: "#C9A227" }} />
                        <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                            Loading product statistics...
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mb: 4 }}>
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#EF4444",
                    }}>
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, mb: 1 }}>
                            Unable to load statistics
                        </Typography>
                        <Typography variant="caption">{error}</Typography>
                    </Box>
                </Alert>
            </Box>
        );
    }

    if (!statistics) {
        return null;
    }

    const statisticCards = [
        {
            title: "Total Products",
            value: statistics.totalProducts,
            icon: <Inventory sx={{ fontSize: 40, color: "#111827" }} />,
            color: "#111827",
        },
        {
            title: "Active Products",
            value: statistics.activeProducts,
            icon: <CheckCircle sx={{ fontSize: 40, color: "#16A34A" }} />,
            color: "#16A34A",
        },
        {
            title: "Inactive Products",
            value: statistics.inactiveProducts,
            icon: <Cancel sx={{ fontSize: 40, color: "#EF4444" }} />,
            color: "#EF4444",
        },
    ];

    return (
        <Box sx={{ mb: 4 }}>
            <Card
                sx={{
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                    },
                }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        {/* Statistics Cards */}
                        {statisticCards.map((stat, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                <Box
                                    sx={{
                                        p: 2.5,
                                        borderRadius: "12px",
                                        backgroundColor: "#F8FAFC",
                                        border: "1px solid #E2E8F0",
                                        height: "100%",
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            backgroundColor: "#F1F5F9",
                                            borderColor: "#CBD5E1",
                                        },
                                    }}>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between">
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "#9CA3AF",
                                                    fontWeight: 500,
                                                    mb: 0.8,
                                                    fontSize: "0.8rem",
                                                }}>
                                                {stat.title}
                                            </Typography>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: stat.color,
                                                    fontSize: "1.8rem",
                                                }}>
                                                {stat.value}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                borderRadius: "10px",
                                                p: 1.2,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                            <Box
                                                sx={{
                                                    fontSize: 28,
                                                    color: stat.color,
                                                }}>
                                                {React.cloneElement(stat.icon, {
                                                    sx: {
                                                        fontSize: 28,
                                                        color: stat.color,
                                                    },
                                                })}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}

                        {/* Top Selling Product Card */}
                        <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: "12px",
                                    backgroundColor: "#F8FAFC",
                                    border: "1px solid #E2E8F0",
                                    height: "100%",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        backgroundColor: "#F1F5F9",
                                        borderColor: "#CBD5E1",
                                    },
                                }}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between">
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "#9CA3AF",
                                                fontWeight: 500,
                                                mb: 0.8,
                                                fontSize: "0.8rem",
                                            }}>
                                            Top Selling Product (30 Days)
                                        </Typography>

                                        {statistics.topSellingProductByRevenue ? (
                                            <>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        color: "#111827",
                                                        fontSize: "1.1rem",
                                                        lineHeight: 1.3,
                                                    }}>
                                                    {
                                                        statistics
                                                            .topSellingProductByRevenue
                                                            .name
                                                    }
                                                </Typography>
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        color: "#C9A227",
                                                        fontWeight: 700,
                                                        fontSize: "1.4rem",
                                                    }}>
                                                    {new Intl.NumberFormat(
                                                        "en-AE",
                                                        {
                                                            style: "currency",
                                                            currency: "AED",
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 2,
                                                        }
                                                    ).format(
                                                        statistics
                                                            .topSellingProductByRevenue
                                                            .totalRevenue
                                                    )}
                                                </Typography>
                                            </>
                                        ) : (
                                            <>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        color: "#111827",
                                                        fontSize: "1.1rem",
                                                    }}>
                                                    No Sales Data
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: "#9CA3AF",
                                                        fontWeight: 500,
                                                        fontSize: "0.9rem",
                                                    }}>
                                                    No orders in the last 30
                                                    days
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                    <Box
                                        sx={{
                                            backgroundColor: "#F0F9FF",
                                            borderRadius: "10px",
                                            p: 1.2,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                        <TrendingUp
                                            sx={{
                                                fontSize: 28,
                                                color: "#C9A227",
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};
