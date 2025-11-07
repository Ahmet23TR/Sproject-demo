"use client";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCart } from "../../../../context/CartContext";
import { Product } from "../../../../services/productService";
import type { CartItem as CartItemType } from "../../../../context/CartContext";
import {
    useState,
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle,
    useMemo,
} from "react";
import { calculateProductPrice } from "../../../../utils/price";

interface CartItemProps {
    item: CartItemType;
    product?: Product;
}

export interface CartItemRef {
    focusInput: () => void;
}

export const CartItem = forwardRef<CartItemRef, CartItemProps>(
    ({ item, product }, ref) => {
        const { updateQuantity, removeFromCart } = useCart();
        const inputRef = useRef<HTMLInputElement>(null);

        const [inputValue, setInputValue] = useState(item.quantity.toString());
        const [inputError, setInputError] = useState<string | null>(null);

        useImperativeHandle(
            ref,
            () => ({
                focusInput: () => {
                    if (inputRef.current) {
                        inputRef.current.focus();
                        inputRef.current.select();
                    }
                },
            }),
            []
        );

        useEffect(() => {
            setInputValue(item.quantity.toString());
            setInputError(null);
        }, [item.quantity]);

        const calculateItemPrice = useMemo(() => {
            // Prefer backend retail snapshot if present
            const retailUnit = item.retailUnitPrice;
            if (typeof retailUnit === 'number') return retailUnit;
            // Frontend hesaplamasını fallback olarak kullan (multiplier dahil)
            if (!product) return 0;

            const groupNameSelected: {
                [groupName: string]: string | string[];
            } = {};

            if (item.selectedOptionItemIds.length > 0) {
                product.optionGroups?.forEach((group) => {
                    const selectedItems = group.items.filter((groupItem) =>
                        item.selectedOptionItemIds.includes(groupItem.id)
                    );

                    if (selectedItems.length > 0) {
                        const selectedNames = selectedItems.map(
                            (groupItem) => groupItem.name
                        );
                        groupNameSelected[group.name] = group.allowMultiple
                            ? selectedNames
                            : selectedNames[0];
                    }
                });
            }

            return calculateProductPrice(product, groupNameSelected);
        }, [product, item]);

        // Note: frontendMultiplier no longer used

        const unitPrice = calculateItemPrice;
        const totalPrice = item.retailTotalPrice !== undefined
            ? item.retailTotalPrice
            : unitPrice * item.quantity; // Frontend fallback

        if (!product) return null;

        const selectedOptionNames = product.optionGroups
            ?.flatMap((group) =>
                group.items
                    .filter((optItem) =>
                        item.selectedOptionItemIds.includes(optItem.id)
                    )
                    .map((optItem) => optItem.name)
            )
            .join(", ");

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputError(null);
            setInputValue(e.target.value);
        };

        const handleBlur = () => {
            const newQuantity = parseInt(inputValue, 10);

            // Ondalıklı sayı kontrolü - inputValue ile parseInt sonucu aynı olmalı
            if (
                !isNaN(newQuantity) &&
                newQuantity > 0 &&
                inputValue === newQuantity.toString()
            ) {
                setInputError(null);
                updateQuantity(
                    item.productId,
                    item.selectedOptionItemIds,
                    newQuantity
                );
            } else if (inputValue.includes(".")) {
                setInputError("Only whole numbers allowed");
            } else {
                setInputError("Minimum 1 piece");
            }
        };

        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    p: 1.5,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.200",
                    mb: 1,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    minHeight: 68,
                    "&:hover": {
                        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    },
                }}>
                {/* Ürün Resmi */}
                <Box
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        overflow: "hidden",
                        flexShrink: 0,
                        bgcolor: "grey.100",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                    {product.imageUrl ? (
                        <Box
                            component="img"
                            src={product.imageUrl}
                            alt={product.name}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}>
                            📷
                        </Typography>
                    )}
                </Box>

                {/* Ürün Bilgileri - Two-line Layout */}
                <Box
                    flex={1}
                    minWidth={0}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.25,
                    }}>
                    {/* Top Line: Product Name */}
                    <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{
                            fontSize: "0.875rem",
                            lineHeight: 1.3,
                            wordWrap: "break-word",
                        }}>
                        {product.name}
                    </Typography>

                    {/* Bottom Line: Selected Options */}
                    {selectedOptionNames && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.3,
                                wordWrap: "break-word",
                            }}>
                            {selectedOptionNames}
                        </Typography>
                    )}

                    {/* Fiyat - Mobilde ürün adının altında */}
                    <Typography
                        variant="body1"
                        fontWeight={700}
                        color="secondary.main"
                        sx={{
                            fontSize: "0.875rem",
                            mt: 0.25,
                            display: { xs: "block", sm: "none" },
                        }}>
                        AED {totalPrice}
                    </Typography>
                </Box>

                {/* Miktar Kontrolleri - Kompakt */}
                <Box
                    display="flex"
                    alignItems="center"
                    gap={0.25}
                    sx={{
                        bgcolor: "grey.50",
                        borderRadius: 1.5,
                        p: 0.25,
                        border: "1px solid",
                        borderColor: "grey.200",
                        flexShrink: 0,
                        alignSelf: "center",
                    }}>
                    <IconButton
                        size="small"
                        onClick={() => {
                            if (item.quantity === 1) {
                                removeFromCart(
                                    item.productId,
                                    item.selectedOptionItemIds
                                );
                            } else {
                                updateQuantity(
                                    item.productId,
                                    item.selectedOptionItemIds,
                                    item.quantity - 1
                                );
                            }
                        }}
                        sx={{
                            color: "secondary.main",
                            bgcolor: "rgba(201, 162, 39, 0.1)",
                            width: 24,
                            height: 24,
                            "&:hover": {
                                bgcolor: "rgba(201, 162, 39, 0.2)",
                            },
                        }}>
                        <RemoveCircleOutlineIcon sx={{ fontSize: "16px" }} />
                    </IconButton>

                    <TextField
                        type="number"
                        size="small"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={!!inputError}
                        helperText={inputError}
                        inputProps={{
                            min: 1,
                            style: { textAlign: "center", width: 32 },
                            ref: inputRef,
                        }}
                        sx={{
                            width: 45,
                            "& .MuiInputBase-root": {
                                fontSize: "0.75rem",
                                bgcolor: "white",
                                fontWeight: 600,
                                height: 24,
                            },
                            "& .MuiInputBase-input": {
                                textAlign: "center",
                                p: "2px 4px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                            },
                        }}
                    />

                    <IconButton
                        size="small"
                        onClick={() =>
                            updateQuantity(
                                item.productId,
                                item.selectedOptionItemIds,
                                item.quantity + 1
                            )
                        }
                        sx={{
                            color: "secondary.main",
                            bgcolor: "rgba(201, 162, 39, 0.1)",
                            width: 24,
                            height: 24,
                            "&:hover": {
                                bgcolor: "rgba(201, 162, 39, 0.2)",
                            },
                        }}>
                        <AddCircleOutlineIcon sx={{ fontSize: "16px" }} />
                    </IconButton>
                </Box>

                {/* Toplam Fiyat - Desktop için sağda */}
                <Box
                    textAlign="right"
                    minWidth={60}
                    sx={{
                        display: { xs: "none", sm: "block" },
                        flexShrink: 0,
                        alignSelf: "center",
                    }}>
                    <Typography
                        variant="body1"
                        fontWeight={700}
                        color="secondary.main"
                        sx={{ fontSize: "0.875rem" }}>
                        AED {totalPrice}
                    </Typography>
                </Box>

                {/* Silme Butonu */}
                <IconButton
                    size="small"
                    onClick={() =>
                        removeFromCart(
                            item.productId,
                            item.selectedOptionItemIds
                        )
                    }
                    sx={{
                        color: "error.main",
                        bgcolor: "rgba(239, 68, 68, 0.1)",
                        width: 28,
                        height: 28,
                        flexShrink: 0,
                        alignSelf: "center",
                        "&:hover": {
                            bgcolor: "rgba(239, 68, 68, 0.2)",
                        },
                    }}>
                    <DeleteIcon sx={{ fontSize: "16px" }} />
                </IconButton>
            </Box>
        );
    }
);

CartItem.displayName = "CartItem";
