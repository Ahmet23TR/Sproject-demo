"use client";
import { Box, Typography, Divider } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import type { DistributorDailySummary } from "@/types/data";

interface DailySummaryCardProps {
    summary: DistributorDailySummary;
}

export const DailySummaryCard = ({ summary }: DailySummaryCardProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Box
            sx={{
                bgcolor: "#FFFFFF",
                borderRadius: 3,
                p: { xs: 2.5, sm: 3, md: 4 },
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.06)",
                boxShadow: "0 8px 32px rgba(17, 24, 39, 0.08)",
            }}
        >
            {/* Header */}
            <Typography
                variant="h6"
                sx={{
                    fontFamily:
                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 600,
                    color: "#111827",
                    fontSize: { xs: "18px", sm: "20px" },
                    mb: 3,
                }}
            >
                Daily Summary
            </Typography>

            {/* Summary Row */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 3,
                    flexWrap: { xs: "wrap", md: "nowrap" },
                }}
            >
                {/* Total Clients */}
                <Box sx={{ flex: 1, minWidth: { xs: "45%", sm: "auto" } }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <PeopleIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#9CA3AF",
                                fontSize: "14px",
                                fontWeight: 500,
                            }}
                        >
                            Total Clients
                        </Typography>
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            color: "#111827",
                            fontSize: { xs: "24px", sm: "28px" },
                        }}
                    >
                        {summary.totalClients}
                    </Typography>
                </Box>

                {/* Divider */}
                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        display: { xs: "none", md: "block" },
                        borderColor: "rgba(0, 0, 0, 0.06)",
                        height: "60px",
                    }}
                />

                {/* Total Orders */}
                <Box sx={{ flex: 1, minWidth: { xs: "45%", sm: "auto" } }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <ShoppingCartIcon
                            sx={{ color: "#9CA3AF", fontSize: 20 }}
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#9CA3AF",
                                fontSize: "14px",
                                fontWeight: 500,
                            }}
                        >
                            Total Orders
                        </Typography>
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            color: "#111827",
                            fontSize: { xs: "24px", sm: "28px" },
                        }}
                    >
                        {summary.totalOrders}
                    </Typography>
                </Box>

                {/* Divider */}
                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        display: { xs: "none", md: "block" },
                        borderColor: "rgba(0, 0, 0, 0.06)",
                        height: "60px",
                    }}
                />

                {/* Grand Total Revenue */}
                <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <AttachMoneyIcon
                            sx={{ color: "#C9A227", fontSize: 20 }}
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#9CA3AF",
                                fontSize: "14px",
                                fontWeight: 500,
                            }}
                        >
                            Grand Total Revenue
                        </Typography>
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            color: "#C9A227",
                            fontSize: { xs: "26px", sm: "30px" },
                        }}
                    >
                        {formatCurrency(summary.grandTotalRevenue)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

