// src/app/login/components/LoginForm.tsx
import {
    Box,
    TextField,
    Typography,
    Alert,
    InputAdornment,
    Paper,
    IconButton,
} from "@mui/material";
import Link from "next/link";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { LoadingButton } from "../../../components/ui/LoadingButton";

interface LoginFormProps {
    form: { identifier: string; password: string };
    loading: boolean;
    error: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: FormEvent) => void;
}

export const LoginForm = ({
    form,
    loading,
    error,
    onChange,
    onSubmit,
}: LoginFormProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const phoneRegex = /^\+971\d{7,12}$/;

    // Kullanıcının girdiği değere göre telefon/email modunu belirle
    const currentInput = form.identifier || "";
    const isPhone =
        !!currentInput &&
        !currentInput.includes("@") &&
        !/[a-zA-Z]/.test(currentInput);
    const isIdentifierValid = !isPhone || phoneRegex.test(form.identifier);

    // Email için tam değeri, telefon için sadece yerel kısmı göster
    const displayValue = isPhone
        ? (form.identifier || "").replace(/^\+971/, "")
        : form.identifier;

    const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;

        // Email girişi kontrolü - @ içeriyorsa veya harf içeriyorsa email olarak kabul et
        const containsAtSign = raw.includes("@");
        const containsLetters = /[a-zA-Z]/.test(raw);
        const looksLikeEmail = containsAtSign || containsLetters;

        if (looksLikeEmail) {
            // Email girişi - direkt olarak raw değeri kullan (tüm karakterlere izin ver)
            onChange({
                target: { name: "identifier", value: raw },
            } as unknown as ChangeEvent<HTMLInputElement>);
            return;
        }

        // Telefon girişi - sadece rakamları al ve +971 ekle
        const digitsOnly = raw.replace(/\D/g, "");
        const limited = digitsOnly.slice(0, 12);
        const full = limited ? `+971${limited}` : "";
        onChange({
            target: { name: "identifier", value: full },
        } as unknown as ChangeEvent<HTMLInputElement>);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFFFFF",
                p: 1,
            }}>
            {/* Left side - Logo/Branding */}
            <Box
                sx={{
                    position: "absolute",
                    top: 40,
                    left: 40,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}></Box>

            {/* Main Form Container */}
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 420,
                    width: "100%",
                    p: 5,
                    borderRadius: 3,
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 20px 60px rgba(17, 24, 39, 0.08)",
                    border: "1px solid rgba(156, 163, 175, 0.1)",
                }}>
                {/* Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 600,
                            color: "#111827",
                            mb: 1,
                            fontSize: "28px",
                        }}>
                        Welcome back!
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "#9CA3AF",
                            fontSize: "16px",
                        }}>
                        Login to your account
                    </Typography>
                </Box>

                <form method="post" action="/api/auth/login" onSubmit={onSubmit} style={{ width: "100%" }}>
                    {/* Email/Phone Input */}
                    <TextField
                        placeholder="Email Address"
                        name="identifier_display"
                        type="text"
                        value={displayValue}
                        onChange={handleIdentifierChange}
                        fullWidth
                        required
                        sx={{ mb: 3 }}
                        inputProps={
                            isPhone
                                ? { inputMode: "tel", maxLength: 12 }
                                : undefined
                        }
                        error={!isIdentifierValid}
                        helperText={
                            !isIdentifierValid
                                ? "Enter valid phone number (7-12 digits)"
                                : undefined
                        }
                        FormHelperTextProps={{
                            sx: { color: "#EF4444" },
                        }}
                        InputProps={{
                            startAdornment: isPhone ? (
                                <InputAdornment position="start">
                                    +971
                                </InputAdornment>
                            ) : (
                                <InputAdornment position="start">
                                    <Email
                                        sx={{ color: "#9CA3AF", fontSize: 20 }}
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {/* Hidden canonical identifier for non-JS POST fallback */}
                    <input type="hidden" name="identifier" value={form.identifier} />

                    {/* Password Input */}
                    <TextField
                        placeholder="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={onChange}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock
                                        sx={{ color: "#9CA3AF", fontSize: 20 }}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        edge="end"
                                        sx={{ color: "#9CA3AF" }}>
                                        {showPassword ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Error Message */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                backgroundColor: "#FEF2F2",
                                color: "#EF4444",
                                border: "1px solid rgba(239, 68, 68, 0.1)",
                            }}>
                            {error}
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        loading={loading}
                        loadingLabel="Signing in..."
                        sx={{
                            height: 56,
                            fontSize: "16px",
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: "none",
                            backgroundColor: loading ? "#9CA3AF" : "#C9A227",
                            color: "#000000",
                            boxShadow: "0 4px 16px rgba(201, 162, 39, 0.3)",
                            "&:hover": {
                                backgroundColor: "#E0C097",
                                boxShadow: "0 6px 20px rgba(201, 162, 39, 0.4)",
                            },
                            "&:disabled": {
                                backgroundColor: "#9CA3AF",
                                color: "#FFFFFF",
                                boxShadow: "none",
                            },
                        }}>
                        Login
                    </LoadingButton>

                    {/* Sign Up Link */}
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                style={{ textDecoration: "none" }}>
                                <Typography
                                    component="span"
                                    sx={{
                                        color: "#C9A227",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        "&:hover": {
                                            color: "#E0C097",
                                        },
                                    }}>
                                    Sign Up
                                </Typography>
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};
