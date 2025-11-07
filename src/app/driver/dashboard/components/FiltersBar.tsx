"use client";
import React from "react";
import { Box, Select, MenuItem, FormControl } from "@mui/material";

interface FiltersBarProps {
    tabValue: number; // 0: all, 1: pending, 2: completed
    onChangeTab: (value: number) => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
    tabValue,
    onChangeTab,
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                gap: { xs: 1, sm: 2 },
                mb: 2,
                alignItems: "center",
                justifyContent: "flex-start",
                flexWrap: "nowrap",
            }}>
            <FormControl
                size="small"
                sx={{
                    minWidth: { xs: 150, sm: 200 },
                    width: { xs: 150, sm: 200 },
                }}>
                <Select
                    value={tabValue}
                    onChange={(event) =>
                        onChangeTab(event.target.value as number)
                    }
                    sx={{
                        minHeight: { xs: 36, sm: 40 }, // Mobile'da daha küçük height
                        backgroundColor: "transparent",
                        fontSize: { xs: "0.8rem", sm: "0.875rem" }, // Mobile'da daha küçük font
                        "& .MuiSelect-select": {
                            padding: { xs: "6px 12px", sm: "8px 14px" }, // Mobile'da daha az padding
                        },
                        "&:hover": {
                            backgroundColor: "transparent",
                        },
                        "&.Mui-focused": {
                            backgroundColor: "transparent",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0, 0, 0, 0.23)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0, 0, 0, 0.87)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                        },
                    }}>
                    <MenuItem
                        value={0}
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                        📋 All Orders
                    </MenuItem>
                    <MenuItem
                        value={1}
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                        🚚 To Be Delivered
                    </MenuItem>
                    <MenuItem
                        value={2}
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                        ✅ Completed
                    </MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default FiltersBar;
