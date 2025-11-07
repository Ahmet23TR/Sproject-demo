import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminAnalyticsFinancials } from "@/services/adminService";
import type { EnhancedFinancialsData, AdminAnalyticsFinancialsQuery } from "@/types/data";

// Backend'den gelen raw data yapısı
interface BackendFinancialsResponse {
    summary: {
        totalInitialAmount: number;
        totalFinalAmount: number;
        totalDelta: number;
        orderCount: number;
        averageOrderValue: number;
        failedOrCancelledRate: number;
    };
    timeSeries: Array<{
        date: string;
        initialAmount: number;
        finalAmount: number;
        delta: number;
    }>;
    topLossContributors: Array<{
        orderId: string;
        orderNumber: string;
        customerName: string;
        initialAmount: number;
        finalAmount: number;
        lossAmount: number;
        status: string;
    }>;
}

export const useFinancialsReport = () => {
    const { token } = useAuth();
    const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
        "daily"
    );
    const toDateInputValue = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };
    const [startDate, setStartDate] = useState<string>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30); // Last 30 days
        return toDateInputValue(date);
    });
    const [endDate, setEndDate] = useState<string>(() => {
        const date = new Date();
        return toDateInputValue(date);
    });

    // Enhanced API için
    const [reportData, setReportData] = useState<EnhancedFinancialsData | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // API çağrısı
    const handleFetchReport = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            const query: AdminAnalyticsFinancialsQuery = { timeframe } as AdminAnalyticsFinancialsQuery;
            if (startDate) query.startDate = startDate;
            if (endDate) {
                // Parse as local date and shift by +1 day to make end inclusive
                const [yy, mm, dd] = endDate.split("-").map(Number);
                const end = new Date(yy, (mm || 1) - 1, dd || 1);
                end.setDate(end.getDate() + 1);
                query.endDate = toDateInputValue(end);
            }
            const response = (await getAdminAnalyticsFinancials(query, token)) as unknown as BackendFinancialsResponse;

            // Backend verisini frontend formatına dönüştür
            const mappedData: EnhancedFinancialsData = {
                summary: {
                    totalInitialAmount: response.summary.totalInitialAmount,
                    totalFinalAmount: response.summary.totalFinalAmount,
                    totalDelta: response.summary.totalDelta,
                    orderCount: response.summary.orderCount,
                    averageOrderValue: response.summary.averageOrderValue,
                    failedOrCancelledRate:
                        response.summary.failedOrCancelledRate,
                },
                timeSeries: response.timeSeries,
                topLossContributors: response.topLossContributors.map(
                    (item) => ({
                        ...item,
                        status: item.status as
                            | "FAILED"
                            | "CANCELLED"
                            | "PARTIALLY_DELIVERED"
                            | "DELIVERED",
                    })
                ),
            };

            setReportData(mappedData);
        } catch (err) {
            console.error("Financial report error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Error loading financial report"
            );
        } finally {
            setLoading(false);
        }
    }, [token, timeframe, startDate, endDate]);

    // İlk yükleme
    useEffect(() => {
        if (token) {
            handleFetchReport();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // İlk mount'da ve token değiştiğinde çağır

    return {
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
    } as const;
};
