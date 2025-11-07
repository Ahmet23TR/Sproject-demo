import { useState, useEffect, useCallback } from "react";
import {
    Product,
    fetchAdminProductDetail,
    createOptionGroup,
    createOptionItem,
    deleteOptionGroup,
    deleteOptionItem,
} from "../../services/productService";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errorHandler";

export const useProductOptions = (product: Product | null) => {
    const { token } = useAuth();
    const [detailedProduct, setDetailedProduct] = useState<Product | null>(
        product
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const refetch = useCallback(async () => {
        if (!product || !token) return;
        setLoading(true);
        try {
            const data = await fetchAdminProductDetail(product.id, token);
            setDetailedProduct(data);
        } catch (error) {
            setError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [product, token]);

    useEffect(() => {
        if (product) {
            refetch();
        }
    }, [product, refetch]);

    const addGroup = async (groupName: string) => {
        if (!product || !token) return;
        await createOptionGroup(product.id, { name: groupName }, token);
        refetch();
    };

    const deleteGroup = async (groupId: string) => {
        if (!token) return;
        await deleteOptionGroup(groupId, token);
        refetch();
    };

    const addItem = async (
        groupId: string,
        itemName: string,
        price: number = 0,
        multiplier?: number
    ) => {
        if (!token) return;
        const payload: { name: string; price: number; multiplier?: number } = {
            name: itemName,
            price,
        };
        if (multiplier !== undefined && multiplier !== null) {
            payload.multiplier = multiplier;
        }
        await createOptionItem(groupId, payload, token);
        refetch();
    };

    const deleteItem = async (itemId: string) => {
        if (!token) return;
        await deleteOptionItem(itemId, token);
        refetch();
    };

    return {
        detailedProduct,
        loading,
        error,
        addGroup,
        deleteGroup,
        addItem,
        deleteItem,
    };
};
