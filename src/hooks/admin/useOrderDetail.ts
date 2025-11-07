// src/hooks/useOrderDetail.ts
"use client";
import { useState, useEffect, useCallback } from 'react';
import { fetchOrderDetail } from '../../services/orderService'; // Servis dosyasını order olarak güncelledim
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { Order } from '../../types/data';

export const useOrderDetail = (orderId: string | string[]) => {
    const { token } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOrder = useCallback(async () => {
        if (!token || !orderId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await fetchOrderDetail(orderId as string, token);
            setOrder(data);
        } catch (error) {
            setError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [orderId, token]);

    useEffect(() => {
        loadOrder();
    }, [loadOrder]);

    // Refetch function for manual refresh
    const refetch = () => {
        loadOrder();
    };

    return { order, loading, error, refetch };
};
