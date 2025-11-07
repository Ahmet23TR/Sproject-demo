"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Alert,
    CircularProgress,
    Modal,
    IconButton,
} from "@mui/material";
import { useProductDetail } from "../../../../hooks/admin/useProductDetail";
import ProductEditForm from "./components/ProductEditForm";
import ProductOptionsSection from "./components/ProductOptionsSection";
import ProductImageSection from "./components/ProductImageSection";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function AdminProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [optionsModalOpen, setOptionsModalOpen] = useState(false);

    const {
        product,
        loading,
        error,
        saving,
        formData,
        isFormDirty,
        handleFormChange,
        handleImageChange,
        handleImageUpload,
        handleImageDelete,
        handleSaveProduct,
        handleDeleteProduct,
    } = useProductDetail(id);

    const handleBackToProducts = () => {
        router.push("/admin/products");
    };

    const handleOpenOptionsModal = () => {
        setOptionsModalOpen(true);
    };

    const handleCloseOptionsModal = () => {
        setOptionsModalOpen(false);
    };

    if (loading) {
        return (
            <ProtectedRoute requiredRole="ADMIN">
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="400px">
                    <CircularProgress />
                </Box>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute requiredRole="ADMIN">
                <Box sx={{ p: 4 }}>
                    <Alert severity="error">{error}</Alert>
                    <Button
                        variant="outlined"
                        onClick={handleBackToProducts}
                        sx={{ mt: 2 }}
                        startIcon={<ArrowBackIcon />}>
                        Back to Products
                    </Button>
                </Box>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", mx: "auto" }}>
                {/* Header with breadcrumbs and actions */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={3}>
                    <Box>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ mb: 1 }}>
                            {product?.name || "Product Details"}
                        </Typography>
                    </Box>

                    <Box display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            onClick={handleOpenOptionsModal}
                            startIcon={<SettingsIcon />}>
                            Manage Options
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveProduct}
                            disabled={!isFormDirty || saving}
                            startIcon={<SaveIcon />}
                            sx={{
                                minWidth: 120,
                                opacity: isFormDirty ? 1 : 0.6,
                            }}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
                    {/* Left Column - Product Image and Basic Info */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={1}
                            sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                            <ProductImageSection
                                product={product}
                                onImageChange={handleImageChange}
                                uploadHandler={handleImageUpload}
                                deleteHandler={handleImageDelete}
                            />
                        </Paper>
                    </Grid>

                    {/* Right Column - Product Form and Options */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                mb: 3,
                                height: "100%",
                            }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ mb: 3 }}>
                                Product Information
                            </Typography>
                            <ProductEditForm
                                formData={formData}
                                onChange={handleFormChange}
                                onDelete={handleDeleteProduct}
                            />
                        </Paper>
                    </Grid>
                </Grid>

                {/* Product Options Modal */}
                <Modal
                    open={optionsModalOpen}
                    onClose={handleCloseOptionsModal}
                    aria-labelledby="product-options-modal">
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: { xs: "95vw", sm: 500, md: 600 },
                            height: { xs: "85vh", sm: "80vh", md: "75vh" },
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}>
                        {/* Modal Header - Fixed */}
                        <Box
                            sx={{
                                p: 3,
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                flexShrink: 0,
                            }}>
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between">
                                <Typography variant="h6" fontWeight={600}>
                                    {product?.name}
                                </Typography>
                                <IconButton
                                    onClick={handleCloseOptionsModal}
                                    sx={{ borderRadius: 1 }}>
                                    <CloseRoundedIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Modal Content - Scrollable */}
                        <Box
                            sx={{
                                p: 3,
                                flex: 1,
                                overflow: "auto",
                                "&::-webkit-scrollbar": {
                                    width: "8px",
                                },
                                "&::-webkit-scrollbar-track": {
                                    backgroundColor: "#f1f1f1",
                                    borderRadius: "4px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "#c1c1c1",
                                    borderRadius: "4px",
                                    "&:hover": {
                                        backgroundColor: "#a8a8a8",
                                    },
                                },
                            }}>
                            <ProductOptionsSection product={product} />
                        </Box>
                    </Box>
                </Modal>
            </Box>
        </ProtectedRoute>
    );
}
