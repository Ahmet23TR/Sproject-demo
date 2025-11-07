// src/hooks/admin/useProductStatistics.ts
import { useState, useEffect, useCallback } from "react";
import {
    ProductStatistics,
    fetchProductStatistics,
} from "../../services/productService";
import { useAuth } from "../../context/AuthContext";

interface UseProductStatisticsReturn {
    statistics?: ProductStatistics;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useProductStatistics = (): UseProductStatisticsReturn => {
    const [statistics, setStatistics] = useState<ProductStatistics>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchData = useCallback(async () => {
        if (!token) {
            setError("No authentication token available");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await fetchProductStatistics(token);
            setStatistics(data);
        } catch (err) {
            console.error("Error fetching product statistics:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch statistics"
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = () => {
        fetchData();
    };

    return {
        statistics,
        loading,
        error,
        refetch,
    };
};
