import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder, CreateOrderPayload } from "../../services/orderService";
import { uploadOrderAttachment } from "../../services/attachmentService";
import type { Order } from "../../types/data";

export const useOrderForm = () => {
    const { token } = useAuth();
    const { cart, clearCart } = useCart();
    const [orderNote, setOrderNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

    const handleSubmit = async (attachmentFile?: File | null) => {
        if (!token) return setError("Please log in.");
        if (cart.length === 0) return setError("Your cart is empty.");

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            let attachmentUrl: string | null = null;
            if (attachmentFile) {
                attachmentUrl = await uploadOrderAttachment(
                    attachmentFile,
                    token
                );
            }
            const payload: CreateOrderPayload = {
                items: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    selectedOptionItemIds: item.selectedOptionItemIds,
                })),
                notes: orderNote,
                attachmentUrl,
            };
            const order = await createOrder(payload, token);
            setCreatedOrder(order);
            setSuccess("Your order has been created successfully!");
            setShowSuccessModal(true);
            clearCart();
            setOrderNote("");
        } catch (e: unknown) {
            const message =
                (e as { response?: { data?: { error?: string } } })?.response
                    ?.data?.error ||
                (e as Error)?.message ||
                "Order could not be created.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setCreatedOrder(null);
    };

    return {
        orderNote,
        setOrderNote,
        loading,
        error,
        setError,
        success,
        handleSubmit,
        showSuccessModal,
        closeSuccessModal,
        createdOrder,
    };
};
