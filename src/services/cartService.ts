// Sepet işlemleri için servis fonksiyonları
import type { CartItemPayload } from "../context/CartContext";
import { apiClient } from "./apiClient";

// Cart response types
interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    selectedOptionItemIds: string[];
    unitPrice?: number;
    totalPrice?: number;
    multiplier?: number;
    product?: {
        id: string;
        name: string;
        description?: string | null;
        imageUrl?: string | null;
        isActive?: boolean;
        unit?: "PIECE" | "KG" | "TRAY";
        productGroup?: "SWEETS" | "BAKERY";
        optionGroups?: unknown[];
    };
}

interface CartResponse {
    items: CartItem[];
}

interface CartItemResponse {
    item: CartItem;
}

interface MergeCartResponse {
    items: CartItem[];
    merged: boolean;
}

export async function getCart(token: string): Promise<CartResponse> {
    const data = await apiClient.get<CartResponse>(`/cart`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}

export async function addCartItem(
    item: CartItemPayload,
    token: string
): Promise<CartItemResponse> {
    const data = await apiClient.post<CartItemResponse>(`/cart/items`, item, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}

export async function updateCartItem(
    id: string,
    quantity: number,
    token: string
): Promise<CartItemResponse> {
    const data = await apiClient.put<CartItemResponse>(
        `/cart/items/${id}`,
        { quantity },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return data;
}

export async function removeCartItem(
    id: string,
    token: string
): Promise<void | null> {
    const data = await apiClient.delete<void>(`/cart/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data ?? null;
}

export async function mergeCart(
    items: CartItemPayload[],
    token: string
): Promise<MergeCartResponse> {
    const data = await apiClient.post<MergeCartResponse>(
        `/cart/merge`,
        { items },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return data;
}
