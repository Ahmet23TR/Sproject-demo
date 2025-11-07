"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
    login as loginService,
    LoginCredentials,
} from "../../services/authService";
import { mergeCart } from "../../services/cartService";
import { getApiErrorMessage } from "../../utils/errorHandler";
import type { CartItemPayload } from "../../context/CartContext";
import { useCart } from "../../context/CartContext";

export const useLoginForm = () => {
    const [form, setForm] = useState<LoginCredentials>({
        identifier: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { login: loginContext } = useAuth();
    const { refetchCart } = useCart();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await loginService(form);
            loginContext(data.token); // AuthContext'i güncelle

            // --- Sepeti Birleştir Akışı ---
            try {
                const localCartRaw = localStorage.getItem("cart");
                const localCart: CartItemPayload[] = localCartRaw
                    ? JSON.parse(localCartRaw)
                    : [];
                if (localCart && localCart.length > 0) {
                    await mergeCart(localCart, data.token);
                    localStorage.removeItem("cart");
                }
            } catch {
                // Sepet birleştirme hatası kullanıcıya gösterilmez, loglanabilir
                // console.error("Sepet birleştirme hatası:", mergeErr);
            }
            // CartContext'ten sepeti refetch et
            await refetchCart();
            // -----------------------------

            // Kullanıcı rolüne göre yönlendir
            switch (data.user.role) {
                case "ADMIN":
                    router.push("/admin/dashboard");
                    break;
                case "CLIENT":
                    router.push("/client/dashboard");
                    break;
                case "CHEF":
                    router.push("/chef/dashboard");
                    break;
                case "DRIVER":
                    router.push("/driver/dashboard");
                    break;
                case "DISTRIBUTOR":
                    router.push("/distributor/summary");
                    break;
                default:
                    router.push("/"); // Varsayılan yönlendirme
            }
        } catch (error) {
            setError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return { form, loading, error, handleChange, handleSubmit };
};
