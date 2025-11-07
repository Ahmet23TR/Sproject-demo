
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { User } from "../types/data";

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
    isIntentionalLogout: boolean;
    resetIntentionalLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isIntentionalLogout, setIsIntentionalLogout] = useState(false);

    const updateUserFromToken = (tokenToDecode: string) => {
        try {
            const decoded: unknown = jwtDecode(tokenToDecode);
            const safeDecoded = decoded as Partial<User> & { id?: string; role?: User['role']; isActive?: boolean } & Record<string, unknown>;
            // DÜZELTME 2: User objesini oluştururken yeni alanları da token'dan okuyalım
            const decodedExtras = safeDecoded as {
                companyName?: string;
                address?: string;
                productGroup?: string;
                assignedDistributorId?: string | null;
                priceListId?: string | null;
            };
            setUser({
                id: String(safeDecoded.id || ''),
                email: String((safeDecoded as { email?: string }).email || ''),
                name: String((safeDecoded as { name?: string }).name || ''),
                surname: String((safeDecoded as { surname?: string }).surname || ''),
                role: (safeDecoded.role as User['role']) || 'CLIENT',
                isActive: Boolean(safeDecoded.isActive),
                companyName: decodedExtras.companyName ?? '',
                address: decodedExtras.address ?? null,
                productGroup: decodedExtras.productGroup as User['productGroup'] || undefined,
                assignedDistributorId: decodedExtras.assignedDistributorId ?? null,
                priceListId: decodedExtras.priceListId ?? null,
            });
        } catch {
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
        }
    };

    useEffect(() => {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (storedToken) {
            setToken(storedToken);
            updateUserFromToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (newToken: string) => {
        setIsIntentionalLogout(false);
        setToken(newToken);
        localStorage.setItem("token", newToken);
        updateUserFromToken(newToken);
    };

    const logout = () => {
        setIsIntentionalLogout(true);
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };

    const resetIntentionalLogout = () => {
        setIsIntentionalLogout(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isIntentionalLogout, resetIntentionalLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
