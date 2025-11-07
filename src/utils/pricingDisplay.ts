import type { OrderDualPricing, OrderItemDualPricing } from "../types/data";

type Role = "ADMIN" | "CLIENT" | "CHEF" | "DRIVER" | "DISTRIBUTOR";

export function getOrderDisplayTotals(order: Partial<OrderDualPricing>, role: Role) {
    const isAdmin = role === "ADMIN";
    const final = isAdmin
        ? order.finalWholesaleTotalAmount ?? order.initialWholesaleTotalAmount
        : order.finalRetailTotalAmount ?? order.initialRetailTotalAmount;
    const initial = isAdmin
        ? order.initialWholesaleTotalAmount
        : order.initialRetailTotalAmount;
    return { final: Number(final ?? 0), initial: Number(initial ?? 0) };
}

export function getOrderItemDisplayAmounts(item: Partial<OrderItemDualPricing>, role: Role) {
    const isAdmin = role === "ADMIN";
    const unit = isAdmin
        ? item.wholesaleUnitPrice ?? item.unitPrice
        : item.retailUnitPrice ?? item.unitPrice;
    const total = isAdmin
        ? item.wholesaleTotalPrice ?? item.totalPrice ?? (unit ?? 0) * (item.quantity ?? 0)
        : item.retailTotalPrice ?? item.totalPrice ?? (unit ?? 0) * (item.quantity ?? 0);
    return { unit: Number(unit ?? 0), total: Number(total ?? 0) };
}

