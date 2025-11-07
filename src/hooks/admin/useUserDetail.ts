"use client";
import {
    useState,
    useEffect,
    useCallback,
    ChangeEvent,
    FormEvent,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
    fetchUserById,
    updateUserByAdmin,
    deleteUserByAdmin,
    activateUser,
    deactivateUser,
    updateUserRole,
} from "../../services/userService";
import { updateChefProductGroupByAdmin } from "../../services/adminService";
import { fetchOrdersByUserId } from "../../services/orderService";
import { getApiErrorMessage } from "../../utils/errorHandler";
import type {
    User,
    UpdateProfilePayload,
    PaginationInfo,
} from "../../types/data";
import type { Order } from "../../types/data";

export const useUserDetail = (userId: string) => {
    const { token, user: currentUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL'den sayfa numarasını al
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState<Partial<User>>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
    const [isActivating, setIsActivating] = useState(false);
    const [activationError, setActivationError] = useState<string | null>(null);
    const [isChangingRole, setIsChangingRole] = useState(false);
    const [roleChangeError, setRoleChangeError] = useState<string | null>(null);
    const [roleChangeSuccess, setRoleChangeSuccess] = useState<string | null>(
        null
    );

    // Backend pagination artık destekleniyor, cache'e gerek yok

    const fetchData = useCallback(async () => {
        if (!token || !userId) return;
        setLoading(true);
        try {
            const [userData, ordersResponse] = await Promise.all([
                fetchUserById(userId, token, true), // includeStats=true ekledik
                fetchOrdersByUserId(userId, token, currentPage, 10),
            ]);

            setUser(userData);

            // Backend artık pagination destekliyor, direkt kullan
            const orders = ordersResponse.order || [];
            const pagination = ordersResponse.pagination;

            setOrders(orders);
            setPagination(pagination);

            setFormState({
                name: userData.name,
                surname: userData.surname,
                email: userData.email,
                companyName: userData.companyName,
                address: userData.address,
                phone: userData.phone || "",
                priceListId: userData.priceListId ?? null,
                productGroup: userData.productGroup ?? undefined,
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError(getApiErrorMessage(error));
            setOrders([]); // Hata durumunda orders'ı boş array yap
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [token, userId, currentPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePriceListChange = (priceListId: string | null) => {
        setFormState((prev) => ({ ...prev, priceListId }));
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!token || !userId || !user) return;
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(null);

        try {
            // Check if we're updating a chef's product group
            const productGroupChanged =
                (formState.productGroup ?? "") !== (user.productGroup ?? "");

            if (
                user.role === "CHEF" &&
                productGroupChanged &&
                formState.productGroup
            ) {

                // Use the dedicated chef product group endpoint
                await updateChefProductGroupByAdmin(
                    userId,
                    formState.productGroup as "SWEETS" | "BAKERY",
                    token
                );
                setUpdateSuccess(
                    `Chef product group updated to ${
                        formState.productGroup === "SWEETS"
                            ? "Sweets"
                            : "Bakery"
                    } successfully.`
                );
            } else {
                // Use the general user update endpoint for other fields
                await updateUserByAdmin(
                    userId,
                    formState as UpdateProfilePayload,
                    token
                );
                setUpdateSuccess("User information updated successfully.");
            }

            await fetchData();
        } catch (error) {
            console.error("Error updating user:", error);
            setUpdateError(getApiErrorMessage(error));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!token || !userId) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteUserByAdmin(userId, token);
            setDeleteSuccess("User deleted successfully. Redirecting...");
            setTimeout(() => {
                // Redirect based on user role
                if (user?.role === "CLIENT") {
                    router.push("/admin/clients");
                } else {
                    router.push("/admin/staff");
                }
            }, 2000);
        } catch (error) {
            setDeleteError(getApiErrorMessage(error));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleActivate = async () => {
        if (!token || !userId) return;
        setIsActivating(true);
        setActivationError(null);
        try {
            await activateUser(userId, token);
            setUser((prev) => (prev ? { ...prev, isActive: true } : prev));
        } catch (error) {
            setActivationError(getApiErrorMessage(error));
        } finally {
            setIsActivating(false);
        }
    };

    const handleDeactivate = async () => {
        if (!token || !userId) return;
        setIsActivating(true);
        setActivationError(null);
        try {
            await deactivateUser(userId, token);
            setUser((prev) => (prev ? { ...prev, isActive: false } : prev));
        } catch (error) {
            setActivationError(getApiErrorMessage(error));
        } finally {
            setIsActivating(false);
        }
    };

    const handleRoleChange = async (newRole: User["role"]) => {
        if (!token || !userId) return;
        setIsChangingRole(true);
        setRoleChangeError(null);
        setRoleChangeSuccess(null);
        try {
            await updateUserRole(userId, newRole, token);
            setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
            setRoleChangeSuccess("User role updated successfully.");
        } catch (error) {
            setRoleChangeError(getApiErrorMessage(error));
        } finally {
            setIsChangingRole(false);
        }
    };

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        // URL'i güncelle
        const params = new URLSearchParams(searchParams);
        params.set("page", value.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const isDirty = (() => {
        if (!user) return false;
        const nameChanged = (formState.name ?? "") !== (user.name ?? "");
        const surnameChanged =
            (formState.surname ?? "") !== (user.surname ?? "");
        const emailChanged = (formState.email ?? "") !== (user.email ?? "");
        const companyChanged =
            (formState.companyName ?? "") !== (user.companyName ?? "");
        const addressChanged =
            (formState.address ?? "") !== (user.address ?? "");
        const phoneChanged = (formState.phone ?? "") !== (user.phone ?? "");
        const priceListChanged = formState.priceListId !== user.priceListId;
        const productGroupChanged =
            (formState.productGroup ?? "") !== (user.productGroup ?? "");
        return (
            nameChanged ||
            surnameChanged ||
            emailChanged ||
            companyChanged ||
            addressChanged ||
            phoneChanged ||
            priceListChanged ||
            productGroupChanged
        );
    })();

    return {
        user,
        orders,
        pagination,
        loading,
        error,
        currentUser,
        refetch: fetchData,
        formState,
        isUpdating,
        updateSuccess,
        updateError,
        handleFormChange,
        handlePriceListChange,
        handleFormSubmit,
        isDeleting,
        deleteError,
        deleteSuccess,
        handleDeleteUser,
        isActivating,
        activationError,
        handleActivate,
        handleDeactivate,
        isChangingRole,
        roleChangeError,
        roleChangeSuccess,
        handleRoleChange,
        currentPage,
        handlePageChange,
        isDirty,
    };
};
