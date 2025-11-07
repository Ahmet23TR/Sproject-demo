import { Order } from "@/types/data";
import { SxProps, Theme } from "@mui/material/styles";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

export const formatCurrency = (value?: number | null) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "—";
    }
    return currencyFormatter.format(value);
};

export const formatDate = (value?: string | null) => {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }
    return dateFormatter.format(date);
};

export const formatDateTime = (value?: string | null) => {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }
    const time = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return `${dateFormatter.format(date)} · ${time}`;
};

const deliveryStatusStyles: Record<string, { label: string; color: string; background: string }> = {
    DELIVERED: {
        label: "Completed",
        color: "#047857",
        background: "rgba(16, 185, 129, 0.16)",
    },
    PENDING: {
        label: "Pending",
        color: "#b45309",
        background: "rgba(234, 179, 8, 0.18)",
    },
    READY_FOR_DELIVERY: {
        label: "Ready",
        color: "#2563eb",
        background: "rgba(59, 130, 246, 0.16)",
    },
    PARTIALLY_DELIVERED: {
        label: "Partial Delivery",
        color: "#0369a1",
        background: "rgba(14, 165, 233, 0.16)",
    },
    CANCELLED: {
        label: "Cancelled",
        color: "#b91c1c",
        background: "rgba(248, 113, 113, 0.18)",
    },
    FAILED: {
        label: "Failed",
        color: "#dc2626",
        background: "rgba(239, 68, 68, 0.18)",
    },
};

export const getDeliveryStatusChip = (status?: string) => {
    if (!status) {
        return {
            label: "Unknown",
            sx: {
                backgroundColor: "rgba(148, 163, 184, 0.16)",
                color: "#475569",
                fontWeight: 600,
            } as SxProps<Theme>,
        };
    }
    const config = deliveryStatusStyles[status] || {
        label: status.replace(/_/g, " "),
        color: "#1f2937",
        background: "rgba(148, 163, 184, 0.16)",
    };
    return {
        label: config.label,
        sx: {
            backgroundColor: config.background,
            color: config.color,
            fontWeight: 600,
        } as SxProps<Theme>,
    };
};

export const getOrderTotal = (order: Order) => {
    // Prefer normalized distributor/admin enriched totalAmount if present
    const total = order.totalAmount ?? order.finalTotalAmount ?? order.initialTotalAmount ?? 0;
    return typeof total === "number" ? total : Number(total) || 0;
};

/**
 * Sadece tamamlanmış siparişleri filtreler (DELIVERED ve PARTIALLY_DELIVERED)
 */
export const getCompletedOrders = (orders: Order[]) => {
    return orders.filter(order => 
        order.deliveryStatus === "DELIVERED" || order.deliveryStatus === "PARTIALLY_DELIVERED"
    );
};

/**
 * Tamamlanmış siparişlerin toplam tutarını hesaplar
 * PARTIALLY_DELIVERED siparişler için finalTotalAmount kullanır
 */
export const calculateCompletedOrdersTotal = (orders: Order[]) => {
    const completedOrders = getCompletedOrders(orders);
    return completedOrders.reduce((sum, order) => {
        const total = order.finalTotalAmount ?? order.initialTotalAmount ?? 0;
        return sum + (typeof total === "number" ? total : Number(total) || 0);
    }, 0);
};

export const sectionCardSx: SxProps<Theme> = {
    borderRadius: 2,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    backgroundColor: "white",
    boxShadow: "0px 8px 18px rgba(15, 23, 42, 0.08)",
};
