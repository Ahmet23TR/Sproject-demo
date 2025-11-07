"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Chip,
    Stack,
    Alert,
} from "@mui/material";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useDistributorPriceListDetail } from "@/hooks/distributor/useDistributorPricing";
import { PriceListRow } from "./components/PriceListRow";

export default function DistributorPriceListDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { detail, adminPriceList, adminPricesMap, loading, error, saving, onSave, onSetDefault } =
        useDistributorPriceListDetail(id);

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [edits, setEdits] = useState<
        Record<string, { price?: number; multiplier?: number }>
    >({});

    const rows = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        if (!q) return detail?.prices ?? [];
        return (
            detail?.prices.filter(
                (p) =>
                    p.optionItem?.name.toLowerCase().includes(q) ||
                    p.optionItem?.optionGroup?.product?.name
                        .toLowerCase()
                        .includes(q)
            ) ?? []
        );
    }, [debouncedQuery, detail]);

    const paginatedRows = useMemo(() => {
        const start = page * rowsPerPage;
        return rows.slice(start, start + rowsPerPage);
    }, [rows, page, rowsPerPage]);

    const handleEditChange = useCallback(
        (
            optionItemId: string,
            field: "price" | "multiplier",
            value: number | undefined
        ) => {
            setEdits((prev) => {
                const newEdits = { ...prev };
                const current = newEdits[optionItemId] || {};

                if (value === undefined) {
                    delete current[field];
                } else {
                    current[field] = value;
                }

                if (Object.keys(current).length === 0) {
                    delete newEdits[optionItemId];
                } else {
                    newEdits[optionItemId] = current;
                }
                return newEdits;
            });
        },
        []
    );

    const handleSave = useCallback(async () => {
        const items = Object.entries(edits).map(([optionItemId, payload]) => ({
            optionItemId,
            ...payload,
        }));
        if (items.length === 0) return;
        await onSave(items);
        setEdits({});
    }, [edits, onSave]);

    if (loading) {
        return (
            <ProtectedRoute requiredRole="DISTRIBUTOR">
                <Box maxWidth={1200} mx="auto" my={{ xs: 2, md: 4 }} px={{ xs: 1, sm: 2 }}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            Loading price list...
                        </Typography>
                    </Box>
                </Box>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute requiredRole="DISTRIBUTOR">
                <Box maxWidth={1200} mx="auto" my={{ xs: 2, md: 4 }} px={{ xs: 1, sm: 2 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                </Box>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="DISTRIBUTOR">
            <Box maxWidth={1200} mx="auto" my={{ xs: 2, md: 4 }} px={{ xs: 1, sm: 2 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={{ xs: 2, sm: 0 }}
                    mb={{ xs: 3, md: 4 }}>
                    <Box>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="#1f2937"
                            sx={{
                                fontSize: { xs: '1.5rem', md: '2rem' }
                            }}>
                            {detail?.name}
                        </Typography>
                        {!adminPriceList && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                No admin-assigned price list found
                            </Typography>
                        )}
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {detail?.isDefault && (
                            <Chip
                                label="Default Price List"
                                color="success"
                                variant="filled"
                                size="medium"
                                sx={{
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    backgroundColor: "#10b981",
                                    color: "white",
                                    "& .MuiChip-label": {
                                        px: { xs: 1.5, sm: 2 },
                                        py: 0.5,
                                    },
                                }}
                            />
                        )}
                        {!detail?.isDefault && (
                            <LoadingButton
                                loading={saving}
                                variant="outlined"
                                color="primary"
                                onClick={onSetDefault}
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 500,
                                    borderColor: "primary.main",
                                    "&:hover": {
                                        backgroundColor: "primary.main",
                                        color: "white",
                                    },
                                }}>
                                Set as Default
                            </LoadingButton>
                        )}
                    </Stack>
                </Stack>
                <Card
                    sx={{
                        borderRadius: 1.5,
                        boxShadow: "0px 18px 32px rgba(15, 23, 42, 0.06)",
                        border: "1px solid rgba(148, 163, 184, 0.15)",
                    }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            gap={2}
                            alignItems={{ xs: "stretch", sm: "center" }}
                            mb={3}>
                            <TextField
                                placeholder="Search products or options..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                fullWidth
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 1,
                                        backgroundColor:
                                            "rgba(248, 250, 252, 0.5)",
                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(248, 250, 252, 0.8)",
                                        },
                                        "&.Mui-focused": {
                                            backgroundColor: "white",
                                        },
                                    },
                                }}
                            />
                            <LoadingButton
                                loading={saving}
                                variant="contained"
                                onClick={handleSave}
                                disabled={Object.keys(edits).length === 0}
                                sx={{
                                    whiteSpace: "nowrap",
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1,
                                    width: { xs: '100%', sm: 'auto' },
                                    boxShadow:
                                        "0px 8px 16px rgba(59, 130, 246, 0.25)",
                                    "&:hover": {
                                        boxShadow:
                                            "0px 12px 20px rgba(59, 130, 246, 0.35)",
                                    },
                                }}>
                                Save Changes ({Object.keys(edits).length})
                            </LoadingButton>
                        </Box>
                        {/* Desktop Table View */}
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    borderRadius: 1.5,
                                    border: "1px solid rgba(148, 163, 184, 0.25)",
                                    overflow: "hidden",
                                    boxShadow:
                                        "0px 12px 24px rgba(15, 23, 42, 0.04)",
                                }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                backgroundColor:
                                                    "rgba(248, 250, 252, 0.9)",
                                            }}>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "0.75rem",
                                                    letterSpacing: 0.4,
                                                    textTransform: "uppercase",
                                                    color: "#64748b",
                                                    borderBottom:
                                                        "1px solid rgba(148, 163, 184, 0.3)",
                                                    py: 2.5,
                                                }}>
                                                Product
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "0.75rem",
                                                    letterSpacing: 0.4,
                                                    textTransform: "uppercase",
                                                    color: "#64748b",
                                                    borderBottom:
                                                        "1px solid rgba(148, 163, 184, 0.3)",
                                                    py: 2.5,
                                                }}>
                                                Option
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "0.75rem",
                                                    letterSpacing: 0.4,
                                                    textTransform: "uppercase",
                                                    color: "#64748b",
                                                    borderBottom:
                                                        "1px solid rgba(148, 163, 184, 0.3)",
                                                    py: 2.5,
                                                }}>
                                                Currency
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "0.75rem",
                                                    letterSpacing: 0.4,
                                                    textTransform: "uppercase",
                                                    color: "#64748b",
                                                    borderBottom:
                                                        "1px solid rgba(148, 163, 184, 0.3)",
                                                    py: 2.5,
                                                }}>
                                                Admin Price
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "0.75rem",
                                                    letterSpacing: 0.4,
                                                    textTransform: "uppercase",
                                                    color: "#64748b",
                                                    borderBottom:
                                                        "1px solid rgba(148, 163, 184, 0.3)",
                                                    py: 2.5,
                                                }}>
                                                Custom Price
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "0.75rem",
                                                    letterSpacing: 0.4,
                                                    textTransform: "uppercase",
                                                    color: "#64748b",
                                                    borderBottom:
                                                        "1px solid rgba(148, 163, 184, 0.3)",
                                                    py: 2.5,
                                                }}>
                                                Custom Multiplier
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedRows.map((item) => {
                                            const editData =
                                                edits[item.optionItemId] || {};
                                            const adminPrice = adminPricesMap[item.optionItemId];
                                            return (
                                                <PriceListRow
                                                    key={item.id}
                                                    item={item}
                                                    edit={editData}
                                                    adminPrice={adminPrice}
                                                    onEditChange={handleEditChange}
                                                />
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        {/* Mobile Card View */}
                        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                            {paginatedRows.map((item) => {
                                const editData = edits[item.optionItemId] || {};
                                const adminPrice = adminPricesMap[item.optionItemId];
                                const localPrice = (editData?.price ?? item.price)?.toString() ?? "";
                                const localMultiplier = (editData?.multiplier ?? item.multiplier)?.toString() ?? "";

                                // Admin'in belirlediği fiyatı hesapla
                                const adminPriceDisplay = adminPrice?.price !== undefined && adminPrice?.price !== null
                                    ? `AED ${adminPrice.price.toFixed(2)}`
                                    : adminPrice?.multiplier !== undefined && adminPrice?.multiplier !== null
                                        ? `${adminPrice.multiplier}x`
                                        : item.optionItem?.defaultPrice
                                            ? `AED ${item.optionItem.defaultPrice.toFixed(2)}`
                                            : "-";

                                return (
                                    <Card
                                        key={item.id}
                                        sx={{
                                            mb: 2,
                                            borderRadius: 2,
                                            border: '1px solid rgba(148, 163, 184, 0.15)',
                                            boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.04)',
                                        }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Product
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500} mb={2}>
                                                {item.optionItem?.optionGroup?.product?.name || "-"}
                                            </Typography>

                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Option
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500} mb={2}>
                                                {item.optionItem?.name || item.optionItemId}
                                            </Typography>

                                            <Stack direction="row" spacing={2} mb={2}>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                        Currency
                                                    </Typography>
                                                    <Typography variant="body2">AED</Typography>
                                                </Box>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                        Admin Price
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {adminPriceDisplay}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Box mb={2}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    Custom Price
                                                </Typography>
                                                <TextField
                                                    size="small"
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={localPrice}
                                                    onChange={(e) => {
                                                        const num = parseFloat(e.target.value.replace(",", "."));
                                                        const finalValue = isNaN(num) ? undefined : num;
                                                        handleEditChange(item.optionItemId, "price", finalValue);
                                                    }}
                                                    placeholder="0.00"
                                                    disabled={!!item.multiplier}
                                                    fullWidth
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: 1.5,
                                                            fontSize: "0.875rem",
                                                        },
                                                    }}
                                                />
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    Custom Multiplier
                                                </Typography>
                                                <TextField
                                                    size="small"
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={localMultiplier}
                                                    onChange={(e) => {
                                                        const num = parseFloat(e.target.value.replace(",", "."));
                                                        const finalValue = isNaN(num) ? undefined : num;
                                                        handleEditChange(item.optionItemId, "multiplier", finalValue);
                                                    }}
                                                    placeholder="1.0"
                                                    disabled={!!item.optionItem?.defaultPrice}
                                                    fullWidth
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: 1.5,
                                                            fontSize: "0.875rem",
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                        <TablePagination
                            component="div"
                            count={rows.length}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </CardContent>
                </Card>
            </Box>
        </ProtectedRoute>
    );
}

