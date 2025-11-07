"use client";
import { Box, CircularProgress, Alert } from "@mui/material";
import { useDistributorDailySummary } from "@/hooks/distributor/useDistributorDailySummary";
import { DatePickerSection } from "./components/DatePickerSection";
import { DailySummaryCard } from "./components/DailySummaryCard";
import { ClientSummaryList } from "./components/ClientSummaryList";
import { QuickAccessCards } from "./components/QuickAccessCards";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * Distributor Daily Client Summary Page
 * Displays daily client order summary for dispatch and billing
 */
function DistributorSummaryContent() {
    const {
        selectedDate,
        data,
        loading,
        error,
        goToPreviousDay,
        goToNextDay,
        goToToday,
    } = useDistributorDailySummary();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#F5F5F5",
                p: { xs: 2, sm: 3, md: 4 },
            }}>
            {/* Quick Access Cards */}
            <Box sx={{ mb: 4 }}>
                <QuickAccessCards />
            </Box>

            {/* Date Picker Section */}
            <Box sx={{ mb: 3 }}>
                <DatePickerSection
                    selectedDate={selectedDate}
                    onPreviousDay={goToPreviousDay}
                    onNextDay={goToNextDay}
                    onToday={goToToday}
                />
            </Box>

            {/* Loading State */}
            {loading && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "400px",
                    }}>
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
                    }}>
                    {error}
                </Alert>
            )}

            {/* Data Display */}
            {!loading && !error && data && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {/* Daily Summary Card */}
                    <DailySummaryCard summary={data.dailySummary} />

                    {/* Client Summary List */}
                    <ClientSummaryList clients={data.clientSummaries} />
                </Box>
            )}
        </Box>
    );
}

export default function DistributorSummaryPage() {
    return (
        <ProtectedRoute requiredRole="DISTRIBUTOR">
            <DistributorSummaryContent />
        </ProtectedRoute>
    );
}
