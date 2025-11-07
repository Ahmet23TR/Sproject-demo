"use client";
import React from "react";
import { Pagination, Box, Typography } from "@mui/material";
import { PaginationInfo } from "../types/data";

interface PaginationComponentProps {
    pagination: PaginationInfo;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    showInfo?: boolean;
}

export const PaginationComponent: React.FC<PaginationComponentProps> = ({
    pagination,
    onPageChange,
    showInfo = true,
}) => {
    const { currentPage, totalPages, totalItems, pageSize } = pagination;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // If only one page, show just the info without pagination controls
    if (totalPages <= 1) {
        if (showInfo && totalItems > 0) {
            return (
                <Box
                    display="flex"
                    justifyContent="center"
                    sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing all {totalItems} record{totalItems !== 1 ? 's' : ''}
                    </Typography>
                </Box>
            );
        }
        return null;
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            sx={{ mt: 3, mb: 2 }}>
            {showInfo && (
                <Typography variant="body2" color="text.secondary">
                    Showing {startItem}-{endItem} of {totalItems} record{totalItems !== 1 ? 's' : ''}
                </Typography>
            )}
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={onPageChange}
                color="primary"
                size="medium"
                showFirstButton
                showLastButton
                sx={{
                    "& .MuiPaginationItem-root": {
                        fontSize: "0.875rem",
                    },
                }}
            />
        </Box>
    );
};

export default PaginationComponent;
