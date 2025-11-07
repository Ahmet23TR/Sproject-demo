import { apiClient } from './apiClient';
import { User, PaginatedResponse, DistributorClientDetail } from "../types/data"; // Tipi artık merkezi dosyadan alıyoruz

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const hasUserPayload = (value: unknown): value is { user: User } =>
    typeof value === "object" &&
    value !== null &&
    "user" in value &&
    typeof (value as { user: unknown }).user === "object";

const hasDistributorClientPayload = (
    value: unknown
): value is { data: DistributorClientDetail } =>
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    typeof (value as { data: unknown }).data === "object";

// Profil güncelleme için gönderilecek payload tipi
// Partial<User> kullanarak User tipindeki bazı alanların opsiyonel olmasını sağlıyoruz
export type UpdateProfilePayload = Partial<
    Pick<User, "name" | "surname" | "email" | "companyName" | "address" | "phone">
>;

/**
 * Admin için tüm kullanıcıları listeler - Sayfalandırma desteği ile.
 */
export const fetchUsers = async (
    token: string,
    page: number = 1,
    limit: number = 10,
    options?: {
        role?: User["role"];
        includeStats?: boolean;
    }
): Promise<PaginatedResponse<User>> => {
    try {
        const params: Record<string, string | number | boolean> = { page, limit };
        if (options?.role) {
            params.role = options.role;
        }
        if (options?.includeStats) {
            params.includeStats = options.includeStats;
        }
        const data = await apiClient.get<PaginatedResponse<User>>(
            `${API_BASE_URL}/users`,
            { headers: { Authorization: `Bearer ${token}` }, params }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

export const fetchUserById = async (
    userId: string,
    token: string,
    includeStats: boolean = false
): Promise<User> => {
    try {
        const params = includeStats ? '?includeStats=true' : '';
        const data = await apiClient.get<User | { user: User }>(
            `${API_BASE_URL}/users/${userId}${params}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (hasUserPayload(data)) {
            return data.user;
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const updateUserByAdmin = async (
    userId: string,
    payload: UpdateProfilePayload,
    token: string
): Promise<User> => {
    try {
        const data = await apiClient.put<User | { user: User }>(
            `${API_BASE_URL}/users/${userId}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (hasUserPayload(data)) {
            return data.user;
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const changeUserPasswordByAdmin = async (
    userId: string,
    newPassword: string,
    token: string
): Promise<{ message: string }> => {
    const data = await apiClient.put<{ message: string }>(
        `${API_BASE_URL}/users/${userId}/change-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
};

export const deleteUserByAdmin = async (
    userId: string,
    token: string
): Promise<void> => {
    try {
        await apiClient.delete(`${API_BASE_URL}/users/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Bir kullanıcının hesabını aktif eder.
 */
export const activateUser = async (
    userId: string,
    token: string
): Promise<User> => {
    try {
        const data = await apiClient.put<User>(
            `${API_BASE_URL}/users/${userId}/activate`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Bir kullanıcının hesabını deaktif eder.
 */
export const deactivateUser = async (
    userId: string,
    token: string
): Promise<User> => {
    try {
        const data = await apiClient.put<User>(
            `${API_BASE_URL}/users/${userId}/deactivate`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Giriş yapmış kullanıcının kendi profil bilgilerini çeker.
 */
export const fetchProfile = async (token: string): Promise<User> => {
    try {
        const data = await apiClient.get<User>(`${API_BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Giriş yapmış kullanıcının kendi profil bilgilerini günceller.
 */
export const updateProfile = async (
    payload: UpdateProfilePayload,
    token: string
): Promise<User> => {
    try {
        const data = await apiClient.put<User>(
            `${API_BASE_URL}/profile`,
            payload,
            { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Giriş yapmış kullanıcının şifresini değiştirir.
 */
export const changePassword = async (
    oldPassword: string,
    newPassword: string,
    token: string
): Promise<{ message: string }> => {
    try {
        const data = await apiClient.post<{ message: string }>(
            `${API_BASE_URL}/profile/change-password`,
            { oldPassword, newPassword },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Yeni kullanıcı oluşturur (sadece admin).
 * Endpoint: POST /api/auth/admin/users
 */
export const createUser = async (
    payload: {
        name: string;
        surname: string;
        email: string;
        password: string;
        role: User["role"];
        companyName?: string;
        phone?: string | null;
        isActive?: boolean;
        priceListId?: string;
    },
    token: string
): Promise<User> => {
    try {
        const data = await apiClient.post<User | { user: User }>(
            `${API_BASE_URL}/users`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (hasUserPayload(data)) {
            return data.user;
        }
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Kullanıcının rolünü günceller (sadece admin).
 */
export const updateUserRole = async (
    userId: string,
    newRole: User["role"],
    token: string
): Promise<User> => {
    try {
        const data = await apiClient.put<User>(
            `${API_BASE_URL}/users/${userId}`,
            { role: newRole },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        throw error;
    }
};

// Distributor or Admin: get client details (read-only)
export const fetchDistributorClientById = async (
    clientId: string,
    token: string
): Promise<DistributorClientDetail> => {
    try {
        const data = await apiClient.get<{ message?: string; data?: DistributorClientDetail } | DistributorClientDetail>(
            `${API_BASE_URL}/distributor/clients/${clientId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        // API may wrap response; normalize
        if (hasDistributorClientPayload(data)) {
            return data.data;
        }
        if (data && typeof data === "object" && !Array.isArray(data) && "message" in data) {
            throw new Error((data as { message?: string }).message ?? "Client could not be loaded");
        }
        return data as DistributorClientDetail;
    } catch (error) {
        throw error;
    }
};
