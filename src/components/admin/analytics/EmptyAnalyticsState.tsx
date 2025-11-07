"use client";

import { Box, Button, Typography, Stack } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BarChartIcon from "@mui/icons-material/BarChart";

interface EmptyAnalyticsStateProps {
    onCreateTestData: () => void | Promise<void>;
    onReload: () => void | Promise<void>;
    loadingCreate?: boolean;
    refreshing?: boolean;
}

export const EmptyAnalyticsState = ({
    onCreateTestData,
    onReload,
    loadingCreate = false,
    refreshing = false,
}: EmptyAnalyticsStateProps) => {
    return (
        <Box
            sx={{
                bgcolor: "#fff",
                border: "1px dashed #d1d5db",
                borderRadius: 3,
                p: { xs: 4, md: 6 },
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
            }}>
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    bgcolor: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                }}>
                <BarChartIcon fontSize="large" />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#1f2937">
                No analytics data yet
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={420}>
                We could not find production analytics matching the selected
                filters. You can refresh the page or load sample analytics data
                to test the dashboard quickly.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => {
                        void onCreateTestData();
                    }}
                    disabled={loadingCreate}
                    sx={{ minWidth: 220 }}>
                    {loadingCreate ? "Generating sample data" : "Create Test Data"}
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<AutorenewIcon />}
                    onClick={() => {
                        void onReload();
                    }}
                    disabled={refreshing}
                    sx={{ minWidth: 180 }}>
                    {refreshing ? "Refreshing..." : "Reload"}
                </Button>
            </Stack>
        </Box>
    );
};
