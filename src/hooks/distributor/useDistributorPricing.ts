"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    fetchDistributorPriceLists,
    createDistributorPriceList,
    fetchDistributorPriceListDetail,
    updateDistributorPriceListItems,
    deleteDistributorPriceList,
    setDistributorPriceListDefault,
    fetchDistributorAdminPriceList,
} from "@/services/distributorService";
import type { PriceListSummary, PriceListDetail } from "@/types/data";
import { extractErrorMessage } from "@/utils/error";

export const useDistributorPricing = () => {
    const { token } = useAuth();
    const [lists, setLists] = useState<PriceListSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [creating, setCreating] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const refetch = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const data = await fetchDistributorPriceLists(token);
            setLists(data);
        } catch (err) {
            setError(extractErrorMessage(err, "Price lists could not be loaded"));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleCreate = async (name: string, type?: string, isDefault?: boolean) => {
        if (!token) return;
        setCreating(true);
        try {
            await createDistributorPriceList({ name, type, isDefault }, token);
            setSuccess("Price list created successfully");
            await refetch();
        } catch (err) {
            setError(extractErrorMessage(err, "Price list could not be created"));
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!token) return;
        setDeleting(true);
        try {
            const result = await deleteDistributorPriceList(id, token);
            
            // Backend'den gelen detaylı response'u kullan
            if (result?.data?.reassignedUsersCount && result.data.reassignedUsersCount > 0) {
                // Kullanıcı yeniden ataması varsa detaylı mesaj göster
                const userCount = result.data.reassignedUsersCount;
                const message = `Price list deleted successfully. ${userCount} client(s) have been automatically reassigned to the default price list.`;
                setError(""); // Error'u temizle
                setSuccess(message);
            } else {
                setSuccess("Price list deleted successfully.");
            }
            
            await refetch();
        } catch (err) {
            setError(extractErrorMessage(err, "Price list could not be deleted"));
        } finally {
            setDeleting(false);
        }
    };

    const clearSuccess = () => {
        setSuccess("");
    };

    const defaultList = useMemo(() => lists.find(l => l.isDefault) || null, [lists]);

    return { 
        lists, 
        defaultList, 
        loading, 
        error, 
        success, 
        creating, 
        deleting, 
        refetch, 
        onCreate: handleCreate, 
        onDelete: handleDelete, 
        clearSuccess 
    };
};

export const useDistributorPriceListDetail = (id: string) => {
    const { token } = useAuth();
    const [detail, setDetail] = useState<PriceListDetail | null>(null);
    const [adminPriceList, setAdminPriceList] = useState<PriceListDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);

    const refetch = useCallback(async () => {
        if (!token || !id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const data = await fetchDistributorPriceListDetail(id, token);
            setDetail(data);
            
            // Admin'in bu distributor için belirlediği fiyat listesini çek
            try {
                const adminData = await fetchDistributorAdminPriceList(token);
                setAdminPriceList(adminData || null);
            } catch (adminErr) {
                // Admin fiyat listesi çekilemezse sessizce devam et
                console.warn("Could not fetch admin price list:", adminErr);
                setAdminPriceList(null);
            }
        } catch (err) {
            setError(extractErrorMessage(err, "Price list could not be loaded"));
        } finally {
            setLoading(false);
        }
    }, [token, id]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleSave = async (items: Array<{ optionItemId: string; price?: number; multiplier?: number }>) => {
        if (!token || !id) return;
        setSaving(true);
        try {
            const updated = await updateDistributorPriceListItems(id, items, token);
            setDetail(updated);
        } catch (err) {
            setError(extractErrorMessage(err, "Prices could not be saved"));
        } finally {
            setSaving(false);
        }
    };

    const handleSetDefault = async () => {
        if (!token || !id) return;
        setSaving(true);
        try {
            const updated = await setDistributorPriceListDefault(id, token);
            setDetail(updated);
        } catch (err) {
            setError(extractErrorMessage(err, "Default flag could not be updated"));
        } finally {
            setSaving(false);
        }
    };

    // Admin fiyatlarını optionItemId ile eşleştir
    const adminPricesMap = useMemo(() => {
        if (!adminPriceList?.prices) {
            return {};
        }
        
        const map: Record<string, { price?: number | null; multiplier?: number | null }> = {};
        adminPriceList.prices.forEach((item) => {
            map[item.optionItemId] = {
                price: item.price,
                multiplier: item.multiplier,
            };
        });
        return map;
    }, [adminPriceList]);

    return { 
        detail, 
        adminPriceList,
        adminPricesMap,
        loading, 
        error, 
        saving, 
        refetch, 
        onSave: handleSave, 
        onSetDefault: handleSetDefault 
    };
};
