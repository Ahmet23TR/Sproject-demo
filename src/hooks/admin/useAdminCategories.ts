"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchCategories, type Category as ProductCategory } from "@/services/productService";
import {
    createCategory,
    deleteCategory,
    updateCategory,
    type CreateCategoryPayload,
    type UpdateCategoryPayload,
} from "@/services/categoryService";

type CombinedCategory = ProductCategory & { parentId?: string | null };

export interface UseAdminCategoriesResult {
    categories: CombinedCategory[];
    loading: boolean;
    error: string | null;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    selectedCategoryId: string | null;
    setSelectedCategoryId: (id: string | null) => void;
    create: (payload: CreateCategoryPayload) => Promise<void>;
    update: (id: string, payload: UpdateCategoryPayload) => Promise<void>;
    remove: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export const useAdminCategories = (): UseAdminCategoriesResult => {
    const [categories, setCategories] = useState<CombinedCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false);
    const [updating, setUpdating] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCategories();
            // fetchCategories provides id/name; parentId not available from that endpoint
            setCategories(data as CombinedCategory[]);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to load categories");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const create = useCallback(async (payload: CreateCategoryPayload) => {
        setCreating(true);
        try {
            await createCategory(payload);
            await load();
        } finally {
            setCreating(false);
        }
    }, [load]);

    const update = useCallback(async (id: string, payload: UpdateCategoryPayload) => {
        setUpdating(true);
        try {
            await updateCategory(id, payload);
            await load();
        } finally {
            setUpdating(false);
        }
    }, [load]);

    const remove = useCallback(async (id: string) => {
        setDeleting(true);
        try {
            await deleteCategory(id);
            await load();
        } finally {
            setDeleting(false);
        }
    }, [load]);

    const refresh = useCallback(async () => {
        await load();
    }, [load]);

    return {
        categories,
        loading,
        error,
        isModalOpen,
        openModal,
        closeModal,
        creating,
        updating,
        deleting,
        selectedCategoryId,
        setSelectedCategoryId,
        create,
        update,
        remove,
        refresh,
    };
};

