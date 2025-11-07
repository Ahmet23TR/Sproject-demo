"use client";
import { Box, Typography, Card } from "@mui/material";
import { useRouter } from "next/navigation";
import WidgetsIcon from "@mui/icons-material/Widgets";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

export const QuickAccessCards = () => {
    const router = useRouter();

    const quickLinks = [
        {
            title: "Daily Products",
            description: "View product distribution summary",
            icon: <WidgetsIcon sx={{ fontSize: 32 }} />,
            href: "/distributor/products",
            color: "#C9A227",
        },
        {
            title: "Daily Orders",
            description: "View all daily orders",
            icon: <ReceiptLongIcon sx={{ fontSize: 32 }} />,
            href: "/distributor/orders",
            color: "#111827",
        },
    ];

    return (
        <Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                    },
                    gap: { xs: 2, sm: 2.5, md: 3 },
                }}>
                {quickLinks.map((link) => (
                    <Card
                        key={link.href}
                        onClick={() => router.push(link.href)}
                        sx={{
                            bgcolor: "#FFFFFF",
                            borderRadius: 3,
                            p: { xs: 3, sm: 3.5 },
                            border: "1px solid",
                            borderColor: "rgba(0, 0, 0, 0.06)",
                            boxShadow: "0 2px 12px rgba(17, 24, 39, 0.05)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                boxShadow: "0 8px 32px rgba(17, 24, 39, 0.12)",
                                borderColor: link.color,
                                transform: "translateY(-2px)",
                            },
                        }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 2,
                            }}>
                            {/* Icon */}
                            <Box
                                sx={{
                                    bgcolor: `${link.color}10`,
                                    color: link.color,
                                    borderRadius: 2,
                                    p: 1.5,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                {link.icon}
                            </Box>

                            {/* Text */}
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontFamily:
                                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                        fontWeight: 600,
                                        color: "#111827",
                                        fontSize: { xs: "16px", sm: "18px" },
                                        mb: 0.5,
                                    }}>
                                    {link.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#6B7280",
                                        fontSize: "14px",
                                        lineHeight: 1.5,
                                    }}>
                                    {link.description}
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};
