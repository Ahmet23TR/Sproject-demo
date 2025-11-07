// src/hooks/admin/useAdminOrdersSummary.ts
"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errorHandler";
import { fetchAllOrders, OrderFilterParams } from "../../services/orderService";
import { Order } from "../../types/data";

export type SummaryDateFilter = 
    | "ALL_TIME"
    | "TODAY" 
    | "THIS_WEEK" 
    | "LAST_WEEK"
    | "THIS_MONTH" 
    | "LAST_MONTH"
    | "THIS_YEAR" 
    | "LAST_YEAR";

export const useAdminOrdersSummary = (dateFilter: SummaryDateFilter = "ALL_TIME") => {
    const { token } = useAuth();
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Build filters for summary data
    const summaryFilters = useMemo((): OrderFilterParams => {
        const filters: OrderFilterParams = {
            // Get all data for summary calculations (no pagination)
            limit: 1000, // Large limit to get all orders for summary
            page: 1,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        };

        // Apply date filter for summary
        if (dateFilter !== "ALL_TIME") {
            filters.dateFilter = dateFilter as OrderFilterParams["dateFilter"];
        }

        return filters;
    }, [dateFilter]);

    useEffect(() => {
        const loadSummaryData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetchAllOrders(token, summaryFilters);
                setOrders(response.data || []);
                
            } catch (error) {
                setError(getApiErrorMessage(error));
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadSummaryData();
    }, [token, summaryFilters]);

    return {
        orders,
        loading,
        error,
    };
};
