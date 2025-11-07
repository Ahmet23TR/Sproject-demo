import { apiClient } from "./apiClient";
import { EnhancedFinancialsData } from "@/types/data";

/**
 * Enhanced finansal analiz raporu API çağrısı
 * @param token Admin JWT token
 * @param params startDate, endDate ve timeframe parametreleri
 * @returns Promise<EnhancedFinancialsData>
 */
export const fetchFinancialsReport = async (
    token: string,
    params: {
        startDate: string;
        endDate: string;
        timeframe?: "daily" | "weekly" | "monthly";
    }
): Promise<EnhancedFinancialsData> => {
    const queryParams = new URLSearchParams();
    queryParams.set("startDate", params.startDate);
    queryParams.set("endDate", params.endDate);

    if (params.timeframe) {
        queryParams.set("timeframe", params.timeframe);
    }

    const url = `/admin/analytics/financials?${queryParams.toString()}`;

    const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: EnhancedFinancialsData;
    }>(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};
