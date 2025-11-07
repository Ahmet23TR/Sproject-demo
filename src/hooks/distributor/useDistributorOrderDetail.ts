"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Order } from "@/types/data";
import { getApiErrorMessage } from "@/utils/errorHandler";
import { fetchDistributorOrderDetail } from "@/services/distributorService";

export const useDistributorOrderDetail = () => {
    const params = useParams<{ id: string }>();
    const { token } = useAuth();
    const orderId = useMemo(() => params?.id ?? "", [params]);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        if (!token || !orderId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDistributorOrderDetail(orderId, token);
            setOrder(data);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, token]);

    return { order, loading, error, refetch: load };
};



