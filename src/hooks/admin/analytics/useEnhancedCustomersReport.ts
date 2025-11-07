import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    getCustomerKPIMetrics,
    getTopCustomers,
    getCustomerAcquisitionTrend,
    getEnhancedCustomers,
} from "@/services/adminService";
import type {
    CustomerKPIMetrics,
    TopCustomerData,
    AcquisitionTrendData,
    EnhancedCustomerData,
} from "@/types/data";

export interface CustomerKPIFilters {
    startDate: Date | null;
    endDate: Date | null;
}

export interface CustomerTableFilters {
    sortBy:
        | "totalSpending"
        | "orderCount"
        | "averageOrderValue"
        | "firstOrderDate"
        | "lastOrderDate";
    sortOrder: "asc" | "desc";
    search: string;
    page: number;
    limit: number;
    orderCountMin?: number | null;
    orderCountMax?: number | null;
    totalSpendingMin?: number | null;
    totalSpendingMax?: number | null;
    aovMin?: number | null;
    aovMax?: number | null;
    activityStatus?: "ALL" | "ACTIVE_30" | "RISK_31_60" | "RISK_61_90" | "DORMANT_90_PLUS";
    customerType?: "ALL" | "COMPANY" | "INDIVIDUAL";
    priceList?: string;
}

interface UseEnhancedCustomersReportState {
    // KPI Data
    kpiData: CustomerKPIMetrics | null;
    kpiLoading: boolean;
    kpiError: string | null;

    // Top Customers Chart Data
    topCustomersData: TopCustomerData[];
    topCustomersLoading: boolean;
    topCustomersError: string | null;

    // Acquisition Trend Chart Data
    acquisitionData: AcquisitionTrendData[];
    acquisitionLoading: boolean;
    acquisitionError: string | null;

    // Enhanced Table Data
    tableData: EnhancedCustomerData[];
    tablePagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
        hasNext: boolean;
        hasPrevious: boolean;
    } | null;
    tableLoading: boolean;
    tableError: string | null;

    // Filters
    kpiFilters: CustomerKPIFilters;
    tableFilters: CustomerTableFilters;
}

export const useEnhancedCustomersReport = () => {
    const { token } = useAuth();

    const [state, setState] = useState<UseEnhancedCustomersReportState>({
        // KPI Data
        kpiData: null,
        kpiLoading: false,
        kpiError: null,

        // Top Customers Chart Data
        topCustomersData: [],
        topCustomersLoading: false,
        topCustomersError: null,

        // Acquisition Trend Chart Data
        acquisitionData: [],
        acquisitionLoading: false,
        acquisitionError: null,

        // Enhanced Table Data
        tableData: [],
        tablePagination: null,
        tableLoading: false,
        tableError: null,

        // Initial filters
        kpiFilters: {
            startDate: null,
            endDate: null,
        },
        tableFilters: {
            sortBy: "totalSpending",
            sortOrder: "desc",
            search: "",
            page: 1,
            limit: 25,
            orderCountMin: null,
            orderCountMax: null,
            totalSpendingMin: null,
            totalSpendingMax: null,
            aovMin: null,
            aovMax: null,
            activityStatus: "ALL",
            customerType: "ALL",
            priceList: "",
        },
    });

    // Update KPI filters
    const updateKpiFilters = useCallback(
        (patch: Partial<CustomerKPIFilters>) => {
            setState((prev) => ({ ...prev, kpiFilters: { ...prev.kpiFilters, ...patch } }));
        },
        []
    );

    // Update table filters
    const updateTableFilters = useCallback(
        (patch: Partial<CustomerTableFilters>) => {
            setState((prev) => ({ ...prev, tableFilters: { ...prev.tableFilters, ...patch } }));
        },
        []
    );

    // Clear all filters
    const clearKpiFilters = useCallback(() => {
        setState((prev) => ({ ...prev, kpiFilters: { startDate: null, endDate: null } }));
    }, []);

    const clearTableFilters = useCallback(() => {
        setState((prev) => ({
            ...prev,
            tableFilters: {
                sortBy: "totalSpending",
                sortOrder: "desc",
                search: "",
                page: 1,
                limit: 25,
                orderCountMin: null,
                orderCountMax: null,
                totalSpendingMin: null,
                totalSpendingMax: null,
                aovMin: null,
                aovMax: null,
                activityStatus: "ALL",
                customerType: "ALL",
                priceList: "",
            },
        }));
    }, []);

    // Format date for API
    const formatDateForAPI = (date: Date | null): string | undefined => {
        if (!date) return undefined;
        return date.toISOString().split("T")[0];
    };

    // Fetch KPI metrics
    const fetchKPIMetrics = useCallback(async () => {
        if (!token) return;

        setState((prev) => ({ ...prev, kpiLoading: true, kpiError: null }));

        try {
            const response = await getCustomerKPIMetrics(
                {
                    startDate: formatDateForAPI(state.kpiFilters.startDate),
                    endDate: formatDateForAPI(state.kpiFilters.endDate),
                },
                token
            );

            setState((prev) => ({
                ...prev,
                kpiData: response,
                kpiLoading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                kpiError:
                    error instanceof Error
                        ? error.message
                        : "Error occurred while fetching KPI data",
                kpiLoading: false,
            }));
        }
    }, [token, state.kpiFilters.startDate, state.kpiFilters.endDate]);

    // Fetch top customers
    const fetchTopCustomers = useCallback(async () => {
        if (!token) return;

        setState((prev) => ({
            ...prev,
            topCustomersLoading: true,
            topCustomersError: null,
        }));

        try {
            const response = await getTopCustomers({ limit: 10 }, token);

            setState((prev) => ({
                ...prev,
                topCustomersData: response,
                topCustomersLoading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                topCustomersError:
                    error instanceof Error
                        ? error.message
                        : "Error occurred while fetching top customer data",
                topCustomersLoading: false,
            }));
        }
    }, [token]);

    // Fetch acquisition trend
    const fetchAcquisitionTrend = useCallback(async () => {
        if (!token) return;

        setState((prev) => ({
            ...prev,
            acquisitionLoading: true,
            acquisitionError: null,
        }));

        try {
            const response = await getCustomerAcquisitionTrend(
                { months: 6 },
                token
            );

            setState((prev) => ({
                ...prev,
                acquisitionData: response,
                acquisitionLoading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                acquisitionError:
                    error instanceof Error
                        ? error.message
                        : "Error occurred while fetching acquisition trend data",
                acquisitionLoading: false,
            }));
        }
    }, [token]);

    // Fetch enhanced table data
    const fetchTableData = useCallback(async () => {
        if (!token) return;

        setState((prev) => ({ ...prev, tableLoading: true, tableError: null }));

        try {
            const response = await getEnhancedCustomers(
                {
                    page: state.tableFilters.page,
                    limit: state.tableFilters.limit,
                    sortBy: state.tableFilters.sortBy,
                    sortOrder: state.tableFilters.sortOrder,
                    search: state.tableFilters.search || undefined,
                },
                token
            );

            setState((prev) => ({
                ...prev,
                tableData: response.data,
                tablePagination: response.pagination,
                tableLoading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                tableError:
                    error instanceof Error
                        ? error.message
                        : "Error occurred while fetching table data",
                tableLoading: false,
            }));
        }
    }, [
        token,
        state.tableFilters.page,
        state.tableFilters.limit,
        state.tableFilters.sortBy,
        state.tableFilters.sortOrder,
        state.tableFilters.search,
    ]);

    // Fetch all dashboard data (except table)
    const fetchDashboardData = useCallback(async () => {
        await Promise.all([
            fetchKPIMetrics(),
            fetchTopCustomers(),
            fetchAcquisitionTrend(),
        ]);
    }, [fetchKPIMetrics, fetchTopCustomers, fetchAcquisitionTrend]);

    // Apply filters and refresh data
    const applyKpiFilters = useCallback(async () => {
        await fetchKPIMetrics();
    }, [fetchKPIMetrics]);

    const applyTableFilters = useCallback(async () => {
        await fetchTableData();
    }, [fetchTableData]);

    // Initial load
    useEffect(() => {
        if (token) {
            fetchDashboardData();
            fetchTableData();
        }
    }, [token, fetchDashboardData, fetchTableData]);

    // Refresh all data
    const refreshAllData = useCallback(async () => {
        await Promise.all([
            fetchKPIMetrics(),
            fetchTopCustomers(),
            fetchAcquisitionTrend(),
            fetchTableData(),
        ]);
    }, [
        fetchKPIMetrics,
        fetchTopCustomers,
        fetchAcquisitionTrend,
        fetchTableData,
    ]);

    // Computed values
    const isAnyLoading =
        state.kpiLoading ||
        state.topCustomersLoading ||
        state.acquisitionLoading ||
        state.tableLoading;
    const hasAnyError = Boolean(
        state.kpiError ||
            state.topCustomersError ||
            state.acquisitionError ||
            state.tableError
    );

    return {
        // Data
        kpiData: state.kpiData,
        topCustomersData: state.topCustomersData,
        acquisitionData: state.acquisitionData,
        tableData: state.tableData,
        tablePagination: state.tablePagination,

        // Loading states
        kpiLoading: state.kpiLoading,
        topCustomersLoading: state.topCustomersLoading,
        acquisitionLoading: state.acquisitionLoading,
        tableLoading: state.tableLoading,
        isAnyLoading,

        // Error states
        kpiError: state.kpiError,
        topCustomersError: state.topCustomersError,
        acquisitionError: state.acquisitionError,
        tableError: state.tableError,
        hasAnyError,

        // Filters
        kpiFilters: state.kpiFilters,
        tableFilters: state.tableFilters,
        updateKpiFilters,
        updateTableFilters,
        clearKpiFilters,
        clearTableFilters,

        // Actions
        applyKpiFilters,
        applyTableFilters,
        refreshAllData,
        fetchKPIMetrics,
        fetchTopCustomers,
        fetchAcquisitionTrend,
        fetchTableData,
    } as const;
};
