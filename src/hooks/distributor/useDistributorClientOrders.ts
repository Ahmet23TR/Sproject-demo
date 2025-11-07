"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchDistributorClientOrders } from "@/services/orderService";
import type { Order, PaginationInfo } from "@/types/data";
import { getApiErrorMessage } from "@/utils/errorHandler";

export const useDistributorClientOrders = (clientId: string) => {
    const { token } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [overallStatusCounts, setOverallStatusCounts] = useState({ completed: 0, inProgress: 0, pending: 0, cancelled: 0 });

    const refetch = useCallback(async () => {
        if (!token || !clientId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetchDistributorClientOrders(clientId, token, currentPage, 10);
            setOrders(response.data || []);
            setPagination(response.pagination || null);

            // Aggregate overall status counts across all pages for accurate stats
            const totalPages = response.pagination?.totalPages ?? 1;
            if (totalPages > 1) {
                const pageIndices: number[] = [];
                for (let p = 1; p <= totalPages; p++) {
                    pageIndices.push(p);
                }
                const results = await Promise.all(
                    pageIndices.map((p) => fetchDistributorClientOrders(clientId, token, p, response.pagination?.pageSize ?? 10))
                );
                const allOrders = results.flatMap((r) => r.data || []);
                const counts = allOrders.reduce(
                    (acc, o) => {
                        const s = o.deliveryStatus;
                        if (s === "DELIVERED") acc.completed += 1;
                        else if (s === "CANCELLED") acc.cancelled += 1;
                        else if (s === "READY_FOR_DELIVERY" || s === "PARTIALLY_DELIVERED") acc.inProgress += 1;
                        else acc.pending += 1;
                        return acc;
                    },
                    { completed: 0, inProgress: 0, pending: 0, cancelled: 0 }
                );
                setOverallStatusCounts(counts);
            } else {
                // Single page - overall equals current page counts
                setOverallStatusCounts((prev) => prev); // will be derived below from orders effect
            }
        } catch (err) {
            setError(getApiErrorMessage(err));
            setOrders([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [token, clientId, currentPage]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handlePageChange = (_: unknown, value: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", value.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const statusCounts = useMemo(() => {
        const counts = {
            completed: 0,
            inProgress: 0,
            pending: 0,
            cancelled: 0,
        };
        orders.forEach((o) => {
            const s = o.deliveryStatus;
            if (s === "DELIVERED") counts.completed += 1;
            else if (s === "CANCELLED") counts.cancelled += 1;
            else if (s === "READY_FOR_DELIVERY" || s === "PARTIALLY_DELIVERED") counts.inProgress += 1;
            else counts.pending += 1;
        });
        return counts;
    }, [orders]);

    // If overall counts were computed (multi-page), prefer them; else fall back to current page counts
    const effectiveStatusCounts = useMemo(() => {
        const sum = overallStatusCounts.completed + overallStatusCounts.inProgress + overallStatusCounts.pending + overallStatusCounts.cancelled;
        return sum > 0 ? overallStatusCounts : statusCounts;
    }, [overallStatusCounts, statusCounts]);

    return { orders, pagination, loading, error, refetch, handlePageChange, statusCounts: effectiveStatusCounts };
};


