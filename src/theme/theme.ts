import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#000000", // Siyah - Premium brand color
        },
        secondary: {
            main: "#C9A227", // Altın - Accent/CTA color
        },
        error: {
            main: "#EF4444", // Kırmızı - Error state
        },
        warning: {
            main: "#F59E0B", // Amber - Warning state
        },
        success: {
            main: "#16A34A", // Yeşil - Success state
        },
        info: {
            main: "#3B82F6", // Mavi - Info state
        },
        background: {
            default: "#FFFFFF", // Beyaz - Ana arka plan
            paper: "#F5F5F5", // Açık gri - Kart arka planları
        },
        text: {
            primary: "#111827", // Gri-siyah - Ana yazılar (göz yormayan)
            secondary: "#9CA3AF", // Gri orta - Secondary text
        },
        divider: "#9CA3AF",
        grey: {
            50: "#F9FAFB",
            100: "#F5F5F5", // Açık gri
            200: "#E5E7EB", // Skeleton/Loading
            300: "#D1D5DB",
            400: "#9CA3AF", // Gri orta
            500: "#6B7280",
            600: "#4B5563",
            700: "#374151",
            800: "#1E1E1E", // Gri koyu - Hover states
            900: "#111827", // Ana yazı rengi
        },
    },
    typography: {
        fontFamily:
            '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h1: { fontWeight: 600, letterSpacing: -0.5, color: "#2D2D2D" },
        h2: { fontWeight: 600, letterSpacing: -0.5, color: "#2D2D2D" },
        h3: { fontWeight: 500, color: "#2D2D2D" },
        h4: { fontWeight: 500, color: "#2D2D2D" },
        h5: { fontWeight: 500, color: "#2D2D2D" },
        h6: { fontWeight: 400, color: "#2D2D2D" },
        body1: { fontWeight: 400, color: "#2D2D2D" },
        body2: { fontWeight: 400, color: "#B0B0B0" },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 16,
                    fontWeight: 500,
                    boxShadow: "none",
                    padding: "12px 24px",
                    fontSize: "16px",
                    "&:hover": {
                        boxShadow: "none",
                    },
                },
                containedPrimary: {
                    backgroundColor: "#000000",
                    color: "#FFFFFF",
                    "&:hover": {
                        backgroundColor: "#1E1E1E",
                    },
                },
                containedSecondary: {
                    backgroundColor: "#C9A227",
                    color: "#000000",
                    "&:hover": {
                        backgroundColor: "#E0C097",
                    },
                },
                outlined: {
                    borderColor: "#9CA3AF",
                    color: "#111827",
                    "&:hover": {
                        borderColor: "#000000",
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                },
                text: {
                    color: "#111827",
                    "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 16,
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                            borderColor: "#9CA3AF",
                        },
                        "&:hover fieldset": {
                            borderColor: "#111827",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#C9A227",
                            borderWidth: 2,
                        },
                    },
                    "& .MuiInputLabel-root": {
                        color: "#9CA3AF",
                        transform: "translate(14px, -9px) scale(0.75)",
                        "&.Mui-focused": {
                            color: "#C9A227",
                        },
                        "&.MuiFormLabel-filled": {
                            transform: "translate(14px, -9px) scale(0.75)",
                        },
                        "&.MuiInputLabel-shrink": {
                            transform: "translate(14px, -9px) scale(0.75)",
                        },
                    },
                    "& .MuiInputLabel-outlined": {
                        transform: "translate(14px, -9px) scale(0.75)",
                        "&.MuiInputLabel-shrink": {
                            transform: "translate(14px, -9px) scale(0.75)",
                        },
                    },
                },
            },
            defaultProps: {
                InputLabelProps: {
                    shrink: true,
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    backgroundColor: "#FFFFFF",
                    "& fieldset": {
                        borderColor: "#9CA3AF",
                    },
                    "&:hover fieldset": {
                        borderColor: "#111827",
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: "#C9A227",
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#9CA3AF",
                    transform: "translate(14px, -9px) scale(0.75)",
                    "&.Mui-focused": {
                        color: "#C9A227",
                    },
                    "&.MuiFormLabel-filled": {
                        transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "&.MuiInputLabel-shrink": {
                        transform: "translate(14px, -9px) scale(0.75)",
                    },
                },
                outlined: {
                    transform: "translate(14px, -9px) scale(0.75)",
                    "&.MuiInputLabel-shrink": {
                        transform: "translate(14px, -9px) scale(0.75)",
                    },
                },
            },
        },
        MuiFormControl: {
            defaultProps: {
                variant: "outlined" as const,
            },
            styleOverrides: {
                root: {
                    "& .MuiInputLabel-root": {
                        transform: "translate(14px, -9px) scale(0.75)",
                        "&.MuiInputLabel-shrink": {
                            transform: "translate(14px, -9px) scale(0.75)",
                        },
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
                standardError: {
                    backgroundColor: "#FEF2F2",
                    color: "#EF4444",
                    "& .MuiAlert-icon": {
                        color: "#EF4444",
                    },
                },
                standardSuccess: {
                    backgroundColor: "#F0FDF4",
                    color: "#16A34A",
                    "& .MuiAlert-icon": {
                        color: "#16A34A",
                    },
                },
                standardWarning: {
                    backgroundColor: "#FFFBEB",
                    color: "#F59E0B",
                    "& .MuiAlert-icon": {
                        color: "#F59E0B",
                    },
                },
                standardInfo: {
                    backgroundColor: "#EFF6FF",
                    color: "#3B82F6",
                    "& .MuiAlert-icon": {
                        color: "#3B82F6",
                    },
                },
            },
        },
    },
});

export default theme;
