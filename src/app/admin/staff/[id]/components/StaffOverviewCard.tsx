"use client";
import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Grid,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import type { User } from "@/types/data";

interface StaffOverviewCardProps {
    user: User;
    staffSince: string;
    phoneDisplay: string;
    emailDisplay: string;
    addressDisplay: string;
    productGroupLabel: string;
    copiedId: boolean;
    onCopyStaffId: () => void;
    onToggleStatus: () => void;
    isActivating: boolean;
    toggleLabel: string;
}

const SummaryCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(3),
    },
    [theme.breakpoints.up("md")]: {
        padding: theme.spacing(4),
    },
    borderRadius: 16,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    backgroundColor: theme.palette.common.white,
    boxShadow: "0px 18px 40px rgba(15, 23, 42, 0.12)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
        gap: theme.spacing(3),
    },
}));

const MiniCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(2.5),
    },
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    backgroundColor: theme.palette.common.white,
    boxShadow: "0px 12px 24px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
}));

export const StaffOverviewCard = ({
    user,
    staffSince,
    phoneDisplay,
    emailDisplay,
    productGroupLabel,
    onToggleStatus,
    isActivating,
    toggleLabel,
}: StaffOverviewCardProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleToggleStatus = () => {
        handleMenuClose();
        onToggleStatus();
    };

    const initials = `${user.name?.[0] ?? "S"}${user.surname?.[0] ?? ""
        }`.toUpperCase();
    const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();
    const isActive = user.isActive;

    return (
        <SummaryCard>
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={{ xs: 2, md: 3 }}>
                <Stack
                    direction="row"
                    spacing={{ xs: 1.5, sm: 2.5 }}
                    alignItems="center"
                    sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Avatar
                        sx={{
                            bgcolor: "#2563eb",
                            width: { xs: 48, sm: 56, md: 64 },
                            height: { xs: 48, sm: 56, md: 64 },
                            fontSize: { xs: 18, sm: 20, md: 24 },
                        }}>
                        {initials}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{
                                color: "#0f172a",
                                mb: 0.5,
                                fontSize: { xs: "1.125rem", sm: "1.25rem", md: "1.5rem" },
                                wordBreak: "break-word",
                            }}>
                            {user.name} {user.surname}
                        </Typography>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 0.5, sm: 1.5 }}
                            alignItems={{ xs: "flex-start", sm: "center" }}>
                            <Chip
                                label={roleLabel}
                                size="small"
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: "rgba(59, 130, 246, 0.12)",
                                    color: "#1d4ed8",
                                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                }}
                            />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                                Joined {staffSince}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
                <Stack
                    direction="row"
                    spacing={{ xs: 1, sm: 1.5 }}
                    alignItems="center"
                    sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Chip
                        label={isActive ? "Active" : "Suspended"}
                        size="medium"
                        sx={{
                            fontWeight: 600,
                            backgroundColor: isActive
                                ? "rgba(16, 185, 129, 0.16)"
                                : "rgba(248, 113, 113, 0.18)",
                            color: isActive ? "#047857" : "#b91c1c",
                            fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                        }}
                    />
                    {/* <Tooltip title={copiedId ? "Copied!" : "Copy staff ID"}>
                        <IconButton
                            onClick={onCopyStaffId}
                            sx={{
                                borderRadius: 2,
                                border: "1px solid rgba(148, 163, 184, 0.45)",
                                color: "#475569",
                            }}>
                            <ContentCopyRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip> */}
                    <Button
                        variant="outlined"
                        onClick={handleMenuClick}
                        disabled={isActivating}
                        sx={{
                            minWidth: { xs: 36, sm: 40 },
                            width: { xs: 36, sm: 50 },
                            height: { xs: 36, sm: 40 },
                            padding: 0,
                            borderRadius: 1,
                            borderColor: "rgba(148, 163, 184, 0.5)",
                            "&:hover": {
                                borderColor: "rgba(148, 163, 184, 0.7)",
                            },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                        <MoreHorizRoundedIcon fontSize="small" />
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            "aria-labelledby": "basic-button",
                        }}
                        transformOrigin={{
                            horizontal: "right",
                            vertical: "top",
                        }}
                        anchorOrigin={{
                            horizontal: "right",
                            vertical: "bottom",
                        }}>
                        <MenuItem
                            onClick={handleToggleStatus}
                            disabled={isActivating}
                            sx={{
                                color: user.isActive ? "#b91c1c" : "#047857",
                                fontWeight: 600,
                                minWidth: 120,
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                            }}>
                            {isActivating ? "Processing..." : toggleLabel}
                        </MenuItem>
                    </Menu>
                </Stack>
            </Stack>

            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MiniCard>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                            Contact Details
                        </Typography>
                        <Stack spacing={1.2}>
                            <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center">
                                <PhoneOutlinedIcon
                                    fontSize="small"
                                    sx={{ color: "#2563eb" }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{
                                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                        wordBreak: "break-word",
                                    }}>
                                    {phoneDisplay}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center">
                                <MailOutlineRoundedIcon
                                    fontSize="small"
                                    sx={{ color: "#6366f1" }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{
                                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                        wordBreak: "break-word",
                                    }}>
                                    {emailDisplay}
                                </Typography>
                            </Stack>
                        </Stack>
                    </MiniCard>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MiniCard>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                            Role & Access
                        </Typography>
                        <Stack spacing={1.2}>
                            <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center">
                                <WorkOutlineOutlinedIcon
                                    fontSize="small"
                                    sx={{ color: "#f97316" }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                                    {roleLabel}
                                </Typography>
                            </Stack>
                            {user.role === "CHEF" && (
                                <Stack
                                    direction="row"
                                    spacing={1.2}
                                    alignItems="center">
                                    <BadgeOutlinedIcon
                                        fontSize="small"
                                        sx={{ color: "#22c55e" }}
                                    />
                                    <Typography
                                        variant="body2"
                                        color="text.primary"
                                        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                                        Product group: {productGroupLabel}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>
                    </MiniCard>
                </Grid>
                {/* <Grid size={{ xs: 12, md: 4 }}>
                    <MiniCard>
                        <Typography variant="subtitle2" color="text.secondary">
                            Address
                        </Typography>
                        <Stack direction="row" spacing={1.2} alignItems="flex-start">
                            <LocationOnOutlinedIcon fontSize="small" sx={{ color: "#10b981" }} />
                            <Typography variant="body2" color="text.primary">
                                {addressDisplay}
                            </Typography>
                        </Stack>
                    </MiniCard>
                </Grid> */}
            </Grid>
        </SummaryCard>
    );
};
