import {
    TextField,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Fade,
    InputAdornment,
    Divider,
} from "@mui/material";
import { LoadingButton } from "../../../components/ui/LoadingButton";
import { usePasswordChange } from "../../../hooks/auth/usePasswordChange";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
}

export const ChangePasswordModal = ({
    open,
    onClose,
}: ChangePasswordModalProps) => {
    const { form, loading, error, success, handleChange, handleSubmit } =
        usePasswordChange(onClose);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    background:
                        "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.16)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    overflow: "hidden",
                },
            }}>
            {/* Header with gradient accent */}
            <Box
                sx={{
                    position: "relative",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background:
                            "linear-gradient(90deg, #C9A227 0%, #E0C097 100%)",
                    },
                }}>
                <DialogTitle
                    sx={{
                        pt: 3,
                        pb: 2,
                        px: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#111827",
                    }}>
                    <SecurityIcon
                        sx={{ color: "secondary.main", fontSize: 28 }}
                    />
                    Change Password
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: "absolute",
                            right: 16,
                            top: 16,
                            color: "text.secondary",
                            "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.04)",
                                color: "#111827",
                            },
                        }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
            </Box>

            <DialogContent sx={{ px: 3, pb: 2 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6 }}>
                    Please enter your current password and choose a new secure
                    password
                </Typography>

                <form id="password-form" onSubmit={handleSubmit}>
                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField
                            label="Current Password"
                            name="oldPassword"
                            type="password"
                            value={form.oldPassword}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOpenIcon
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 20,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    },
                                },
                            }}
                        />

                        <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />

                        <TextField
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={form.newPassword}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 20,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    },
                                },
                            }}
                        />

                        <TextField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 20,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    },
                                },
                            }}
                        />

                        {(error || success) && (
                            <Fade in={!!(error || success)}>
                                <Box>
                                    {error && (
                                        <Alert
                                            severity="error"
                                            sx={{
                                                borderRadius: 3,
                                                boxShadow:
                                                    "0 4px 12px rgba(239, 68, 68, 0.15)",
                                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                                mb: success ? 1 : 0,
                                            }}>
                                            {error}
                                        </Alert>
                                    )}
                                    {success && (
                                        <Alert
                                            severity="success"
                                            sx={{
                                                borderRadius: 3,
                                                boxShadow:
                                                    "0 4px 12px rgba(22, 163, 74, 0.15)",
                                                border: "1px solid rgba(22, 163, 74, 0.2)",
                                            }}>
                                            {success}
                                        </Alert>
                                    )}
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </form>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        borderRadius: 2.5,
                        px: 3,
                        py: 1.2,
                        fontWeight: 500,
                        textTransform: "none",
                        color: "#111827",
                        "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.04)",
                        },
                    }}>
                    Cancel
                </Button>
                <LoadingButton
                    type="submit"
                    form="password-form"
                    variant="contained"
                    loading={loading}
                    sx={{
                        borderRadius: 2.5,
                        px: 4,
                        py: 1.2,
                        fontWeight: 600,
                        textTransform: "none",
                        background:
                            "linear-gradient(135deg, #C9A227 0%, #E0C097 100%)",
                        color: "#000000",
                        boxShadow: "0 8px 24px rgba(201, 162, 39, 0.25)",
                        "&:hover": {
                            background:
                                "linear-gradient(135deg, #E0C097 0%, #C9A227 100%)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 12px 32px rgba(201, 162, 39, 0.35)",
                        },
                        "&:disabled": {
                            background: "#f5f5f5",
                            color: "#9ca3af",
                            boxShadow: "none",
                            transform: "none",
                        },
                        transition: "all 0.2s ease-in-out",
                    }}>
                    {loading ? "Changing..." : "Change Password"}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
