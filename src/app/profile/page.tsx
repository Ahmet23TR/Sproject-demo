"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
    Box,
    Typography,
    Button,
    Divider,
    Avatar,
    CircularProgress,
    Alert,
    Paper,
    Fade,
} from "@mui/material";
import { useState } from "react";
import { useUserProfile } from "../../hooks/auth/useUserProfile";
import { UserProfileForm } from "./components/UserProfileForm";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import SecurityIcon from "@mui/icons-material/Security";

export default function ProfilePage() {
    const {
        profile,
        form,
        loading,
        updating,
        error,
        success,
        isDirty,
        handleChange,
        handleSubmit,
    } = useUserProfile();
    const [pwModalOpen, setPwModalOpen] = useState(false);

    const initials =
        (
            (profile?.name?.[0] ?? "") + (profile?.surname?.[0] ?? "")
        ).toUpperCase() || undefined;

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="60vh"
                flexDirection="column"
                gap={2}>
                <CircularProgress
                    size={48}
                    thickness={4}
                    sx={{ color: "secondary.main" }}
                />
                <Typography variant="body2" color="text.secondary">
                    Loading your profile...
                </Typography>
            </Box>
        );
    }

    return (
        <ProtectedRoute>
            <Box
                maxWidth={1200}
                mx="auto"
                my={{ xs: 2, md: 4 }}
                px={{ xs: 2, md: 3 }}
                sx={{
                    background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    minHeight: "calc(100vh - 200px)",
                    borderRadius: { xs: 0, md: 3 },
                }}>
                {error && (
                    <Fade in={!!error}>
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 3,
                                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                            }}>
                            {error}
                        </Alert>
                    </Fade>
                )}

                {/* Profile Header Card */}
                <Paper
                    elevation={0}
                    sx={{
                        mb: 3,
                        borderRadius: 4,
                        background:
                            "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                        position: "relative",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background:
                                "linear-gradient(90deg, #C9A227 0%, #E0C097 100%)",
                        },
                    }}>
                    <Box p={{ xs: 3, md: 4 }}>
                        <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            alignItems={{ xs: "center", sm: "flex-start" }}
                            gap={3}
                            mb={4}>
                            {/* Avatar Section */}
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                position="relative">
                                <Avatar
                                    sx={{
                                        width: 88,
                                        height: 88,
                                        background:
                                            "linear-gradient(135deg, #C9A227 0%, #E0C097 100%)",
                                        fontSize: "2rem",
                                        fontWeight: 600,
                                        boxShadow:
                                            "0 8px 24px rgba(201, 162, 39, 0.25)",
                                        border: "4px solid rgba(255,255,255,0.9)",
                                    }}>
                                    {initials}
                                </Avatar>
                            </Box>

                            {/* User Info */}
                            <Box
                                flex={1}
                                textAlign={{ xs: "center", sm: "left" }}>
                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    sx={{
                                        mb: 0.5,
                                        letterSpacing: -0.5,
                                        color: "#111827",
                                    }}>
                                    {profile?.name} {profile?.surname}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ mb: 2, fontWeight: 500 }}>
                                    {profile?.email}
                                </Typography>
                            </Box>

                            {/* Action Button */}
                            <Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<SecurityIcon />}
                                    onClick={() => setPwModalOpen(true)}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.5,
                                        fontWeight: 600,
                                        textTransform: "none",
                                        borderColor: "rgba(0,0,0,0.12)",
                                        color: "#111827",
                                        "&:hover": {
                                            borderColor: "#C9A227",
                                            backgroundColor:
                                                "rgba(201, 162, 39, 0.04)",
                                            transform: "translateY(-1px)",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.1)",
                                        },
                                        transition: "all 0.2s ease-in-out",
                                    }}>
                                    Change Password
                                </Button>
                            </Box>
                        </Box>

                        <Divider
                            sx={{ mb: 4, borderColor: "rgba(0,0,0,0.06)" }}
                        />

                        {profile && (
                            <UserProfileForm
                                form={form}
                                profile={profile}
                                success={success}
                                error={null}
                                loading={updating}
                                isDirty={isDirty}
                                onChange={handleChange}
                                onSubmit={handleSubmit}
                            />
                        )}
                    </Box>
                </Paper>
            </Box>

            <ChangePasswordModal
                open={pwModalOpen}
                onClose={() => setPwModalOpen(false)}
            />
        </ProtectedRoute>
    );
}
