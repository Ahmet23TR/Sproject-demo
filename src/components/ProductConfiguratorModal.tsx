import React from "react";
import { Box, Typography, Modal, Button, Alert, Divider } from "@mui/material";
import { Product } from "../services/productService";
import { useProductConfigurator } from "../hooks/order/useProductConfigurator";
import { OptionGroupDisplay } from "./OptionGroupDisplay";
import CloseIcon from "@mui/icons-material/Close";

interface ProductConfiguratorModalProps {
    open: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function ProductConfiguratorModal({
    open,
    onClose,
    product,
}: ProductConfiguratorModalProps) {
    const {
        selectedOptions,
        error,
        handleOptionChange,
        handleAddToCart,
        calculatePrice,
    } = useProductConfigurator(product, onClose);

    if (!product) return null;

    // Zorunlu opsiyonların seçilip seçilmediğini kontrol et
    const isRequiredOptionsSelected = () => {
        if (!product.optionGroups || product.optionGroups.length === 0)
            return true;

        for (const group of product.optionGroups) {
            if (group.isRequired) {
                if (
                    !selectedOptions[group.id] ||
                    selectedOptions[group.id].length === 0
                ) {
                    return false;
                }
            }
        }
        return true;
    };

    const canAddToCart = isRequiredOptionsSelected(); // Sadece zorunlu opsiyonlar seçildiğinde aktif olsun

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: {
                        xs: "calc(100vw - 32px)", // Mobile: full width minus safe padding
                        sm: "calc(100vw - 64px)", // Small tablets: full width minus safe padding
                        md: 480, // Desktop: fixed 480px width
                    },
                    maxWidth: {
                        xs: "calc(100vw - 32px)",
                        sm: "calc(100vw - 64px)",
                        md: 600, // Maximum width on larger screens
                    },
                    maxHeight: {
                        xs: "90vh", // Mobile: 90% of viewport height
                        sm: "85vh", // Small tablets: 85% of viewport height
                        md: "80vh", // Desktop: 80% of viewport height
                    },
                    bgcolor: "background.default", // Use white background from theme
                    boxShadow:
                        "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    p: {
                        xs: 2, // Mobile: smaller padding
                        sm: 3, // Small tablets: medium padding
                        md: 4, // Desktop: original padding
                    },
                    borderRadius: 2, // Use theme's border radius (16px)
                    overflow: "auto",
                }}>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={2}
                    color="text.primary" // Use theme's primary text color
                    sx={{
                        fontSize: {
                            xs: "1.1rem", // Smaller font on mobile
                            sm: "1.25rem", // Medium font on tablets
                            md: "1.25rem", // Original size on desktop
                        },
                    }}>
                    {product.name} Select
                </Typography>

                <CloseIcon
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        cursor: "pointer",
                    }}
                />

                <Divider sx={{ my: 2 }} />

                {!product.optionGroups || product.optionGroups.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                            This product has no options to configure.
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}>
                            You can add it directly to your cart.
                        </Typography>
                    </Box>
                ) : (
                    (product.optionGroups || []).map((group) => (
                        <OptionGroupDisplay
                            key={group.id}
                            group={group}
                            selectedValue={selectedOptions[group.id] || []}
                            onChange={handleOptionChange}
                        />
                    ))
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Divider sx={{ my: 2, borderColor: "divider" }} />

                {/* Ürün fiyatı gösterimi */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: {
                            xs: "column", // Stack vertically on mobile
                            sm: "row", // Side by side on tablets and up
                        },
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: {
                            xs: 1, // Spacing between stacked items on mobile
                            sm: 0, // No gap when side by side
                        },
                        p: {
                            xs: 1.5, // Smaller padding on mobile
                            sm: 2, // Original padding on tablets and up
                        },
                        bgcolor: "secondary.main", // Use theme's gold color
                        color: "primary.main", // Use black text on gold background
                        borderRadius: 2, // Use theme's border radius
                        mb: 2,
                        textAlign: {
                            xs: "center", // Center text on mobile
                            sm: "left", // Left align on tablets and up
                        },
                        border: "1px solid",
                        borderColor: "secondary.main",
                    }}>
                    <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{
                            fontSize: {
                                xs: "1rem", // Smaller on mobile
                                sm: "1.25rem", // Original size on tablets and up
                            },
                        }}>
                        Product Price:
                    </Typography>
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{
                            fontSize: {
                                xs: "1.5rem", // Smaller on mobile
                                sm: "2rem", // Original size on tablets and up
                            },
                        }}>
                        {calculatePrice.toFixed(2)} AED
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    color="primary" // Use theme's primary button styling (black)
                    fullWidth
                    onClick={handleAddToCart}
                    sx={{
                        mt: 2,
                        height: {
                            xs: 48, // Taller button for better mobile touch target
                            sm: 40, // Standard height on tablets and up
                        },
                        fontSize: {
                            xs: "1rem", // Larger text on mobile
                            sm: "0.875rem", // Standard size on tablets and up
                        },
                        fontWeight: 500, // Use theme's button font weight
                        borderRadius: 2, // Use theme's border radius
                        textTransform: "none", // Use theme's text transform
                        "&:disabled": {
                            bgcolor: "grey.300",
                            color: "grey.500",
                        },
                    }}
                    disabled={!canAddToCart}>
                    Add to Cart
                </Button>
            </Box>
        </Modal>
    );
}
