"use client";
import { Box, CircularProgress, Alert, Paper } from "@mui/material";
import { useDistributorDailyProducts } from "@/hooks/distributor/useDistributorDailyProducts";
import { InvoiceHeader } from "./components/InvoiceHeader";
import { InvoiceTable } from "./components/InvoiceTable";
import { InvoiceFooter } from "./components/InvoiceFooter";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * Distributor Daily Product Summary Page
 * Displays daily product order summary in invoice format
 */
function DistributorProductsContent() {
    const {
        selectedDate,
        data,
        loading,
        error,
        goToPreviousDay,
        goToNextDay,
        goToToday,
    } = useDistributorDailyProducts();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#F5F5F5",
                p: { xs: 2, sm: 3, md: 4 },
                "@media print": {
                    bgcolor: "#FFFFFF",
                    p: 0,
                },
            }}
        >
            {/* Loading State */}
            {loading && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "400px",
                    }}
                >
                    <CircularProgress
                        sx={{
                            color: "#C9A227",
                        }}
                    />
                </Box>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert
                    severity="error"
                    sx={{
                        borderRadius: 2,
                        mb: 3,
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Invoice Display */}
            {!loading && !error && data && (
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: "#FFFFFF",
                        borderRadius: 3,
                        p: { xs: 3, sm: 4, md: 6 },
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 4px 20px rgba(17, 24, 39, 0.08)",
                        "@media print": {
                            boxShadow: "none",
                            border: "none",
                            borderRadius: 0,
                            p: 4,
                        },
                    }}
                >
                    {/* Header with Date Navigation */}
                    <InvoiceHeader
                        selectedDate={selectedDate}
                        onPreviousDay={goToPreviousDay}
                        onNextDay={goToNextDay}
                        onToday={goToToday}
                    />

                    {/* Products Table */}
                    <Box sx={{ mb: 4 }}>
                        <InvoiceTable products={data.productSummaries} />
                    </Box>

                    {/* Footer with Totals */}
                    <InvoiceFooter summary={data.dailySummary} />
                </Paper>
            )}

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </Box>
    );
}

export default function DistributorProductsPage() {
    return (
        <ProtectedRoute requiredRole="DISTRIBUTOR">
            <DistributorProductsContent />
        </ProtectedRoute>
    );
}

