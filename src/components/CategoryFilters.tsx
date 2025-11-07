"use client";
import { Box, Chip, Typography } from "@mui/material";
import { Category } from "../services/catalogService";
import { Favorite, Restaurant } from "@mui/icons-material";
import React from "react";

interface CategoryFiltersProps {
    categories: Category[];
    selectedCategoryId: string | null;
    onSelectCategory: (id: string | null) => void;
    showFavoritesOnly?: boolean;
    onToggleFavorites?: () => void;
}

export const CategoryFilters = React.memo(
    ({
        categories,
        selectedCategoryId,
        onSelectCategory,
        showFavoritesOnly = false,
        onToggleFavorites,
    }: CategoryFiltersProps) => (
        <Box mb={4}>
            <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 2, color: "text.primary" }}>
                Categories
            </Typography>
            <Box
                display="flex"
                flexWrap="wrap"
                gap={1.5}
                sx={{
                    "& .MuiChip-root": {
                        height: 40,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                    },
                }}>
                <Chip
                    icon={<Restaurant />}
                    label="All Items"
                    variant={
                        selectedCategoryId === null && !showFavoritesOnly
                            ? "filled"
                            : "outlined"
                    }
                    onClick={() => onSelectCategory(null)}
                    color={
                        selectedCategoryId === null && !showFavoritesOnly
                            ? "primary"
                            : "default"
                    }
                    clickable
                    sx={{
                        backgroundColor:
                            selectedCategoryId === null && !showFavoritesOnly
                                ? "primary.main"
                                : "transparent",
                        color:
                            selectedCategoryId === null && !showFavoritesOnly
                                ? "white"
                                : "text.primary",
                        borderColor:
                            selectedCategoryId === null && !showFavoritesOnly
                                ? "primary.main"
                                : "grey.300",
                        "&:hover": {
                            backgroundColor:
                                selectedCategoryId === null &&
                                !showFavoritesOnly
                                    ? "primary.dark"
                                    : "grey.100",
                        },
                    }}
                />

                {onToggleFavorites && (
                    <Chip
                        icon={<Favorite />}
                        label="Favorites"
                        variant={showFavoritesOnly ? "filled" : "outlined"}
                        onClick={onToggleFavorites}
                        color={showFavoritesOnly ? "secondary" : "default"}
                        clickable
                        sx={{
                            backgroundColor: showFavoritesOnly
                                ? "secondary.main"
                                : "transparent",
                            color: showFavoritesOnly ? "black" : "text.primary",
                            borderColor: showFavoritesOnly
                                ? "secondary.main"
                                : "grey.300",
                            "&:hover": {
                                backgroundColor: showFavoritesOnly
                                    ? "secondary.dark"
                                    : "grey.100",
                            },
                        }}
                    />
                )}

                {categories.map((category) => (
                    <Chip
                        key={category.id}
                        label={category.name}
                        variant={
                            selectedCategoryId === category.id &&
                            !showFavoritesOnly
                                ? "filled"
                                : "outlined"
                        }
                        onClick={() => onSelectCategory(category.id)}
                        color={
                            selectedCategoryId === category.id &&
                            !showFavoritesOnly
                                ? "primary"
                                : "default"
                        }
                        clickable
                        sx={{
                            backgroundColor:
                                selectedCategoryId === category.id &&
                                !showFavoritesOnly
                                    ? "primary.main"
                                    : "transparent",
                            color:
                                selectedCategoryId === category.id &&
                                !showFavoritesOnly
                                    ? "white"
                                    : "text.primary",
                            borderColor:
                                selectedCategoryId === category.id &&
                                !showFavoritesOnly
                                    ? "primary.main"
                                    : "grey.300",
                            "&:hover": {
                                backgroundColor:
                                    selectedCategoryId === category.id &&
                                    !showFavoritesOnly
                                        ? "primary.dark"
                                        : "grey.100",
                            },
                        }}
                    />
                ))}
            </Box>
        </Box>
    )
);

CategoryFilters.displayName = "CategoryFilters";
