"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchDistributorClientById } from "@/services/userService";
import type { DistributorClientDetail, User } from "@/types/data";
import { getApiErrorMessage } from "@/utils/errorHandler";

export const useDistributorClientDetail = (clientId: string) => {
    const { token } = useAuth();

    const [detail, setDetail] = useState<DistributorClientDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!token || !clientId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDistributorClientById(clientId, token);
            setDetail(data);
        } catch (err) {
            setError(getApiErrorMessage(err));
            setDetail(null);
        } finally {
            setLoading(false);
        }
    }, [token, clientId]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Map to minimal User shape for presentational components reuse
    const userForDisplay: User | null = useMemo(() => {
        if (!detail) return null;
        return {
            id: detail.id,
            email: detail.email,
            name: detail.name,
            surname: detail.surname,
            role: "CLIENT",
            isActive: detail.isActive,
            companyName: detail.companyName,
            address: detail.address,
            phone: detail.phone ?? undefined,
            assignedDistributorId: detail.assignedDistributor?.id ?? null,
            createdAt: detail.createdAt,
            orderCount: detail.orderCount,
            totalOrderAmount: detail.totalOrderAmount,
            priceListId: detail.priceListId ?? undefined,
            productGroup: detail.productGroup,
        };
    }, [detail]);

    const priceListName = detail?.priceList?.name ?? "Default";
    const assignedDistributorName = detail?.assignedDistributor
        ? `${detail.assignedDistributor.name} ${detail.assignedDistributor.surname}`
        : null;

    // Stats (read-only): compute simple derived metrics
    const orderCount = detail?.orderCount ?? 0;
    const totalSpend = detail?.totalOrderAmount ?? 0;
    const averageOrderValue = orderCount > 0 ? totalSpend / orderCount : null;

    return {
        detail,
        user: userForDisplay,
        loading,
        error,
        refetch,
        priceListName,
        assignedDistributorName,
        orderCount,
        totalSpend,
        averageOrderValue,
    };
};


