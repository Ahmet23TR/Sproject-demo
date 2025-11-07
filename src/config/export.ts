// Export configuration for backend optimizations
export const EXPORT_CONFIG = {
    // API endpoints
    endpoints: {
        exportStats: "/api/admin/analytics/orders/export/stats",
        exportDirect: "/api/admin/analytics/orders/export",
        exportAsync: "/api/admin/analytics/orders/export-async",
        exportStatus: "/api/admin/analytics/orders/export-status",
        exportCancel: "/api/admin/analytics/orders/export-cancel",
    },

    // Export thresholds
    thresholds: {
        maxDirectExportSize: 1000, // Orders count threshold for direct vs async
        pollInterval: 2000, // Job polling interval in ms
        maxRetries: 3,
    },

    // UI settings
    ui: {
        showCacheIndicator: true,
        showExportStats: true,
        showProgressBar: true,
    },
} as const;

// Helper function to determine export method based on stats
export const getRecommendedExportMethod = (
    orderCount: number
): "direct" | "async" => {
    return orderCount > EXPORT_CONFIG.thresholds.maxDirectExportSize
        ? "async"
        : "direct";
};

// Format export stats for display
export const formatExportStats = (stats: {
    orderCount: number;
    itemCount: number;
    estimatedSizeKB: number;
    estimatedTimeSeconds: number;
    canExport: boolean;
    willCache: boolean;
}) => ({
    orderInfo: `${stats.orderCount} orders, ${stats.itemCount} items`,
    sizeInfo: `~${Math.round(stats.estimatedSizeKB)}KB`,
    timeInfo: `~${stats.estimatedTimeSeconds}s`,
    cacheInfo: stats.willCache ? "Will be cached" : "Direct export",
    recommended: getRecommendedExportMethod(stats.orderCount),
});
