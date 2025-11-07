import { apiClient } from "./apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface AdminCategory {
    id: string;
    name: string;
    parentId?: string | null;
}

export interface CreateCategoryPayload {
    name: string;
    parentId?: string | null;
}

export interface UpdateCategoryPayload {
    name?: string;
    parentId?: string | null;
}

export const createCategory = async (
    payload: CreateCategoryPayload
): Promise<AdminCategory> => {
    const data = await apiClient.post<AdminCategory>(
        `${API_BASE_URL}/categories`,
        payload
    );
    return data as AdminCategory;
};

export const updateCategory = async (
    id: string,
    payload: UpdateCategoryPayload
): Promise<AdminCategory> => {
    const data = await apiClient.put<AdminCategory>(
        `${API_BASE_URL}/categories/${id}`,
        payload
    );
    return data as AdminCategory;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE_URL}/categories/${id}`);
};

export const getCategoryById = async (id: string): Promise<AdminCategory> => {
    const data = await apiClient.get<AdminCategory>(
        `${API_BASE_URL}/categories/${id}`
    );
    return data as AdminCategory;
};


