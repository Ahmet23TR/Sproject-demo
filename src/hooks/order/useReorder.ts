"use client";
import { useRouter } from "next/navigation";
import type { Order } from "../../types/data";
import { useCart } from "../../context/CartContext";

// Simple reusable reorder action for client flows
export const useReorder = () => {
    const router = useRouter();
    const { loadCartFromOrder } = useCart();

    const reorder = async (order: Order) => {
        try {
            await loadCartFromOrder(order);
            router.push("/client/new-order");
        } catch (error) {
             
            console.error("Reorder failed:", error);
        }
    };

    return { reorder };
};


