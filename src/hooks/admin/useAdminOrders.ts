// src/hooks/useAdminOrders.ts
"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errorHandler";
import { fetchAllOrders, OrderFilterParams, OrdersResponse, cancelOrderByAdmin } from "../../services/orderService";
import { Order } from "../../types/data";

// Siparişleri tarihe göre gruplandıran yardımcı fonksiyon
const groupOrdersByDate = (orders: Order[]) => {
    const grouped: { [key: string]: Order[] } = {};
    orders.forEach((order) => {
        const date = new Date(order.createdAt).toLocaleDateString("en-US");
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(order);
    });
    return grouped;
};

export const useAdminOrders = (filters?: OrderFilterParams) => {
    const { token } = useAuth();
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<OrdersResponse['pagination'] | null>(null);
    const [filterMetadata, setFilterMetadata] = useState<OrdersResponse['filters'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetchAllOrders(token, filters);
                
                setOrders(response.data || []);
                setPagination(response.pagination);
                setFilterMetadata(response.filters || null);
                
            } catch (error) {
                setError(getApiErrorMessage(error));
                setOrders([]);
                setPagination(null);
                setFilterMetadata(null);
            } finally {
                setLoading(false);
            }
        };
        
        loadOrders();
    }, [token, filters]); // Re-fetch when filters change

    const groupedOrders = useMemo(() => groupOrdersByDate(orders), [orders]);

    const handlePageChange = () => {
        // This will be handled by the parent component now
        // since pagination is part of filters
    };

    // Sipariş iptal etme fonksiyonu
    const cancelOrder = async (orderId: string, notes: string): Promise<{ success: boolean; message: string }> => {
        if (!token) {
            throw new Error('Authentication token is required');
        }
        
        try {
            const response = await cancelOrderByAdmin(orderId, notes, token);
            
            // Başarılı ise local state'i güncelle
            if (response.success && response.order) {
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId ? response.order! : order
                    )
                );
            }
            
            return { success: response.success, message: response.message };
        } catch (error) {
            const errorMessage = getApiErrorMessage(error);
            return { success: false, message: errorMessage };
        }
    };

    // Siparişin iptal edilebilir olup olmadığını kontrol eden yardımcı fonksiyon
    const canCancelOrder = (order: Order): boolean => {
        return order.deliveryStatus === 'PENDING' || order.deliveryStatus === 'READY_FOR_DELIVERY';
    };

    return {
        orders,
        loading,
        error,
        groupedOrders,
        pagination,
        filterMetadata,
        handlePageChange, // Keep for backward compatibility
        cancelOrder,
        canCancelOrder,
    };
};
