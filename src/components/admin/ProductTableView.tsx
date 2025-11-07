// src/components/admin/ProductTableView.tsx
import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Avatar,
    IconButton,
    Checkbox,
    Box,
    Typography,
    Tooltip,
} from "@mui/material";
import {
    ToggleOn as ToggleOnIcon,
    ToggleOff as ToggleOffIcon,
} from "@mui/icons-material";
import { Product } from "../../services/productService";

interface ProductTableViewProps {
    products: Product[];
    selectedProducts?: string[];
    onSelectProduct?: (productId: string) => void;
    onSelectAll?: (selected: boolean) => void;
    onToggleStatus?: (product: Product) => void;
    onView?: (product: Product) => void;
}

export const ProductTableView: React.FC<ProductTableViewProps> = ({
    products,
    selectedProducts = [],
    onSelectProduct,
    onSelectAll,
    onToggleStatus,
    onView,
}) => {
    const allSelected =
        products.length > 0 && selectedProducts.length === products.length;
    const someSelected =
        selectedProducts.length > 0 &&
        selectedProducts.length < products.length;

    const handleSelectAll = () => {
        if (onSelectAll) {
            onSelectAll(!allSelected);
        }
    };

    if (products.length === 0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 8,
                    color: "#6B7280",
                }}>
                <Typography variant="h6">No products found</Typography>
            </Box>
        );
    }

    return (
        <TableContainer
            component={Paper}
            sx={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                        {(onSelectProduct || onSelectAll) && (
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={someSelected}
                                    checked={allSelected}
                                    onChange={handleSelectAll}
                                    sx={{
                                        "&.Mui-checked, &.MuiCheckbox-indeterminate":
                                            {
                                                color: "#3B82F6",
                                            },
                                    }}
                                />
                            </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                            Product
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                            Category
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                            Unit
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                            Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                            Group
                        </TableCell>
                        {onToggleStatus && (
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: "#374151",
                                    textAlign: "center",
                                }}>
                                Actions
                            </TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => {
                        const handleRowClick = (e: React.MouseEvent) => {
                            // Prevent row click when clicking on action buttons or checkboxes
                            if (
                                (e.target as HTMLElement).closest("button") ||
                                (e.target as HTMLElement).closest(
                                    ".MuiCheckbox-root"
                                )
                            ) {
                                e.stopPropagation();
                                return;
                            }
                            if (onView) {
                                onView(product);
                            }
                        };

                        return (
                            <TableRow
                                key={product.id}
                                onClick={handleRowClick}
                                sx={{
                                    "&:hover": {
                                        backgroundColor: "#F9FAFB",
                                    },
                                    borderBottom: "1px solid #F3F4F6",
                                    cursor: "pointer",
                                }}>
                                {(onSelectProduct || onSelectAll) && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={selectedProducts.includes(
                                                product.id
                                            )}
                                            onChange={() =>
                                                onSelectProduct?.(product.id)
                                            }
                                            sx={{
                                                "&.Mui-checked": {
                                                    color: "#3B82F6",
                                                },
                                            }}
                                        />
                                    </TableCell>
                                )}

                                {/* Product Info */}
                                <TableCell>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={2}>
                                        <Avatar
                                            src={product.imageUrl || undefined}
                                            alt={product.name}
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                backgroundColor: "#F3F4F6",
                                                color: "#6B7280",
                                            }}>
                                            {product.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#111827",
                                                    mb: 0.5,
                                                }}>
                                                {product.name}
                                            </Typography>
                                            {product.description && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "#6B7280",
                                                        display: "block",
                                                        maxWidth: 200,
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}>
                                                    {product.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </TableCell>

                                {/* Category */}
                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#374151" }}>
                                        {product.category?.name || (
                                            <span
                                                style={{
                                                    color: "#EF4444",
                                                    fontStyle: "italic",
                                                }}>
                                                Uncategorized
                                            </span>
                                        )}
                                    </Typography>
                                </TableCell>

                                {/* Unit */}
                                <TableCell>
                                    <Chip
                                        label={product.unit}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            backgroundColor: "white",
                                            color: "#6B7280",
                                            fontWeight: 500,
                                            border: "1px solid #D1D5DB",
                                        }}
                                    />
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <Chip
                                        label={
                                            product.isActive
                                                ? "Active"
                                                : "Inactive"
                                        }
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            backgroundColor: "white",
                                            color: product.isActive
                                                ? "#16A34A"
                                                : "#EF4444",
                                            fontWeight: 500,
                                            border: `1px solid ${
                                                product.isActive
                                                    ? "#16A34A"
                                                    : "#EF4444"
                                            }`,
                                        }}
                                    />
                                </TableCell>

                                {/* Product Group */}
                                <TableCell>
                                    <Chip
                                        label={product.productGroup}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            backgroundColor:
                                                product.productGroup ===
                                                "SWEETS"
                                                    ? "#F9F5E8" // Altın'ın çok açık tonu
                                                    : "#F1F3F5", // Gri'nin çok açık tonu (BAKERY ve diğerleri)
                                            color: "#2D2D2D", // Charcoal
                                            fontWeight: 500,
                                            border: `1px solid ${
                                                product.productGroup ===
                                                "SWEETS"
                                                    ? "#CBA135" // Muted Gold
                                                    : "#B0B0B0" // Ash Gray
                                            }`,
                                            "&:hover": {
                                                backgroundColor:
                                                    product.productGroup ===
                                                    "SWEETS"
                                                        ? "#F5F0E0" // Biraz daha koyu altın tonu
                                                        : "#EAECEF", // Biraz daha koyu gri tonu
                                                borderColor:
                                                    product.productGroup ===
                                                    "SWEETS"
                                                        ? "#B8922F" // Daha koyu muted gold
                                                        : "#9A9A9A", // Daha koyu ash gray
                                            },
                                        }}
                                    />
                                </TableCell>

                                {/* Actions */}
                                {onToggleStatus && (
                                    <TableCell>
                                        <Box
                                            display="flex"
                                            justifyContent="center"
                                            gap={0.5}>
                                            <Tooltip
                                                title={
                                                    product.isActive
                                                        ? "Deactivate Product"
                                                        : "Activate Product"
                                                }
                                                arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        onToggleStatus(product)
                                                    }
                                                    sx={{
                                                        color: product.isActive
                                                            ? "#16A34A"
                                                            : "#EF4444",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                product.isActive
                                                                    ? "#FEF2F2"
                                                                    : "#F0FDF4",
                                                        },
                                                    }}>
                                                    {product.isActive ? (
                                                        <ToggleOnIcon fontSize="large" />
                                                    ) : (
                                                        <ToggleOffIcon fontSize="large" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
