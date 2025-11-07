import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminAnalyticsProduction } from "@/services/adminService";
import type {
    AdminAnalyticsProductionResponse,
    ProductGroup,
} from "@/types/data";

export const useProductionReport = () => {
    const { token } = useAuth();
    const [filters, setFilters] = useState<{
        startDate?: string;
        endDate?: string;
        productGroup?: ProductGroup | "";
        categoryId?: string;
    }>({});
    const [data, setData] = useState<AdminAnalyticsProductionResponse | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [cacheInfo, setCacheInfo] = useState<
        { fromCache: boolean; timestamp: string; silent: boolean }
    | null>(null);

    const fetchData = useCallback(
        async (options?: { silent?: boolean }) => {
            if (!token) return;
            if (options?.silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            try {
                const res = await getAdminAnalyticsProduction(
                    {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        productGroup:
                            (filters.productGroup as ProductGroup) || undefined,
                        categoryId: filters.categoryId,
                    },
                    token
                );
                setData(res);
                setCacheInfo({
                    fromCache: Boolean(res.fromCache),
                    timestamp: new Date().toISOString(),
                    silent: Boolean(options?.silent),
                });
                setError(null);
            } catch (err) {
                setError(err);
            } finally {
                if (options?.silent) {
                    setRefreshing(false);
                } else {
                    setLoading(false);
                }
            }
        },
        [token, filters]
    );

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setFilter = (patch: Partial<typeof filters>) =>
        setFilters((f) => ({ ...f, ...patch }));

    return {
        loading,
        refreshing,
        data,
        filters,
        setFilter,
        fetchData,
        cacheInfo,
        error,
    } as const;
};
