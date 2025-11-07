"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    Box,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    InputAdornment,
    Alert,
    MenuItem,
    Select,
    FormControl,
    TablePagination,
    Divider,
    Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDistributorClients } from "@/hooks/distributor/useDistributorClients";

export default function DistributorClientsPage() {
    const router = useRouter();
    const {
        clients,
        priceLists,
        pagination,
        loading,
        error,
        success,
        updating,
        onUpdatePriceList,
        onPageChange,
        clearSuccess,
        clearError,
    } = useDistributorClients();

    const [search, setSearch] = useState("");

    // Only show distributor-created price lists (exclude admin/global lists)
    const distributorPriceLists = useMemo(() => {
        return priceLists.filter((pl) => Boolean(pl.distributorId));
    }, [priceLists]);

    // Filter clients by search
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return clients;
        return clients.filter(
            (client) =>
                client.name.toLowerCase().includes(q) ||
                client.surname.toLowerCase().includes(q) ||
                client.email.toLowerCase().includes(q) ||
                client.companyName?.toLowerCase().includes(q)
        );
    }, [clients, search]);

    const handlePriceListChange = async (
        clientId: string,
        newPriceListId: string
    ) => {
        await onUpdatePriceList(
            clientId,
            newPriceListId === "" ? null : newPriceListId
        );
    };

    const handlePageChange = (_: unknown, newPage: number) => {
        onPageChange(newPage + 1); // MUI uses 0-based indexing
    };

    const handleRowsPerPageChange = () => {
        onPageChange(1); // Reset to first page when changing page size
    };

    const getPriceListName = (priceListId: string | null | undefined) => {
        if (!priceListId) return "No price list";
        const priceList = distributorPriceLists.find((pl) => pl.id === priceListId);
        return priceList?.name || "Unknown";
    };

    const goToDetail = (id: string) => router.push(`/distributor/clients/${id}`);

    return (
        <ProtectedRoute requiredRole="DISTRIBUTOR">
            <Box
                maxWidth={1400}
                mx="auto"
                my={{ xs: 2, md: 4 }}
                px={{ xs: 1, sm: 2 }}
            >

                {/* Search Bar */}
                <Box mb={3}>
                    <TextField
                        placeholder="Search clients by name, email, or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        fullWidth
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ maxWidth: { sm: 400 } }}
                    />
                </Box>

                {/* Success Message */}
                {success && (
                    <Alert
                        severity="success"
                        onClose={clearSuccess}
                        sx={{ mb: 2 }}
                    >
                        {success}
                    </Alert>
                )}

                {/* Error Message */}
                {error && (
                    <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Table */}
                <Paper sx={{ overflow: "hidden" }}>
                    {/* Desktop Table Header */}
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <Table sx={{ tableLayout: "fixed" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: "20%" }}>
                                        Name
                                    </TableCell>
                                    <TableCell sx={{ width: "25%" }}>
                                        Company
                                    </TableCell>
                                    <TableCell sx={{ width: "20%" }}>
                                        Email
                                    </TableCell>
                                    <TableCell sx={{ width: "20%" }}>
                                        Price List
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table>
                        <Divider />
                    </Box>

                    {/* Content */}
                    {loading ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                Loading clients...
                            </Typography>
                        </Box>
                    ) : filtered.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                {search ? "No clients found" : "No clients yet"}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <Box sx={{ display: { xs: "none", md: "block" } }}>
                                <Table sx={{ tableLayout: "fixed" }}>
                                    <TableBody>
                                        {filtered.map((client) => (
                                            <TableRow
                                                key={client.id}
                                                hover
                                                onClick={() => goToDetail(client.id)}
                                                sx={{ cursor: "pointer" }}
                                            >
                                                <TableCell sx={{ width: "20%" }}>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={500}
                                                    >
                                                        {client.name}{" "}
                                                        {client.surname}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ width: "25%" }}>
                                                    <Typography variant="body1">
                                                        {client.companyName ||
                                                            "-"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ width: "20%" }} onClick={(e) => e.stopPropagation()}>
                                                    <Typography
                                                        variant="body1"
                                                        color="text.primary"
                                                    >
                                                        {client.email}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ width: "20%" }} onClick={(e) => e.stopPropagation()}>
                                                    <FormControl
                                                        size="small"
                                                        fullWidth
                                                        disabled={
                                                            updating ===
                                                            client.id
                                                        }
                                                    >
                                                        <Select
                                                            value={
                                                                client.priceListId ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handlePriceListChange(
                                                                    client.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            displayEmpty
                                                        >
                                                            {distributorPriceLists.map(
                                                                (pl) => (
                                                                    <MenuItem
                                                                        key={
                                                                            pl.id
                                                                        }
                                                                        value={
                                                                            pl.id
                                                                        }
                                                                    >
                                                                        {pl.name}
                                                                        {pl.isDefault &&
                                                                            " (Default)"}
                                                                    </MenuItem>
                                                                )
                                                            )}
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>

                            {/* Mobile Card View */}
                            <Box sx={{ display: { xs: "block", md: "none" } }}>
                                {filtered.map((client) => (
                                    <Box
                                        key={client.id}
                                        onClick={() => goToDetail(client.id)}
                                        sx={{
                                            p: 2,
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                            cursor: "pointer",
                                            "&:last-child": {
                                                borderBottom: "none",
                                            },
                                        }}
                                    >
                                        <Box mb={1}>
                                            <Typography
                                                variant="body1"
                                                fontWeight={500}
                                            >
                                                {client.name} {client.surname}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {client.companyName || "-"}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {client.email}
                                            </Typography>
                                        </Box>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                            mb={1}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Current:
                                            </Typography>
                                            <Chip
                                                label={getPriceListName(
                                                    client.priceListId
                                                )}
                                                size="small"
                                                color={
                                                    client.priceListId
                                                        ? "primary"
                                                        : "default"
                                                }
                                                variant="outlined"
                                            />
                                        </Box>
                                        <FormControl
                                            size="small"
                                            fullWidth
                                            onClick={(e) => e.stopPropagation()}
                                            disabled={updating === client.id}
                                        >
                                            <Select
                                                value={
                                                    client.priceListId || ""
                                                }
                                                onChange={(e) =>
                                                    handlePriceListChange(
                                                        client.id,
                                                        e.target.value
                                                    )
                                                }
                                                displayEmpty
                                            >
                                                {distributorPriceLists.map((pl) => (
                                                    <MenuItem
                                                        key={pl.id}
                                                        value={pl.id}
                                                    >
                                                        {pl.name}
                                                        {pl.isDefault &&
                                                            " (Default)"}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                ))}
                            </Box>

                            {/* Pagination */}
                            <TablePagination
                                component="div"
                                count={pagination.totalItems}
                                page={pagination.currentPage - 1}
                                onPageChange={handlePageChange}
                                rowsPerPage={pagination.pageSize}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                rowsPerPageOptions={[10, 25, 50]}
                            />
                        </>
                    )}
                </Paper>
            </Box>
        </ProtectedRoute>
    );
}
