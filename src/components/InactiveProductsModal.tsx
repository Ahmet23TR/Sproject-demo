"use client";
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Alert,
} from "@mui/material";
import {
    Warning as WarningIcon,
    Close as CloseIcon,
    ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";

interface InactiveProduct {
    id: string;
    name: string;
    quantity: number;
    unit: string;
}

interface InactiveProductsModalProps {
    open: boolean;
    onClose: () => void;
    inactiveProducts: InactiveProduct[];
    activeProductsCount: number;
    onProceedWithActive: () => void;
}

export const InactiveProductsModal: React.FC<InactiveProductsModalProps> = ({
    open,
    onClose,
    inactiveProducts,
    activeProductsCount,
    onProceedWithActive,
}) => {
    const getUnitDisplay = (unit: string) => {
        switch (unit) {
            case 'KG': return 'kg';
            case 'PIECE': return 'pc';
            case 'TRAY': return 'tray';
            default: return unit;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                },
            }}>
            <DialogContent sx={{ p: 0, position: "relative" }}>
                {/* Header with close button */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 1,
                    }}>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(10px)",
                            "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 1)",
                                transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease-in-out",
                        }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Warning header */}
                <Box
                    sx={{
                        bgcolor: "warning.main",
                        background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                        color: "white",
                        p: 4,
                        textAlign: "center",
                        position: "relative",
                        overflow: "hidden",
                    }}>
                    <WarningIcon sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h5" fontWeight={600} mb={1}>
                        Some Products Are No Longer Available
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        The following products from your previous order are no longer active and cannot be added to your cart.
                    </Typography>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3 }}>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight={500}>
                            {inactiveProducts.length} product{inactiveProducts.length > 1 ? 's' : ''} cannot be added to your cart.
                            {activeProductsCount > 0 && ` ${activeProductsCount} active product${activeProductsCount > 1 ? 's' : ''} will be added.`}
                        </Typography>
                    </Alert>

                    {/* Inactive products list */}
                    <Typography variant="h6" fontWeight={600} mb={2} color="text.secondary">
                        Inactive Products:
                    </Typography>
                    <List dense sx={{ mb: 3 }}>
                        {inactiveProducts.map((product) => (
                            <ListItem key={product.id} sx={{ bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" fontWeight={500}>
                                            {product.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.secondary">
                                            {product.quantity} {getUnitDisplay(product.unit)}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>

                    {activeProductsCount > 0 && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                You can still add the remaining product{activeProductsCount > 1 ? 's' : ''} to your cart.
                            </Typography>
                        </Alert>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{ minWidth: 120 }}
                >
                    Cancel
                </Button>
                {activeProductsCount > 0 && (
                    <Button
                        onClick={onProceedWithActive}
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        sx={{ minWidth: 200 }}
                    >
                        Add Active Products to Cart
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
