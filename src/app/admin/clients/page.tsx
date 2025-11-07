"use client";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAdminUsers } from "../../../hooks/admin/useAdminUsers";
import { useAdminPricing } from "../../../hooks/admin/useAdminPricing";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    InputAdornment,
    Paper,
    Stack,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import { Suspense, useMemo, useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import { UserTable } from "../../../components/admin/UserTable";
import PaginationComponent from "../../../components/PaginationComponent";
import SearchIcon from "@mui/icons-material/Search";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export const dynamic = "force-dynamic";

function AdminClientsContent() {
    const {
        clients,
        loading,
        error,
        pagination,
        onPageChange,
        ...restOfProps
    } = useAdminUsers({ role: "CLIENT", includeStats: false });

    const { lists: priceLists } = useAdminPricing();

    // Filter to only show admin price lists (not distributor price lists)
    const adminPriceLists = useMemo(() => {
        return priceLists.filter((pl) => !pl.distributorId);
    }, [priceLists]);

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<{
        name: string;
        surname: string;
        email: string;
        password: string;
        confirmPassword?: string;
        phone?: string;
        companyName?: string;
    }>({
        name: "",
        surname: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
    });
    const [formError, setFormError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "active" | "passive"
    >("all");
    const [priceListFilter, setPriceListFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"name" | "createdAt" | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const isLoading = restOfProps.actionLoading === "create";
    const filteredClients = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        let filtered = clients;

        // Apply search filter
        if (normalizedQuery) {
            filtered = filtered.filter((client) => {
                const fullName = `${client.name ?? ""} ${client.surname ?? ""
                    }`.toLowerCase();
                const email = client.email?.toLowerCase() ?? "";
                const phone = client.phone?.toLowerCase() ?? "";
                const company = client.companyName?.toLowerCase() ?? "";

                return (
                    fullName.includes(normalizedQuery) ||
                    email.includes(normalizedQuery) ||
                    phone.includes(normalizedQuery) ||
                    company.includes(normalizedQuery)
                );
            });
        }

        // Apply status filter
        if (statusFilter === "active") {
            filtered = filtered.filter((client) => client.isActive);
        } else if (statusFilter === "passive") {
            filtered = filtered.filter((client) => !client.isActive);
        }

        // Apply price list filter
        if (priceListFilter !== "all") {
            if (priceListFilter === "no-price-list") {
                filtered = filtered.filter((client) => !client.priceListId);
            } else {
                filtered = filtered.filter(
                    (client) => client.priceListId === priceListFilter
                );
            }
        }

        // Apply sorting
        if (sortBy) {
            filtered = [...filtered].sort((a, b) => {
                let comparison = 0;

                if (sortBy === "name") {
                    const nameA = `${a.name ?? ""} ${a.surname ?? ""
                        }`.toLowerCase();
                    const nameB = `${b.name ?? ""} ${b.surname ?? ""
                        }`.toLowerCase();
                    comparison = nameA.localeCompare(nameB);
                } else if (sortBy === "createdAt") {
                    const dateA = new Date(a.createdAt ?? 0).getTime();
                    const dateB = new Date(b.createdAt ?? 0).getTime();
                    comparison = dateA - dateB;
                }

                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return filtered;
    }, [
        clients,
        searchQuery,
        statusFilter,
        priceListFilter,
        sortBy,
        sortDirection,
    ]);

    const hasSearchQuery =
        searchQuery.trim().length > 0 ||
        statusFilter !== "all" ||
        priceListFilter !== "all";

    const handleSort = (column: "name" | "createdAt") => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormError("");
        setForm({
            name: "",
            surname: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digitsOnly = e.target.value.replace(/\D/g, "");
        const limited = digitsOnly.slice(0, 12);
        const full = limited ? `+971${limited}` : "";
        setForm({ ...form, phone: full });
    };

    const localPhone = (form.phone || "").replace(/^\+971/, "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        if (!form.name || !form.surname || !form.email || !form.password) {
            setFormError("All fields are required.");
            return;
        }

        if (form.password !== (form.confirmPassword || "")) {
            setFormError("Passwords do not match.");
            return;
        }

        const { confirmPassword, ...rest } = form;
        void confirmPassword; // already validated above
        const payload = {
            ...rest,
            role: "CLIENT" as const,
        };

        try {
            await restOfProps.onCreateUser?.(payload);
            handleClose();
        } catch {
            setFormError("Client could not be added.");
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: "#f5f6fa",
                minHeight: "100vh",
                py: { xs: 4, md: 6 },
            }}>
                <Box
                    sx={{
                        maxWidth: 1280,
                        mx: "auto",
                        px: { xs: 2, md: 4 },
                    }}>
                    {/* <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            mb: 3,
                        }}>
                    </Box> */}

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 1,
                            p: { xs: 2, md: 3 },
                            mb: 4,
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            backgroundColor: "white",
                        }}>
                        <Stack spacing={{ xs: 2.5, md: 2 }} mb={3}>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                                alignItems={{ xs: "stretch", sm: "center" }}>
                                <TextField
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(event.target.value)
                                    }
                                    placeholder="Search customers by name, email, phone, or company"
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon
                                                    fontSize="small"
                                                    color="action"
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        backgroundColor: "#f8fafc",
                                        borderRadius: 2,
                                        "& fieldset": {
                                            border: "1px solid rgba(148, 163, 184, 0.4)",
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleOpen}
                                    startIcon={<AddRoundedIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        px: 2,
                                        py: 1,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        minWidth: { xs: "auto", sm: 200 },
                                        boxShadow:
                                            "0px 12px 20px rgba(59, 130, 246, 0.15)",
                                    }}>
                                    Add New Customer
                                </Button>
                            </Stack>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={{ xs: 2, sm: 2 }}
                                sx={{ pt: { xs: 0.5, sm: 0 } }}>
                                <FormControl
                                    size="small"
                                    fullWidth
                                    sx={{
                                        minWidth: { xs: "auto", sm: 140 },
                                        maxWidth: { xs: "100%", sm: 180 },
                                    }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(
                                                e.target.value as
                                                | "all"
                                                | "active"
                                                | "passive"
                                            )
                                        }
                                        label="Status"
                                        sx={{
                                            backgroundColor: "#f8fafc",
                                            borderRadius: 2,
                                            height: { xs: 48, sm: 40 },
                                        }}>
                                        <MenuItem value="all">
                                            All Status
                                        </MenuItem>
                                        <MenuItem value="active">
                                            Active
                                        </MenuItem>
                                        <MenuItem value="passive">
                                            Passive
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl
                                    size="small"
                                    fullWidth
                                    sx={{
                                        minWidth: { xs: "auto", sm: 160 },
                                        maxWidth: { xs: "100%", sm: 220 },
                                    }}>
                                    <InputLabel>Price List</InputLabel>
                                    <Select
                                        value={priceListFilter}
                                        onChange={(e) =>
                                            setPriceListFilter(e.target.value)
                                        }
                                        label="Price List"
                                        sx={{
                                            backgroundColor: "#f8fafc",
                                            borderRadius: 2,
                                            height: { xs: 48, sm: 40 },
                                        }}>
                                        <MenuItem value="all">
                                            All Price Lists
                                        </MenuItem>
                                        <MenuItem value="no-price-list">
                                            No Price List
                                        </MenuItem>
                                        {adminPriceLists.map((priceList) => (
                                            <MenuItem
                                                key={priceList.id}
                                                value={priceList.id}>
                                                {priceList.name}
                                                {priceList.isDefault &&
                                                    " (Default)"}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {loading ? (
                            <Box display="flex" justifyContent="center" py={6}>
                                <CircularProgress />
                            </Box>
                        ) : filteredClients.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                {hasSearchQuery
                                    ? "No customers match your search criteria."
                                    : "No customers have been registered yet."}
                            </Alert>
                        ) : (
                            <Suspense
                                fallback={
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        mt={4}>
                                        <CircularProgress />
                                    </Box>
                                }>
                                <UserTable
                                    title=""
                                    users={filteredClients}
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                    {...restOfProps}
                                />
                            </Suspense>
                        )}

                        {pagination &&
                            pagination.totalPages > 1 &&
                            !hasSearchQuery && (
                                <PaginationComponent
                                    pagination={pagination}
                                    onPageChange={onPageChange}
                                />
                            )}
                    </Paper>

                    {/* Add Client Modal */}
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        fullWidth
                        maxWidth="sm"
                        fullScreen={false}
                        PaperProps={{
                            sx: {
                                mx: { xs: 2, sm: 4 },
                                width: { xs: "calc(100% - 32px)", sm: "100%" },
                            },
                        }}>
                        <DialogTitle
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                pr: { xs: 1, sm: 2 },
                                pl: { xs: 2, sm: 3 },
                                py: { xs: 2, sm: 2.5 },
                            }}>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                                Add New Customer
                            </Typography>
                            <IconButton
                                onClick={handleClose}
                                sx={{ borderRadius: 1 }}>
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        </DialogTitle>
                        <form onSubmit={handleSubmit}>
                            <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 } }}>
                                <TextField
                                    label="First Name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    size="small"
                                />
                                <TextField
                                    label="Last Name"
                                    name="surname"
                                    value={form.surname}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    size="small"
                                />
                                <TextField
                                    label="Email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    type="email"
                                    size="small"
                                />
                                <TextField
                                    label="Password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    type="password"
                                    fullWidth
                                    margin="normal"
                                    required
                                    size="small"
                                />
                                <TextField
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    value={form.confirmPassword || ""}
                                    onChange={handleChange}
                                    type="password"
                                    fullWidth
                                    margin="normal"
                                    required
                                    size="small"
                                />
                                <TextField
                                    label="Phone"
                                    name="phone"
                                    value={localPhone}
                                    onChange={handlePhoneChange}
                                    type="tel"
                                    fullWidth
                                    margin="normal"
                                    size="small"
                                    inputProps={{
                                        inputMode: "tel",
                                        pattern: "^\\d{1,12}$",
                                        maxLength: 12,
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                +971
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    label="Company Name"
                                    name="companyName"
                                    value={form.companyName || ""}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    size="small"
                                />
                                {formError && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {formError}
                                    </Alert>
                                )}
                            </DialogContent>
                            <DialogActions sx={{
                                px: { xs: 2, sm: 3 },
                                pb: { xs: 2, sm: 3 },
                                pt: 2,
                                gap: 1,
                                flexDirection: { xs: "column", sm: "row" },
                            }}>
                                <Button
                                    onClick={handleClose}
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        textTransform: "none",
                                        order: { xs: 2, sm: 1 },
                                    }}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isLoading}
                                    fullWidth
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        order: { xs: 1, sm: 2 },
                                    }}>
                                    {isLoading
                                        ? "Adding..."
                                        : "Create Customer"}
                                </Button>
                            </DialogActions>
                        </form>
                    </Dialog>
                </Box>
        </Box>
    );
}

export default function AdminClientsPage() {
    return (
        <ProtectedRoute requiredRole="ADMIN">
            <Suspense
                fallback={
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "50vh",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                }
            >
                <AdminClientsContent />
            </Suspense>
        </ProtectedRoute>
    );
}
