"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/hooks/useNotifications";
import { fetchMyOrders } from "@/services/orderService";
import { getFavorites, type FavoriteProduct } from "@/services/favoriteService";
import type { Order } from "@/types/data";
import { getApiErrorMessage } from "@/utils/errorHandler";
import { useReorder } from "@/hooks/order/useReorder";
import type { Product } from "@/services/catalogService";

interface ClientDashboardState {
    loading: boolean;
    error: string | null;
    recentOrders: Order[];
    favorites: FavoriteProduct[];
}

const createDefaultState = (): ClientDashboardState => ({
    loading: true,
    error: null,
    recentOrders: [],
    favorites: [],
});

const selectDefaultOptionIds = (
    product: Product | null | undefined
): string[] => {
    if (!product?.optionGroups?.length) {
        return [];
    }

    const selections: string[] = [];

    product.optionGroups.forEach((group) => {
        if (!group.isRequired || group.items.length === 0) {
            return;
        }

        // Prefer zero-cost items as defaults, otherwise fall back to the first item
        const zeroCostItems = group.items.filter((item) => {
            if (typeof item.priceAdjustment === "number") {
                return item.priceAdjustment === 0;
            }
            if (typeof item.price === "number") {
                return item.price === 0;
            }
            return false;
        });

        if (group.allowMultiple) {
            const choice = zeroCostItems[0] ?? group.items[0];
            if (choice) {
                selections.push(choice.id);
            }
            return;
        }

        const defaultItem = zeroCostItems[0] ?? group.items[0];
        if (defaultItem) {
            selections.push(defaultItem.id);
        }
    });

    return selections;
};

export const useClientDashboard = () => {
    const router = useRouter();
    const { user, token } = useAuth();
    const { addToCart } = useCart();
    const { showError, showSuccess } = useNotifications();
    const { reorder } = useReorder();

    const [state, setState] =
        useState<ClientDashboardState>(createDefaultState);
    const [addingProductId, setAddingProductId] = useState<string | null>(null);

    // Track whether latest addToCart call succeeded via callback
    const addSuccessRef = useRef(false);

    const fetchDashboardData = useCallback(async () => {
        if (!token) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: "Authentication required",
            }));
            return;
        }

        setState(createDefaultState());
        try {
            const [ordersResponse, favoritesResponse] = await Promise.all([
                fetchMyOrders(token, 1, 5),
                getFavorites(),
            ]);

            const sortedOrders = [...(ordersResponse.data || [])].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );

            setState({
                loading: false,
                error: null,
                recentOrders: sortedOrders,
                favorites: favoritesResponse.slice(0, 5),
            });
        } catch (error) {
            setState({
                loading: false,
                error: getApiErrorMessage(error),
                recentOrders: [],
                favorites: [],
            });
        }
    }, [token]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const lastOrder = useMemo(() => {
        return state.recentOrders[0] ?? null;
    }, [state.recentOrders]);

    const displayName = useMemo(() => {
        if (!user) return "there";
        const parts = [user.name, user.surname].filter(Boolean);
        if (parts.length === 0) {
            return user.companyName?.trim() || "there";
        }
        return parts.join(" ");
    }, [user]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    const greetingSubtitle = useMemo(() => {
        if (!user?.companyName) {
            return;
        }
        return `${user.companyName}`;
    }, [user?.companyName]);

    const handleCreateOrder = useCallback(() => {
        router.push("/client/new-order");
    }, [router]);

    const handleViewHistory = useCallback(() => {
        router.push("/client/order-history");
    }, [router]);

    const handleRepeatLastOrder = useCallback(async () => {
        if (!lastOrder) return;
        await reorder(lastOrder);
    }, [lastOrder, reorder]);

    const handleQuickAddFavorite = useCallback(
        async (favorite: FavoriteProduct) => {
            const product = favorite.product;
            if (!product) {
                showError(
                    "We couldn't load this product. Please try again later."
                );
                return;
            }

            const optionSelections = selectDefaultOptionIds(product);
            setAddingProductId(product.id);
            addSuccessRef.current = false;

            try {
                await addToCart(
                    {
                        productId: product.id,
                        quantity: 1,
                        selectedOptionItemIds: optionSelections,
                    },
                    () => {
                        addSuccessRef.current = true;
                        showSuccess(`${product.name} added to your cart.`);
                    }
                );

                if (!addSuccessRef.current) {
                    showError(
                        "We couldn't add this product automatically. Configure it from the catalog."
                    );
                }
            } catch (error) {
                showError(getApiErrorMessage(error));
            } finally {
                setAddingProductId(null);
            }
        },
        [addToCart, showError, showSuccess]
    );

    const derivedState = useMemo(
        () => ({
            ...state,
            lastOrder,
            greeting,
            greetingSubtitle,
            displayName,
            addingProductId,
        }),
        [
            state,
            lastOrder,
            greeting,
            greetingSubtitle,
            displayName,
            addingProductId,
        ]
    );

    return {
        ...derivedState,
        handleCreateOrder,
        handleViewHistory,
        handleQuickAddFavorite,
        handleRepeatLastOrder,
        refetch: fetchDashboardData,
    };
};

export type UseClientDashboardReturn = ReturnType<typeof useClientDashboard>;
