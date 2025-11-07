import { useState, useEffect, useCallback } from "react";
import { getDailyProductsSummary } from "../../services/distributorService";
import { getApiErrorMessage } from "../../utils/errorHandler";
import type { DistributorDailyProductSummaryResponse } from "../../types/data";

/**
 * Custom hook for managing distributor daily product summary
 * Handles fetching and state management for daily product summary data
 */
export const useDistributorDailyProducts = () => {
    // State management
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [data, setData] =
        useState<DistributorDailyProductSummaryResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches daily product summary data for the selected date
     */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Format date to YYYY-MM-DD
            const dateString = selectedDate.toISOString().split("T")[0];

            const response = await getDailyProductsSummary(dateString);
            setData(response);
        } catch (err) {
            setError(getApiErrorMessage(err));
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    /**
     * Changes the selected date and triggers data refresh
     */
    const handleDateChange = useCallback((newDate: Date) => {
        setSelectedDate(newDate);
    }, []);

    /**
     * Navigates to the previous day
     */
    const goToPreviousDay = useCallback(() => {
        setSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() - 1);
            return newDate;
        });
    }, []);

    /**
     * Navigates to the next day
     */
    const goToNextDay = useCallback(() => {
        setSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + 1);
            return newDate;
        });
    }, []);

    /**
     * Goes to today's date
     */
    const goToToday = useCallback(() => {
        setSelectedDate(new Date());
    }, []);

    // Fetch data when selected date changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        // State
        selectedDate,
        data,
        loading,
        error,
        // Actions
        handleDateChange,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        refreshData: fetchData,
    };
};

