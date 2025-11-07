import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    fetchDistributorClients,
    updateClientPriceList,
    fetchDistributorPriceLists,
} from "@/services/distributorService";
import { User, PriceListSummary, PaginationInfo } from "@/types/data";
import { getApiErrorMessage } from "@/utils/errorHandler";

/**
 * Hook for distributor client management
 * Allows distributors to view clients and assign price lists
 */
export const useDistributorClients = () => {
    const { token } = useAuth();
    const [clients, setClients] = useState<User[]>([]);
    const [priceLists, setPriceLists] = useState<PriceListSummary[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [updating, setUpdating] = useState<string | null>(null);

    // Fetch clients
    const fetchClients = useCallback(
        async (page = 1, limit = 10) => {
            if (!token) return;
            setLoading(true);
            setError("");
            try {
                const response = await fetchDistributorClients(token, page, limit);
                setClients(response.data);
                setPagination(response.pagination);
            } catch (err) {
                setError(getApiErrorMessage(err));
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    // Fetch price lists
    const fetchPrices = useCallback(async () => {
        if (!token) return;
        try {
            const lists = await fetchDistributorPriceLists(token);
            setPriceLists(lists);
        } catch (err) {
            // Silent fail for price lists
            console.error("Failed to load price lists:", err);
        }
    }, [token]);

    // Initial fetch
    useEffect(() => {
        fetchClients(1, 10);
        fetchPrices();
    }, [fetchClients, fetchPrices]);

    // Update client's price list
    const handleUpdatePriceList = async (
        clientId: string,
        priceListId: string | null
    ) => {
        if (!token) return;
        setUpdating(clientId);
        setError("");
        setSuccess("");
        try {
            await updateClientPriceList(clientId, priceListId, token);
            
            // Update local state
            setClients(prev =>
                prev.map(client =>
                    client.id === clientId
                        ? { ...client, priceListId }
                        : client
                )
            );
            
            const priceListName =
                priceLists.find((pl) => pl.id === priceListId)?.name ||
                "Default";
            setSuccess(
                `Price list updated to "${priceListName}" successfully`
            );
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setUpdating(null);
        }
    };

    // Clear success message
    const clearSuccess = () => setSuccess("");

    // Clear error message
    const clearError = () => setError("");

    // Change page
    const handlePageChange = (page: number) => {
        fetchClients(page, pagination.pageSize);
    };

    return {
        clients,
        priceLists,
        pagination,
        loading,
        error,
        success,
        updating,
        onUpdatePriceList: handleUpdatePriceList,
        onPageChange: handlePageChange,
        refetch: () => fetchClients(pagination.currentPage, pagination.pageSize),
        clearSuccess,
        clearError,
    };
};

