import { apiClient } from "./apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface UploadAttachmentResponse {
    success: boolean;
    message: string;
    data: {
        attachmentUrl: string;
        publicId: string;
        originalName: string;
        size: number;
        mimeType: string;
    };
}

// More flexible response type for debugging
interface FlexibleUploadResponse {
    success?: boolean;
    message?: string;
    data?:
        | {
              attachmentUrl?: string;
              [key: string]: unknown;
          }
        | string;
    attachmentUrl?: string;
    [key: string]: unknown;
}

/**
 * Uploads an order attachment file to the backend
 * @param file The file to upload (images, PDF, Word docs, text files)
 * @param token User's authentication token
 * @returns Promise resolving to the uploaded file URL
 */
export const uploadOrderAttachment = async (
    file: File,
    token: string
): Promise<string> => {
    if (!API_BASE_URL) {
        throw new Error("API base URL is not configured");
    }

    // Validate file type according to backend specification
    const allowedTypes = [
        // Images
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        // Documents
        "application/pdf",
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "text/plain", // .txt
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error(
            "File type not allowed! Only images, PDFs, Word documents, and text files are permitted."
        );
    }

    // Validate file size (10MB limit as per backend spec)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size cannot exceed 10MB");
    }

    const formData = new FormData();
    formData.append("attachment", file);

    try {
        const response = await apiClient.post<FlexibleUploadResponse>(
            `${API_BASE_URL}/orders/upload-attachment`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        // Debug: Log the actual response to see what backend returns

        // Check if response has the expected structure
        if (!response) {
            throw new Error("No response received from upload service");
        }

        // Handle different possible response structures
        if (
            response.success &&
            response.data &&
            typeof response.data === "object" &&
            "attachmentUrl" in response.data
        ) {
            return response.data.attachmentUrl as string;
        } else if (response.attachmentUrl) {
            // Fallback: direct attachmentUrl in response
            return response.attachmentUrl;
        } else if (response.data && typeof response.data === "string") {
            // Fallback: attachmentUrl directly in data
            return response.data;
        } else {
            console.error("Unexpected response structure:", response);
            throw new Error("No URL returned from upload service");
        }
    } catch (error: unknown) {
        // Log the full error for debugging
        console.error("Upload error:", error);

        // Handle specific error messages from backend
        const errorMessage = (
            error as {
                response?: { data?: { message?: string }; status?: number };
            }
        )?.response?.data?.message;
        const statusCode = (error as { response?: { status?: number } })
            ?.response?.status;

        // Log response details if available
        if ((error as { response?: unknown })?.response) {
            console.error(
                "Backend response:",
                (error as { response: unknown }).response
            );
        }

        // If backend returns 400 with specific message
        if (statusCode === 400 && errorMessage) {
            throw new Error(errorMessage);
        }

        throw new Error(
            errorMessage ||
                (error as Error)?.message ||
                "File upload failed. Please try again."
        );
    }
};

/**
 * Debug function to test the upload endpoint
 * Call this from browser console to see what backend returns
 */
export const debugUploadEndpoint = async (file: File, token: string) => {

    try {
        const result = await uploadOrderAttachment(file, token);
        return result;
    } catch (error) {
        throw error;
    }
};
