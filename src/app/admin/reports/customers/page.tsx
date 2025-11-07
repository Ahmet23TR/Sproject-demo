"use client";
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Chip,
    Skeleton,
    Alert,
} from "@mui/material";
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
} from "@mui/icons-material";
import { useEnhancedCustomersReport } from "@/hooks/admin/analytics/useEnhancedCustomersReport";
import type { CustomerTableFilters as CustomerTableFiltersType } from "@/hooks/admin/analytics/useEnhancedCustomersReport";
import { CustomerKPICards } from "@/components/admin/analytics/CustomerKPICards";
import { TopCustomersChart } from "@/components/admin/charts/TopCustomersChart";
import { NewCustomerAcquisitionChart } from "@/components/admin/charts/NewCustomerAcquisitionChart";
import { SummaryDateFilter as SummaryDateFilterComponent } from "@/app/admin/orders/components/SummaryDateFilter";
import { SummaryDateFilter as SummaryPeriod } from "@/hooks/admin/useAdminOrdersSummary";
import { CustomerTableFiltersComponent } from "@/components/admin/analytics/CustomerTableFilters";

export default function AdminCustomersReportPage() {
    const {
        // Data
        kpiData,
        topCustomersData,
        acquisitionData,
        tableData,
        tablePagination,

        // Loading states
        kpiLoading,
        topCustomersLoading,
        acquisitionLoading,
        tableLoading,

        // Error states
        kpiError,
        topCustomersError,
        acquisitionError,
        tableError,
        hasAnyError,

        // Filters (separated)
        tableFilters,
        updateKpiFilters,
        updateTableFilters,
        clearTableFilters,

        // Actions
        applyKpiFilters,
        applyTableFilters,
    } = useEnhancedCustomersReport();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 0,
        }).format(value);
    };

    // KPI summary period (dropdown like Order Reports)
    const [kpiSummaryPeriod, setKpiSummaryPeriod] =
        React.useState<SummaryPeriod>("THIS_MONTH");

    // Helpers to map period → [startDate, endDate]
    const startOfDay = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const addDays = (d: Date, n: number) => {
        const c = new Date(d);
        c.setDate(c.getDate() + n);
        return c;
    };
    const startOfWeek = (d: Date) => {
        const base = startOfDay(d);
        const day = base.getDay();
        const diff = day === 0 ? -6 : 1 - day; // Monday first
        return addDays(base, diff);
    };
    const startOfMonth = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
    const endOfYear = (d: Date) => new Date(d.getFullYear(), 11, 31);
    const getPeriodRange = (
        p: SummaryPeriod
    ): { start: Date | null; end: Date | null } => {
        const now = new Date();
        const today = startOfDay(now);
        switch (p) {
            case "TODAY":
                return { start: today, end: today };
            case "THIS_WEEK": {
                const s = startOfWeek(now);
                return { start: s, end: today };
            }
            case "LAST_WEEK": {
                const thisW = startOfWeek(now);
                const lastW = addDays(thisW, -7);
                return { start: lastW, end: addDays(lastW, 6) };
            }
            case "THIS_MONTH":
                return { start: startOfMonth(now), end: today };
            case "LAST_MONTH": {
                const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return { start: startOfMonth(prev), end: endOfMonth(prev) };
            }
            case "THIS_YEAR":
                return { start: startOfYear(now), end: today };
            case "LAST_YEAR": {
                const prevY = new Date(now.getFullYear() - 1, 0, 1);
                return { start: startOfYear(prevY), end: endOfYear(prevY) };
            }
            case "ALL_TIME":
            default:
                return { start: null, end: null };
        }
    };

    const handleKpiPeriodChange = (val: SummaryPeriod) => {
        setKpiSummaryPeriod(val);
        const { start, end } = getPeriodRange(val);
        updateKpiFilters({ startDate: start ?? null, endDate: end ?? null });
        applyKpiFilters();
    };

    // Client-side table segmentation filters (apply to current fetched page)
    const displayedRows = React.useMemo(() => {
        const rows = tableData || [];
        const f = tableFilters;
        const now = new Date();
        const daysBetween = (a: Date, b: Date) =>
            Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
        const matchActivity = (lastOrderDate: string) => {
            const days = daysBetween(now, new Date(lastOrderDate));
            switch (f.activityStatus) {
                case "ACTIVE_30":
                    return days <= 30;
                case "RISK_31_60":
                    return days >= 31 && days <= 60;
                case "RISK_61_90":
                    return days >= 61 && days <= 90;
                case "DORMANT_90_PLUS":
                    return days > 90;
                case "ALL":
                default:
                    return true;
            }
        };

        return rows.filter((c) => {
            if (f.orderCountMin != null && c.orderCount < f.orderCountMin)
                return false;
            if (f.orderCountMax != null && c.orderCount > f.orderCountMax)
                return false;
            if (
                f.totalSpendingMin != null &&
                c.totalSpending < f.totalSpendingMin
            )
                return false;
            if (
                f.totalSpendingMax != null &&
                c.totalSpending > f.totalSpendingMax
            )
                return false;
            if (f.aovMin != null && c.averageOrderValue < f.aovMin)
                return false;
            if (f.aovMax != null && c.averageOrderValue > f.aovMax)
                return false;
            if (f.customerType === "COMPANY" && !c.companyName) return false;
            if (f.customerType === "INDIVIDUAL" && !!c.companyName)
                return false;
            // Removed price list filtering in admin customers report
            if (!matchActivity(c.lastOrderDate)) return false;
            return true;
        });
    }, [tableData, tableFilters]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US");
    };

    const getRiskColor = (daysSince: number) => {
        if (daysSince > 90) return "error";
        if (daysSince > 60) return "warning";
        if (daysSince > 30) return "info";
        return "success";
    };

    const getRiskLevel = (daysSince: number) => {
        if (daysSince > 90) return "High Risk";
        if (daysSince > 60) return "Medium Risk";
        if (daysSince > 30) return "Low Risk";
        return "Active";
    };

    const handleTableFiltersChange = (patch: Partial<typeof tableFilters>) => {
        updateTableFilters(patch);
    };

    const handleTablePageChange = (event: unknown, newPage: number) => {
        updateTableFilters({ page: newPage + 1 });
        applyTableFilters();
    };

    const handleTableRowsPerPageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        updateTableFilters({
            page: 1,
            limit: parseInt(event.target.value, 10),
        });
        applyTableFilters();
    };

    const handleSort = (column: CustomerTableFiltersType["sortBy"]) => {
        const isCurrentColumn = tableFilters.sortBy === column;
        const newSortOrder =
            isCurrentColumn && tableFilters.sortOrder === "desc"
                ? "asc"
                : "desc";

        updateTableFilters({
            sortBy: column,
            sortOrder: newSortOrder,
            page: 1,
        });
        applyTableFilters();
    };

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Box
                sx={{
                    bgcolor: "#f5f6fa",
                    minHeight: "100vh",
                    py: { xs: 4, md: 6 },
                }}>
                <Box maxWidth={1400} mx="auto" px={2}>
                    {/* Page Header & KPI Summary Period */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "stretch", sm: "center" },
                            gap: 2,
                            mb: 4,
                        }}>
                        <Typography
                            variant="h4"
                            fontWeight={600}
                            sx={{
                                fontSize: { xs: "1.75rem", md: "2.125rem" },
                                display: { xs: "block", sm: "none" },
                            }}>
                            Customer Report
                        </Typography>
                        <SummaryDateFilterComponent
                            value={kpiSummaryPeriod}
                            onChange={handleKpiPeriodChange}
                        />
                    </Box>

                    {/* Error Display */}
                    {hasAnyError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            <Box>
                                {kpiError && <div>KPI Error: {kpiError}</div>}
                                {topCustomersError && (
                                    <div>
                                        Top Customers Error: {topCustomersError}
                                    </div>
                                )}
                                {acquisitionError && (
                                    <div>Trend Error: {acquisitionError}</div>
                                )}
                                {tableError && (
                                    <div>Table Error: {tableError}</div>
                                )}
                            </Box>
                        </Alert>
                    )}

                    {/* KPI Cards */}
                    <CustomerKPICards data={kpiData} loading={kpiLoading} />

                    {/* Charts Section */}
                    <Box sx={{ mt: 4, mb: 4 }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", lg: "row" },
                                gap: 4,
                            }}>
                            <Box sx={{ flex: { lg: "2" } }}>
                                <TopCustomersChart
                                    data={topCustomersData}
                                    loading={topCustomersLoading}
                                />
                            </Box>
                            <Box sx={{ flex: { lg: "1" } }}>
                                <NewCustomerAcquisitionChart
                                    data={acquisitionData}
                                    loading={acquisitionLoading}
                                    useAreaChart={true}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Table Filters */}
                    <CustomerTableFiltersComponent
                        filters={tableFilters}
                        onChange={handleTableFiltersChange}
                        onApply={applyTableFilters}
                        onClear={clearTableFilters}
                        loading={tableLoading}
                    />

                    {/* Enhanced Table */}
                    <Paper elevation={2} sx={{ overflow: "hidden" }}>
                        <Box
                            sx={{
                                p: { xs: 2, md: 3 },
                                borderBottom: "1px solid",
                                borderColor: "divider",
                            }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}>
                                Detailed Customer Table
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: "0.813rem", md: "0.875rem" } }}>
                                Comprehensive analysis of all your customers
                            </Typography>
                        </Box>

                        <TableContainer sx={{ overflowX: "auto" }}>
                            <Table sx={{ minWidth: { xs: 800, md: "auto" } }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "grey.50" }}>
                                        <TableCell sx={{ minWidth: 200 }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}>
                                                <PersonIcon fontSize="small" />
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        display: {
                                                            xs: "none",
                                                            sm: "inline",
                                                        },
                                                    }}>
                                                    Customer Information
                                                </Box>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        display: {
                                                            xs: "inline",
                                                            sm: "none",
                                                        },
                                                    }}>
                                                    Customer
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={
                                                    tableFilters.sortBy ===
                                                    "orderCount"
                                                }
                                                direction={
                                                    tableFilters.sortBy ===
                                                        "orderCount"
                                                        ? tableFilters.sortOrder
                                                        : "desc"
                                                }
                                                onClick={() =>
                                                    handleSort("orderCount")
                                                }>
                                                Order Count
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={
                                                    tableFilters.sortBy ===
                                                    "totalSpending"
                                                }
                                                direction={
                                                    tableFilters.sortBy ===
                                                        "totalSpending"
                                                        ? tableFilters.sortOrder
                                                        : "desc"
                                                }
                                                onClick={() =>
                                                    handleSort("totalSpending")
                                                }>
                                                Total Spending
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={
                                                    tableFilters.sortBy ===
                                                    "averageOrderValue"
                                                }
                                                direction={
                                                    tableFilters.sortBy ===
                                                        "averageOrderValue"
                                                        ? tableFilters.sortOrder
                                                        : "desc"
                                                }
                                                onClick={() =>
                                                    handleSort(
                                                        "averageOrderValue"
                                                    )
                                                }>
                                                Average Order
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={
                                                    tableFilters.sortBy ===
                                                    "firstOrderDate"
                                                }
                                                direction={
                                                    tableFilters.sortBy ===
                                                        "firstOrderDate"
                                                        ? tableFilters.sortOrder
                                                        : "desc"
                                                }
                                                onClick={() =>
                                                    handleSort("firstOrderDate")
                                                }>
                                                First Order
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={
                                                    tableFilters.sortBy ===
                                                    "lastOrderDate"
                                                }
                                                direction={
                                                    tableFilters.sortBy ===
                                                        "lastOrderDate"
                                                        ? tableFilters.sortOrder
                                                        : "desc"
                                                }
                                                onClick={() =>
                                                    handleSort("lastOrderDate")
                                                }>
                                                Last Order
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableLoading ? (
                                        Array.from(
                                            { length: tableFilters.limit },
                                            (_, index) => (
                                                <TableRow key={index}>
                                                    {Array.from(
                                                        { length: 7 },
                                                        (_, cellIndex) => (
                                                            <TableCell
                                                                key={cellIndex}>
                                                                <Skeleton variant="text" />
                                                            </TableCell>
                                                        )
                                                    )}
                                                </TableRow>
                                            )
                                        )
                                    ) : (displayedRows || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                align="center"
                                                sx={{ py: 4 }}>
                                                <Typography color="text.secondary">
                                                    No customers found matching
                                                    the filters
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (displayedRows || []).map(
                                            (customer) => {
                                                const daysSinceLastOrder =
                                                    Math.floor(
                                                        (Date.now() -
                                                            new Date(
                                                                customer.lastOrderDate
                                                            ).getTime()) /
                                                        (1000 *
                                                            60 *
                                                            60 *
                                                            24)
                                                    );

                                                return (
                                                    <TableRow
                                                        key={customer.userId}
                                                        hover>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.primary"
                                                                    fontWeight={
                                                                        600
                                                                    }>
                                                                    {
                                                                        customer.customerName
                                                                    }
                                                                </Typography>
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: 0.5,
                                                                        mt: 0.5,
                                                                    }}>
                                                                    <BusinessIcon
                                                                        fontSize="small"
                                                                        color="action"
                                                                    />
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary">
                                                                        {
                                                                            customer.companyName
                                                                        }
                                                                    </Typography>
                                                                </Box>
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: 0.5,
                                                                    }}>
                                                                    <EmailIcon
                                                                        fontSize="small"
                                                                        color="action"
                                                                    />
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary">
                                                                        {
                                                                            customer.email
                                                                        }
                                                                    </Typography>
                                                                </Box>
                                                                {customer.phone && (
                                                                    <Box
                                                                        sx={{
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            gap: 0.5,
                                                                        }}>
                                                                        <PhoneIcon
                                                                            fontSize="small"
                                                                            color="action"
                                                                        />
                                                                        <Typography
                                                                            variant="caption"
                                                                            color="text.secondary">
                                                                            {
                                                                                customer.phone
                                                                            }
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.primary"
                                                                fontWeight={
                                                                    600
                                                                }>
                                                                {
                                                                    customer.orderCount
                                                                }
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={600}
                                                                color="text.primary">
                                                                {formatCurrency(
                                                                    customer.totalSpending
                                                                )}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.primary">
                                                                {formatCurrency(
                                                                    customer.averageOrderValue
                                                                )}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.primary">
                                                                {formatDate(
                                                                    customer.firstOrderDate
                                                                )}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary">
                                                                {
                                                                    customer.customerSince
                                                                }{" "}
                                                                days ago
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.primary">
                                                                {formatDate(
                                                                    customer.lastOrderDate
                                                                )}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary">
                                                                {
                                                                    daysSinceLastOrder
                                                                }{" "}
                                                                days ago
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="small"
                                                                label={getRiskLevel(
                                                                    daysSinceLastOrder
                                                                )}
                                                                color={getRiskColor(
                                                                    daysSinceLastOrder
                                                                )}
                                                                variant={
                                                                    daysSinceLastOrder >
                                                                        30
                                                                        ? "filled"
                                                                        : "outlined"
                                                                }
                                                            />
                                                        </TableCell>
                                                        
                                                    </TableRow>
                                                );
                                            }
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {tablePagination && (
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={tablePagination.totalItems}
                                rowsPerPage={tablePagination.pageSize}
                                page={tablePagination.currentPage - 1}
                                onPageChange={handleTablePageChange}
                                onRowsPerPageChange={
                                    handleTableRowsPerPageChange
                                }
                                labelRowsPerPage="Rows per page:"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} of ${count !== -1 ? count : `more than ${to}`
                                    }`
                                }
                            />
                        )}
                    </Paper>
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
