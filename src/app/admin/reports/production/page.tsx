"use client";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    Paper,
    Alert,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { DatePickerField } from "@/components/DatePickerField";
import DownloadIcon from "@mui/icons-material/Download";
import { useProductionReport } from "@/hooks/admin/analytics/useProductionReport";
import { useCategories } from "@/hooks/useCategories";
import { ProductionKPICards } from "@/components/admin/charts/ProductionKPICards";
import { TopSellingProductsChart } from "@/components/admin/charts/TopSellingProductsChart";
import { GroupRevenueDistributionChart } from "@/components/admin/charts/GroupRevenueDistributionChart";
import { ProductionReportTable } from "@/components/admin/charts/ProductionReportTable";
import { EmptyAnalyticsState } from "@/components/admin/analytics/EmptyAnalyticsState";
import type { ProductGroup } from "@/types/data";
import { useAuth } from "@/context/AuthContext";
import { getAdminAnalyticsProduction } from "@/services/adminService";
import { SummaryDateFilter as OrdersSummaryDateFilter } from "../../orders/components/SummaryDateFilter";
import type { SummaryDateFilter } from "@/hooks/admin/useAdminOrdersSummary";

// CSV export with proper semicolon separation for Excel compatibility
const exportToCSV = (
    data: Array<{
        productId: string;
        productName: string;
        group: ProductGroup;
        ordered: number;
        produced: number;
        cancelled: number;
        categoryName: string | null;
        totalRevenue: number;
        unitPrice: number;
    }>,
    filename: string
) => {
    if (!data || data.length === 0) {
        alert("No data available for export");
        return;
    }

    // Use semicolon separator for better Excel compatibility in international settings
    const separator = ";";

    // Proper CSV field formatter
    const formatField = (value: string | number | null): string => {
        if (value === null || value === undefined) {
            return "";
        }

        // Convert to string and clean up
        let stringValue = String(value).trim();

        // Escape semicolons and quotes
        if (
            stringValue.includes(";") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
        ) {
            // Escape quotes by doubling them
            stringValue = stringValue.replace(/"/g, '""');
            return `"${stringValue}"`;
        }

        return stringValue;
    };

    // Format numbers with 2 decimal places
    const formatNumber = (num: number): string => {
        if (isNaN(num) || num === null || num === undefined) {
            return "0,00";
        }
        // Use comma as decimal separator for international Excel
        return Number(num).toFixed(2).replace(".", ",");
    };

    // Format integers
    const formatInteger = (num: number): string => {
        if (isNaN(num) || num === null || num === undefined) {
            return "0";
        }
        return Math.round(num).toString();
    };

    // Create header row
    const headers = [
        "Product Name",
        "Category",
        "Product Group",
        "Total Orders",
        "Total Produced",
        "Total Cancelled",
        "Total Revenue (AED)",
        "Average Unit Price (AED)",
    ].join(separator);

    // Create data rows
    const dataRows = data.map((item) => {
        return [
            formatField(item.productName || ""),
            formatField(item.categoryName || "Uncategorized"),
            formatField(item.group === "SWEETS" ? "Sweets" : "Bakery Products"),
            formatInteger(item.ordered || 0),
            formatInteger(item.produced || 0),
            formatInteger(item.cancelled || 0),
            formatNumber(item.totalRevenue || 0),
            formatNumber(item.unitPrice || 0),
        ].join(separator);
    });

    // Combine all rows
    const csvContent = [headers, ...dataRows].join("\r\n");

    // Ensure .csv extension
    const csvFilename = filename.replace(/\.(txt|csv)$/, "") + ".csv";

    // Create blob with UTF-8 BOM for proper Excel encoding
    const BOM = "\uFEFF";
    const fullContent = BOM + csvContent;

    const blob = new Blob([fullContent], {
        type: "text/csv;charset=utf-8",
    });

    // Create and trigger download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = csvFilename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory
    URL.revokeObjectURL(url);
};

export default function AdminProductionReportPage() {
    const { token } = useAuth();
    const { loading, refreshing, data, filters, setFilter, fetchData, error } =
        useProductionReport();
    const { categories, loading: categoriesLoading } = useCategories();

    // Separate filter state for KPI cards & charts (group) and summary period (date)
    const [cardFilter, setCardFilter] = useState<ProductGroup | "">("");
    const [summaryDateFilter, setSummaryDateFilter] =
        useState<SummaryDateFilter>("THIS_WEEK");
    const [summaryData, setSummaryData] = useState<null | {
        data: import("@/types/data").AdminAnalyticsProductionResponse | null;
        loading: boolean;
        error: string | null;
    }>(null);
    const [exporting, setExporting] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [exportFilters, setExportFilters] = useState<{
        startDate?: string;
        endDate?: string;
        productGroup?: ProductGroup | "";
        categoryId?: string;
    }>({});

    const openExportModal = () => {
        // Varsayılan olarak mevcut tablo filtrelerini modal'a taşıyalım (bağımsız düzenlenebilir)
        setExportFilters({
            startDate: filters.startDate,
            endDate: filters.endDate,
            productGroup: (filters.productGroup as ProductGroup) || "",
            categoryId: filters.categoryId,
        });
        setExportOpen(true);
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const res = await getAdminAnalyticsProduction(
                {
                    startDate: exportFilters.startDate,
                    endDate: exportFilters.endDate,
                    productGroup:
                        (exportFilters.productGroup as ProductGroup) ||
                        undefined,
                    categoryId: exportFilters.categoryId,
                },
                token || ""
            );
            const currentDate = new Date().toISOString().split("T")[0];
            const filename = `product-performance-report-${currentDate}.csv`;
            exportToCSV(res.byProduct || [], filename);
            setExportOpen(false);
        } finally {
            setExporting(false);
        }
    };

    // No user-facing cache notifications; still keep silent auto-refresh.

    useEffect(() => {
        const interval = setInterval(() => {
            fetchData({ silent: true });
        }, 120000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const showEmptyState =
        !loading &&
        !refreshing &&
        (data?.isEmpty || (!data?.byGroup?.length && !data?.byProduct?.length));

    const errorMessage =
        error instanceof Error
            ? error.message
            : error && typeof error === "object" && "message" in error
                ? String((error as { message?: string }).message)
                : null;

    // Removed cache metrics UI for simplicity

    const summaryRange = useMemo(() => {
        // Utils to compute start/end from summary period
        const toISODate = (d: Date) => d.toISOString().split("T")[0];
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

        const now = new Date();
        switch (summaryDateFilter) {
            case "TODAY": {
                const start = startOfDay(now);
                return {
                    startDate: toISODate(start),
                    endDate: toISODate(addDays(start, 1)),
                };
            }
            case "THIS_WEEK": {
                const start = startOfWeek(now);
                return {
                    startDate: toISODate(start),
                    endDate: toISODate(addDays(start, 7)),
                };
            }
            case "LAST_WEEK": {
                const thisWeek = startOfWeek(now);
                const start = addDays(thisWeek, -7);
                return {
                    startDate: toISODate(start),
                    endDate: toISODate(thisWeek),
                };
            }
            case "THIS_MONTH": {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                return { startDate: toISODate(start), endDate: toISODate(end) };
            }
            case "LAST_MONTH": {
                const start = new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1
                );
                const end = new Date(now.getFullYear(), now.getMonth(), 1);
                return { startDate: toISODate(start), endDate: toISODate(end) };
            }
            case "THIS_YEAR": {
                const start = new Date(now.getFullYear(), 0, 1);
                const end = new Date(now.getFullYear() + 1, 0, 1);
                return { startDate: toISODate(start), endDate: toISODate(end) };
            }
            case "LAST_YEAR": {
                const start = new Date(now.getFullYear() - 1, 0, 1);
                const end = new Date(now.getFullYear(), 0, 1);
                return { startDate: toISODate(start), endDate: toISODate(end) };
            }
            case "ALL_TIME":
            default:
                return { startDate: undefined, endDate: undefined };
        }
    }, [summaryDateFilter]);

    // Fetch separate summary analytics for Performance Overview
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setSummaryData({ data: null, loading: true, error: null });
            try {
                const res = await getAdminAnalyticsProduction(
                    {
                        startDate: summaryRange.startDate,
                        endDate: summaryRange.endDate,
                        // Performance overview: independent from table's productGroup/category
                    },
                    token || ""
                );
                if (!mounted) return;
                setSummaryData({ data: res, loading: false, error: null });
            } catch (e) {
                if (!mounted) return;
                setSummaryData({
                    data: null,
                    loading: false,
                    error:
                        e && typeof e === "object" && "message" in e
                            ? String((e as { message: unknown }).message)
                            : "Failed to load performance overview",
                });
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [token, summaryRange.startDate, summaryRange.endDate]);

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Box
                sx={{
                    bgcolor: "#f5f6fa",
                    minHeight: "100vh",
                    py: { xs: 4, md: 6 },
                }}>
                <Box maxWidth={1400} mx="auto" px={{ xs: 1, sm: 2 }}>
                    {/* Page Title Mobile */}
                    <Typography
                        variant="h4"
                        fontWeight={600}
                        sx={{
                            fontSize: { xs: "1.75rem", md: "2.125rem" },
                            mb: 3,
                            display: { xs: "block", sm: "none" },
                        }}>
                        Production Report
                    </Typography>

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    {showEmptyState ? (
                        <Box mb={4}>
                            <EmptyAnalyticsState
                                onCreateTestData={async () => { }}
                                onReload={() => fetchData()}
                                loadingCreate={false}
                                refreshing={loading || refreshing}
                            />
                        </Box>
                    ) : (
                        <>
                            {/* Analytics Dashboard Section */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 2, md: 3 },
                                    mb: { xs: 3, md: 4 },
                                    borderRadius: 3,
                                    border: "1px solid #e5e7eb",
                                }}>
                                {/* Cache status alert removed for simpler UX */}

                                {/* KPI Cards with Filter */}
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={2}
                                    alignItems={{
                                        xs: "flex-start",
                                        md: "center",
                                    }}
                                    justifyContent="space-between"
                                    mb={3}>
                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                        sx={{
                                            fontSize: {
                                                xs: "1.125rem",
                                                md: "1.25rem",
                                            },
                                        }}>
                                        Performance Overview
                                    </Typography>
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1}
                                        alignItems="center"
                                        sx={{ width: { xs: "100%", sm: "auto" } }}>
                                        <OrdersSummaryDateFilter
                                            value={summaryDateFilter}
                                            onChange={setSummaryDateFilter}
                                        />
                                        <TextField
                                            select
                                            label="Filter by Group"
                                            size="small"
                                            value={cardFilter}
                                            onChange={(e) =>
                                                setCardFilter(
                                                    e.target.value as
                                                    | ProductGroup
                                                    | ""
                                                )
                                            }
                                            sx={{
                                                width: { xs: "100%", sm: 240 },
                                            }}>
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="BAKERY">
                                                Bakery
                                            </MenuItem>
                                            <MenuItem value="SWEETS">
                                                Sweets
                                            </MenuItem>
                                        </TextField>
                                    </Stack>
                                </Stack>

                                {/* KPI Cards */}
                                <Box mb={4}>
                                    <ProductionKPICards
                                        mostPopularProduct={
                                            summaryData?.data?.kpis
                                                ?.mostPopularProduct || null
                                        }
                                        highestRevenueProduct={
                                            summaryData?.data?.kpis
                                                ?.highestRevenueProduct || null
                                        }
                                        cancellationRate={
                                            summaryData?.data?.kpis
                                                ?.cancellationRate || 0
                                        }
                                        loading={
                                            loading ||
                                            refreshing ||
                                            (summaryData?.loading ?? false)
                                        }
                                        cardFilter={cardFilter}
                                        allData={summaryData?.data || null}
                                    />
                                </Box>

                                {/* Charts Section */}
                                <Box
                                    display="grid"
                                    gridTemplateColumns={{
                                        xs: "1fr",
                                        lg: "2fr 1fr",
                                    }}
                                    gap={{ xs: 2, md: 3 }}>
                                    {/* Top Selling Products Chart */}
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: { xs: 2, md: 3 },
                                            borderRadius: 2,
                                            bgcolor: "#fafbfc",
                                        }}>
                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                            mb={2}
                                            sx={{
                                                fontSize: {
                                                    xs: "1rem",
                                                    md: "1.25rem",
                                                },
                                            }}>
                                            Top 10 Highest Revenue Products
                                        </Typography>
                                        <TopSellingProductsChart
                                            data={
                                                summaryData?.data?.kpis
                                                    ?.topSellingProducts || []
                                            }
                                            loading={
                                                loading ||
                                                refreshing ||
                                                (summaryData?.loading ?? false)
                                            }
                                            cardFilter={cardFilter}
                                            allData={summaryData?.data || null}
                                        />
                                    </Paper>

                                    {/* Group Revenue Distribution */}
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: { xs: 2, md: 3 },
                                            borderRadius: 2,
                                            bgcolor: "#fafbfc",
                                        }}>
                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                            mb={2}
                                            sx={{
                                                fontSize: {
                                                    xs: "1rem",
                                                    md: "1.25rem",
                                                },
                                            }}>
                                            {cardFilter
                                                ? `${cardFilter === "BAKERY"
                                                    ? "Bakery"
                                                    : "Sweets"
                                                } Products Revenue Distribution`
                                                : "Product Group Revenue Distribution"}
                                        </Typography>
                                        <GroupRevenueDistributionChart
                                            data={
                                                summaryData?.data?.byGroup || []
                                            }
                                            loading={
                                                loading ||
                                                refreshing ||
                                                (summaryData?.loading ?? false)
                                            }
                                            cardFilter={cardFilter}
                                            allData={summaryData?.data || null}
                                        />
                                    </Paper>
                                </Box>
                            </Paper>

                            {/* Detailed Product Analysis Section */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 2, md: 3 },
                                    mb: { xs: 3, md: 4 },
                                    borderRadius: 3,
                                    border: "1px solid #e5e7eb",
                                }}>
                                {/* Table Filters */}
                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    mb={2}
                                    sx={{
                                        fontSize: {
                                            xs: "1.125rem",
                                            md: "1.25rem",
                                        },
                                    }}>
                                    Detailed Product Performance Table
                                </Typography>
                                <Box
                                    display="grid"
                                    gridTemplateColumns={{
                                        xs: "1fr",
                                        sm: "repeat(2, 1fr)",
                                        md: "repeat(5, 1fr)",
                                    }}
                                    gap={{ xs: 1.5, sm: 2 }}
                                    mb={3}
                                    p={{ xs: 1, sm: 2 }}
                                    sx={{
                                        borderRadius: 2,
                                    }}>
                                    <DatePickerField
                                        label="Start Date"
                                        value={filters.startDate || ""}
                                        onChange={(v) =>
                                            setFilter({ startDate: v })
                                        }
                                    />
                                    <DatePickerField
                                        label="End Date"
                                        value={filters.endDate || ""}
                                        onChange={(v) =>
                                            setFilter({ endDate: v })
                                        }
                                    />
                                    <TextField
                                        select
                                        label="Product Group"
                                        placeholder="Select Product Group"
                                        value={filters.productGroup || ""}
                                        onChange={(e) =>
                                            setFilter({
                                                productGroup: e.target
                                                    .value as ProductGroup,
                                            })
                                        }
                                        fullWidth>
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="SWEETS">
                                            Sweets
                                        </MenuItem>
                                        <MenuItem value="BAKERY">
                                            Bakery Products
                                        </MenuItem>
                                    </TextField>
                                    <TextField
                                        select
                                        label="Category"
                                        placeholder="Select Category"
                                        value={filters.categoryId || ""}
                                        onChange={(e) =>
                                            setFilter({
                                                categoryId: e.target.value,
                                            })
                                        }
                                        fullWidth
                                        disabled={categoriesLoading}>
                                        <MenuItem value="">All</MenuItem>
                                        {categories.map((category) => (
                                            <MenuItem
                                                key={category.id}
                                                value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1}
                                        alignItems="stretch"
                                        sx={{
                                            gridColumn: {
                                                xs: "1",
                                                sm: "span 2",
                                                md: "auto",
                                            },
                                        }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                fetchData();
                                            }}
                                            disabled={loading || refreshing}
                                            sx={{ height: 56 }}>
                                            Apply
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={
                                                <DownloadIcon
                                                    sx={{
                                                        display: {
                                                            xs: "none",
                                                            sm: "block",
                                                        },
                                                    }}
                                                />
                                            }
                                            onClick={openExportModal}
                                            disabled={loading || refreshing}
                                            sx={{ height: 56 }}>
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: {
                                                        xs: "none",
                                                        sm: "inline",
                                                    },
                                                }}>
                                                Download CSV
                                            </Box>
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: {
                                                        xs: "inline",
                                                        sm: "none",
                                                    },
                                                }}>
                                                Export
                                            </Box>
                                        </Button>
                                    </Stack>
                                </Box>

                                {/* Enhanced Product Table */}
                                <ProductionReportTable
                                    data={data?.byProduct || []}
                                    loading={loading || refreshing}
                                />
                            </Paper>
                            {/* Export Modal (Bağımsız filtreler) */}
                            <Dialog
                                open={exportOpen}
                                onClose={() => setExportOpen(false)}
                                maxWidth="sm"
                                fullWidth>
                                <DialogTitle>Export CSV</DialogTitle>
                                <DialogContent dividers>
                                    <Box
                                        display="grid"
                                        gridTemplateColumns={{
                                            xs: "1fr",
                                            sm: "repeat(2, 1fr)",
                                        }}
                                        gap={2}
                                        mt={1}>
                                        <DatePickerField
                                            label="Start Date"
                                            value={
                                                exportFilters.startDate || ""
                                            }
                                            onChange={(v) =>
                                                setExportFilters((f) => ({
                                                    ...f,
                                                    startDate: v,
                                                }))
                                            }
                                        />
                                        <DatePickerField
                                            label="End Date"
                                            value={exportFilters.endDate || ""}
                                            onChange={(v) =>
                                                setExportFilters((f) => ({
                                                    ...f,
                                                    endDate: v,
                                                }))
                                            }
                                        />
                                        <TextField
                                            select
                                            label="Product Group"
                                            value={
                                                exportFilters.productGroup || ""
                                            }
                                            onChange={(e) =>
                                                setExportFilters((f) => ({
                                                    ...f,
                                                    productGroup: e.target
                                                        .value as ProductGroup,
                                                }))
                                            }
                                            fullWidth>
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="SWEETS">
                                                Sweets
                                            </MenuItem>
                                            <MenuItem value="BAKERY">
                                                Bakery Products
                                            </MenuItem>
                                        </TextField>
                                        <TextField
                                            select
                                            label="Category"
                                            value={
                                                exportFilters.categoryId || ""
                                            }
                                            onChange={(e) =>
                                                setExportFilters((f) => ({
                                                    ...f,
                                                    categoryId: e.target.value,
                                                }))
                                            }
                                            fullWidth
                                            disabled={categoriesLoading}>
                                            <MenuItem value="">All</MenuItem>
                                            {categories.map((category) => (
                                                <MenuItem
                                                    key={category.id}
                                                    value={category.id}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={() => setExportOpen(false)}
                                        disabled={exporting}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => {
                                            void handleExportCSV();
                                        }}
                                        disabled={exporting}>
                                        {exporting ? "Preparing..." : "Export"}
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* Legacy Section for Backward Compatibility */}
                            {data && (
                                <Box mt={{ xs: 3, md: 4 }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: { xs: 2, md: 3 },
                                            borderRadius: 3,
                                            border: "1px solid #e5e7eb",
                                        }}>
                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                            mb={2}
                                            sx={{
                                                fontSize: {
                                                    xs: "1.125rem",
                                                    md: "1.25rem",
                                                },
                                            }}>
                                            Group Summary
                                        </Typography>
                                        <Box
                                            display="grid"
                                            gridTemplateColumns="repeat(5, 1fr)"
                                            fontWeight={700}
                                            py={1}
                                            borderBottom="1px solid #eee"
                                            sx={{
                                                fontSize: {
                                                    xs: "0.813rem",
                                                    md: "1rem",
                                                },
                                            }}>
                                            <Box>Group</Box>
                                            <Box>Ordered</Box>
                                            <Box>Produced</Box>
                                            <Box>Cancelled</Box>
                                            <Box>Total Revenue</Box>
                                        </Box>
                                        {(data?.byGroup || []).map((g, idx) => (
                                            <Box
                                                key={idx}
                                                display="grid"
                                                gridTemplateColumns="repeat(5, 1fr)"
                                                py={1}
                                                borderBottom="1px solid #f5f5f5"
                                                fontSize={14}
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        md: "0.875rem",
                                                    },
                                                }}>
                                                <Box>
                                                    {g.group === "SWEETS"
                                                        ? "Sweets"
                                                        : "Bakery Products"}
                                                </Box>
                                                <Box>{g.ordered}</Box>
                                                <Box>{g.produced}</Box>
                                                <Box>{g.cancelled}</Box>
                                                <Box
                                                    fontWeight={600}
                                                    color="success.main">
                                                    AED{" "}
                                                    {g.totalRevenue.toLocaleString()}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Paper>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
