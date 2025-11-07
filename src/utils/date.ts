/**
 * Utility functions for date formatting
 */

/**
 * Format date to DD.MM.YYYY format
 * @param dateString - ISO date string or date object
 * @returns Formatted date string in DD.MM.YYYY format
 */
export const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
        return "-";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
};

/**
 * Format date to DD.MM.YYYY HH:MM format
 * @param dateString - ISO date string or date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date): string => {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
        return "-";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};
