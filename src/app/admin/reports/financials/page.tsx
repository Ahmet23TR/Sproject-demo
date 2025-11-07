"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DatePickerField } from "@/components/DatePickerField";
import {
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
} from "@mui/material";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { useFinancialsReport } from "@/hooks/admin/analytics/useFinancialsReport";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/price";
import { useEffect, useState } from "react";
import { SummaryDateFilter as SummaryDateFilterComponent } from "@/app/admin/orders/components/SummaryDateFilter";
import type { SummaryDateFilter as SummaryPeriod } from "@/hooks/admin/useAdminOrdersSummary";

export default function AdminFinancialsReportPage() {
    const {
        loading,
        reportData,
        startDate,
        endDate,
        timeframe,
        setStartDate,
        setEndDate,
        setTimeframe,
        handleFetchReport,
        error,
    } = useFinancialsReport();

    const router = useRouter();

    // Add richer time filter like other pages
    const [summaryDateFilter, setSummaryDateFilter] =
        useState<SummaryPeriod>("THIS_WEEK");

    // Helpers to compute start/end from summary period
    const startOfDay = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };
    const startOfWeek = (date: Date) => {
        const base = startOfDay(date);
        const day = base.getDay();
        const diff = day === 0 ? -6 : 1 - day; // Monday first
        return addDays(base, diff);
    };
    const startOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1);
    const endOfYear = (date: Date) => new Date(date.getFullYear(), 11, 31);

    const getDateRange = (key: SummaryPeriod): { start: Date; end: Date } => {
        const now = new Date();
        const today = startOfDay(now);
        switch (key) {
            case "TODAY":
                return { start: today, end: today };
            case "THIS_WEEK": {
                const weekStart = startOfWeek(now);
                return { start: weekStart, end: today };
            }
            case "LAST_WEEK": {
                const thisWeekStart = startOfWeek(now);
                const lastWeekStart = addDays(thisWeekStart, -7);
                return { start: lastWeekStart, end: addDays(lastWeekStart, 6) };
            }
            case "THIS_MONTH": {
                const s = startOfMonth(now);
                return { start: s, end: today };
            }
            case "LAST_MONTH": {
                const prevMonth = new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1
                );
                return {
                    start: startOfMonth(prevMonth),
                    end: endOfMonth(prevMonth),
                };
            }
            case "THIS_YEAR":
                return { start: startOfYear(now), end: today };
            case "LAST_YEAR": {
                const prevYear = new Date(now.getFullYear() - 1, 0, 1);
                return {
                    start: startOfYear(prevYear),
                    end: endOfYear(prevYear),
                };
            }
            case "ALL_TIME":
            default: {
                // Reasonable default for charting when "All Time" is selected: last 30 days
                const start = addDays(today, -29);
                return { start, end: today };
            }
        }
    };

    // Sync start/end date with summary period selection
    useEffect(() => {
        const toDateInputValue = (date: Date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        };
        if (summaryDateFilter === "ALL_TIME") {
            // Clear explicit date range to let backend return full history
            setStartDate("");
            setEndDate("");
            return;
        }
        const { start, end } = getDateRange(summaryDateFilter);
        setStartDate(toDateInputValue(start));
        setEndDate(toDateInputValue(end));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [summaryDateFilter]);

    const handleOrderClick = (orderId: string) => {
        router.push(`/admin/orders/${orderId}`);
    };

    const getStatusColor = (
        status: string
    ): "error" | "warning" | "info" | "success" => {
        switch (status) {
            case "FAILED":
                return "error";
            case "CANCELLED":
                return "warning";
            case "PARTIALLY_DELIVERED":
                return "info";
            default:
                return "success";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "FAILED":
                return "Failed";
            case "CANCELLED":
                return "Cancelled";
            case "PARTIALLY_DELIVERED":
                return "Partially Delivered";
            case "DELIVERED":
                return "Delivered";
            default:
                return status;
        }
    };

    // Derived metrics for textual analysis (avoid duplicating KPI cards)
    const lossPct =
        reportData?.summary && reportData.summary.totalInitialAmount > 0
            ? (reportData.summary.totalDelta /
                reportData.summary.totalInitialAmount) *
            100
            : 0;
    const topLossCount = reportData?.topLossContributors?.length ?? 0;
    const topLossSum =
        reportData?.topLossContributors?.reduce(
            (sum, o) => sum + (o.lossAmount || 0),
            0
        ) ?? 0;
    const topLossSharePct =
        reportData?.summary && reportData.summary.totalDelta > 0
            ? (topLossSum / reportData.summary.totalDelta) * 100
            : 0;

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Box
                sx={{
                    bgcolor: "#f5f6fa",
                    minHeight: "100vh",
                    py: { xs: 4, md: 6 },
                }}>
                <Box maxWidth={1200} mx="auto" px={{ xs: 1, sm: 2 }}>
                    {/* Page Title Mobile */}
                    <Typography
                        variant="h4"
                        fontWeight={600}
                        sx={{
                            fontSize: { xs: "1.75rem", md: "2.125rem" },
                            mb: 3,
                            display: { xs: "block", sm: "none" },
                        }}>
                        Financial Report
                    </Typography>

                    {/* Filtreleme Bölümü */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                            {/* Filters Grid */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", lg: "row" },
                                    gap: { xs: 2, md: 2.5 },
                                    alignItems: { lg: "flex-end" },
                                    "& > *": {
                                        minWidth: 0, // Prevents overflow
                                    },
                                }}>
                                {/* Summary Date Filter - Takes priority */}
                                <Box
                                    sx={{
                                        flex: { xs: "1", lg: "0 0 240px" },
                                        minWidth: { xs: "auto", lg: 240 },
                                        maxWidth: { xs: "none", lg: 280 },
                                    }}
                                    mr={{ xs: 0, lg: 2 }}>
                                    <SummaryDateFilterComponent
                                        value={summaryDateFilter}
                                        onChange={setSummaryDateFilter}
                                        compact
                                    />
                                </Box>

                                {/* Secondary Filters Row */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: {
                                            xs: "column",
                                            sm: "row",
                                        },
                                        gap: { xs: 2, sm: 2 },
                                        flex: 1,
                                        minWidth: 0,
                                        alignItems: { sm: "flex-end" },
                                    }}>
                                    {/* Granularity */}
                                    <Box
                                        sx={{
                                            flex: { sm: "0 0 140px" },
                                            minWidth: { xs: "auto", sm: 140 },
                                        }}>
                                        <TextField
                                            select
                                            label="Granularity"
                                            value={timeframe}
                                            onChange={(e) =>
                                                setTimeframe(
                                                    e.target.value as
                                                    | "daily"
                                                    | "weekly"
                                                    | "monthly"
                                                )
                                            }
                                            size="small"
                                            fullWidth
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    height: 40,
                                                    borderRadius: 2,
                                                    backgroundColor: "white",
                                                },
                                                "& .MuiSelect-select": {
                                                    py: 1,
                                                    px: 1.5,
                                                },
                                            }}>
                                            <MenuItem value="daily">
                                                Daily
                                            </MenuItem>
                                            <MenuItem value="weekly">
                                                Weekly
                                            </MenuItem>
                                            <MenuItem value="monthly">
                                                Monthly
                                            </MenuItem>
                                        </TextField>
                                    </Box>

                                    {/* Date Range */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 1.5,
                                            flex: 1,
                                            minWidth: 0,
                                            flexDirection: {
                                                xs: "column",
                                                sm: "row",
                                            },
                                        }}>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                minWidth: {
                                                    xs: "auto",
                                                    sm: 140,
                                                },
                                            }}>
                                            <DatePickerField
                                                label="Start Date"
                                                value={startDate}
                                                onChange={setStartDate}
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        height: 40,
                                                        borderRadius: 2,
                                                        backgroundColor:
                                                            "white",
                                                    },
                                                    "& input": {
                                                        py: 1,
                                                        px: 1.5,
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                minWidth: {
                                                    xs: "auto",
                                                    sm: 140,
                                                },
                                            }}>
                                            <DatePickerField
                                                label="End Date"
                                                value={endDate}
                                                onChange={setEndDate}
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        height: 40,
                                                        borderRadius: 2,
                                                        backgroundColor:
                                                            "white",
                                                    },
                                                    "& input": {
                                                        py: 1,
                                                        px: 1.5,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Generate Button */}
                                    <Box
                                        sx={{
                                            flex: { sm: "0 0 auto" },
                                            alignSelf: {
                                                xs: "stretch",
                                                sm: "flex-end",
                                            },
                                        }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleFetchReport}
                                            disabled={loading}
                                            fullWidth
                                            sx={{
                                                px: 3,
                                                py: 1.25,
                                                borderRadius: 2,
                                                height: 40,
                                                fontWeight: 600,
                                                fontSize: "0.875rem",
                                                minWidth: {
                                                    xs: "auto",
                                                    sm: 140,
                                                },
                                                textTransform: "none",
                                                boxShadow: 1,
                                                "&:hover": {
                                                    boxShadow: 2,
                                                },
                                            }}>
                                            {loading
                                                ? "Loading..."
                                                : "Generate Report"}
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {error && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </Alert>
                    )}

                    {loading && (
                        <Card sx={{ mb: 4 }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    textAlign="center"
                                    py={4}>
                                    Loading financial data...
                                </Typography>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !reportData && !error && (
                        <Card sx={{ mb: 4 }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    textAlign="center"
                                    py={4}>
                                    Click &quot;Generate Report&quot; to view
                                    financial analytics
                                </Typography>
                            </CardContent>
                        </Card>
                    )}

                    {reportData && (
                        <>
                            {/* KPI Kartları */}
                            <Box
                                display="grid"
                                gridTemplateColumns={{
                                    xs: "1fr",
                                    sm: "repeat(2, 1fr)",
                                    md: "repeat(4, 1fr)",
                                }}
                                gap={{ xs: 2, md: 3 }}
                                mb={{ xs: 3, md: 4 }}>
                                <Card>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                            mb={1}
                                            sx={{
                                                fontSize: {
                                                    xs: "0.75rem",
                                                    md: "0.875rem",
                                                },
                                            }}>
                                            Total Revenue (Initial)
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                            color="primary"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.25rem",
                                                    md: "1.5rem",
                                                },
                                            }}>
                                            {formatCurrency(
                                                reportData.summary
                                                    .totalInitialAmount
                                            )}
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                            mb={1}
                                            sx={{
                                                fontSize: {
                                                    xs: "0.75rem",
                                                    md: "0.875rem",
                                                },
                                            }}>
                                            Total Revenue (Final)
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                            color="success.main"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.25rem",
                                                    md: "1.5rem",
                                                },
                                            }}>
                                            {formatCurrency(
                                                reportData.summary
                                                    .totalFinalAmount
                                            )}
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                            mb={1}
                                            sx={{
                                                fontSize: {
                                                    xs: "0.75rem",
                                                    md: "0.875rem",
                                                },
                                            }}>
                                            Potential Loss
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                            color="error.main"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.25rem",
                                                    md: "1.5rem",
                                                },
                                            }}>
                                            -
                                            {formatCurrency(
                                                reportData.summary.totalDelta
                                            )}
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                            mb={1}
                                            sx={{
                                                fontSize: {
                                                    xs: "0.75rem",
                                                    md: "0.875rem",
                                                },
                                            }}>
                                            Total Orders
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.25rem",
                                                    md: "1.5rem",
                                                },
                                            }}>
                                            {reportData.summary.orderCount}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>

                            {/* İkinci satır KPI kartları */}
                            <Box
                                display="grid"
                                gridTemplateColumns={{
                                    xs: "1fr",
                                    sm: "repeat(2, 1fr)",
                                }}
                                gap={{ xs: 2, md: 3 }}
                                mb={{ xs: 3, md: 4 }}>
                                <Card>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                            mb={1}
                                            sx={{
                                                fontSize: {
                                                    xs: "0.75rem",
                                                    md: "0.875rem",
                                                },
                                            }}>
                                            Average Order Value
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="info.main"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.125rem",
                                                    md: "1.25rem",
                                                },
                                            }}>
                                            {formatCurrency(
                                                reportData.summary
                                                    .averageOrderValue
                                            )}
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                            mb={1}
                                            sx={{
                                                fontSize: {
                                                    xs: "0.75rem",
                                                    md: "0.875rem",
                                                },
                                            }}>
                                            Failure Rate
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="warning.main"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.125rem",
                                                    md: "1.25rem",
                                                },
                                            }}>
                                            %
                                            {(
                                                reportData.summary
                                                    .failedOrCancelledRate * 100
                                            ).toFixed(1)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>

                            {/* Grafik Bölümü */}
                            <Card sx={{ mb: { xs: 3, md: 4 } }}>
                                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                    <Typography
                                        variant="h6"
                                        mb={3}
                                        sx={{
                                            fontSize: {
                                                xs: "1.125rem",
                                                md: "1.25rem",
                                            },
                                        }}>
                                        Revenue Trend Analysis
                                    </Typography>
                                    {reportData.timeSeries &&
                                        reportData.timeSeries.length > 0 ? (
                                        <Box
                                            width="100%"
                                            height={{ xs: 300, md: 400 }}>
                                            <ResponsiveContainer>
                                                <LineChart
                                                    data={
                                                        reportData.timeSeries
                                                    }>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip
                                                        formatter={(
                                                            value: number
                                                        ) =>
                                                            formatCurrency(
                                                                value
                                                            )
                                                        }
                                                        labelFormatter={(
                                                            label
                                                        ) => `Date: ${label}`}
                                                    />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="initialAmount"
                                                        stroke="#2196f3"
                                                        name="Initial Amount"
                                                        strokeWidth={2}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="finalAmount"
                                                        stroke="#4caf50"
                                                        name="Final Amount"
                                                        strokeWidth={2}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    ) : (
                                        <Box textAlign="center" py={8}>
                                            <Typography
                                                color="text.secondary"
                                                variant="h6">
                                                No trend data available for{" "}
                                                {timeframe} period
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                mt={2}>
                                                Try selecting a different
                                                timeframe or date range
                                            </Typography>
                                            {/* Debug info removed */}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Detay Tablosu */}
                            {reportData.topLossContributors &&
                                reportData.topLossContributors.length > 0 && (
                                    <Card sx={{ mb: { xs: 3, md: 4 } }}>
                                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                            <Typography
                                                variant="h6"
                                                mb={3}
                                                sx={{
                                                    fontSize: {
                                                        xs: "1.125rem",
                                                        md: "1.25rem",
                                                    },
                                                }}>
                                                Top Revenue Loss Contributing
                                                Orders
                                            </Typography>
                                            <TableContainer
                                                component={Paper}
                                                variant="outlined"
                                                sx={{ overflowX: "auto" }}>
                                                <Table
                                                    sx={{
                                                        minWidth: {
                                                            xs: 600,
                                                            md: "auto",
                                                        },
                                                    }}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>
                                                                <strong>
                                                                    Order No
                                                                </strong>
                                                            </TableCell>
                                                            <TableCell>
                                                                <strong>
                                                                    Customer
                                                                </strong>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <strong>
                                                                    Initial
                                                                    Amount
                                                                </strong>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <strong>
                                                                    Final Amount
                                                                </strong>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <strong>
                                                                    Loss Amount
                                                                </strong>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <strong>
                                                                    Status
                                                                </strong>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {reportData.topLossContributors.map(
                                                            (order) => (
                                                                <TableRow
                                                                    key={
                                                                        order.orderId
                                                                    }
                                                                    sx={{
                                                                        cursor: "pointer",
                                                                        "&:hover":
                                                                        {
                                                                            backgroundColor:
                                                                                "action.hover",
                                                                        },
                                                                    }}
                                                                    onClick={() =>
                                                                        handleOrderClick(
                                                                            order.orderId
                                                                        )
                                                                    }>
                                                                    <TableCell>
                                                                        <Typography
                                                                            color="primary"
                                                                            fontWeight="medium">
                                                                            {
                                                                                order.orderNumber
                                                                            }
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            order.customerName
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        {formatCurrency(
                                                                            order.initialAmount
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        {formatCurrency(
                                                                            order.finalAmount
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <Typography
                                                                            color="error.main"
                                                                            fontWeight="bold">
                                                                            -
                                                                            {formatCurrency(
                                                                                order.lossAmount
                                                                            )}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <Chip
                                                                            label={getStatusLabel(
                                                                                order.status
                                                                            )}
                                                                            color={getStatusColor(
                                                                                order.status
                                                                            )}
                                                                            size="small"
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </CardContent>
                                    </Card>
                                )}

                            {/* Özet Bilgi */}
                            <Card>
                                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                    <Typography
                                        variant="h6"
                                        mb={2}
                                        sx={{
                                            fontSize: {
                                                xs: "1.125rem",
                                                md: "1.25rem",
                                            },
                                        }}>
                                        Analysis Summary
                                    </Typography>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            bgcolor: "#f8fafc",
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary">
                                            <strong>During this period</strong>,{" "}
                                            {reportData.summary.orderCount}{" "}
                                            orders generated{" "}
                                            {formatCurrency(
                                                reportData.summary
                                                    .totalFinalAmount
                                            )}{" "}
                                            final revenue from an initial{" "}
                                            {formatCurrency(
                                                reportData.summary
                                                    .totalInitialAmount
                                            )}
                                            , reflecting a potential loss of{" "}
                                            {formatCurrency(
                                                reportData.summary.totalDelta
                                            )}{" "}
                                            ({lossPct.toFixed(1)}%). Average
                                            order value was{" "}
                                            {formatCurrency(
                                                reportData.summary
                                                    .averageOrderValue
                                            )}{" "}
                                            with a failure/cancellation rate of
                                            %
                                            {(
                                                reportData.summary
                                                    .failedOrCancelledRate * 100
                                            ).toFixed(1)}
                                            .{" "}
                                            {topLossCount > 0 && (
                                                <>
                                                    {" "}
                                                    Top {topLossCount}{" "}
                                                    loss-contributing orders
                                                    accounted for{" "}
                                                    {formatCurrency(topLossSum)}{" "}
                                                    (
                                                    {topLossSharePct.toFixed(1)}
                                                    %) of total loss.
                                                </>
                                            )}
                                            {reportData.timeSeries.length ===
                                                0 && (
                                                    <>
                                                        {" "}
                                                        No trend data available for
                                                        the selected timeframe.
                                                    </>
                                                )}
                                        </Typography>
                                    </Paper>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
