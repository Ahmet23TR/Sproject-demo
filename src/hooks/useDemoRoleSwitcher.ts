import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { DEMO_MODE, DEMO_USERS, type DemoUserInfo } from "@/config/demo";
import { login as authLogin } from "@/services/authService";

interface UseDemoRoleSwitcherReturn {
    isDemoMode: boolean;
    demoUsers: DemoUserInfo[];
    currentUserEmail: string | null;
    switchRole: (email: string) => Promise<void>;
    isSwitching: boolean;
}

export function useDemoRoleSwitcher(): UseDemoRoleSwitcherReturn {
    const { user } = useAuth();
    const [isSwitching, setIsSwitching] = useState(false);

    const switchRole = useCallback(
        async (email: string) => {
            if (!DEMO_MODE) {
                console.warn("Role switching is only available in demo mode");
                return;
            }

            const targetUser = DEMO_USERS.find((u) => u.email === email);
            if (!targetUser) {
                console.error(`Demo user not found: ${email}`);
                return;
            }

            setIsSwitching(true);
            try {
                // Determine target dashboard first
                const dashboardPaths: Record<string, string> = {
                    ADMIN: "/admin/dashboard",
                    CLIENT: "/client/dashboard",
                    CHEF: "/chef/dashboard",
                    DRIVER: "/driver/dashboard",
                    DISTRIBUTOR: "/distributor/summary",
                };
                
                const targetPath = dashboardPaths[targetUser.role] || "/";
                
                // Login with the new user
                const response = await authLogin({
                    identifier: targetUser.email,
                    password: targetUser.password,
                });
                
                // Clear old session data first
                localStorage.removeItem("token");
                
                // Set new token directly to localStorage
                localStorage.setItem("token", response.token);
                
                // Force a full page reload to the target dashboard
                // This ensures all contexts are reset with the new user
                window.location.href = targetPath;
            } catch (error) {
                console.error("Failed to switch role:", error);
                setIsSwitching(false);
            }
            // Note: We don't set isSwitching to false here because we're doing a full page reload
        },
        [] // No dependencies needed since we're doing a full page reload
    );

    return {
        isDemoMode: DEMO_MODE,
        demoUsers: DEMO_USERS,
        currentUserEmail: user?.email || null,
        switchRole,
        isSwitching,
    };
}
