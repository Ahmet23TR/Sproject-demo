"use client";
import { Box, Snackbar, Alert, CircularProgress } from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLoginForm } from "../../hooks/auth/useLoginForm";
import { useAuth } from "../../context/AuthContext";
import { LoginForm } from "./components/LoginForm";

export const dynamic = "force-dynamic";

function LoginContent() {
    const { form, loading, error, handleChange, handleSubmit } = useLoginForm();
    const { resetIntentionalLogout } = useAuth();
    const searchParams = useSearchParams();
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        // Reset intentional logout flag when user reaches login page
        resetIntentionalLogout();

        const reason = searchParams.get("reason");
        if (reason === "auth_required") {
            setNotification("You need to log in to view that page.");
        }
    }, [searchParams, resetIntentionalLogout]);

    return (
        <>
            <LoginForm
                form={form}
                loading={loading}
                error={error}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />

            <Snackbar
                open={!!notification}
                autoHideDuration={6000}
                onClose={() => setNotification(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setNotification(null)}
                    severity="info"
                    sx={{
                        width: "100%",
                        borderRadius: 2,
                        backgroundColor: '#EFF6FF',
                        color: '#3B82F6',
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                    }}
                >
                    {notification}
                </Alert>
            </Snackbar>
        </>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "100vh",
                    }}
                >
                    <CircularProgress />
                </Box>
            }
        >
            <LoginContent />
        </Suspense>
    );
}
