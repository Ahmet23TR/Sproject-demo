import axios, { AxiosError } from 'axios';
import { ApiError as ClientApiError } from '../services/apiClient';

type NormalizedError = { code?: string; status?: number; message?: string };

const extractEnvelopeMessage = (data: unknown): string | null => {
    if (!data || typeof data !== "object") {
        return null;
    }

    if (
        "error" in data &&
        data.error &&
        typeof data.error === "object" &&
        "message" in data.error &&
        typeof (data.error as { message?: unknown }).message === "string"
    ) {
        return (data.error as { message: string }).message;
    }

    if ("message" in data && typeof (data as { message?: unknown }).message === "string") {
        return (data as { message: string }).message;
    }

    return null;
};

// This function takes an Axios error and returns a user-friendly message.
export const getApiErrorMessage = (error: unknown): string => {
    // Handle our normalized ApiClient errors
    if (error instanceof ClientApiError) {
        if (error.status === 401) {
            return 'Invalid email/phone or password.';
        }
        return error.message || 'An unexpected error occurred. Please try again.';
    }

    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<unknown>;

        // Handle normalized ApiClient error shape
        const normalized = axiosError as unknown as NormalizedError;

        // Invalid credentials mapping
        if (normalized.status === 401) {
            return 'Invalid email/phone or password.';
        }

        // Envelope error message if present
        const messageFromEnvelope = extractEnvelopeMessage(axiosError.response?.data);
        if (messageFromEnvelope) {
            return messageFromEnvelope;
        }

        // Network error
        if (axiosError.code === 'ERR_NETWORK') {
            return 'Could not connect to the server. Please check your internet connection.';
        }

        // Fallback message from response
        const generic = extractEnvelopeMessage(axiosError.response?.data) || axiosError.message;
        if (generic) return generic;
    }
    return 'An unexpected error occurred. Please try again.';
};
