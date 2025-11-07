    "use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    fetchUsers,
    activateUser,
    deactivateUser,
    updateUserRole,
    createUser,
} from "../../services/userService";
import {
    updateChefProductGroupByAdmin,
    getAllChefs,
    getAdminCustomerSummary,
} from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import { extractErrorMessage } from "../../utils/error";
import { User, PaginationInfo, ProductGroup, CustomerSummary } from "../../types/data";
import { useAdminPricing } from "./useAdminPricing";

interface UseAdminUsersOptions {
    role?: User["role"];
    includeStats?: boolean;
}

export const useAdminUsers = (options?: UseAdminUsersOptions) => {
    const { token, user: currentUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { defaultList } = useAdminPricing();

    const roleFilter = options?.role;
    const includeStats = options?.includeStats ?? false;
    
    const parsePageParam = () => {
        const raw = searchParams.get("page");
        const parsed = Number.parseInt(raw || "1", 10);
        return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
    };

    const [currentPage, setCurrentPage] = useState<number>(() => parsePageParam());
    
    const [users, setUsers] = useState<User[]>([]);
    const [chefs, setChefs] = useState<User[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [customerSummary, setCustomerSummary] = useState<CustomerSummary | null>(null);

    const refetchUsers = useCallback(
        async (page: number = currentPage) => {
            if (!token) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const usersPromise = fetchUsers(token, page, 10, { role: roleFilter, includeStats });
                const chefsPromise = roleFilter === "CLIENT"
                    ? Promise.resolve<User[]>([])
                    : getAllChefs(token);
                const summaryPromise = includeStats && roleFilter === "CLIENT"
                    ? getAdminCustomerSummary(token)
                    : Promise.resolve<CustomerSummary | null>(null);

                const [usersResponse, chefsResponse, summaryResponse] = await Promise.all([
                    usersPromise,
                    chefsPromise,
                    summaryPromise,
                ]);
                setUsers(usersResponse.data);
                setChefs(chefsResponse);
                if (usersResponse.pagination) {
                    setPagination({
                        ...usersResponse.pagination,
                        currentPage: Math.max(1, usersResponse.pagination.currentPage || currentPage),
                        pageSize: usersResponse.pagination.pageSize || 10,
                    });
                } else {
                    setPagination(null);
                }
                setCustomerSummary(summaryResponse);
            } catch (error) {
                const errorMessage = extractErrorMessage(error, "Users could not be loaded");
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [token, currentPage, roleFilter, includeStats]
    );

    useEffect(() => {
        refetchUsers();
    }, [refetchUsers]);

    useEffect(() => {
        const nextPage = parsePageParam();
        setCurrentPage((prev) => (prev === nextPage ? prev : nextPage));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        if (value === currentPage) {
            return;
        }
        setCurrentPage(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", value.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleActivate = async (userId: string) => {
        if (!token) return;
        setActionLoading(userId);
        try {
            await activateUser(userId, token);
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, isActive: true } : u
                )
            );
        } catch (error) {
            const errorMessage = extractErrorMessage(error, "User could not be activated");
            setError(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeactivate = async (userId: string) => {
        if (!token || userId === currentUser?.id) return;
        setActionLoading(userId);
        try {
            await deactivateUser(userId, token);
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, isActive: false } : u
                )
            );
        } catch (error) {
            const errorMessage = extractErrorMessage(error, "User could not be deactivated");
            setError(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRoleChange = async (userId: string, newRole: User["role"]) => {
        if (!token) return;
        setActionLoading(userId);
        try {
            await updateUserRole(userId, newRole, token);
            await refetchUsers();
        } catch (error) {
            const errorMessage = extractErrorMessage(error, "Role could not be updated");
            setError(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreateUser = async (payload: {
        name: string;
        surname: string;
        email: string;
        password: string;
        role: User["role"];
        companyName?: string;
        productGroup?: ProductGroup;
        phone?: string | null;
    }) => {
        if (!token) return;
        setActionLoading("create");
        try {
            // For CLIENT users, automatically assign the default price list if available
            const userPayload = {
                ...payload,
                priceListId: payload.role === "CLIENT" && defaultList ? defaultList.id : undefined
            };
            
            await createUser(userPayload, token);
            await refetchUsers();
        } catch (error) {
            const errorMessage = extractErrorMessage(error, "User could not be created");
            setError(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateChefProductGroup = async (chefId: string, productGroup: ProductGroup) => {
        if (!token) return;
        setActionLoading(chefId);
        try {
            await updateChefProductGroupByAdmin(chefId, productGroup, token);
            await refetchUsers();
        } catch (error) {
            const errorMessage = extractErrorMessage(error, "Chef product group could not be updated");
            setError(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const categorizedUsers = useMemo(
        () => ({
            admins: Array.isArray(users) ? users.filter((u) => u.role === "ADMIN") : [],
            clients: Array.isArray(users) ? users.filter((u) => u.role === "CLIENT") : [],
            chefs: Array.isArray(chefs) ? chefs : [], // Artık ayrı endpoint'ten geliyor
            drivers: Array.isArray(users) ? users.filter((u) => u.role === "DRIVER") : [],
            distributors: Array.isArray(users) ? users.filter((u) => u.role === "DISTRIBUTOR") : [],
        }),
        [users, chefs]
    );

    return {
        ...categorizedUsers,
        loading,
        error,
        actionLoading,
        currentUser,
        pagination,
        currentPage,
        customerSummary,
        onActivate: handleActivate,
        onDeactivate: handleDeactivate,
        onRoleChange: handleRoleChange,
        onCreateUser: handleCreateUser,
        onUpdateChefProductGroup: handleUpdateChefProductGroup,
        onPageChange: handlePageChange,
    };
};
