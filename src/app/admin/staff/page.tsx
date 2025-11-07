"use client";
import { Suspense, useCallback, useMemo, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAdminUsers } from "../../../hooks/admin/useAdminUsers";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import { UserTable } from "../../../components/admin/UserTable";
import PaginationComponent from "../../../components/PaginationComponent";
import type { User } from "@/types/data";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export const dynamic = "force-dynamic";

const SummaryCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(3),
    },
    borderRadius: 10,
    boxShadow: "0px 12px 24px rgba(15, 23, 42, 0.04)",
    border: "1px solid rgba(15, 23, 42, 0.06)",
    background: theme.palette.common.white,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
        gap: theme.spacing(3),
    },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
    width: 48,
    height: 48,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.primary.main,
}));

type RoleFilter = "ALL" | "ADMIN" | "CHEF" | "DRIVER" | "DISTRIBUTOR";

function AdminStaffContent() {
    const {
        admins,
        chefs,
        drivers,
        distributors,
        loading,
        error,
        pagination,
        onPageChange,
        ...restOfProps
    } = useAdminUsers();

    const [open, setOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [form, setForm] = useState<{
        name: string;
        surname: string;
        email: string;
        password: string;
        confirmPassword?: string;
        phone?: string;
        role: "ADMIN" | "CHEF" | "DRIVER" | "DISTRIBUTOR";
        productGroup?: "SWEETS" | "BAKERY";
    }>({
        name: "",
        surname: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "CHEF",
    });
    const [formError, setFormError] = useState("");
    const isLoading = restOfProps.actionLoading === "create";

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
            role: "CHEF",
            productGroup: undefined,
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

    const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            role: e.target.value as "ADMIN" | "CHEF" | "DRIVER" | "DISTRIBUTOR",
        });
    };

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

        const { confirmPassword: _confirmPassword, ...payload } = form;
        void _confirmPassword;

        try {
            await restOfProps.onCreateUser?.(payload);
            handleClose();
        } catch {
            setFormError("Staff member could not be added.");
        }
    };

    const staffList = useMemo(
        () => [...admins, ...chefs, ...drivers, ...distributors],
        [admins, chefs, drivers, distributors]
    );

    const totalStaff = staffList.length;
    const activeStaff = useMemo(
        () => staffList.filter((member) => member.isActive).length,
        [staffList]
    );
    const inactiveStaff = Math.max(totalStaff - activeStaff, 0);

    const roleCounts = useMemo(
        () => ({
            ADMIN: admins.length,
            CHEF: chefs.length,
            DRIVER: drivers.length,
            DISTRIBUTOR: distributors.length,
        }),
        [admins.length, chefs.length, drivers.length, distributors.length]
    );

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matchesSearch = useCallback(
        (member: User) => {
            if (!normalizedQuery) {
                return true;
            }
            const fullName = `${member.name ?? ""} ${member.surname ?? ""
                }`.toLowerCase();
            const email = member.email?.toLowerCase() ?? "";
            const phone = member.phone?.toLowerCase() ?? "";
            return (
                fullName.includes(normalizedQuery) ||
                email.includes(normalizedQuery) ||
                phone.includes(normalizedQuery)
            );
        },
        [normalizedQuery]
    );

    const filteredAdmins = useMemo(
        () =>
            roleFilter === "ALL" || roleFilter === "ADMIN"
                ? admins.filter((member) => matchesSearch(member))
                : [],
        [admins, matchesSearch, roleFilter]
    );

    const filteredChefs = useMemo(
        () =>
            roleFilter === "ALL" || roleFilter === "CHEF"
                ? chefs.filter((member) => matchesSearch(member))
                : [],
        [chefs, matchesSearch, roleFilter]
    );

    const filteredDrivers = useMemo(
        () =>
            roleFilter === "ALL" || roleFilter === "DRIVER"
                ? drivers.filter((member) => matchesSearch(member))
                : [],
        [drivers, matchesSearch, roleFilter]
    );

    const filteredDistributors = useMemo(
        () =>
            roleFilter === "ALL" || roleFilter === "DISTRIBUTOR"
                ? distributors.filter((member) => matchesSearch(member))
                : [],
        [distributors, matchesSearch, roleFilter]
    );

    const hasResults =
        filteredAdmins.length + filteredChefs.length + filteredDrivers.length + filteredDistributors.length >
        0;

    return (
        <Box
            sx={{
                backgroundColor: "#f5f6fa",
                minHeight: "100vh",
                py: { xs: 4, md: 4 },
            }}>
                <Box
                    sx={{
                        maxWidth: 1280,
                        mx: "auto",
                        px: { xs: 2, md: 4 },
                    }}>
                    <SummaryCard sx={{ mb: { xs: 3, md: 4 } }}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            justifyContent="space-between"
                            spacing={2}>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                color="text.primary"
                                sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                                Staff Summary
                            </Typography>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                alignItems={{ xs: "stretch", sm: "center" }}
                                spacing={1.5}
                                sx={{ width: { xs: "100%", sm: "auto" } }}>
                                <Chip
                                    label={`${totalStaff.toLocaleString()} team members`}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor:
                                            "rgba(59, 130, 246, 0.08)",
                                        color: "#2563eb",
                                        width: { xs: "100%", sm: "auto" },
                                        justifyContent: "center",
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleOpen}
                                    startIcon={<AddRoundedIcon />}
                                    fullWidth
                                    sx={{
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.75,
                                        textTransform: "none",
                                        fontWeight: 400,
                                        boxShadow:
                                            "0px 12px 20px rgba(59, 130, 246, 0.15)",
                                        display: { xs: "flex", sm: "inline-flex" },
                                        width: { xs: "100%", sm: "auto" },
                                    }}>
                                    <Box
                                        component="span"
                                        sx={{
                                            display: { xs: "none", sm: "inline" },
                                        }}>
                                        Add Staff Member
                                    </Box>
                                    <Box
                                        component="span"
                                        sx={{
                                            display: { xs: "inline", sm: "none" },
                                        }}>
                                        Add Staff
                                    </Box>
                                </Button>
                            </Stack>
                        </Stack>
                        <Divider flexItem />
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 2, sm: 3 }}
                            divider={
                                <Divider
                                    orientation="vertical"
                                    flexItem
                                    sx={{
                                        display: { xs: "none", sm: "block" },
                                    }}
                                />
                            }>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={2}
                                flex={1}>
                                <IconWrapper
                                    sx={{
                                        width: { xs: 40, sm: 48 },
                                        height: { xs: 40, sm: 48 },
                                    }}>
                                    <Groups2OutlinedIcon fontSize="small" />
                                </IconWrapper>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                                        All Staff
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                        color="text.primary"
                                        sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                                        {totalStaff.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={2}
                                flex={1}>
                                <IconWrapper
                                    sx={{
                                        backgroundColor:
                                            "rgba(16, 185, 129, 0.12)",
                                        color: "#059669",
                                        width: { xs: 40, sm: 48 },
                                        height: { xs: 40, sm: 48 },
                                    }}>
                                    <VerifiedOutlinedIcon fontSize="small" />
                                </IconWrapper>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                                        Active
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        alignItems="baseline"
                                        spacing={1}
                                        flexWrap="wrap">
                                        <Typography
                                            variant="h4"
                                            fontWeight={700}
                                            color="text.primary"
                                            sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                                            {activeStaff.toLocaleString()}
                                        </Typography>
                                        <Chip
                                            label={
                                                totalStaff > 0
                                                    ? `${Math.round(
                                                        (activeStaff /
                                                            totalStaff) *
                                                        100
                                                    )}%`
                                                    : "0%"
                                            }
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                backgroundColor:
                                                    "rgba(16, 185, 129, 0.12)",
                                                color: "#047857",
                                                height: { xs: 20, sm: 24 },
                                                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                            }}
                                        />
                                    </Stack>
                                </Box>
                            </Box>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={2}
                                flex={1}>
                                <IconWrapper
                                    sx={{
                                        backgroundColor:
                                            "rgba(239, 68, 68, 0.12)",
                                        color: "#dc2626",
                                        width: { xs: 40, sm: 48 },
                                        height: { xs: 40, sm: 48 },
                                    }}>
                                    <HighlightOffOutlinedIcon fontSize="small" />
                                </IconWrapper>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                                        Suspended
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        alignItems="baseline"
                                        spacing={1}
                                        flexWrap="wrap">
                                        <Typography
                                            variant="h4"
                                            fontWeight={700}
                                            color="text.primary"
                                            sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                                            {inactiveStaff.toLocaleString()}
                                        </Typography>
                                        <Chip
                                            label={
                                                totalStaff > 0
                                                    ? `${Math.round(
                                                        (inactiveStaff /
                                                            totalStaff) *
                                                        100
                                                    )}%`
                                                    : "0%"
                                            }
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                backgroundColor:
                                                    "rgba(239, 68, 68, 0.12)",
                                                color: "#b91c1c",
                                                height: { xs: 20, sm: 24 },
                                                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                            }}
                                        />
                                    </Stack>
                                </Box>
                            </Box>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1.5}
                            flexWrap="wrap"
                            sx={{ gap: { xs: 1, sm: 0 } }}>
                            <Chip
                                icon={
                                    <SupervisorAccountOutlinedIcon fontSize="small" />
                                }
                                label={`Admins: ${roleCounts.ADMIN.toLocaleString()}`}
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                                    color: "#1d4ed8",
                                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                }}
                            />
                            <Chip
                                icon={
                                    <RestaurantMenuOutlinedIcon fontSize="small" />
                                }
                                label={`Chefs: ${roleCounts.CHEF.toLocaleString()}`}
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: "rgba(249, 115, 22, 0.12)",
                                    color: "#c2410c",
                                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                }}
                            />
                            <Chip
                                icon={
                                    <LocalShippingOutlinedIcon fontSize="small" />
                                }
                                label={`Drivers: ${roleCounts.DRIVER.toLocaleString()}`}
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: "rgba(14, 165, 233, 0.16)",
                                    color: "#0369a1",
                                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                }}
                            />
                            <Chip
                                icon={
                                    <BusinessCenterOutlinedIcon fontSize="small" />
                                }
                                label={`Distributors: ${roleCounts.DISTRIBUTOR.toLocaleString()}`}
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: "rgba(201, 162, 39, 0.16)",
                                    color: "#C9A227",
                                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                }}
                            />
                        </Stack>
                    </SummaryCard>

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 1,
                            p: { xs: 2, md: 3 },
                            mb: { xs: 3, md: 4 },
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            backgroundColor: "white",
                        }}>
                        <Stack spacing={2} mb={2}>
                            <TextField
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search by name, email or phone"
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
                                    "& input": {
                                        fontSize: { xs: "0.875rem", sm: "1rem" },
                                    },
                                }}
                            />
                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                sx={{ gap: 1 }}>
                                {(
                                    [
                                        { label: "All", value: "ALL" },
                                        { label: "Admins", value: "ADMIN" },
                                        { label: "Chefs", value: "CHEF" },
                                        { label: "Drivers", value: "DRIVER" },
                                        { label: "Distributors", value: "DISTRIBUTOR" },
                                    ] as Array<{
                                        label: string;
                                        value: RoleFilter;
                                    }>
                                ).map((filter) => (
                                    <Chip
                                        key={filter.value}
                                        label={filter.label}
                                        clickable
                                        color={
                                            roleFilter === filter.value
                                                ? "primary"
                                                : "default"
                                        }
                                        onClick={() =>
                                            setRoleFilter(filter.value)
                                        }
                                        sx={{
                                            fontWeight:
                                                roleFilter === filter.value
                                                    ? 700
                                                    : 500,
                                            textTransform: "none",
                                            fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                        }}
                                    />
                                ))}
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
                        ) : !hasResults ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                {normalizedQuery
                                    ? "No staff members match your search."
                                    : "No staff members found for the selected filter."}
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
                                {filteredAdmins.length > 0 && (
                                    <Box sx={{ mb: { xs: 3, md: 4 } }}>
                                        <UserTable
                                            title="Admins"
                                            users={filteredAdmins}
                                            {...restOfProps}
                                        />
                                    </Box>
                                )}
                                {filteredChefs.length > 0 && (
                                    <Box sx={{ mb: { xs: 3, md: 4 } }}>
                                        <UserTable
                                            title="Chefs"
                                            users={filteredChefs}
                                            {...restOfProps}
                                        />
                                    </Box>
                                )}
                                {filteredDrivers.length > 0 && (
                                    <Box sx={{ mb: { xs: 3, md: 4 } }}>
                                        <UserTable
                                            title="Drivers"
                                            users={filteredDrivers}
                                            {...restOfProps}
                                        />
                                    </Box>
                                )}
                                {filteredDistributors.length > 0 && (
                                    <Box sx={{ mb: { xs: 3, md: 4 } }}>
                                        <UserTable
                                            title="Distributors"
                                            users={filteredDistributors}
                                            {...restOfProps}
                                        />
                                    </Box>
                                )}
                            </Suspense>
                        )}

                        {pagination &&
                            pagination.totalPages > 1 &&
                            !normalizedQuery &&
                            roleFilter === "ALL" && (
                                <PaginationComponent
                                    pagination={pagination}
                                    onPageChange={onPageChange}
                                />
                            )}
                    </Paper>

                    <Dialog
                        open={open}
                        onClose={handleClose}
                        fullWidth
                        maxWidth="sm"
                        fullScreen={typeof window !== "undefined" && window.innerWidth < 600}
                        sx={{
                            "& .MuiDialog-paper": {
                                m: { xs: 1, sm: 2 },
                                maxHeight: { xs: "calc(100% - 16px)", sm: "calc(100% - 64px)" },
                            },
                        }}>
                        <DialogTitle
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                pr: 2,
                                py: { xs: 2, sm: 2.5 },
                                fontWeight: 700,
                                fontSize: { xs: "1rem", sm: "1.25rem" },
                            }}>
                            Add New Staff Member
                            <IconButton
                                onClick={handleClose}
                                sx={{ borderRadius: 1, ml: 1 }}>
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        </DialogTitle>
                        <form onSubmit={handleSubmit}>
                            <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
                                <TextField
                                    label="First Name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    size="small"
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            fontSize: { xs: "0.875rem", sm: "1rem" },
                                        },
                                    }}
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
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            fontSize: { xs: "0.875rem", sm: "1rem" },
                                        },
                                    }}
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
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            fontSize: { xs: "0.875rem", sm: "1rem" },
                                        },
                                    }}
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
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            fontSize: { xs: "0.875rem", sm: "1rem" },
                                        },
                                    }}
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
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            fontSize: { xs: "0.875rem", sm: "1rem" },
                                        },
                                    }}
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
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            fontSize: { xs: "0.875rem", sm: "1rem" },
                                        },
                                    }}
                                />
                                <TextField
                                    select
                                    label="Role"
                                    name="role"
                                    value={form.role}
                                    onChange={handleRoleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    size="small"
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            fontSize: { xs: "0.875rem", sm: "1rem" },
                                        },
                                    }}>
                                    <MenuItem value="ADMIN">Admin</MenuItem>
                                    <MenuItem value="CHEF">Chef</MenuItem>
                                    <MenuItem value="DRIVER">Driver</MenuItem>
                                    <MenuItem value="DISTRIBUTOR">Distributor</MenuItem>
                                </TextField>
                                {form.role === "CHEF" && (
                                    <TextField
                                        select
                                        label="Product Group"
                                        name="productGroup"
                                        value={form.productGroup || ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                productGroup: e.target.value as
                                                    | "SWEETS"
                                                    | "BAKERY",
                                            })
                                        }
                                        fullWidth
                                        margin="normal"
                                        size="small"
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                fontSize: { xs: "0.875rem", sm: "1rem" },
                                            },
                                        }}>
                                        <MenuItem value="">Not Set</MenuItem>
                                        <MenuItem value="SWEETS">
                                            Sweets
                                        </MenuItem>
                                        <MenuItem value="BAKERY">
                                            Bakery
                                        </MenuItem>
                                    </TextField>
                                )}
                                {formError && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {formError}
                                    </Alert>
                                )}
                            </DialogContent>
                            <DialogActions
                                sx={{
                                    px: { xs: 2, sm: 3 },
                                    pb: { xs: 2, sm: 3 },
                                    pt: 2,
                                    flexDirection: { xs: "column", sm: "row" },
                                    gap: { xs: 1, sm: 0 },
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
                                        : "Create Staff Member"}
                                </Button>
                            </DialogActions>
                        </form>
                    </Dialog>
                </Box>
        </Box>
    );
}

export default function AdminStaffPage() {
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
                <AdminStaffContent />
            </Suspense>
        </ProtectedRoute>
    );
}
