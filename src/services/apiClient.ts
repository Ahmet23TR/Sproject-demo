import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
} from "axios";
import { v4 as uuidv4 } from "uuid";
import { DEMO_MODE } from "@/config/demo";
import { mockServer } from "@/mocks/mockServer";

// Idempotency key için uuid kütüphanesi eklenmeli
// npm install uuid @types/uuid

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Idempotency key storage
const idempotencyKeys = new Set<string>();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiClient {
    private client: AxiosInstance | null = null;
    private readonly useMockData: boolean = DEMO_MODE;

    constructor() {
        if (!this.useMockData) {
            this.client = axios.create({
                baseURL: API_BASE_URL,
                timeout: 30000, // 30 seconds
                headers: {
                    "Content-Type": "application/json",
                },
            });
            this.setupInterceptors();
        }
    }

    private setupInterceptors() {
        // Request interceptor
        if (!this.client) return;
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add idempotency key for write operations
                if (this.isWriteOperation(config.method || "GET")) {
                    const idempotencyKey = uuidv4();
                    config.headers["Idempotency-Key"] = idempotencyKey;
                    idempotencyKeys.add(idempotencyKey);
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                // Remove idempotency key from storage on success
                const idempotencyKey =
                    response.config.headers["Idempotency-Key"];
                if (idempotencyKey) {
                    idempotencyKeys.delete(idempotencyKey as string);
                }

                // Normalize according to envelope
                return this.normalizeSuccessResponse(response);
            },
            (error: AxiosError) => {
                const apiError = this.normalizeErrorResponse(error);

                // DÜZELTME: SADECE 401 (Unauthorized) hatası geldiğinde login'e yönlendir.
                // Bu, token'ın geçersiz veya süresinin dolmuş olduğu anlamına gelir.
                // Ancak login isteğinin kendisi 401 dönerse (invalid credentials), yönlendirme yapılmamalı.
                const requestUrl = error.config?.url || "";
                const isLoginRequest =
                    /\/auth\/login(\?|$)/.test(requestUrl) ||
                    requestUrl.endsWith("/auth/login");
                if (apiError.status === 401 && !isLoginRequest) {
                    this.handleUnauthorized();
                }

                // Handle network errors
                if (apiError.status === 0) {
                    this.handleNetworkError();
                }

                // Handle different types of errors with appropriate signals
                // 1. CRITICAL ERROR SCENARIO (Stop entire page)
                if (apiError.status >= 500 || error.code === "ERR_NETWORK") {
                    const event = new CustomEvent("critical-api-error", {
                        detail: {
                            message:
                                "An error occurred while processing your request. Please try again later.",
                        },
                    });
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(event);
                    }
                }
                // 2. SESSION ERROR SCENARIO (Redirect to login)
                else if (
                    (apiError.status === 401 && !isLoginRequest) ||
                    apiError.code === "AUTH_TOKEN_EXPIRED"
                ) {
                    this.handleUnauthorized();
                }
                // 3. OTHER INFORMATION ERRORS (Show popup)
                else if (
                    apiError.status !== 403 &&
                    apiError.code !== "AUTH_TOKEN_INVALID" &&
                    // Suppress global popup specifically for login failures
                    !(apiError.status === 401 && isLoginRequest)
                ) {
                    const event = new CustomEvent("notification-api-error", {
                        detail: {
                            message: apiError.message,
                            code: apiError.code,
                        },
                    });
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(event);
                    }
                }

                // Remove idempotency key from storage on error
                const idempotencyKey = error.config?.headers["Idempotency-Key"];
                if (idempotencyKey) {
                    idempotencyKeys.delete(idempotencyKey as string);
                }

                return Promise.reject(apiError);
            }
        );
    }

    private isWriteOperation(method: string): boolean {
        return ["POST", "PUT", "PATCH", "DELETE"].includes(
            method.toUpperCase()
        );
    }

    private getAuthToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("token");
    }

    private handleUnauthorized() {
        // Clear auth data
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

        // Redirect to login with reason
        if (typeof window !== "undefined") {
            window.location.href = "/login?reason=session_expired";
        }
    }

    private handleNetworkError() {
        // Send critical error signal for network errors
        const event = new CustomEvent("critical-api-error", {
            detail: {
                message:
                    "An error occurred while connecting to the server. Please try again later.",
            },
        });
        if (typeof window !== "undefined") {
            window.dispatchEvent(event);
        }
    }

    // --- Envelope Types and Normalization ---
    private normalizeSuccessResponse(response: AxiosResponse): AxiosResponse {
        // 204 No Content
        if (
            response.status === 204 ||
            response.data === "" ||
            response.data == null
        ) {
            return { ...response, data: undefined } as AxiosResponse;
        }

        const body = response.data as unknown;

        // If already an envelope
        if (typeof body === "object" && body !== null && "success" in body) {
            const envelope = body as {
                success: boolean;
                data?: unknown;
                meta?: { pagination?: unknown; requestId?: string };
                error?: { code?: string; message?: string; details?: unknown };
            };

            if (envelope.success === true) {
                const data = envelope.data;
                const meta = envelope.meta;

                // If pagination exists and data is an array, return { data, pagination }
                if (meta?.pagination && Array.isArray(data)) {
                    const normalized = { data, pagination: meta.pagination };
                    return { ...response, data: normalized } as AxiosResponse;
                }

                // Otherwise return inner data directly
                return { ...response, data } as AxiosResponse;
            }

            // success === false coming in the "success" path should be rare; throw ApiError
            const code = envelope?.error?.code ?? "UNKNOWN_ERROR";
            const message = envelope?.error?.message ?? "Request failed";
            const details = envelope?.error?.details;
            const requestId = envelope?.meta?.requestId;
            const apiError = new ApiError(
                code,
                message,
                response.status,
                details,
                requestId
            );
            throw apiError;
        }

        // Not an envelope (backward compatibility) → return as-is
        return response;
    }

    private normalizeErrorResponse(error: AxiosError): ApiError {
        // Network or CORS or no response
        if (!error.response) {
            return new ApiError("NETWORK_ERROR", "Network error occurred", 0);
        }

        const status = error.response.status;
        const data: unknown = error.response.data;

        if (
            data &&
            typeof data === "object" &&
            "success" in data &&
            (data as { success: boolean }).success === false
        ) {
            const envelope = data as {
                success: boolean;
                error?: { code?: string; message?: string; details?: unknown };
                meta?: { requestId?: string };
            };

            const code = envelope?.error?.code ?? "UNKNOWN_ERROR";
            const message = envelope?.error?.message ?? "Request failed";
            const details = envelope?.error?.details;
            const requestId = envelope?.meta?.requestId;
            return new ApiError(code, message, status, details, requestId);
        }

        // Fallback for non-enveloped errors
        const errorData = data as { message?: string; error?: string };
        const fallbackMessage =
            (errorData && (errorData.message || errorData.error)) ||
            error.message ||
            "Request failed";
        return new ApiError("UNKNOWN_ERROR", fallbackMessage, status);
    }

    // Public methods
    public async get<T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> {
        if (this.useMockData) {
            return this.requestMock<T>("GET", url, config);
        }
        const response = await this.client!.get<T>(url, config);
        return response.data as unknown as T;
    }

    public async post<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        if (this.useMockData) {
            return this.requestMock<T>("POST", url, config, data);
        }
        const response = await this.client!.post<T>(url, data, config);
        return response.data as unknown as T;
    }

    public async put<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        if (this.useMockData) {
            return this.requestMock<T>("PUT", url, config, data);
        }
        const response = await this.client!.put<T>(url, data, config);
        return response.data as unknown as T;
    }

    public async patch<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        if (this.useMockData) {
            return this.requestMock<T>("PATCH", url, config, data);
        }
        const response = await this.client!.patch<T>(url, data, config);
        return response.data as unknown as T;
    }

    public async delete<T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> {
        if (this.useMockData) {
            return this.requestMock<T>("DELETE", url, config);
        }
        const response = await this.client!.delete<T>(url, config);
        return response.data as unknown as T;
    }

    // Method to check if a request is in progress (for duplicate prevention)
    public isRequestInProgress(idempotencyKey: string): boolean {
        return idempotencyKeys.has(idempotencyKey);
    }

    private async requestMock<T>(
        method: HttpMethod,
        url: string,
        config?: AxiosRequestConfig,
        data?: unknown
    ): Promise<T> {
        const headers = {
            ...(config?.headers ?? {}),
        };
        if (!headers.Authorization) {
            const token = this.getAuthToken();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }
        const mergedConfig: AxiosRequestConfig = {
            ...config,
            headers,
        };
        return await mockServer.request<T>(method, url, mergedConfig, data);
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export axios instance for backward compatibility
export const axiosInstance = apiClient["client"];

// Exported ApiError for consumers
export class ApiError extends Error {
    public code: string;
    public status: number;
    public details?: unknown;
    public requestId?: string;

    constructor(
        code: string,
        message: string,
        status: number,
        details?: unknown,
        requestId?: string
    ) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.status = status;
        this.details = details;
        this.requestId = requestId;
    }
}
