"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    updateOrderItemStatus,
    fetchChefProductionListByDate,
    fetchChefOrdersByDate,
    fetchChefProductionListByGroup,
    ProductionItem,
    produceOrderItem,
} from "../../services/chefService";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errorHandler";
import { Order, PaginationInfo, ProductGroup } from "../../types/data";

// Gruplandırılmış üretim listesi için tip tanımı
export interface GroupedProductionList {
    [productName: string]: {
        variants: {
            [variantName: string]: {
                total: number;
                unit: "PIECE" | "KG" | "TRAY";
                productGroup: ProductGroup;
            };
        };
    };
}

export const useChefDashboard = () => {
    const { token, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();
    const searchParams = sp ?? new URLSearchParams();

    // Check if user has CHEF role, if not, don't make API calls
    const hasChefRole = user?.role === "CHEF";

    // URL'den sayfa numarasını ve tarihi al
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const selectedDate =
        searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const [rawProductionList, setRawProductionList] = useState<
        ProductionItem[]
    >([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Şefin ürün grubu (backend'den gelecek)
    const [chefProductGroup, setChefProductGroup] = useState<ProductGroup | null>(null);
    

    // Backend'den chef productGroup bilgisini çek
    const fetchChefProductGroup = useCallback(async () => {
        if (!hasChefRole || !token || !user?.id) return;
        
        try {
            const response = await fetch(`/api/admin/chefs/${user.id}/product-group`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.chef?.productGroup) {
                    setChefProductGroup(data.chef.productGroup);
                }
            }
        } catch (error) {
            console.error("Error fetching chef productGroup:", error);
        }
    }, [hasChefRole, token, user?.id]);

    const refetchData = useCallback(
        async (page: number = currentPage, options?: { silent?: boolean }) => {
            // Don't make API calls if user doesn't have CHEF role
            if (!hasChefRole || !token || !selectedDate) return;
            
            const silent = options?.silent === true;
            if (silent) setIsRefreshing(true);
            else setLoading(true);
            try {
                // Şefin ürün grubuna göre production list çek
                let prodData;
                try {
                    prodData = await fetchChefProductionListByGroup(token, selectedDate);
                } catch (groupError) {
                    console.warn("Group endpoint failed, falling back to date endpoint:", groupError);
                    // Fallback to date endpoint if group endpoint fails
                    prodData = await fetchChefProductionListByDate(token, selectedDate);
                }
                
                const ordersResponse = await fetchChefOrdersByDate(token, selectedDate, page, 20);
                const ordersData = ordersResponse.data;
                
                // Backend now guarantees production list contains only PENDING items with correct totals
                const filteredProdData = (prodData || []).filter((x) => x.total > 0);
                
                setRawProductionList(filteredProdData);
                setOrders(ordersData);
                setPagination(ordersResponse.pagination);
            } catch (error) {
                setError(getApiErrorMessage(error));
            } finally {
                if (silent) setIsRefreshing(false);
                else setLoading(false);
            }
        },
        [hasChefRole, token, selectedDate, currentPage]
    );

    // Şefin ürün grubunu user context'inden al
    useEffect(() => {
        if (hasChefRole && user?.productGroup) {
            setChefProductGroup(user.productGroup);
        } else if (hasChefRole && user?.id && !user?.productGroup) {
            // Eğer user'da productGroup yoksa, backend'den chef bilgisini çek
            fetchChefProductGroup();
        }
    }, [hasChefRole, user?.productGroup, user?.id, fetchChefProductGroup]);

    // Chef product group değiştiğinde veriyi yeniden çek
    useEffect(() => {
        if (hasChefRole && chefProductGroup && token && selectedDate) {
            refetchData(currentPage);
        }
    }, [chefProductGroup, hasChefRole, token, selectedDate, currentPage, refetchData]);

    useEffect(() => {
        // Only fetch data if user has CHEF role
        if (hasChefRole) {
            refetchData(currentPage);
        } else {
            setLoading(false);
        }
    }, [refetchData, currentPage, hasChefRole]);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        // URL'i güncelle
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", value.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDateChange = (date: string) => {
        // URL'i güncelle ve sayfayı 1'e sıfırla
        const params = new URLSearchParams(searchParams.toString());
        params.set("date", date);
        params.set("page", "1"); // Tarih değiştiğinde sayfa 1'e dön
        router.push(`${pathname}?${params.toString()}`);
    };

    // Backend'den zaten filtrelenmiş veri geldiği için ek filtreleme gerekmiyor
    const filteredProductionList = useMemo(() => {
        return rawProductionList;
    }, [rawProductionList]);

    // Backend'den gelen production list zaten şefin ürün grubuna göre filtrelenmiş
    // Bu yüzden siparişleri de aynı şekilde filtrelememiz gerekiyor
    const filteredOrders = useMemo(() => {
        // Eğer şefin ürün grubu varsa, sadece o gruba ait ürünleri içeren siparişleri göster
        if (chefProductGroup) {
            return orders.filter((order) =>
                order.items.some((item) => 
                    item.product && 
                    item.product.productGroup === chefProductGroup
                )
            );
        }
        
        // Ürün grubu yoksa tüm siparişleri göster
        return orders;
    }, [orders, chefProductGroup]);

    // Sıralı üretim listesi (stabil görüntü için alfabetik sıralama)
    const sortedProductionList = useMemo(() => {
        const arr = [...filteredProductionList];
        arr.sort((a, b) => {
            const byProduct = a.productName.localeCompare(b.productName);
            if (byProduct !== 0) return byProduct;
            return a.variantName.localeCompare(b.variantName);
        });
        return arr;
    }, [filteredProductionList]);

    // API'den gelen listeyi gruplama
    const groupedProductionList = useMemo((): GroupedProductionList => {
        const groups: GroupedProductionList = {};

        sortedProductionList.forEach((item) => {
            if (!groups[item.productName]) {
                groups[item.productName] = { variants: {} };
            }

            groups[item.productName].variants[item.variantName] = {
                total: item.total,
                unit: item.unit,
                productGroup: item.productGroup,
            };
        });

        return groups;
    }, [sortedProductionList]);

    const handleStatusUpdate = async (
        itemId: string,
        status: "COMPLETED" | "CANCELLED",
        notes: string | null = null
    ) => {
        if (!hasChefRole || !token) return;
        try {
            const updatedItem = await updateOrderItemStatus(
                itemId,
                { status, notes },
                token
            );
            setOrders((prev) =>
                prev.map((order) => ({
                    ...order,
                    items: order.items.map((it) =>
                        it.id === itemId
                            ? {
                                  ...it,
                                  productionStatus:
                                      updatedItem?.productionStatus || status,
                                  productionNotes:
                                      updatedItem?.productionNotes || notes,
                                  producedQuantity:
                                      updatedItem?.producedQuantity ??
                                      it.producedQuantity,
                                  processedByUser:
                                      updatedItem?.processedByUser || null,
                                  processedAt:
                                      updatedItem?.processedAt ||
                                      new Date().toISOString(),
                              }
                            : it
                    ),
                }))
            );
            await refetchData(currentPage, { silent: true });
        } catch (error) {
            setError(getApiErrorMessage(error));
        }
    };

    const handlePartialProduce = async (
        itemId: string,
        amount: number,
        notes: string
    ) => {
        if (!hasChefRole || !token) return;
        // Snapshot current item to map summary keys
        const allItems = orders.flatMap((o) => o.items);
        const currentItem = allItems.find((it) => it.id === itemId) || null;
        const productName = currentItem?.product?.name ?? null;
        const rawVariantName = (currentItem?.selectedOptions || [])
            .map((o) => o.optionItem.name)
            .join(", ");
        const normalizeVariant = (v: string) =>
            v
                .split(",")
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean)
                .sort()
                .join(",");
        const normalizedItemVariant = normalizeVariant(rawVariantName);
        const itemUnit = (currentItem?.product?.unit || "").toUpperCase();
        // If this is the first time producing this item (PENDING -> PARTIAL),
        // we should deduct the full order item quantity from the production summary
        // (same logic as CANCELLED). Subsequent partials should not deduct again.
        const isFirstPartial = currentItem?.productionStatus === "PENDING";
        const fullItemQuantityToDeduct = isFirstPartial
            ? currentItem?.quantity ?? 0
            : 0;
        try {
            const updatedItem = await produceOrderItem(
                itemId,
                { amount, notes },
                token
            );
            // optimistic/local update for orders
            setOrders((prev) =>
                prev.map((order) => ({
                    ...order,
                    items: order.items.map((it) =>
                        it.id === itemId
                            ? {
                                  ...it,
                                  productionStatus:
                                      updatedItem?.productionStatus ||
                                      "PARTIALLY_COMPLETED",
                                  producedQuantity:
                                      updatedItem?.producedQuantity ??
                                      (it.producedQuantity || 0) + amount,
                                  productionNotes:
                                      updatedItem?.productionNotes ?? notes,
                                  processedByUser:
                                      updatedItem?.processedByUser ||
                                      it.processedByUser ||
                                      null,
                                  processedAt:
                                      updatedItem?.processedAt ||
                                      new Date().toISOString(),
                              }
                            : it
                    ),
                }))
            );
            // optimistic/local update for production summary (remaining total)
            // Deduct full order item quantity on first partial produce; otherwise do nothing here
            if (productName && fullItemQuantityToDeduct > 0) {
                setRawProductionList((prev) => {
                    // Try exact product+variant match first
                    let idx = prev.findIndex((p) => {
                        const normalizedPVariant = normalizeVariant(
                            p.variantName || ""
                        );
                        return (
                            p.productName === productName &&
                            normalizedPVariant === normalizedItemVariant
                        );
                    });
                    // Fallback: if not found and unit is known (e.g., TRAY),
                    // and only one summary row exists for this product (or for this unit), use it.
                    if (idx < 0) {
                        const sameProduct = prev
                            .map((p, i) => ({ p, i }))
                            .filter(({ p }) => p.productName === productName);
                        if (sameProduct.length === 1) {
                            idx = sameProduct[0].i;
                        } else if (itemUnit) {
                            const narrowed = sameProduct.filter(
                                ({ p }) =>
                                    (p.unit || "").toUpperCase() === itemUnit
                            );
                            if (narrowed.length === 1) {
                                idx = narrowed[0].i;
                            }
                        }
                    }
                    if (idx >= 0) {
                        const copy = [...prev];
                        copy[idx] = {
                            ...copy[idx],
                            total: Math.max(
                                0,
                                (copy[idx].total || 0) -
                                    fullItemQuantityToDeduct
                            ),
                        };
                        return copy;
                    }
                    return prev;
                });
            }
            await refetchData(currentPage, { silent: true });
            return { ok: true } as const;
        } catch (e: unknown) {
            return { ok: false, error: e } as const;
        }
    };

    const getRemainingForItem = useCallback((item: Order["items"][0]) => {
        const produced = item.producedQuantity ?? 0;
        return Math.max(0, item.quantity - produced);
    }, []);

    return {
        groupedProductionList,
        orders: filteredOrders,
        loading,
        isRefreshing,
        error,
        selectedDate,
        setSelectedDate: handleDateChange,
        handleStatusUpdate,
        handlePartialProduce,
        getRemainingForItem,
        chefProductGroup,
        refetchData,
        pagination,
        handlePageChange,
    };
};
