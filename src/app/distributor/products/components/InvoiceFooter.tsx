"use client";
import { Box, Typography, Divider } from "@mui/material";
import type { DistributorDailyProductSummary } from "@/types/data";

interface InvoiceFooterProps {
    summary: DistributorDailyProductSummary;
}

export const InvoiceFooter = ({ summary }: InvoiceFooterProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Box>
            {/* Summary Stats Row */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(3, 1fr)",
                    },
                    gap: 3,
                    mb: 4,
                }}
            >
                {/* Total Items */}
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
                        Total Items
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
                        {summary.totalItems || summary.totalProducts}
                    </Typography>
                </Box>

                {/* Total Quantity */}
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
                        Total Quantity
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
                        {summary.totalQuantity}
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
                        {formatCurrency(summary.grandTotalAmount)}
                    </Typography>
                </Box>
            </Box>

            {/* Final Total Bar */}
            <Box
                sx={{
                    p: 3,
                    bgcolor: "#000000",
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily:
                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                        color: "#FFFFFF",
                        fontSize: { xs: "16px", sm: "20px" },
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                    }}
                >
                    Total Amount Due
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily:
                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                        color: "#C9A227",
                        fontSize: { xs: "20px", sm: "28px" },
                    }}
                >
                    {formatCurrency(summary.grandTotalAmount)}
                </Typography>
            </Box>

            {/* Footer Note */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
                <Divider sx={{ mb: 2, borderColor: "#E5E7EB" }} />
                <Typography
                    variant="body2"
                    sx={{
                        color: "#9CA3AF",
                        fontSize: "12px",
                        fontStyle: "italic",
                    }}
                >
                    This is a system-generated distribution summary for internal use only
                </Typography>
            </Box>
        </Box>
    );
};

