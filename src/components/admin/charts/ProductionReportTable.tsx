"use client";
import { useState, useMemo } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    Typography,
    Button,
    Chip,
    Link,
} from "@mui/material";
import { useRouter } from "next/navigation";
import DownloadIcon from "@mui/icons-material/Download";
import type { ProductGroup } from "@/types/data";

interface ProductTableData {
    productId: string;
    productName: string;
    group: ProductGroup;
    ordered: number;
    produced: number;
    cancelled: number;
    categoryName: string | null;
    totalRevenue: number;
    unitPrice: number;
}

interface ProductionReportTableProps {
    data: ProductTableData[];
    loading?: boolean;
    onExportCSV?: () => void;
}

type SortDirection = "asc" | "desc";
type SortableFields =
    | "productName"
    | "ordered"
    | "produced"
    | "cancelled"
    | "totalRevenue"
    | "unitPrice";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

const ITEMS_PER_PAGE = 15;

export const ProductionReportTable = ({
    data,
    loading = false,
    onExportCSV,
}: ProductionReportTableProps) => {
    const router = useRouter();
    const [sortField, setSortField] = useState<SortableFields>("totalRevenue");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (field: SortableFields) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        return [...data].sort((a, b) => {
            let aValue: number | string = a[sortField];
            let bValue: number | string = b[sortField];

            // Special handling for string fields
            if (sortField === "productName") {
                aValue = (aValue as string).toLowerCase();
                bValue = (bValue as string).toLowerCase();
            }

            if (aValue < bValue) {
                return sortDirection === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === "asc" ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortField, sortDirection]);

    // Sayfalama
    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const handleProductClick = (productId: string) => {
        router.push(`/admin/products/${productId}`);
    };

    const getEfficiencyColor = (ordered: number, produced: number) => {
        if (ordered === 0) return "default";
        const efficiency = (produced / ordered) * 100;
        if (efficiency >= 95) return "success";
        if (efficiency >= 80) return "warning";
        return "error";
    };

    const getEfficiencyLabel = (ordered: number, produced: number) => {
        if (ordered === 0) return "N/A";
        const efficiency = (produced / ordered) * 100;
        return `${efficiency.toFixed(1)}%`;
    };

    if (loading) {
        return (
            <Box bgcolor="#fff" p={2} borderRadius={2}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height={200}>
                    <Typography color="text.secondary">
                        Table loading...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box bgcolor="#fff" p={2} borderRadius={2}>
            {/* Header */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}>
                <Typography variant="subtitle1" fontWeight={700}>
                    Detailed Product Performance Table ({sortedData.length}{" "}
                    products)
                </Typography>
                {onExportCSV && (
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={onExportCSV}
                        size="small">
                        Download CSV
                    </Button>
                )}
            </Box>

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e5e7eb" }}>
                <Table size="medium">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === "productName"}
                                    direction={
                                        sortField === "productName"
                                            ? sortDirection
                                            : "asc"
                                    }
                                    onClick={() => handleSort("productName")}>
                                    Product
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Group</TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={sortField === "ordered"}
                                    direction={
                                        sortField === "ordered"
                                            ? sortDirection
                                            : "desc"
                                    }
                                    onClick={() => handleSort("ordered")}>
                                    Orders
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={sortField === "produced"}
                                    direction={
                                        sortField === "produced"
                                            ? sortDirection
                                            : "desc"
                                    }
                                    onClick={() => handleSort("produced")}>
                                    Produced
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={sortField === "cancelled"}
                                    direction={
                                        sortField === "cancelled"
                                            ? sortDirection
                                            : "desc"
                                    }
                                    onClick={() => handleSort("cancelled")}>
                                    Cancelled
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center">Efficiency</TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={sortField === "totalRevenue"}
                                    direction={
                                        sortField === "totalRevenue"
                                            ? sortDirection
                                            : "desc"
                                    }
                                    onClick={() => handleSort("totalRevenue")}>
                                    Revenue
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={sortField === "unitPrice"}
                                    direction={
                                        sortField === "unitPrice"
                                            ? sortDirection
                                            : "desc"
                                    }
                                    onClick={() => handleSort("unitPrice")}>
                                    Avg. Unit Price
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((product) => (
                            <TableRow
                                key={product.productId}
                                sx={{
                                    "&:hover": { backgroundColor: "#f9fafb" },
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    handleProductClick(product.productId)
                                }>
                                <TableCell>
                                    <Link
                                        component="button"
                                        variant="body2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleProductClick(
                                                product.productId
                                            );
                                        }}
                                        sx={{
                                            textAlign: "left",
                                            fontWeight: 500,
                                        }}>
                                        {product.productName}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        color="text.primary">
                                        {product.categoryName ||
                                            "Uncategorized"}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={
                                            product.group === "SWEETS"
                                                ? "Sweets"
                                                : "Bakery Products"
                                        }
                                        size="small"
                                        color={
                                            product.group === "SWEETS"
                                                ? "secondary"
                                                : "primary"
                                        }
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        color="text.primary"
                                        fontWeight={450}>
                                        {product.ordered}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        color="text.primary"
                                        fontWeight={450}>
                                        {product.produced}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        color="error"
                                        fontWeight={450}>
                                        {product.cancelled}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={getEfficiencyLabel(
                                            product.ordered,
                                            product.produced
                                        )}
                                        size="small"
                                        color={getEfficiencyColor(
                                            product.ordered,
                                            product.produced
                                        )}
                                        variant="filled"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color="success.main">
                                        {formatCurrency(product.totalRevenue)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        color="text.primary">
                                        {formatCurrency(product.unitPrice)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={2}
                    mt={2}>
                    <Button
                        disabled={currentPage <= 1}
                        onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        size="small">
                        Previous
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                        Page {currentPage} / {totalPages}
                    </Typography>
                    <Button
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                            setCurrentPage(
                                Math.min(totalPages, currentPage + 1)
                            )
                        }
                        size="small">
                        Next
                    </Button>
                </Box>
            )}
        </Box>
    );
};
