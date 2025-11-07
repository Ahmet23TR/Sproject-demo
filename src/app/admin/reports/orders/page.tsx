"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { DatePickerField } from "@/components/DatePickerField";
import { useOrdersReport } from "@/hooks/admin/analytics/useOrdersReport";
import { formatDeliveryStatus, getDeliveryStatusOptions } from "@/utils/status";
import { formatDate } from "@/utils/date";
import { orderReportColumns } from "@/utils/ordersReportExport";
import type { AdminAnalyticsOrdersItem } from "@/types/data";
import {
    SummaryDateFilter as SummaryPeriod,
    useAdminOrdersSummary,
} from "@/hooks/admin/useAdminOrdersSummary";
import { SummaryDateFilter as SummaryDateFilterComponent } from "@/app/admin/orders/components/SummaryDateFilter";
import {
    OrdersSummaryCards,
    type OrdersSummaryItem,
} from "@/app/admin/orders/components/OrdersSummaryCards";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import DailyOrdersChart, {
    DailyOrdersPoint,
} from "@/components/admin/charts/DailyOrdersChart";

const summaryPeriodLabels: Record<
    SummaryPeriod,
    { capitalized: string; lowercase: string }
> = {
    ALL_TIME: { capitalized: "Total", lowercase: "total" },
    TODAY: { capitalized: "Today", lowercase: "today" },
    THIS_WEEK: { capitalized: "This week", lowercase: "this week" },
    LAST_WEEK: { capitalized: "Last week", lowercase: "last week" },
    THIS_MONTH: { capitalized: "This month", lowercase: "this month" },
    LAST_MONTH: { capitalized: "Last month", lowercase: "last month" },
    THIS_YEAR: { capitalized: "This year", lowercase: "this year" },
    LAST_YEAR: { capitalized: "Last year", lowercase: "last year" },
};

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
        case "TODAY": {
            return { start: today, end: today };
        }
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
            const start = startOfMonth(now);
            return { start, end: today };
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
        case "THIS_YEAR": {
            return { start: startOfYear(now), end: today };
        }
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

const isWithinRange = (
    date: Date,
    range: { start: Date; end: Date } | null
) => !range || (date >= range.start && date < range.end);

const formatTrend = (current: number, previous: number) => {
    if (previous === 0) {
        if (current === 0) {
            return { label: "No change", direction: "flat" as const };
        }
        return { label: "New this period", direction: "up" as const };
    }
    const delta = ((current - previous) / previous) * 100;
    if (Math.abs(delta) < 0.5) {
        return { label: "Stable", direction: "flat" as const };
    }
    const rounded = Math.round(delta);
    return {
        label: `${delta > 0 ? "+" : ""}${rounded}% vs last`,
        direction: delta > 0 ? ("up" as const) : ("down" as const),
    };
};

export default function AdminOrdersReportPage() {
    const router = useRouter();

    // KPI summary period state & data
    const [summaryDateFilter, setSummaryDateFilter] =
        useState<SummaryPeriod>("THIS_WEEK");
    const {
        orders: summaryOrders,
        loading: summaryLoading,
        error: summaryError,
    } = useAdminOrdersSummary(summaryDateFilter);

    const {
        loading,
        data,
        page,
        setPage,
        filters,
        setFilter,
        fetchData,
        fetchOrdersForRange,
        exportCsv,
        exporting,
        exportProgress,
        exportStats,
        getExportStats,
        asyncJobId,
        jobProgress,
        jobStatus,
    } = useOrdersReport();

    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportStartDate, setExportStartDate] = useState("");
    const [exportEndDate, setExportEndDate] = useState("");
    const [exportError, setExportError] = useState("");
    const [previewData, setPreviewData] = useState<AdminAnalyticsOrdersItem[]>(
        []
    );
    const [previewLoading, setPreviewLoading] = useState(false);

    // Format currency with proper formatting
    const formatCurrency = (amount: number | null | undefined): string => {
        if (!amount && amount !== 0) return "-";
        return `AED ${Number(amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };
    const [previewError, setPreviewError] = useState("");
    const previewRequestRef = useRef(0);
    const statusOptions = useMemo(() => getDeliveryStatusOptions(), []);

    const summaryItems = useMemo<OrdersSummaryItem[]>(() => {
        const total = summaryOrders.length;
        const pending = summaryOrders.filter(
            (o) => o.deliveryStatus === "PENDING"
        ).length;
        const ready = summaryOrders.filter(
            (o) => o.deliveryStatus === "READY_FOR_DELIVERY"
        ).length;
        const delivered = summaryOrders.filter(
            (o) => o.deliveryStatus === "DELIVERED"
        ).length;
        const cancelled = summaryOrders.filter(
            (o) => o.deliveryStatus === "CANCELLED"
        ).length;
        const failed = summaryOrders.filter(
            (o) => o.deliveryStatus === "FAILED"
        ).length;
        const partial = summaryOrders.filter(
            (o) => o.deliveryStatus === "PARTIALLY_DELIVERED"
        ).length;
        const customers = new Set(
            summaryOrders
                .filter((o) => o.user?.id || o.user?.email)
                .map((o) => o.user?.id ?? o.user?.email ?? o.id)
        ).size;

        const thisWeekRange = getDateRange("THIS_WEEK");
        const lastWeekRange = getDateRange("LAST_WEEK");
        const thisWeekDelivered = summaryOrders.filter(
            (o) =>
                o.deliveryStatus === "DELIVERED" &&
                isWithinRange(new Date(o.createdAt), thisWeekRange)
        ).length;
        const lastWeekDelivered = summaryOrders.filter(
            (o) =>
                o.deliveryStatus === "DELIVERED" &&
                isWithinRange(new Date(o.createdAt), lastWeekRange)
        ).length;
        const trend = formatTrend(thisWeekDelivered, lastWeekDelivered);

        const getPeriodLabel = (filter: SummaryPeriod, isCap = true) => {
            const entry = summaryPeriodLabels[filter];
            if (!entry) {
                return isCap ? "Total" : "total";
            }
            return isCap ? entry.capitalized : entry.lowercase;
        };

        const periodLabel = getPeriodLabel(summaryDateFilter, true);
        const trendLabelPeriod = getPeriodLabel(summaryDateFilter, false);

        return [
            {
                id: "all",
                label: "All Orders",
                value: total,
                helper: `${periodLabel}: ${total}`,
                chipLabel: periodLabel,
                icon: <ShoppingBagRoundedIcon />,
            },
            {
                id: "queue",
                label: "Pending",
                value: pending + ready,
                helper: `${pending} pending · ${ready} ready`,
                chipLabel: "Queue",
                icon: <ScheduleRoundedIcon />,
            },
            {
                id: "completed",
                label: "Delivered",
                value: delivered,
                helper: `${delivered} ${trendLabelPeriod}`,
                chipLabel: "Fulfilled",
                trend: summaryDateFilter === "THIS_WEEK" ? trend : undefined,
                icon: <TaskAltRoundedIcon />,
            },
            {
                id: "exceptions",
                label: "Cancelled / Failed",
                value: cancelled + failed,
                helper: `${cancelled} cancelled · ${failed} failed`,
                chipLabel: "Alerts",
                icon: <CancelRoundedIcon />,
            },
            {
                id: "partial",
                label: "Partially Delivered",
                value: partial,
                helper: partial > 0 ? "Requires attention" : "All clear",
                chipLabel: "Logistics",
                icon: <ShoppingCartRoundedIcon />,
            },
            {
                id: "customers",
                label: "Customers",
                value: customers,
                helper: total ? "Unique buyers" : "—",
                chipLabel: "Active",
                icon: <PeopleAltRoundedIcon />,
            },
        ];
    }, [summaryOrders, summaryDateFilter]);

    // --- Daily Orders chart data (by selected date range) ---
    const [dailyData, setDailyData] = useState<DailyOrdersPoint[]>([]);
    const [dailyLoading, setDailyLoading] = useState(false);

    useEffect(() => {
        const range = getDateRange(summaryDateFilter);
        if (!range) {
            setDailyData([]);
            return;
        }
        const toYmd = (d: Date) => {
            const pad = (n: number) => String(n).padStart(2, "0");
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
                d.getDate()
            )}`;
        };
        const start = toYmd(range.start);
        const end = toYmd(range.end);

        let cancelled = false;
        (async () => {
            try {
                setDailyLoading(true);
                const orders = await fetchOrdersForRange({
                    startDate: start,
                    endDate: end,
                });

                // Build counts per day and include empty days
                const startDate = new Date(start + "T00:00:00Z");
                const endDate = new Date(end + "T00:00:00Z");
                const counts = new Map<string, number>();

                const pad = (n: number) => String(n).padStart(2, "0");
                const toKey = (d: Date) =>
                    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
                        d.getUTCDate()
                    )}`;

                // seed zeros
                for (
                    let d = new Date(startDate);
                    d <= endDate;
                    d.setUTCDate(d.getUTCDate() + 1)
                ) {
                    counts.set(toKey(d), 0);
                }

                orders.forEach((o: AdminAnalyticsOrdersItem) => {
                    const d = new Date(o.createdAt);
                    const key = `${d.getUTCFullYear()}-${pad(
                        d.getUTCMonth() + 1
                    )}-${pad(d.getUTCDate())}`;
                    counts.set(key, (counts.get(key) || 0) + 1);
                });

                const points: DailyOrdersPoint[] = Array.from(counts.entries())
                    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
                    .map(([date, count]) => {
                        const [y, m, day] = date
                            .split("-")
                            .map((s) => parseInt(s, 10));
                        const dt = new Date(Date.UTC(y, m - 1, day));
                        const label = dt.toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "short",
                        });
                        return { date, label, count };
                    });

                if (!cancelled) setDailyData(points);
            } finally {
                if (!cancelled) setDailyLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [summaryDateFilter, fetchOrdersForRange, filters.status]);

    useEffect(() => {
        if (!exportModalOpen) {
            previewRequestRef.current += 1;
            setPreviewData([]);
            setPreviewError("");
            setPreviewLoading(false);
        }
    }, [exportModalOpen]);

    // Export stats'ı otomatik yükle
    useEffect(() => {
        if (exportModalOpen && exportStartDate && exportEndDate) {
            getExportStats({
                startDate: exportStartDate,
                endDate: exportEndDate,
            });
        }
    }, [exportModalOpen, exportStartDate, exportEndDate, getExportStats]);

    const loadPreview = async () => {
        if (!exportStartDate || !exportEndDate) {
            setExportError(
                "Select both start and end dates before previewing."
            );
            return;
        }
        if (new Date(exportStartDate) > new Date(exportEndDate)) {
            setExportError("Start date cannot be greater than end date.");
            return;
        }

        setExportError("");
        setPreviewError("");
        const requestId = previewRequestRef.current + 1;
        previewRequestRef.current = requestId;
        setPreviewLoading(true);
        setPreviewData([]);
        try {
            const rows = await fetchOrdersForRange({
                startDate: exportStartDate,
                endDate: exportEndDate,
            });

            if (previewRequestRef.current !== requestId) {
                return;
            }

            if (!rows.length) {
                setPreviewData([]);
                setPreviewError("No orders found for the selected range.");
            } else {
                setPreviewData(rows);
            }
        } catch (error) {
            console.error("Order export preview failed", error);
            if (previewRequestRef.current === requestId) {
                setPreviewData([]);
                setPreviewError(
                    "An error occurred while preparing the preview."
                );
            }
        } finally {
            if (previewRequestRef.current === requestId) {
                setPreviewLoading(false);
            }
        }
    };

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Box
                sx={{
                    bgcolor: "#f5f6fa",
                    minHeight: "100vh",
                    py: { xs: 4, md: 6 },
                }}>
                <Box maxWidth="100%" mx="auto" px={{ xs: 1, sm: 2 }}>
                    {/* Page Title Mobile */}
                    <Typography
                        variant="h4"
                        fontWeight={600}
                        sx={{
                            fontSize: { xs: "1.75rem", md: "2.125rem" },
                            mb: 2,
                            display: { xs: "block", sm: "none" },
                        }}>
                        Orders Report
                    </Typography>

                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        alignItems={{ xs: "flex-start", md: "flex-end" }}
                        mb={2}>
                        <SummaryDateFilterComponent
                            value={summaryDateFilter}
                            onChange={setSummaryDateFilter}
                        />
                    </Box>

                    {summaryError && (
                        <Box mb={2}>
                            <Typography color="error" fontSize={14}>
                                {summaryError}
                            </Typography>
                        </Box>
                    )}

                    <Box mb={3}>
                        <OrdersSummaryCards
                            items={summaryItems}
                            loading={summaryLoading}
                        />
                    </Box>

                    <Box mb={3}>
                        <DailyOrdersChart
                            data={dailyData}
                            loading={dailyLoading}
                            title="Daily Orders (selected range)"
                        />
                    </Box>

                    <Box
                        bgcolor="#fff"
                        p={{ xs: 1.5, sm: 2 }}
                        mb={3}
                        borderRadius={2}
                        display="grid"
                        gridTemplateColumns={{
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(5, 1fr)",
                        }}
                        gap={{ xs: 1.5, sm: 2 }}>
                        <DatePickerField
                            label="Start Date"
                            value={filters.startDate || ""}
                            onChange={(v) => setFilter({ startDate: v })}
                        />
                        <DatePickerField
                            label="End Date"
                            value={filters.endDate || ""}
                            onChange={(v) => setFilter({ endDate: v })}
                        />
                        <TextField
                            select
                            // label="Status"
                            value={filters.status || ""}
                            onChange={(e) =>
                                setFilter({ status: e.target.value })
                            }
                            SelectProps={{
                                displayEmpty: true,
                                renderValue: (selected) => {
                                    const value = (selected as string) ?? "";
                                    if (!value) {
                                        return statusOptions[0]?.label ?? "All";
                                    }
                                    return (
                                        statusOptions.find(
                                            (option) => option.value === value
                                        )?.label || value
                                    );
                                },
                            }}>
                            {statusOptions.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setPage(1);
                                fetchData();
                            }}
                            disabled={loading}
                            sx={{
                                gridColumn: { xs: "1", sm: "auto" },
                            }}>
                            Apply
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={async () => {
                                if (exporting) return;
                                const startDate = filters.startDate || "";
                                const endDate = filters.endDate || "";

                                setExportStartDate(startDate);
                                setExportEndDate(endDate);
                                setExportError("");

                                // Önce export stats'ı yükle (eğer tarih aralığı varsa)
                                if (startDate && endDate) {
                                    await getExportStats({
                                        startDate,
                                        endDate,
                                    });
                                }

                                setExportModalOpen(true);
                            }}
                            disabled={loading || exporting}
                            sx={{
                                gridColumn: { xs: "1", sm: "auto" },
                                position: "relative",
                                ...(exportStats?.willCache && {
                                    "&::after": {
                                        content: '"⚡"',
                                        position: "absolute",
                                        top: -8,
                                        right: -8,
                                        fontSize: 12,
                                        color: "primary.main",
                                    },
                                }),
                            }}>
                            Export CSV
                            {/* Cache indicator hint */}
                            {filters.startDate &&
                                filters.endDate &&
                                exportStats?.willCache && (
                                    <Typography
                                        component="span"
                                        fontSize={10}
                                        ml={0.5}
                                        color="primary">
                                        (cached)
                                    </Typography>
                                )}
                        </Button>
                    </Box>

                    <Box
                        bgcolor="#fff"
                        p={{ xs: 1, sm: 2 }}
                        borderRadius={2}
                        sx={{ overflowX: "auto" }}>
                        <Box
                            display="grid"
                            gridTemplateColumns="minmax(180px, 1fr) minmax(120px, 0.8fr) minmax(140px, 1fr) minmax(150px, 1fr) minmax(120px, 0.8fr) minmax(120px, 0.8fr) minmax(80px, 0.6fr)"
                            fontWeight={700}
                            py={1}
                            borderBottom="1px solid #eee"
                            gap={1}
                            minWidth="1000px"
                            sx={{ fontSize: { xs: "0.813rem", md: "1rem" } }}>
                            <Box>Order #</Box>
                            <Box>Date</Box>
                            <Box>Customer</Box>
                            <Box>Status</Box>
                            <Box textAlign="right">Initial</Box>
                            <Box textAlign="right">Final</Box>
                            <Box textAlign="center">Items</Box>
                        </Box>
                        {(data?.data || []).map((o) => (
                            <Box
                                key={o.id}
                                display="grid"
                                gridTemplateColumns="minmax(180px, 1fr) minmax(120px, 0.8fr) minmax(140px, 1fr) minmax(150px, 1fr) minmax(120px, 0.8fr) minmax(120px, 0.8fr) minmax(80px, 0.6fr)"
                                py={1}
                                borderBottom="1px solid #f5f5f5"
                                fontSize={14}
                                gap={1}
                                minWidth="1000px"
                                onClick={() =>
                                    router.push(`/admin/orders/${o.id}`)
                                }
                                sx={{
                                    cursor: "pointer",
                                    fontSize: { xs: "0.813rem", md: "0.875rem" },
                                    "&:hover": {
                                        backgroundColor: "#f5f5f5",
                                    },
                                }}>
                                <Box
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                    {o.orderNumber}
                                </Box>
                                <Box
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                    {formatDate(o.createdAt)}
                                </Box>
                                <Box
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                    {o.user
                                        ? `${o.user.name} ${o.user.surname}`
                                        : "-"}
                                </Box>
                                <Box
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                    {formatDeliveryStatus(o.deliveryStatus)}
                                </Box>
                                <Box
                                    textAlign="right"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                    {formatCurrency(o.initialWholesaleTotalAmount ?? o.initialTotalAmount)}
                                </Box>
                                <Box
                                    textAlign="right"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                    {formatCurrency(o.finalWholesaleTotalAmount ?? o.finalTotalAmount)}
                                </Box>
                                <Box textAlign="center">
                                    {o.items?.length ?? 0}
                                </Box>
                            </Box>
                        ))}
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            mt={2}>
                            <Button
                                disabled={page <= 1 || loading}
                                onClick={() => setPage(Math.max(1, page - 1))}>
                                Prev
                            </Button>
                            <Box>
                                Page {page} /{" "}
                                {data?.pagination?.totalPages || 1}
                            </Box>
                            <Button
                                disabled={
                                    loading ||
                                    (data?.pagination &&
                                        page >= data.pagination.totalPages)
                                }
                                onClick={() => setPage(page + 1)}>
                                Next
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Dialog
                open={exportModalOpen}
                onClose={() => {
                    if (exporting) return;
                    setExportModalOpen(false);
                    setExportError("");
                }}
                maxWidth="sm"
                fullWidth>
                <DialogTitle>Export Orders</DialogTitle>
                <DialogContent dividers>
                    <Typography fontSize={14} mb={2} color="text.secondary">
                        Select the date range to preview and export matching
                        orders.
                    </Typography>
                    <Box
                        display="grid"
                        gridTemplateColumns={{
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                        }}
                        gap={2}>
                        <DatePickerField
                            label="Start Date"
                            value={exportStartDate}
                            onChange={(value) => {
                                setExportStartDate(value);
                                if (exportError) setExportError("");
                                if (previewError) setPreviewError("");
                            }}
                            max={exportEndDate || undefined}
                            size="small"
                        />
                        <DatePickerField
                            label="End Date"
                            value={exportEndDate}
                            onChange={(value) => {
                                setExportEndDate(value);
                                if (exportError) setExportError("");
                                if (previewError) setPreviewError("");
                            }}
                            min={exportStartDate || undefined}
                            size="small"
                        />
                    </Box>
                    {exportError && (
                        <Typography color="error" fontSize={13} mt={1.5}>
                            {exportError}
                        </Typography>
                    )}

                    {/* Export Stats Information */}
                    {exportStats && (
                        <Box
                            mt={2}
                            p={2}
                            sx={{
                                backgroundColor: "#f5f5f5",
                                borderRadius: 1,
                                border: "1px solid #e0e0e0",
                            }}>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                mb={1}>
                                Export Information
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                <Typography
                                    fontSize={12}
                                    color="text.secondary">
                                    📊 {exportStats.orderCount} orders,{" "}
                                    {exportStats.itemCount} items
                                </Typography>
                                <Typography
                                    fontSize={12}
                                    color="text.secondary">
                                    📦 Size: ~
                                    {Math.round(exportStats.estimatedSizeKB)}KB
                                </Typography>
                                <Typography
                                    fontSize={12}
                                    color="text.secondary">
                                    ⏱️ Est. time: ~
                                    {exportStats.estimatedTimeSeconds}s
                                </Typography>
                                {exportStats.willCache && (
                                    <Typography fontSize={12} color="primary">
                                        ⚡ Will be cached
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* Async Job Progress */}
                    {asyncJobId && jobStatus !== "idle" && (
                        <Box
                            mt={2}
                            p={2}
                            sx={{
                                backgroundColor: "#e3f2fd",
                                borderRadius: 1,
                                border: "1px solid #2196f3",
                            }}>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                mb={1}>
                                Export Job Status: {jobStatus.toUpperCase()}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                <CircularProgress
                                    variant={
                                        jobProgress > 0
                                            ? "determinate"
                                            : "indeterminate"
                                    }
                                    value={jobProgress}
                                    size={20}
                                />
                                <Typography fontSize={12}>
                                    {jobProgress > 0
                                        ? `${jobProgress}% completed`
                                        : "Processing..."}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Export Progress for Direct Exports */}
                    {exporting && exportProgress > 0 && !asyncJobId && (
                        <Box
                            mt={2}
                            p={2}
                            sx={{
                                backgroundColor: "#fff3e0",
                                borderRadius: 1,
                                border: "1px solid #ff9800",
                            }}>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                mb={1}>
                                Exporting...
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                <CircularProgress
                                    variant="determinate"
                                    value={exportProgress}
                                    size={20}
                                />
                                <Typography fontSize={12}>
                                    {exportProgress}% completed
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Box mt={2} display="flex" alignItems="center" gap={1.5}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={loadPreview}
                            disabled={previewLoading || exporting}>
                            {previewLoading ? "Loading..." : "Show Preview"}
                        </Button>
                        {!previewLoading && previewData.length > 0 && (
                            <Typography fontSize={13} color="text.secondary">
                                {previewData.length} orders ready to export.
                            </Typography>
                        )}
                    </Box>
                    {previewError && (
                        <Typography color="error" fontSize={13} mt={1.5}>
                            {previewError}
                        </Typography>
                    )}

                    <TableContainer
                        sx={{
                            mt: 2,
                            maxHeight: 320,
                            border: "1px solid #e3e6ef",
                            borderRadius: 1,
                            overflowX: "auto",
                        }}>
                        <Table
                            size="small"
                            stickyHeader
                            sx={{ tableLayout: "auto" }}>
                            <TableHead>
                                <TableRow>
                                    {orderReportColumns.map((column) => (
                                        <TableCell
                                            key={column.header}
                                            sx={{
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                            }}>
                                            {column.header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {previewLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={orderReportColumns.length}
                                            align="center"
                                            sx={{ py: 4 }}>
                                            <CircularProgress size={20} />
                                        </TableCell>
                                    </TableRow>
                                ) : previewData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={orderReportColumns.length}
                                            align="center"
                                            sx={{ py: 4 }}>
                                            {previewError
                                                ? "No orders to display for this range."
                                                : "Preview will appear here once loaded."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    previewData.map((order) => (
                                        <TableRow
                                            hover
                                            key={order.id}
                                            onClick={() =>
                                                router.push(
                                                    `/admin/orders/${order.id}`
                                                )
                                            }
                                            sx={{ cursor: "pointer" }}>
                                            {orderReportColumns.map(
                                                (column) => (
                                                    <TableCell
                                                        key={`${order.id}-${column.header}`}
                                                        sx={{
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}>
                                                        {column.getValue(order)}
                                                    </TableCell>
                                                )
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => {
                            if (exporting) return;
                            setExportModalOpen(false);
                            setExportError("");
                        }}
                        disabled={exporting}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            if (!exportStartDate || !exportEndDate) {
                                setExportError(
                                    "Select both start and end dates."
                                );
                                return;
                            }
                            if (
                                new Date(exportStartDate) >
                                new Date(exportEndDate)
                            ) {
                                setExportError(
                                    "Start date cannot be greater than end date."
                                );
                                return;
                            }

                            setExportError("");
                            if (previewError) setPreviewError("");
                            const success = await exportCsv({
                                startDate: exportStartDate,
                                endDate: exportEndDate,
                            });

                            if (success) {
                                setExportModalOpen(false);
                            }
                        }}
                        disabled={exporting || previewLoading}>
                        {exporting
                            ? asyncJobId
                                ? "Processing in background..."
                                : "Exporting..."
                            : "Confirm Export"}
                    </Button>
                </DialogActions>
            </Dialog>
        </ProtectedRoute>
    );
}
