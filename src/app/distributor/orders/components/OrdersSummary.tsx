"use client";
import { Box, Typography } from "@mui/material";

interface OrdersSummaryProps {
    totalOrders: number;
    totalAmount: number;
}

export const OrdersSummary = ({
    totalOrders,
    totalAmount,
}: OrdersSummaryProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                    },
                    gap: 3,
                }}
            >
                {/* Total Orders */}
                <Box
                    sx={{
                        p: 3,
                        bgcolor: "#F9FAFB",
                        borderRadius: 2,
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6B7280",
                            fontSize: "13px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            mb: 1,
                        }}
                    >
                        Total Orders
                    </Typography>
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
                        {totalOrders}
                    </Typography>
                </Box>

                {/* Grand Total */}
                <Box
                    sx={{
                        p: 3,
                        bgcolor: "#C9A227",
                        borderRadius: 2,
                        border: "2px solid #B89020",
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#FFFFFF",
                            fontSize: "13px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            mb: 1,
                        }}
                    >
                        Grand Total
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            color: "#FFFFFF",
                            fontSize: { xs: "26px", sm: "32px" },
                        }}
                    >
                        {formatCurrency(totalAmount)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

