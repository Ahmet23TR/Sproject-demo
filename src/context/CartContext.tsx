"use client";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
    getCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    mergeCart,
} from "../services/cartService";
import { fetchProductsByIds, fetchClientProductsByIds } from "../services/catalogService";
import { calculateProductPrice } from "../utils/price";

export interface CartItem {
    id?: string;
    productId: string;
    quantity: number;
    selectedOptionItemIds: string[];
    unitPrice?: number; // Legacy unit price
    totalPrice?: number; // Legacy total price
    // Dual pricing snapshots
    retailUnitPrice?: number;
    retailTotalPrice?: number;
    wholesaleUnitPrice?: number;
    wholesaleTotalPrice?: number;
    multiplier?: number; // Backend'den gelen çarpan değeri (debug için)
    calculatedPrice?: number; // Geriye uyumluluk için (deprecated)
    product?: {
        id: string;
        name: string;
        description?: string | null;
        imageUrl?: string | null;
        isActive?: boolean;
        unit?: "PIECE" | "KG" | "TRAY";
        productGroup?: "SWEETS" | "BAKERY";
        optionGroups?: Array<{
            id: string;
            name: string;
            isRequired: boolean;
            allowMultiple: boolean;
            items: Array<{
                id: string;
                name: string;
                price: string | number;
                multiplier: string | number;
            }>;
        }>;
    }; // Backend'den gelen product bilgisi
}

type CartItemWithSnapshots = CartItem & {
    product?: CartItem["product"];
    retailUnitPrice?: number;
    retailTotalPrice?: number;
    wholesaleUnitPrice?: number;
    wholesaleTotalPrice?: number;
    multiplier?: number;
};

type ProductOptionGroupList = CartItem["product"] extends { optionGroups?: infer G }
    ? G
    : never;

export interface CartItemPayload {
    productId: string;
    quantity: number;
    selectedOptionItemIds: string[];
}

type OrderItemSelectedOption = {
    optionItem: {
        id: string;
    };
};

interface RepeatableOrderItem {
    productId: string;
    quantity: number;
    selectedOptions?: OrderItemSelectedOption[];
}

interface RepeatableOrderItemSource
    extends Omit<RepeatableOrderItem, "productId"> {
    productId?: string | null;
    product?: {
        id?: string | null;
    } | null;
}

interface CartContextType {
    cart: CartItem[];
    loading: boolean;
    error: string | null;
    addToCart: (
        item: CartItemPayload,
        onSuccess?: (addedItem: CartItemPayload) => void
    ) => Promise<void>;
    removeFromCart: (
        productId: string,
        selectedOptionItemIds: string[]
    ) => Promise<void>;
    updateQuantity: (
        productId: string,
        selectedOptionItemIds: string[],
        quantity: number
    ) => Promise<void>;
    clearCart: () => Promise<void>;
    refetchCart: () => Promise<void>;
    loadCartFromOrder: (order: unknown) => Promise<{
        activeItems: RepeatableOrderItem[];
        inactiveItems: Array<{
            id: string;
            name: string;
            quantity: number;
            unit: string;
        }>;
    } | void>;
    loadActiveItemsToCart: (activeItems: RepeatableOrderItem[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const isDemoMode =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA !== undefined
        ? process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false"
        : true;

const resolveOrderItemProductId = (
    item: RepeatableOrderItemSource
): string | null => {
    if (item.productId && typeof item.productId === "string") {
        const trimmed = item.productId.trim();
        if (trimmed) {
            return trimmed;
        }
    }
    const nestedId =
        item.product && typeof item.product === "object"
            ? item.product.id
            : null;
    return typeof nestedId === "string" && nestedId.trim()
        ? nestedId.trim()
        : null;
};

const normalizeOrderItemsForCart = (
    items: RepeatableOrderItemSource[]
): RepeatableOrderItem[] => {
    return items.reduce<RepeatableOrderItem[]>((acc, item) => {
        const productId = resolveOrderItemProductId(item);
        if (!productId) {
            console.warn(
                "[Cart] Skipping order item without product ID",
                item
            );
            return acc;
        }

        acc.push({
            productId,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions ?? [],
        });
        return acc;
    }, []);
};

function findCartItemId(
    cart: CartItem[],
    productId: string,
    selectedOptionItemIds: string[]
) {
    return cart.find(
        (i) =>
            i.productId === productId &&
            JSON.stringify(i.selectedOptionItemIds) ===
            JSON.stringify(selectedOptionItemIds)
    )?.id;
}

// Sepet sıralamasını korumak için yardımcı fonksiyon
function preserveCartOrder(
    currentCart: CartItem[],
    newCartData: unknown
): CartItem[] {
    let newCart: CartItem[] = [];
    if (Array.isArray(newCartData)) {
        newCart = newCartData;
    } else if (
        typeof newCartData === "object" &&
        newCartData !== null &&
        "items" in newCartData &&
        Array.isArray((newCartData as { items: unknown }).items)
    ) {
        newCart = (newCartData as { items: CartItem[] }).items;
    }

    // Mevcut sepet sırasını korumak için sıralama yap
    if (newCart.length > 0 && currentCart.length > 0) {
        // Mevcut sepet öğelerinin sırasını koru
        const currentOrder = new Map();
        currentCart.forEach((item, index) => {
            const key = `${item.productId}-${item.selectedOptionItemIds
                .sort()
                .join("-")}`;
            currentOrder.set(key, index);
        });

        // Yeni sepet öğelerini mevcut sıraya göre sırala
        newCart.sort((a, b) => {
            const keyA = `${a.productId}-${a.selectedOptionItemIds
                .sort()
                .join("-")}`;
            const keyB = `${b.productId}-${b.selectedOptionItemIds
                .sort()
                .join("-")}`;
            const orderA = currentOrder.get(keyA) ?? Number.MAX_SAFE_INTEGER;
            const orderB = currentOrder.get(keyB) ?? Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
        });
    }

    return newCart;
}

function extractCartItemsPayload(data: unknown): unknown[] {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === "object" && "items" in data) {
        const items = (data as { items?: unknown }).items;
        return Array.isArray(items) ? items : [];
    }
    return [];
}

function normalizeCartItem(item: unknown): CartItemWithSnapshots {
    const base = (item ?? {}) as CartItemWithSnapshots;
    const baseProduct = base.product;
    let normalizedProduct: CartItemWithSnapshots["product"];

    if (baseProduct && typeof baseProduct === "object") {
        const productDetails = baseProduct as NonNullable<CartItemWithSnapshots["product"]>;
        const rawOptionGroups =
            "optionGroups" in productDetails ? (productDetails as { optionGroups?: unknown }).optionGroups : undefined;
        const optionGroups = Array.isArray(rawOptionGroups)
            ? (rawOptionGroups as ProductOptionGroupList)
            : undefined;

        normalizedProduct = {
            ...productDetails,
            optionGroups,
        };
    } else {
        normalizedProduct = undefined;
    }

    return {
        ...base,
        product: normalizedProduct,
    };
}

function normalizeCartItems(data: unknown): CartItemWithSnapshots[] {
    return extractCartItemsPayload(data).map(normalizeCartItem);
}

// Cart item için multiplier ve fiyat hesaplama yardımcı fonksiyonu
async function calculateCartItemDetails(item: CartItemPayload, token?: string): Promise<Partial<CartItem>> {
    try {
        const products = token
            ? await fetchClientProductsByIds([item.productId], token)
            : await fetchProductsByIds([item.productId]);

        const product = products.find(p => p.id === item.productId);

        if (!product) {
            return {};
        }

        // Seçilen opsiyonları group name'e göre organize et
        const groupNameSelected: { [groupName: string]: string | string[] } = {};
        let multiplier = 1;

        if (item.selectedOptionItemIds.length > 0) {
            product.optionGroups?.forEach((group) => {
                const selectedItems = group.items.filter(groupItem =>
                    item.selectedOptionItemIds.includes(groupItem.id)
                );

                if (selectedItems.length > 0) {
                    const selectedNames = selectedItems.map(groupItem => groupItem.name);
                    groupNameSelected[group.name] = group.allowMultiple ? selectedNames : selectedNames[0];

                    // Multiplier hesaplama - backend'den gelen multiplier değerini kullan
                    selectedItems.forEach(selectedItem => {
                        if (selectedItem.multiplier !== undefined) {
                            // Backend'den gelen multiplier string olabilir, number'a çevir
                            const itemMultiplier = typeof selectedItem.multiplier === 'string'
                                ? parseFloat(selectedItem.multiplier)
                                : selectedItem.multiplier;

                            if (itemMultiplier > multiplier) {
                                multiplier = itemMultiplier;
                            }
                        }
                    });
                }
            });
        }

        const unitPrice = calculateProductPrice(product, groupNameSelected);
        const totalPrice = unitPrice * item.quantity;

        const normalizedProduct: CartItem["product"] = {
            id: product.id,
            name: product.name,
            description: product.description,
            imageUrl: product.imageUrl,
            isActive: product.isActive,
            unit: product.unit,
            productGroup: product.productGroup,
            optionGroups: product.optionGroups?.map((group) => ({
                id: group.id,
                name: group.name,
                isRequired: group.isRequired,
                allowMultiple: !!group.allowMultiple,
                items: group.items.map((groupItem) => ({
                    id: groupItem.id,
                    name: groupItem.name,
                    price:
                        typeof groupItem.priceAdjustment === "number"
                            ? groupItem.priceAdjustment
                            : groupItem.price ?? 0,
                    multiplier:
                        groupItem.multiplier ?? groupItem.priceAdjustment ?? 1,
                })),
            })),
        };

        return {
            unitPrice,
            totalPrice,
            multiplier,
            product: normalizedProduct,
        };
    } catch (error) {
        console.error('Error calculating cart item details:', error);
        return {};
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mevcut cart item'ları için eksik multiplier bilgilerini hesapla
    const updateCartItemsWithMultiplier = useCallback(async (cartItems: CartItem[]) => {
        if (cartItems.length === 0) return cartItems;

        const updatedItems = await Promise.all(
            cartItems.map(async (cartItem) => {
                // Eğer multiplier zaten varsa, dokunma
                if (cartItem.multiplier !== undefined) {
                    return cartItem;
                }

                // Multiplier yoksa hesapla
                const itemDetails = await calculateCartItemDetails({
                    productId: cartItem.productId,
                    quantity: cartItem.quantity,
                    selectedOptionItemIds: cartItem.selectedOptionItemIds
                }, token || undefined);

                return {
                    ...cartItem,
                    ...itemDetails,
                    // also set retail snapshots for display consistency
                    retailUnitPrice: itemDetails.unitPrice,
                    retailTotalPrice: itemDetails.unitPrice ? itemDetails.unitPrice * cartItem.quantity : cartItem.totalPrice,
                    totalPrice: itemDetails.unitPrice ? itemDetails.unitPrice * cartItem.quantity : cartItem.totalPrice
                };
            })
        );

        return updatedItems;
    }, [token]);

    // Sepeti uygun kaynaktan yükle
    const loadCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Admin kullanıcısı için cart yükleme işlemini atla
            if (user?.role === 'ADMIN') {
                setCart([]);
                setLoading(false);
                return;
            }

            if (user && token) {
                // Backend sepet API'si henüz hazır değil, şimdilik localStorage kullan
                try {
                    const data = await getCart(token);
                    // Backend'den gelen cart item'ları - client pricing ile hesaplanmış
                    const cartItemsWithMultiplier = normalizeCartItems(data);
                    const updatedCartItems = cartItemsWithMultiplier.map((item) => {
                        // Backend artık client pricing ile hesaplanmış fiyatları döndürüyor
                        // unitPrice ve totalPrice zaten doğru değerler
                        return {
                            ...item,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                            retailUnitPrice: item.retailUnitPrice ?? item.unitPrice,
                            retailTotalPrice: item.retailTotalPrice ?? item.totalPrice,
                            wholesaleUnitPrice: item.wholesaleUnitPrice,
                            wholesaleTotalPrice: item.wholesaleTotalPrice,
                            multiplier: item.multiplier || 1
                        };
                    });

                    setCart((prevCart) => {
                        const newCart = preserveCartOrder(prevCart, updatedCartItems);
                        return newCart;
                    });
                } catch {
                    console.warn('Backend cart API not available, using localStorage fallback');
                    // localStorage'dan çek ve multiplier bilgilerini güncelle
                    const local = localStorage.getItem("cart");
                    const cartItems = normalizeCartItems(local ? JSON.parse(local) : []);
                    const updatedCartItems = await updateCartItemsWithMultiplier(cartItems);
                    setCart(updatedCartItems);
                    // Güncellenmiş bilgileri localStorage'a kaydet
                    if (updatedCartItems.length > 0) {
                        localStorage.setItem("cart", JSON.stringify(updatedCartItems));
                    }
                }
            } else {
                // localStorage'dan çek ve multiplier bilgilerini güncelle
                const local = localStorage.getItem("cart");
                const cartItems = normalizeCartItems(local ? JSON.parse(local) : []);
                const updatedCartItems = await updateCartItemsWithMultiplier(cartItems);
                setCart(updatedCartItems);
                // Güncellenmiş bilgileri localStorage'a kaydet
                if (updatedCartItems.length > 0) {
                    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
                }
            }
        } catch (err: unknown) {
            // Cart boş olduğunda hata gösterme, sadece gerçek hatalarda göster
            const errorMessage = err instanceof Error ? err.message : "Cart could not be loaded";

            // Sadece gerçek hatalarda notification göster
            if (!errorMessage.toLowerCase().includes('empty') &&
                !errorMessage.toLowerCase().includes('404') &&
                !errorMessage.toLowerCase().includes('not found')) {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [user, token, updateCartItemsWithMultiplier]);

    // user değiştiğinde sepeti yükle
    useEffect(() => {
        loadCart();
    }, [loadCart]);

    // Sepeti localStorage'a kaydet
    const saveCartToLocal = (items: CartItem[]) => {
        setCart(items);
        localStorage.setItem("cart", JSON.stringify(items));
    };



    // Sepeti refetch etme fonksiyonu (login sonrası merge için dışarıdan da çağrılabilir)
    const refetchCart = useCallback(loadCart, [loadCart]);

    // Sepete ürün ekle
    const addToCart = async (
        item: CartItemPayload,
        onSuccess?: (addedItem: CartItemPayload) => void
    ) => {
        setLoading(true);
        setError(null);
        try {
            const applyLocalAdd = async (reason: string) => {
                console.log("[Cart] Applying local cart update:", reason, item);
                const itemDetails = await calculateCartItemDetails(
                    item,
                    token || undefined
                );
                setCart((prev) => {
                    const existing = prev.find(
                        (i) =>
                            i.productId === item.productId &&
                            JSON.stringify(i.selectedOptionItemIds) ===
                                JSON.stringify(item.selectedOptionItemIds)
                    );
                    let newCart: CartItem[];
                    if (existing) {
                        const newQuantity = existing.quantity + item.quantity;
                        newCart = prev.map((i) =>
                            i.productId === item.productId &&
                            JSON.stringify(i.selectedOptionItemIds) ===
                                JSON.stringify(item.selectedOptionItemIds)
                                ? {
                                      ...i,
                                      quantity: newQuantity,
                                      ...itemDetails,
                                      retailUnitPrice: itemDetails.unitPrice,
                                      retailTotalPrice:
                                          itemDetails.unitPrice
                                              ? itemDetails.unitPrice *
                                                newQuantity
                                              : itemDetails.totalPrice,
                                      totalPrice:
                                          itemDetails.unitPrice
                                              ? itemDetails.unitPrice *
                                                newQuantity
                                              : itemDetails.totalPrice,
                                  }
                                : i
                        );
                    } else {
                        newCart = [
                            ...prev,
                            {
                                ...item,
                                ...itemDetails,
                                retailUnitPrice: itemDetails.unitPrice,
                                retailTotalPrice: itemDetails.totalPrice,
                            },
                        ];
                    }
                    saveCartToLocal(newCart);
                    return newCart;
                });
            };

            if (user && token && !isDemoMode) {
                let backendSucceeded = false;
                try {
                    console.log("[Cart] addToCart via backend", item);
                    await addCartItem(item, token);
                    await loadCart();
                    backendSucceeded = true;
                    console.log("[Cart] Backend add succeeded");
                } catch (err) {
                    console.error(
                        "[Cart] Backend add failed, falling back to local cart",
                        err
                    );
                }

                if (!backendSucceeded) {
                    await applyLocalAdd("backend-fallback");
                }
            } else {
                await applyLocalAdd(
                    user && token ? "demo-mode" : "guest-cart"
                );
                // Demo/guest modlarında ürün detayını manual olarak bağla
                if (user && token) {
                    // already handled via applyLocalAdd
                } else {
                    try {
                        const products = await fetchProductsByIds([
                            item.productId,
                        ]);
                        setCart((prev) =>
                            prev.map((cartItem) =>
                                cartItem.productId === item.productId
                                    ? {
                                          ...cartItem,
                                          product:
                                              cartItem.product ||
                                              products.find(
                                                  (p) =>
                                                      p.id === item.productId
                                              ) ||
                                              null,
                                      }
                                    : cartItem
                            )
                        );
                    } catch (err) {
                        console.error(
                            "[Cart] Unable to hydrate product details",
                            err
                        );
                    }
                }
            }

            if (onSuccess) {
                onSuccess(item);
            }
        } catch (err: unknown) {
            console.error("[Cart] addToCart error", err);
            setError(
                err instanceof Error ? err.message : "Product could not be added to cart"
            );
        } finally {
            setLoading(false);
        }
    };

    // Sepetten ürün sil
    const removeFromCart = async (
        productId: string,
        selectedOptionItemIds: string[]
    ) => {
        setLoading(true);
        setError(null);
        try {
            if (user && token) {
                // Backend'de CartItem'ın id'si ile silme
                const id = findCartItemId(
                    cart,
                    productId,
                    selectedOptionItemIds
                );
                if (id) {
                    await removeCartItem(id, token);
                    const data = await getCart(token);
                    setCart((prevCart) => {
                        const newCart = preserveCartOrder(prevCart, data);
                        return newCart;
                    });
                }
            } else {
                setCart((prev) => {
                    const newCart = prev.filter(
                        (i) =>
                            !(
                                i.productId === productId &&
                                JSON.stringify(i.selectedOptionItemIds) ===
                                JSON.stringify(selectedOptionItemIds)
                            )
                    );
                    saveCartToLocal(newCart);
                    return newCart;
                });
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Product could not be removed from cart"
            );
        } finally {
            setLoading(false);
        }
    };

    // Sepetteki ürünün miktarını güncelle
    const updateQuantity = async (
        productId: string,
        selectedOptionItemIds: string[],
        quantity: number
    ) => {
        setLoading(true);
        setError(null);
        try {
            if (user && token) {
                const id = findCartItemId(
                    cart,
                    productId,
                    selectedOptionItemIds
                );
                if (id) {
                    await updateCartItem(id, quantity, token);
                    const data = await getCart(token);
                    setCart((prevCart) => {
                        const newCart = preserveCartOrder(prevCart, data);
                        return newCart;
                    });
                }
            } else {
                setCart((prev) => {
                    const newCart = prev.map((i) =>
                        i.productId === productId &&
                            JSON.stringify(i.selectedOptionItemIds) ===
                            JSON.stringify(selectedOptionItemIds)
                            ? { ...i, quantity }
                            : i
                    );
                    saveCartToLocal(newCart);
                    return newCart;
                });
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Cart could not be updated"
            );
        } finally {
            setLoading(false);
        }
    };

    // Sepeti tamamen temizle
    const clearCart = async () => {
        setLoading(true);
        setError(null);
        try {
            if (user && token) {
                // Backend sipariş sonrası sepeti temizliyor, sadece refetch et
                await loadCart();
            } else {
                saveCartToLocal([]);
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Cart could not be cleared"
            );
        } finally {
            setLoading(false);
        }
    };

    // Deaktive ürünleri kontrol et ve ayır
    const checkInactiveProducts = async (
        orderItems: RepeatableOrderItem[]
    ) => {
        if (orderItems.length === 0) {
            return { activeItems: [], inactiveItems: [] };
        }

        try {
            // Tüm ürün ID'lerini topla
            const productIds = Array.from(
                new Set(orderItems.map((item) => item.productId))
            );

            if (productIds.length === 0) {
                return { activeItems: [], inactiveItems: [] };
            }

            // Ürün bilgilerini çek
            const products = await fetchProductsByIds(productIds);
            const productMap = new Map(
                products.map((product) => [product.id, product])
            );

            // Aktif ve deaktive ürünleri ayır
            const activeItems: RepeatableOrderItem[] = [];
            const inactiveItems: Array<{
                id: string;
                name: string;
                quantity: number;
                unit: string;
            }> = [];

            orderItems.forEach((item) => {
                const product = productMap.get(item.productId);

                if (product && product.isActive) {
                    activeItems.push(item);
                } else if (product) {
                    inactiveItems.push({
                        id: product.id,
                        name: product.name,
                        quantity: item.quantity,
                        unit: product.unit,
                    });
                } else {
                    inactiveItems.push({
                        id: item.productId,
                        name: "Unavailable item",
                        quantity: item.quantity,
                        unit: "-",
                    });
                }
            });

            return { activeItems, inactiveItems };
        } catch (error) {
            console.warn(
                "[Cart] Failed to validate inactive products, assuming active",
                error
            );
            // Hata durumunda tüm ürünleri aktif kabul et
            return { activeItems: orderItems, inactiveItems: [] };
        }
    };

    // Geçmiş siparişi sepete yükle (deaktive ürün kontrolü ile)
    const loadCartFromOrder = async (
        order: unknown
    ): Promise<
        | {
              activeItems: RepeatableOrderItem[];
              inactiveItems: Array<{
                  id: string;
                  name: string;
                  quantity: number;
                  unit: string;
              }>;
          }
        | undefined
    > => {
        if (!order || typeof order !== "object" || !("items" in order)) {
            console.warn("[Cart] loadCartFromOrder called with invalid order");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log("[Cart] loadCartFromOrder start", order);
            const orderData = order as {
                items: RepeatableOrderItemSource[];
            };

            const normalizedItems = normalizeOrderItemsForCart(orderData.items);

            // Deaktive ürünleri kontrol et
            const { activeItems, inactiveItems } =
                await checkInactiveProducts(normalizedItems);
            const hasActiveItems = activeItems.length > 0;
            if (!hasActiveItems) {
                console.warn(
                    "[Cart] No active items found while repeating order",
                    inactiveItems
                );
                return { activeItems, inactiveItems };
            }

            // Tüm ürünler aktifse, normal işleme devam et
            const cartItemsWithDetails = await Promise.all(
                activeItems.map(async (item) => {
                    // selectedOptions'dan selectedOptionItemIds'i çıkar
                    const selectedOptionItemIds = item.selectedOptions?.map(
                        (option) => option.optionItem.id
                    ) || [];

                    // Fiyat hesaplaması için item details'i al
                    const itemDetails = await calculateCartItemDetails({
                        productId: item.productId,
                        quantity: item.quantity,
                        selectedOptionItemIds,
                    }, token || undefined);

                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        selectedOptionItemIds,
                        ...itemDetails,
                    };
                })
            );

            // State'i güncelle
            setCart(cartItemsWithDetails);
            localStorage.setItem("cart", JSON.stringify(cartItemsWithDetails));

            // Eğer kullanıcı giriş yaptıysa backend'e de gönder
            if (user && token) {
                try {
                    // Backend'e sadece temel bilgileri gönder
                    const simpleCartItems = cartItemsWithDetails.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        selectedOptionItemIds: item.selectedOptionItemIds,
                    }));

                    await mergeCart(simpleCartItems, token);
                    // Backend'den güncel sepeti çek
                    await loadCart();
                } catch (err) {
                    console.error("Cart could not be saved to backend", err);
                    setError("Cart could not be updated");
                }
            }

            console.log(
                "[Cart] loadCartFromOrder success",
                cartItemsWithDetails.length,
                "items"
            );
            return { activeItems, inactiveItems };
        } catch (err: unknown) {
            console.error("Error loading cart from order:", err);
            setError(
                err instanceof Error ? err.message : "Cart could not be updated"
            );
            return { activeItems: [], inactiveItems: [] };
        } finally {
            setLoading(false);
        }
    };

    // Sadece aktif ürünleri sepete yükle
    const loadActiveItemsToCart = async (
        activeItems: RepeatableOrderItem[]
    ) => {
        setLoading(true);
        setError(null);

        try {
            console.log(
                "[Cart] loadActiveItemsToCart requested",
                activeItems.length,
                "items"
            );
            const cartItemsWithDetails = await Promise.all(
                activeItems.map(async (item) => {
                    // selectedOptions'dan selectedOptionItemIds'i çıkar
                    const selectedOptionItemIds = item.selectedOptions?.map(
                        (option) => option.optionItem.id
                    ) || [];

                    // Fiyat hesaplaması için item details'i al
                    const itemDetails = await calculateCartItemDetails({
                        productId: item.productId,
                        quantity: item.quantity,
                        selectedOptionItemIds,
                    }, token || undefined);

                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        selectedOptionItemIds,
                        ...itemDetails,
                    };
                })
            );

            // State'i güncelle
            setCart(cartItemsWithDetails);
            localStorage.setItem("cart", JSON.stringify(cartItemsWithDetails));

            // Eğer kullanıcı giriş yaptıysa backend'e de gönder
            if (user && token) {
                try {
                    // Backend'e sadece temel bilgileri gönder
                    const simpleCartItems = cartItemsWithDetails.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        selectedOptionItemIds: item.selectedOptionItemIds,
                    }));

                    await mergeCart(simpleCartItems, token);
                    // Backend'den güncel sepeti çek
                    await loadCart();
                } catch (err) {
                    console.error("Cart could not be saved to backend", err);
                    setError("Cart could not be updated");
                }
            }
        } catch (err: unknown) {
            console.error("Error loading active items to cart:", err);
            setError(
                err instanceof Error ? err.message : "Cart could not be updated"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                error,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                refetchCart,
                loadCartFromOrder,
                loadActiveItemsToCart,
            }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
