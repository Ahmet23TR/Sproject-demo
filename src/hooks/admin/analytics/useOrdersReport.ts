import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    getAdminAnalyticsOrders,
    getOrdersExportStats,
    createAsyncOrdersExport,
    getExportJobStatus,
    type ExportRequest,
} from "@/services/adminService";
import { orderReportColumns } from "@/utils/ordersReportExport";
import { EXPORT_CONFIG } from "@/config/export";
import type {
    AdminAnalyticsOrdersItem,
    AdminAnalyticsOrdersResponse,
} from "@/types/data";

function toIsoRange(dateStr?: string, end?: boolean): string | undefined {
    if (!dateStr) return undefined;
    const d = new Date(dateStr + (end ? "T23:59:59.999Z" : "T00:00:00.000Z"));
    return d.toISOString();
}

export const useOrdersReport = () => {
    const { token } = useAuth();
    const [filters, setFilters] = useState<{
        startDate?: string;
        endDate?: string;
        status?: string;
    }>({});
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [data, setData] = useState<AdminAnalyticsOrdersResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportStats, setExportStats] = useState<{
        orderCount: number;
        itemCount: number;
        estimatedSizeKB: number;
        estimatedTimeSeconds: number;
        canExport: boolean;
        willCache: boolean;
    } | null>(null);
    const [asyncJobId, setAsyncJobId] = useState<string | null>(null);
    const [jobProgress, setJobProgress] = useState(0);
    const [jobStatus, setJobStatus] = useState<
        "idle" | "queued" | "processing" | "completed" | "failed"
    >("idle");

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await getAdminAnalyticsOrders(
                {
                    page,
                    limit,
                    startDate: toIsoRange(filters.startDate, false),
                    endDate: toIsoRange(filters.endDate, true),
                    status: filters.status || undefined,
                },
                token
            );

            if (res.data.length === 0) {
                console.warn("⚠️ No orders returned. Check:");
                console.warn("  1. Database has orders");
                console.warn("  2. Date filters not too restrictive");
                console.warn("  3. Status filter not too restrictive");
                console.warn("  4. User has permission to see orders");
            }

            setData(res);
        } catch (error) {
            console.error("❌ Orders fetch failed:", error);
        } finally {
            setLoading(false);
        }
    }, [token, page, limit, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setFilter = (patch: Partial<typeof filters>) =>
        setFilters((f) => ({ ...f, ...patch }));

    // Export stats fonksiyonu - backend'den export bilgilerini al
    const getExportStats = useCallback(
        async (range?: { startDate?: string; endDate?: string }) => {
            if (!token || !range?.startDate || !range?.endDate) return null;

            try {
                const params = {
                    startDate: toIsoRange(range.startDate, false) || "",
                    endDate: toIsoRange(range.endDate, true) || "",
                    ...(filters.status && { status: filters.status }),
                };

                const data = await getOrdersExportStats(params, token);
                setExportStats(data);
                return data;
            } catch (error) {
                console.error("❌ Export stats endpoint failed:", error);

                // Backend henüz yeni endpoint implement etmediyse, fallback data döndür
                console.warn(
                    "⚠️ Export stats endpoint not available, using preview data for estimate"
                );

                // Fallback: Mevcut orders endpoint'ini kullanarak tahmin yap
                try {
                    const previewRes = await getAdminAnalyticsOrders(
                        {
                            page: 1,
                            limit: 1,
                            startDate: toIsoRange(range.startDate, false),
                            endDate: toIsoRange(range.endDate, true),
                            status: filters.status || undefined,
                        },
                        token
                    );

                    const totalOrders = previewRes.pagination?.totalItems || 0;
                    const estimatedItems = totalOrders * 3; // Average 3 items per order
                    const estimatedSizeKB = Math.max(
                        1,
                        Math.round(totalOrders * 0.5)
                    ); // ~0.5KB per order
                    const estimatedTimeSeconds = Math.max(
                        1,
                        Math.round(totalOrders / 100)
                    ); // 100 orders per second

                    const fallbackStats = {
                        orderCount: totalOrders,
                        itemCount: estimatedItems,
                        estimatedSizeKB,
                        estimatedTimeSeconds,
                        canExport: totalOrders > 0,
                        willCache: totalOrders > 100,
                    };

                    setExportStats(fallbackStats);
                    return fallbackStats;
                } catch (fallbackError) {
                    console.error(
                        "❌ Fallback stats generation failed:",
                        fallbackError
                    );
                }

                // Son fallback - varsayılan değerler
                const fallbackStats = {
                    orderCount: 0,
                    itemCount: 0,
                    estimatedSizeKB: 1,
                    estimatedTimeSeconds: 1,
                    canExport: true,
                    willCache: false,
                };
                setExportStats(fallbackStats);
                return fallbackStats;
            }
        },
        [token, filters.status]
    );

    // Job tracking fonksiyonu
    const trackExportJob = useCallback(
        (jobId: string) => {
            const interval = setInterval(async () => {
                try {
                    const data = await getExportJobStatus(jobId, token || "");

                    setJobProgress(data.progress);
                    setJobStatus(data.status);

                    if (data.status === "completed") {
                        clearInterval(interval);
                        if (data.downloadUrl) {
                            window.open(data.downloadUrl, "_blank");
                            window.alert("Export tamamlandı!");
                        }
                        setAsyncJobId(null);
                        setJobProgress(0);
                        setJobStatus("idle");
                    } else if (data.status === "failed") {
                        clearInterval(interval);
                        window.alert("Export başarısız oldu");
                        setAsyncJobId(null);
                        setJobProgress(0);
                        setJobStatus("idle");
                    }
                } catch (error) {
                    console.error("Failed to track job:", error);
                    clearInterval(interval);
                }
            }, EXPORT_CONFIG.thresholds.pollInterval); // Config'den alınan interval

            return interval;
        },
        [token]
    );

    // Async job oluşturma fonksiyonu
    const createAsyncExport = useCallback(
        async (range?: { startDate?: string; endDate?: string }) => {
            if (!token || !range?.startDate || !range?.endDate) return false;

            try {
                const request: ExportRequest = {
                    startDate: toIsoRange(range.startDate, false),
                    endDate: toIsoRange(range.endDate, true),
                    format: "csv",
                    ...(filters.status && { status: filters.status }),
                };

                const data = await createAsyncOrdersExport(request, token);

                if (data.recommendedMethod === "direct") {
                    window.alert("Bu export için direct download öneriliyor");
                    return false;
                }

                setAsyncJobId(data.jobId);
                setJobStatus("queued");
                trackExportJob(data.jobId);
                return true;
            } catch (error) {
                console.error("Failed to create async export:", error);
                return false;
            }
        },
        [token, filters.status, trackExportJob]
    );

    const fetchOrdersForRange = useCallback(
        async ({
            startDate,
            endDate,
        }: {
            startDate: string;
            endDate: string;
        }) => {
            if (!token) return [];

            const exportLimit = 100; // Performans için 250'den 100'e düşürüldü
            const allOrders: AdminAnalyticsOrdersItem[] = [];
            let currentPage = 1;
            let totalPages = 1;

            do {
                const res = await getAdminAnalyticsOrders(
                    {
                        page: currentPage,
                        limit: exportLimit,
                        startDate: toIsoRange(startDate, false),
                        endDate: toIsoRange(endDate, true),
                        status: filters.status || undefined,
                    },
                    token
                );

                allOrders.push(...res.data);
                totalPages = res.pagination?.totalPages || 1;
                currentPage += 1;

                // Her 500 kayıt sonrası kısa bir break ver
                if (allOrders.length % 500 === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
            } while (currentPage <= totalPages);

            return allOrders;
        },
        [token, filters.status]
    );

    // Fallback client-side export
    const fallbackClientExport = useCallback(
        async ({
            startDate,
            endDate,
        }: {
            startDate: string;
            endDate: string;
        }) => {
            try {
                const orders = await fetchOrdersForRange({
                    startDate,
                    endDate,
                });

                if (!orders.length) {
                    window.alert("No orders found in the selected date range.");
                    return false;
                }

                const delimiter = ";";
                const newline = "\r\n";

                const escapeCell = (value: unknown) => {
                    if (value === null || value === undefined) {
                        return "";
                    }
                    const str = String(value);
                    if (str === "-") {
                        return "-";
                    }
                    const needsQuotes =
                        str.includes('"') ||
                        str.includes(delimiter) ||
                        str.includes("\n") ||
                        str.includes("\r");
                    const sanitized = str.replace(/"/g, '""');
                    return needsQuotes ? `"${sanitized}"` : sanitized;
                };

                const headerRow = orderReportColumns
                    .map((column) => escapeCell(column.header))
                    .join(delimiter);

                const bodyRows = orders.map((order) =>
                    orderReportColumns
                        .map((column) => escapeCell(column.getValue(order)))
                        .join(delimiter)
                );

                const csvContent = [headerRow, ...bodyRows].join(newline);
                const blob = new Blob([`\ufeff${csvContent}`], {
                    type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                    "download",
                    `orders-report-${Date.now()}.csv`
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                return true;
            } catch (error) {
                console.error("Fallback export failed", error);
                window.alert(
                    "Something went wrong during export. Please try again."
                );
                return false;
            }
        },
        [fetchOrdersForRange]
    );

    const exportCsv = async (range?: {
        startDate?: string;
        endDate?: string;
    }) => {
        if (!token) return false;
        const startDate = range?.startDate;
        const endDate = range?.endDate;

        if (!startDate || !endDate) {
            window.alert("Please select the start and end dates for export.");
            return false;
        }

        setExporting(true);
        setExportProgress(0);

        try {
            // Backend CSV formatı sorunu var - şimdilik fallback kullan
            return await fallbackClientExport({ startDate, endDate });

            // Backend optimizasyonu: Direct stream export denemesi (şimdilik kapalı)
            /* 
            const request: ExportRequest = {
                startDate: toIsoRange(startDate, false),
                endDate: toIsoRange(endDate, true),
                format: "csv",
                ...(filters.status && { status: filters.status })
            };

            const response = await exportOrdersDirect(request, token);

            // Backend her zaman blob döndürmeli, ancak eğer JSON response gelirse kontrol et
            if (response instanceof Blob) {
                // Direct stream durumunda file download
                const url = URL.createObjectURL(response);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                    "download",
                    `orders-report-${Date.now()}.csv`
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                return true;
            } else {
                // Eğer JSON response geldiyse (beklenmeyen durum), konsola log et
                console.warn("❌ Expected blob response but received:", response);
                
                // Fallback to client-side export if server doesn't return blob
                return await fallbackClientExport({ startDate, endDate });
            }
            */
        } catch (error) {
            console.error("Orders CSV export failed", error);

            return await fallbackClientExport({ startDate, endDate });
        } finally {
            setExporting(false);
            setExportProgress(0);
        }
    };

    return {
        loading,
        data,
        page,
        limit,
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
        createAsyncExport,
    } as const;
};
