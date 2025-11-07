"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { fetchOrderDetail } from "../../services/orderService";
import type { Order } from "../../types/data";
import { getApiErrorMessage } from "../../utils/errorHandler";

export const useOrderDetail = () => {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuth();

    const orderId = useMemo(() => params?.id ?? "", [params]);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            if (!token || !orderId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const data = await fetchOrderDetail(orderId, token);
                setOrder(data);
            } catch (err) {
                setError(getApiErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [orderId, token]);

    const goBackToHistory = () => router.push("/client/order-history");

    return {
        order,
        loading,
        error,
        orderId,
        goBackToHistory,
    };
};


