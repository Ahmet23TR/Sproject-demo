// src/components/WelcomeModal.tsx
"use client";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TouchAppIcon from "@mui/icons-material/TouchApp";

interface WelcomeModalProps {
    open: boolean;
    onClose: () => void;
}

const demoUsers = [
    {
        role: "Admin",
        email: "admin@sproject.demo",
        password: "demo123",
        color: "error" as const,
    },
    {
        role: "Client (Palm)",
        email: "lina@palmbistro.demo",
        password: "demo123",
        color: "primary" as const,
    },
    {
        role: "Client (Sunrise)",
        email: "omar@sunrisecatering.demo",
        password: "demo123",
        color: "primary" as const,
    },
    {
        role: "Chef",
        email: "chef.selim@sproject.demo",
        password: "demo123",
        color: "warning" as const,
    },
    {
        role: "Driver",
        email: "driver.yusuf@sproject.demo",
        password: "demo123",
        color: "info" as const,
    },
    {
        role: "Distributor",
        email: "nadia@coastaldist.demo",
        password: "demo123",
        color: "secondary" as const,
    },
];

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: 6,
                },
            }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            bgcolor: "secondary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                        }}>
                        <Typography variant="h5" fontWeight={700}>
                            D
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={600}>
                            Welcome to Deras Demo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Explore our multi-role catering platform
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ py: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        🎯 What is this demo?
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph>
                        This is a fully functional demonstration of
                        comprehensive catering management platform. You can
                        explore different user roles and features without any
                        backend setup. All data is mocked locally in your
                        browser.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        ✨ Key Features
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon
                                    color="success"
                                    fontSize="small"
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary="Role-based dashboards"
                                secondary="Admin, Client, Chef, Driver, and Distributor interfaces"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon
                                    color="success"
                                    fontSize="small"
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary="Complete workflows"
                                secondary="Order management, production tracking, delivery coordination"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon
                                    color="success"
                                    fontSize="small"
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary="Rich demo data"
                                secondary="Pre-populated products, orders, analytics, and user interactions"
                            />
                        </ListItem>
                    </List>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="h6"
                        gutterBottom
                        fontWeight={600}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <SwapHorizIcon /> How to Switch Roles
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph>
                        Look for the{" "}
                        <Chip
                            label="DEMO MODE"
                            color="secondary"
                            size="small"
                            sx={{ mx: 0.5 }}
                        />{" "}
                        switcher in the top-right corner of every page. Click it
                        to instantly switch between different user roles and
                        explore their unique dashboards.
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            mt: 1,
                            p: 2,
                            bgcolor: "action.hover",
                            borderRadius: 2,
                        }}>
                        <TouchAppIcon color="primary" />
                        <Typography variant="body2" fontWeight={500}>
                            You can also drag the demo switcher anywhere on the
                            screen and minimize it when not needed!
                        </Typography>
                    </Box>
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        🔑 Demo User Credentials
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph>
                        Use these credentials to login, or simply use the role
                        switcher:
                    </Typography>
                    <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: "action.hover" }}>
                                    <TableCell>
                                        <strong>Role</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Email</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Password</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {demoUsers.map((user) => (
                                    <TableRow key={user.email} hover>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                color={user.color}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontFamily="monospace">
                                                {user.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontFamily="monospace">
                                                {user.password}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: "info.lighter",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "info.light",
                    }}>
                    <Typography
                        variant="body2"
                        color="info.dark"
                        fontWeight={500}>
                        💡 <strong>Pro Tip:</strong> Click the info button (ℹ️)
                        in the bottom-left corner anytime to see this guide
                        again!
                    </Typography>
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2.5 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth>
                    Start Exploring
                </Button>
            </DialogActions>
        </Dialog>
    );
}
