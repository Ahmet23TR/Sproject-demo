import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminAnalyticsCustomers } from "@/services/adminService";
import type { AdminAnalyticsCustomersResponse } from "@/types/data";

export const useCustomersReport = () => {
    const { token } = useAuth();
    const [sortBy, setSortBy] = useState<'totalSpending' | 'orderCount'>('totalSpending');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [data, setData] = useState<AdminAnalyticsCustomersResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await getAdminAnalyticsCustomers({ page, limit, sortBy }, token);
            setData(res);
        } finally {
            setLoading(false);
        }
    }, [token, page, limit, sortBy]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { loading, data, page, limit, setPage, sortBy, setSortBy, fetchData } as const;
};


