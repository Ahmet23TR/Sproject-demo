"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { fetchProducts } from "../services/productService";
import type { Product } from "../services/productService";

interface QuickLink {
    label: string;
    href: string;
}

export const useHomePage = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    // Admin, Şef, Şoför, Distributor ve Client yönlendirme mantığı
    useEffect(() => {
        if (authLoading) return;
        if (user?.role === "ADMIN") {
            router.replace("/admin/dashboard");
        } else if (user?.role === "CHEF") {
            router.replace("/chef/dashboard");
        } else if (user?.role === "DRIVER") {
            router.replace("/driver/dashboard");
        } else if (user?.role === "DISTRIBUTOR") {
            router.replace("/distributor/summary");
        } else if (user?.role === "CLIENT") {
            router.replace("/client/dashboard");
        }
    }, [user, authLoading, router]);

    // Öne çıkan ürünleri çekme mantığı
    useEffect(() => {
        const getProducts = async () => {
            setProductsLoading(true);
            try {
                const response = await fetchProducts();
                // Support both array and { data: Product[] } shapes
                const list: Product[] = Array.isArray(response)
                    ? response
                    : (response as unknown as { data?: Product[] })?.data || [];
                // Get only first 3 active products
                const activeProducts = list
                    .filter((p: Product) => p.isActive)
                    .slice(0, 3);
                setProducts(activeProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]); // Empty array on error
            } finally {
                setProductsLoading(false);
            }
        };
        getProducts();
    }, []);

    // Kullanıcı rolüne göre hızlı linkleri hesaplama mantığı
    const quickLinks = useMemo((): QuickLink[] => {
        if (!user) {
            // User not logged in
            return [
                { label: "Login", href: "/login" },
                { label: "Register", href: "/register" },
            ];
        }
        if (user.role === "ADMIN") {
            return [
                { label: "Dashboard", href: "/admin/dashboard" },
                { label: "Orders", href: "/admin/orders" },
                { label: "Product Management", href: "/admin/products" },
                { label: "Client Management", href: "/admin/clients" },
                { label: "Staff Management", href: "/admin/staff" },
            ];
        }
        // Default CLIENT role
        return [
            { label: "Place Order", href: "/client/new-order" },
            { label: "My Order History", href: "/client/order-history" },
            { label: "My Profile", href: "/profile" },
        ];
    }, [user]);

    return { user, authLoading, products, productsLoading, quickLinks };
};
