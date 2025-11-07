import {
    Box,
    Typography,
    TextField,
    Alert,
    Paper,
    IconButton,
    Button,
    Collapse,
    Divider,
} from "@mui/material";
import { LoadingButton } from "../../../../components/ui/LoadingButton";
import { useCart } from "../../../../context/CartContext";
import { useOrderForm } from "../../../../hooks/order/useOrderForm";
import { Product } from "../../../../services/catalogService";
import { CartItem, CartItemRef } from "./CartItem";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import NoteAddIcon from "@mui/icons-material/NoteAdd";

import React from "react";
import { SuccessOrderModal } from "../../../../components/SuccessOrderModal";
import type { CartItemPayload } from "../../../../context/CartContext";
import { calculateProductPrice } from "../../../../utils/price";

interface ShoppingCartProps {
    variant?: "page" | "drawer";
}

export const ShoppingCart = React.memo(
    ({ variant = "page" }: ShoppingCartProps) => {
        const { cart, error: cartError } = useCart();
        const {
            orderNote,
            setOrderNote,
            loading,
            error,
            setError,
            success,
            handleSubmit,
            showSuccessModal,
            closeSuccessModal,
            createdOrder,
        } = useOrderForm();
        const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
        const [cartProducts, setCartProducts] = useState<Product[]>([]);
        const [previewUrl, setPreviewUrl] = useState<string | null>(null);

        // Progressive disclosure state
        const [showNotesField, setShowNotesField] = useState(false);
        const [showFileUpload, setShowFileUpload] = useState(false);

        // Cart expansion state
        const [isCartExpanded, setIsCartExpanded] = useState(false);
        const maxItemsToShow = 4;

        // Auto-show fields if they have content
        React.useEffect(() => {
            if (orderNote && orderNote.length > 0) {
                setShowNotesField(true);
            } else if (!orderNote) {
                // Don't auto-hide if user manually opened it
                // Field will be hidden by close button or success reset
            }
        }, [orderNote]);

        React.useEffect(() => {
            if (attachmentFile) {
                setShowFileUpload(true);
            } else if (!attachmentFile) {
                // Don't auto-hide if user manually opened it
                // Field will be hidden by close button or success reset
            }
        }, [attachmentFile]);

        const cartItemRefs = useRef<Map<string, CartItemRef>>(new Map());

        const handleNewItemAdded = useCallback((addedItem: CartItemPayload) => {
            const uniqueKey = `${
                addedItem.productId
            }-${addedItem.selectedOptionItemIds.sort().join("-")}`;

            setTimeout(() => {
                const cartItemRef = cartItemRefs.current.get(uniqueKey);
                if (cartItemRef) {
                    cartItemRef.focusInput();
                }
            }, 100);
        }, []);

        React.useEffect(() => {
            (
                window as typeof window & {
                    __cartItemAddedCallback?: (item: CartItemPayload) => void;
                }
            ).__cartItemAddedCallback = handleNewItemAdded;

            return () => {
                delete (
                    window as typeof window & {
                        __cartItemAddedCallback?: (
                            item: CartItemPayload
                        ) => void;
                    }
                ).__cartItemAddedCallback;
            };
        }, [handleNewItemAdded]);

        useEffect(() => {
            if (success) {
                setAttachmentFile(null);
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                }
                // Reset progressive disclosure state
                setShowNotesField(false);
                setShowFileUpload(false);
            }
        }, [success, previewUrl]);

        useEffect(() => {
            return () => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            };
        }, [previewUrl]);

        useEffect(() => {
            // Cart item'larından product bilgilerini çıkar
            const productsFromCart = cart
                .filter((item) => item.product) // product bilgisi olan item'ları filtrele
                .map((item) => ({
                    id: item.product!.id,
                    name: item.product!.name,
                    description: item.product!.description || null,
                    imageUrl: item.product!.imageUrl || null,
                    isActive: item.product!.isActive || true,
                    unit: item.product!.unit || "PIECE",
                    categoryId: null,
                    category: null,
                    productGroup: item.product!.productGroup || "SWEETS",
                    basePrice: 0,
                    optionGroups:
                        item.product!.optionGroups?.map((group) => ({
                            id: group.id,
                            name: group.name,
                            isRequired: group.isRequired,
                            allowMultiple: group.allowMultiple,
                            items: group.items.map((groupItem) => ({
                                id: groupItem.id,
                                name: groupItem.name,
                                price:
                                    typeof groupItem.price === "string"
                                        ? parseFloat(groupItem.price)
                                        : groupItem.price,
                                multiplier: groupItem.multiplier,
                            })),
                        })) || [],
                }));

            setCartProducts(productsFromCart);
        }, [cart]);

        const totalCartPrice = useMemo(() => {
            return cart.reduce((total, item) => {
                // 1) Prefer backend retail snapshots if available
                if (typeof item.retailTotalPrice === 'number') {
                    return total + item.retailTotalPrice;
                }
                if (typeof item.retailUnitPrice === 'number') {
                    return total + item.retailUnitPrice * item.quantity;
                }
                // 2) Then prefer legacy totals if present (backward compatibility)
                if (typeof item.totalPrice === 'number') {
                    return total + item.totalPrice;
                }
                if (typeof item.unitPrice === 'number') {
                    return total + item.unitPrice * item.quantity;
                }

                // 3) Otherwise compute from current product catalog snapshot (already resolved per user)
                const product = cartProducts.find(
                    (p) => p.id === item.productId
                );
                if (product) {
                    const groupNameSelected: {
                        [groupName: string]: string | string[];
                    } = {};

                    if (item.selectedOptionItemIds.length > 0) {
                        product.optionGroups?.forEach((group) => {
                            const selectedItems = group.items.filter(
                                (groupItem) =>
                                    item.selectedOptionItemIds.includes(
                                        groupItem.id
                                    )
                            );

                            if (selectedItems.length > 0) {
                                const selectedNames = selectedItems.map(
                                    (groupItem) => groupItem.name
                                );
                                groupNameSelected[group.name] =
                                    group.allowMultiple
                                        ? selectedNames
                                        : selectedNames[0];
                            }
                        });
                    }

                    const itemPrice = calculateProductPrice(
                        product,
                        groupNameSelected
                    );
                    return total + itemPrice * item.quantity;
                }

                return total;
            }, 0);
        }, [cart, cartProducts]);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                // Validate file type according to backend specification
                const allowedTypes = [
                    // Images
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/gif",
                    "image/webp",
                    // Documents
                    "application/pdf",
                    "application/msword", // .doc
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                    "text/plain", // .txt
                ];

                if (!allowedTypes.includes(file.type)) {
                    setError(
                        "File type not allowed! Only images, PDFs, Word documents, and text files are permitted."
                    );
                    return;
                }

                // Validate file size (10MB limit as per backend spec)
                if (file.size > 10 * 1024 * 1024) {
                    setError("File size cannot exceed 10MB.");
                    return;
                }

                // Clear any previous error
                setError(null);

                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }

                // Only create preview for images
                if (file.type.startsWith("image/")) {
                    const newPreviewUrl = URL.createObjectURL(file);
                    setPreviewUrl(newPreviewUrl);
                } else {
                    setPreviewUrl(null);
                }

                setAttachmentFile(file);
            }
        };
        const handleRemoveFile = () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            setAttachmentFile(null);
        };

        const handleOrderSubmit = () => {
            handleSubmit(attachmentFile);
        };

        const isDrawer = variant === "drawer";

        return (
            <>
                <Paper
                    elevation={isDrawer ? 0 : 2}
                    sx={{
                        position: isDrawer ? "static" : { lg: "sticky" },
                        top: isDrawer ? "auto" : { lg: 24 },
                        p: isDrawer ? 0 : 2,
                        borderRadius: isDrawer ? 0 : 3,
                        bgcolor: "background.paper",
                        boxShadow: isDrawer ? "none" : undefined,
                        height: isDrawer ? "auto" : undefined,
                        display: isDrawer ? "flex" : "block",
                        flexDirection: isDrawer ? "column" : undefined,
                    }}>
                    {!isDrawer && (
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                            sx={{ fontSize: "1.1rem", mb: 1.5 }}>
                            Shopping Cart
                        </Typography>
                    )}

                    <Box
                        sx={{
                            p: isDrawer ? 0 : 0,
                            flex: isDrawer ? 1 : undefined,
                            display: isDrawer ? "flex" : "block",
                            flexDirection: isDrawer ? "column" : undefined,
                            minHeight: 0,
                        }}>
                        {cartError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {cartError}
                            </Alert>
                        )}

                        {cart.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 3 }}>
                                <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    color="text.secondary"
                                    gutterBottom>
                                    Your cart is empty
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: "0.875rem" }}>
                                    Add some products to get started
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        maxHeight: isDrawer
                                            ? "none"
                                            : isCartExpanded
                                            ? "80vh"
                                            : 280,
                                        overflowY: isDrawer
                                            ? "visible"
                                            : "auto",
                                        mb: 1,
                                        pr: 0.5,
                                        transition:
                                            "max-height 0.3s ease-in-out",
                                    }}>
                                    {(isDrawer || isCartExpanded
                                        ? cart
                                        : cart.slice(0, maxItemsToShow)
                                    ).map((cartItem) => {
                                        const product = cartProducts.find(
                                            (p: Product) =>
                                                p.id === cartItem.productId
                                        );
                                        const uniqueKey = `${
                                            cartItem.productId
                                        }-${cartItem.selectedOptionItemIds
                                            .sort()
                                            .join("-")}`;
                                        return (
                                            <CartItem
                                                key={uniqueKey}
                                                ref={(ref) => {
                                                    if (ref) {
                                                        cartItemRefs.current.set(
                                                            uniqueKey,
                                                            ref
                                                        );
                                                    } else {
                                                        cartItemRefs.current.delete(
                                                            uniqueKey
                                                        );
                                                    }
                                                }}
                                                item={cartItem}
                                                product={product}
                                            />
                                        );
                                    })}
                                </Box>

                                {/* Show More/Show Less Button - Only show for page variant when cart has more than maxItemsToShow items */}
                                {!isDrawer && cart.length > maxItemsToShow && (
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            mt: 1,
                                            mb: 1,
                                        }}>
                                        <Button
                                            variant="text"
                                            onClick={() =>
                                                setIsCartExpanded(
                                                    !isCartExpanded
                                                )
                                            }
                                            sx={{
                                                fontSize: "0.875rem",
                                                color: "primary.main",
                                                textTransform: "none",
                                                fontWeight: 500,
                                                "&:hover": {
                                                    backgroundColor:
                                                        "rgba(0, 0, 0, 0.04)",
                                                },
                                            }}>
                                            {isCartExpanded
                                                ? "Show Less"
                                                : `Show ${
                                                      cart.length -
                                                      maxItemsToShow
                                                  } More Items...`}
                                        </Button>
                                    </Box>
                                )}
                            </>
                        )}

                        {/* Divider after cart items */}
                        {cart.length > 0 && (
                            <Divider
                                sx={{
                                    my: 2,
                                    borderColor: "rgba(0, 0, 0, 0.08)",
                                }}
                            />
                        )}

                        {/* Optional Actions Section - Progressive Disclosure */}
                        <Box sx={{ mb: 2 }}>
                            {/* Available Action Links */}
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 3,
                                    py: 1,
                                    mb:
                                        showNotesField ||
                                        Boolean(orderNote) ||
                                        showFileUpload ||
                                        attachmentFile
                                            ? 2
                                            : 0,
                                }}>
                                {/* Add Note Link - show if not expanded and no content */}
                                {!showNotesField && !orderNote && (
                                    <Button
                                        variant="text"
                                        startIcon={<NoteAddIcon />}
                                        onClick={() => setShowNotesField(true)}
                                        sx={{
                                            color: "text.secondary",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                            textTransform: "none",
                                            p: 0,
                                            minWidth: "auto",
                                            "&:hover": {
                                                bgcolor: "transparent",
                                                color: "secondary.main",
                                            },
                                            transition:
                                                "color 0.2s ease-in-out",
                                        }}>
                                        Add a Note
                                    </Button>
                                )}

                                {/* Add File Link - show if not expanded and no file */}
                                {!showFileUpload && !attachmentFile && (
                                    <Button
                                        variant="text"
                                        startIcon={<AddIcon />}
                                        onClick={() => setShowFileUpload(true)}
                                        sx={{
                                            color: "text.secondary",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                            textTransform: "none",
                                            p: 0,
                                            minWidth: "auto",
                                            "&:hover": {
                                                bgcolor: "transparent",
                                                color: "secondary.main",
                                            },
                                            transition:
                                                "color 0.2s ease-in-out",
                                        }}>
                                        Attach a File
                                    </Button>
                                )}
                            </Box>

                            {/* Notes Field - shown when expanded or has content */}
                            <Collapse
                                in={
                                    showNotesField ||
                                    Boolean(orderNote && orderNote.length > 0)
                                }>
                                <Box
                                    sx={{
                                        mb:
                                            showFileUpload || attachmentFile
                                                ? 2
                                                : 0,
                                    }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            sx={{ fontSize: "0.9rem" }}>
                                            Notes
                                        </Typography>
                                        {/* Close button - only show if no content */}
                                        {!orderNote && (
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setShowNotesField(false)
                                                }
                                                sx={{
                                                    color: "text.secondary",
                                                    p: 0.5,
                                                    "&:hover": {
                                                        color: "error.main",
                                                        bgcolor:
                                                            "rgba(239, 68, 68, 0.1)",
                                                    },
                                                }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Box sx={{ position: "relative" }}>
                                        <TextField
                                            value={orderNote}
                                            onChange={(e) =>
                                                setOrderNote(e.target.value)
                                            }
                                            fullWidth
                                            multiline
                                            rows={2}
                                            placeholder="Add any special instructions..."
                                            autoFocus={
                                                showNotesField && !orderNote
                                            }
                                            sx={{
                                                "& .MuiInputBase-root": {
                                                    borderRadius: 2,
                                                    bgcolor: "grey.50",
                                                    fontSize: "0.8rem",
                                                    pr: orderNote ? 5 : 1.5, // Add padding for clear button
                                                },
                                                "& .MuiInputBase-input": {
                                                    fontSize: "0.8rem",
                                                },
                                                "& .MuiOutlinedInput-notchedOutline":
                                                    {
                                                        borderColor: "grey.300",
                                                    },
                                                "&:hover .MuiOutlinedInput-notchedOutline":
                                                    {
                                                        borderColor:
                                                            "secondary.main",
                                                    },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                                    {
                                                        borderColor:
                                                            "secondary.main",
                                                    },
                                            }}
                                        />
                                        {/* Clear note button */}
                                        {orderNote && (
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setOrderNote("");
                                                    setShowNotesField(false);
                                                }}
                                                sx={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                    color: "text.secondary",
                                                    backgroundColor:
                                                        "background.paper",
                                                    width: 20,
                                                    height: 20,
                                                    "&:hover": {
                                                        color: "error.main",
                                                        backgroundColor:
                                                            "rgba(239, 68, 68, 0.1)",
                                                    },
                                                }}>
                                                <CloseIcon
                                                    sx={{ fontSize: 14 }}
                                                />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            </Collapse>

                            {/* File Upload Field - shown when expanded or has file */}
                            <Collapse in={showFileUpload || !!attachmentFile}>
                                <Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            mb: 1.5,
                                        }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            sx={{ fontSize: "1rem" }}>
                                            Add Files
                                        </Typography>
                                        {/* Close button - only show if no file */}
                                        {!attachmentFile && (
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setShowFileUpload(false)
                                                }
                                                sx={{
                                                    color: "text.secondary",
                                                    p: 0.5,
                                                    "&:hover": {
                                                        color: "error.main",
                                                        bgcolor:
                                                            "rgba(239, 68, 68, 0.1)",
                                                    },
                                                }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<InsertDriveFileIcon />}
                                        fullWidth
                                        sx={{
                                            borderRadius: 2,
                                            p: 1.5,
                                            borderColor: "grey.300",
                                            color: "text.secondary",
                                            bgcolor: "grey.50",
                                            borderStyle: "dashed",
                                            "&:hover": {
                                                borderColor: "secondary.main",
                                                bgcolor:
                                                    "rgba(201, 162, 39, 0.1)",
                                                color: "secondary.main",
                                            },
                                        }}>
                                        Click to upload files (Images, PDF,
                                        Word, Text)
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt"
                                            hidden
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                </Box>
                            </Collapse>
                            {attachmentFile && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        mt: 2,
                                        p: 2,
                                        bgcolor: "rgba(22, 163, 74, 0.1)",
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: "rgba(22, 163, 74, 0.3)",
                                    }}>
                                    {attachmentFile.type.startsWith(
                                        "image/"
                                    ) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={
                                                previewUrl ||
                                                URL.createObjectURL(
                                                    attachmentFile
                                                )
                                            }
                                            alt="Preview"
                                            style={{
                                                width: 40,
                                                height: 40,
                                                objectFit: "cover",
                                                borderRadius: 8,
                                                border: "1px solid #e0e0e0",
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor:
                                                    "rgba(59, 130, 246, 0.1)",
                                                borderRadius: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                            <InsertDriveFileIcon
                                                fontSize="small"
                                                sx={{ color: "#3B82F6" }}
                                            />
                                        </Box>
                                    )}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            sx={{ fontSize: "0.875rem" }}>
                                            {attachmentFile.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary">
                                            {(
                                                attachmentFile.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={handleRemoveFile}
                                        sx={{
                                            color: "error.main",
                                            bgcolor: "rgba(239, 68, 68, 0.1)",
                                            "&:hover": {
                                                bgcolor:
                                                    "rgba(239, 68, 68, 0.2)",
                                            },
                                        }}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {success}
                            </Alert>
                        )}

                        {/* Divider before total section */}
                        {cart.length > 0 && (
                            <Divider
                                sx={{
                                    my: 2,
                                    borderColor: "rgba(0, 0, 0, 0.08)",
                                }}
                            />
                        )}

                        {/* Bottom Actions - Fixed at bottom for drawer */}
                        <Box
                            sx={{
                                mt: isDrawer ? "auto" : 0,
                                flexShrink: 0,
                                pt: isDrawer ? 2 : 0,
                                borderTop:
                                    isDrawer && cart.length > 0
                                        ? "1px solid"
                                        : "none",
                                borderColor: isDrawer
                                    ? "grey.200"
                                    : "transparent",
                            }}>
                            {/* Toplam Fiyat - Complete Order butonunun hemen üstünde */}
                            {cart.length > 0 && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: 2,
                                        borderRadius: 2,
                                        mb: 2,
                                    }}>
                                    <Typography
                                        variant="body1"
                                        fontWeight={600}
                                        color="#2D2D2D"
                                        sx={{
                                            fontSize: "1.6rem",
                                            mb: 0.5,
                                        }}>
                                        Total
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        fontWeight={800}
                                        color="#2D2D2D"
                                        sx={{ fontSize: "1.5rem" }}>
                                        AED {totalCartPrice.toFixed(2)}
                                    </Typography>
                                </Box>
                            )}

                            <LoadingButton
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{
                                    py: 2.5,
                                    fontWeight: 600,
                                    fontSize: "1.1rem",
                                    borderRadius: 3,
                                    bgcolor: "#CBA135",
                                    color: "#2D2D2D",
                                    boxShadow:
                                        "0 4px 12px rgba(203, 161, 53, 0.3)",
                                    "&:hover": {
                                        bgcolor: "#B8941E",
                                        boxShadow:
                                            "0 6px 16px rgba(203, 161, 53, 0.4)",
                                    },
                                    "&:disabled": {
                                        bgcolor: "grey.300",
                                        color: "grey.500",
                                        boxShadow: "none",
                                    },
                                }}
                                onClick={handleOrderSubmit}
                                loading={loading}
                                disabled={cart.length === 0}
                                loadingLabel="🛒 Completing Order...">
                                Complete Order
                            </LoadingButton>
                        </Box>
                    </Box>
                </Paper>

                <SuccessOrderModal
                    open={showSuccessModal}
                    onClose={closeSuccessModal}
                    orderNumber={createdOrder?.orderNumber}
                />
            </>
        );
    }
);

ShoppingCart.displayName = "ShoppingCart";
