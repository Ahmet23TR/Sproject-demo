/**
 * Utility functions for formatting order statuses
 */

/**
 * Format delivery status to user-friendly display text
 */
export const formatDeliveryStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        READY_FOR_DELIVERY: "Ready for Delivery",
        DELIVERED: "Delivered",
        PARTIALLY_DELIVERED: "Partially Delivered",
        PARTIAL: "Partial Delivery",
        FAILED: "Failed",
        CANCELLED: "Cancelled",
        PENDING: "Pending",
    };

    return statusMap[status] || status;
};

/**
 * Get all delivery status options for dropdowns
 */
export const getDeliveryStatusOptions = () => [
    { value: "", label: "All" },
    { value: "READY_FOR_DELIVERY", label: "Ready for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "PARTIALLY_DELIVERED", label: "Partially Delivered" },
    { value: "FAILED", label: "Failed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "PENDING", label: "Pending" },
];

/**
 * Format production status to user-friendly display text
 */
export const formatProductionStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        ACCEPTED: "Accepted",
        PENDING: "Pending",
        READY: "Ready",
        IN_PROGRESS: "In Progress",
        PARTIALLY_COMPLETED: "Partially Completed",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
    };

    return statusMap[status] || status;
};
