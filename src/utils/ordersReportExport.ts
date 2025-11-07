import { formatDate } from "@/utils/date";
import {
    formatDeliveryStatus,
    formatProductionStatus,
} from "@/utils/status";
import type { AdminAnalyticsOrdersItem } from "@/types/data";

export interface OrderReportColumn {
    header: string;
    getValue: (order: AdminAnalyticsOrdersItem) => string;
}

export const orderReportColumns: OrderReportColumn[] = [
    {
        header: "Order #",
        getValue: (order) =>
            order.orderNumber !== undefined && order.orderNumber !== null
                ? String(order.orderNumber)
                : "",
    },
    {
        header: "Date",
        getValue: (order) => formatDate(order.createdAt),
    },
    {
        header: "Customer",
        getValue: (order) =>
            order.user ? `${order.user.name} ${order.user.surname}`.trim() : "-",
    },
    {
        header: "Delivery Status",
        getValue: (order) =>
            order.deliveryStatus ? formatDeliveryStatus(order.deliveryStatus) : "-",
    },
    {
        header: "Production Status",
        getValue: (order) =>
            order.productionStatus
                ? formatProductionStatus(order.productionStatus)
                : "-",
    },
    {
        header: "Initial Total",
        getValue: (order) => {
            const val =
                order.initialWholesaleTotalAmount ?? order.initialTotalAmount;
            return val !== undefined && val !== null ? String(val) : "";
        },
    },
    {
        header: "Final Total",
        getValue: (order) => {
            const val = order.finalWholesaleTotalAmount ?? order.finalTotalAmount;
            return val !== undefined && val !== null ? String(val) : "";
        },
    },
    {
        header: "Items",
        getValue: (order) => String(order.items?.length ?? 0),
    },
];
