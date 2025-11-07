"use client";
import React, { useMemo, useState, useEffect } from "react";
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
    Chip,
    InputAdornment,
    IconButton,
    Tooltip,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { DeletePriceListModal } from "@/components/admin/DeletePriceListModal";
import { useAdminPricing } from "@/hooks/admin/useAdminPricing";
import { useRouter } from "next/navigation";
import { PriceListSummary } from "@/types/data";

export default function AdminPricingPage() {
    const {
        lists,
        loading,
        error,
        success,
        creating,
        deleting,
        onCreate,
        onDelete,
        clearSuccess,
    } = useAdminPricing();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [priceListToDelete, setPriceListToDelete] =
        useState<PriceListSummary | null>(null);
    const router = useRouter();

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        // Filter out distributor price lists - only show admin's price lists
        const adminLists = lists.filter((l) => !l.distributorId);

        const filteredLists = !q
            ? adminLists
            : adminLists.filter((l) => l.name.toLowerCase().includes(q));

        // Default price list'i her zaman en üstte göster
        return filteredLists.sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
        });
    }, [lists, search]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        await onCreate(newName.trim());
        setNewName("");
        setModalOpen(false);
    };

    const handleDelete = async (priceList: PriceListSummary) => {
        setPriceListToDelete(priceList);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!priceListToDelete) return;

        await onDelete(priceListToDelete.id);
        setDeleteModalOpen(false);
        setPriceListToDelete(null);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setPriceListToDelete(null);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setNewName("");
    };

    // Success mesajını 5 saniye sonra temizle
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                clearSuccess();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, clearSuccess]);

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Box maxWidth={1200} mx="auto" my={{ xs: 2, md: 4 }} px={{ xs: 1, sm: 2 }}>
                <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="flex-end"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={2}
                    mb={3}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setModalOpen(true)}
                        disabled={creating}
                        sx={{
                            height: 40,
                            order: { xs: 2, sm: 1 }
                        }}>
                        New Price List
                    </Button>
                    <TextField
                        placeholder="Search price lists..."
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
                        sx={{
                            maxWidth: { sm: 300 },
                            order: { xs: 1, sm: 2 }
                        }}
                    />
                </Box>

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper sx={{ overflow: 'hidden' }}>
                    {/* Desktop Table Header */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Table sx={{ tableLayout: "fixed" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: "40%" }}>
                                        Name
                                    </TableCell>
                                    <TableCell sx={{ width: "30%" }}>
                                        Status
                                    </TableCell>
                                    <TableCell align="right" sx={{ width: "30%" }}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table>
                        <Divider />
                    </Box>

                    {/* Mobile & Desktop Content */}
                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Loading...
                            </Typography>
                        </Box>
                    ) : filtered.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                {search ? "No price lists found" : "No price lists yet"}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                <Table sx={{ tableLayout: "fixed" }}>
                                    <TableBody>
                                        {filtered.map((list) => (
                                            <TableRow
                                                key={list.id}
                                                hover
                                                onClick={() =>
                                                    router.push(
                                                        `/admin/pricing/${encodeURIComponent(list.id)}`
                                                    )
                                                }
                                                style={{ cursor: "pointer" }}>
                                                <TableCell sx={{ width: "40%" }}>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {list.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ width: "30%" }}>
                                                    {list.isDefault ? (
                                                        <Chip size="small" color="primary" label="Default" />
                                                    ) : (
                                                        <Chip size="small" color="default" label="Custom" variant="outlined" />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right" sx={{ width: "30%" }}>
                                                    {!list.isDefault && (
                                                        <Tooltip title="Delete price list">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(list);
                                                                }}
                                                                disabled={deleting}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>

                            {/* Mobile Card View */}
                            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                                {filtered.map((list) => (
                                    <Box
                                        key={list.id}
                                        onClick={() =>
                                            router.push(
                                                `/admin/pricing/${encodeURIComponent(list.id)}`
                                            )
                                        }
                                        sx={{
                                            p: 2,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                            },
                                            '&:last-child': {
                                                borderBottom: 'none',
                                            },
                                        }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="body1" fontWeight={500} sx={{ flex: 1 }}>
                                                {list.name}
                                            </Typography>
                                            {!list.isDefault && (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(list);
                                                    }}
                                                    disabled={deleting}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                        <Box>
                                            {list.isDefault ? (
                                                <Chip size="small" color="primary" label="Default" />
                                            ) : (
                                                <Chip size="small" color="default" label="Custom" variant="outlined" />
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}
                </Paper>

                {/* Create Price List Modal */}
                <Dialog
                    open={modalOpen}
                    onClose={handleCloseModal}
                    maxWidth="sm"
                    fullWidth>
                    <DialogTitle>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center">
                            Create New Price List
                            <IconButton onClick={handleCloseModal} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Price List Name"
                            placeholder="e.g. VIP Customers, Wholesale Prices"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal}>Cancel</Button>
                        <LoadingButton
                            loading={creating}
                            variant="contained"
                            onClick={handleCreate}
                            disabled={!newName.trim()}>
                            Create
                        </LoadingButton>
                    </DialogActions>
                </Dialog>

                {/* Delete Price List Modal */}
                <DeletePriceListModal
                    open={deleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    priceList={priceListToDelete}
                    loading={deleting}
                />
            </Box>
        </ProtectedRoute>
    );
}
