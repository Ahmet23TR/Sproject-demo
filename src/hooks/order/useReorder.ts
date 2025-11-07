"use client";
import { useRouter } from "next/navigation";
import type { Order } from "../../types/data";
import { useCart } from "../../context/CartContext";
import { useNotifications } from "../useNotifications";

// Simple reusable reorder action for client flows
export const useReorder = () => {
    const router = useRouter();
    const { loadCartFromOrder } = useCart();
    const { showError, showWarning, showSuccess } = useNotifications();

    const reorder = async (order: Order) => {
        try {
            console.log("[Reorder] start", order.id);
            const result = await loadCartFromOrder(order);
            if (!result) {
                showError("We couldn't repeat this order. Please try again.");
                console.warn("[Reorder] loadCartFromOrder returned undefined");
                return;
            }

            const { activeItems, inactiveItems } = result;

            if (activeItems.length === 0) {
                showError(
                    "This order can no longer be repeated because all items are inactive."
                );
                console.warn(
                    "[Reorder] no active items available",
                    inactiveItems
                );
                return;
            }

            if (inactiveItems.length > 0) {
                const skippedNames = inactiveItems
                    .map((item) => item.name)
                    .join(", ");
                showWarning(
                    `Some items were skipped because they are inactive: ${skippedNames}.`
                );
                console.warn("[Reorder] skipped inactive items", inactiveItems);
            } else {
                showSuccess("Items added to your cart. You can review them now.");
            }

            router.push("/client/new-order");
        } catch (error) {
            console.error("Reorder failed:", error);
            showError("We couldn't repeat this order. Please try again.");
        }
    };

    return { reorder };
};
