import { useState, useEffect } from "react";
import { fetchCategories, type Category } from "@/services/productService";

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchCategories();
                setCategories(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Kategoriler yüklenirken hata oluştu"
                );
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    return { categories, loading, error };
};
