// src/app/register/components/RegistrationForm.tsx
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    Paper,
    IconButton,
} from "@mui/material";
import Link from "next/link";
import React, { ChangeEvent, FormEvent, useState } from "react";
import {
    Visibility,
    VisibilityOff,
    Person,
    Email,
    Lock,
} from "@mui/icons-material";

interface RegistrationFormData {
    name: string;
    surname: string;
    email: string;
    password: string;
    confirmPassword: string;
    companyName?: string;
    address?: string | null;
    phone?: string | null;
}

interface RegistrationFormProps {
    form: RegistrationFormData;
    loading: boolean;
    error: string;
    success: string;
    formErrors?: { email?: string };
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: FormEvent) => void;
}

export const RegistrationForm = ({
    form,
    loading,
    error,
    success,
    formErrors,
    onChange,
    onSubmit,
}: RegistrationFormProps) => {
    // Track which fields have been touched by the user
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
        {}
    );
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(form.email);
    const isPasswordValid = form.password.length >= 6;
    const isPasswordMatch = form.password === form.confirmPassword;

    // Only show validation errors if field has been touched or form has been submitted
    // But don't show errors if registration was successful
    const shouldShowError = (fieldName: string) => {
        if (success) return false; // Hide all validation errors when success message is shown
        return touchedFields[fieldName] || isSubmitted;
    };

    const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Mark field as touched when user starts typing
        if (!touchedFields[e.target.name]) {
            setTouchedFields((prev) => ({ ...prev, [e.target.name]: true }));
        }
        onChange(e);
    };

    const handleFormSubmit = (e: FormEvent) => {
        setIsSubmitted(true);
        onSubmit(e);
    };

    // Reset touched fields when success is shown (form is cleared)
    React.useEffect(() => {
        if (success) {
            setTouchedFields({});
            setIsSubmitted(false);
        }
    }, [success]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFFFFF",
                p: 2,
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
                        Get Started
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "#9CA3AF",
                            fontSize: "16px",
                        }}>
                        Create your account in seconds
                    </Typography>
                </Box>

                <form onSubmit={handleFormSubmit} style={{ width: "100%" }}>
                    {/* Name Fields */}
                    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                        <TextField
                            placeholder="First Name"
                            name="name"
                            value={form.name}
                            onChange={handleFieldChange}
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person
                                            sx={{
                                                color: "#9CA3AF",
                                                fontSize: 20,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: "56px",
                                    fontSize: "16px",
                                },
                            }}
                        />
                        <TextField
                            placeholder="Last Name"
                            name="surname"
                            value={form.surname}
                            onChange={handleFieldChange}
                            fullWidth
                            required
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: "56px",
                                    fontSize: "16px",
                                },
                            }}
                        />
                    </Box>

                    {/* Email */}
                    <TextField
                        placeholder="Email Address"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleFieldChange}
                        fullWidth
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email
                                        sx={{ color: "#9CA3AF", fontSize: 20 }}
                                    />
                                </InputAdornment>
                            ),
                        }}
                        error={
                            shouldShowError("email") &&
                            (!isEmailValid || Boolean(formErrors?.email))
                        }
                        helperText={
                            formErrors?.email ||
                            (shouldShowError("email") && !isEmailValid
                                ? "Please enter a valid email address"
                                : undefined)
                        }
                        FormHelperTextProps={{
                            sx: { color: "#EF4444" },
                        }}
                    />

                    {/* Password Fields */}
                    <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                        <TextField
                            placeholder="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={handleFieldChange}
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock
                                            sx={{
                                                color: "#9CA3AF",
                                                fontSize: 20,
                                            }}
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
                            error={
                                shouldShowError("password") && !isPasswordValid
                            }
                            helperText={
                                shouldShowError("password") && !isPasswordValid
                                    ? "Min 6 characters"
                                    : undefined
                            }
                            FormHelperTextProps={{
                                sx: { color: "#EF4444" },
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: "56px",
                                    fontSize: "16px",
                                },
                            }}
                        />
                        <TextField
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={handleFieldChange}
                            fullWidth
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            edge="end"
                                            sx={{ color: "#9CA3AF" }}>
                                            {showConfirmPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            error={
                                shouldShowError("confirmPassword") &&
                                !isPasswordMatch &&
                                form.confirmPassword.length > 0
                            }
                            helperText={
                                shouldShowError("confirmPassword") &&
                                !isPasswordMatch &&
                                form.confirmPassword.length > 0
                                    ? "Passwords do not match"
                                    : undefined
                            }
                            FormHelperTextProps={{
                                sx: { color: "#EF4444" },
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: "56px",
                                    fontSize: "16px",
                                },
                            }}
                        />
                    </Box>

                    {/* Error/Success Messages */}
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
                    {success && (
                        <Alert
                            severity="success"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                backgroundColor: "#F0FDF4",
                                color: "#16A34A",
                                border: "1px solid rgba(22, 163, 74, 0.1)",
                            }}>
                            {success}
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={
                            loading ||
                            !isEmailValid ||
                            !isPasswordValid ||
                            !isPasswordMatch ||
                            !form.name.trim() ||
                            !form.surname.trim()
                        }
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
                        {loading ? (
                            <CircularProgress
                                size={24}
                                sx={{ color: "#FFFFFF" }}
                            />
                        ) : (
                            "Create Account"
                        )}
                    </Button>

                    {/* Additional Info Note */}
                    <Box sx={{ textAlign: "center", mt: 2, mb: 3 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: "#9CA3AF", fontSize: "14px" }}>
                            We&apos;ll help you complete your profile after
                            registration
                        </Typography>
                    </Box>

                    {/* Login Link */}
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                            Already have an account?{" "}
                            <Link
                                href="/login"
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
                                    Sign In
                                </Typography>
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};
