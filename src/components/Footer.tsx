"use client";
import React from "react";
import { Box, Typography, Container, Divider, Link } from "@mui/material";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: "#1C1C1E",
                color: "#FFFFFF",
                mt: "auto",
                py: 4,
                borderTop: "1px solid rgba(203, 161, 53, 0.2)",
            }}>
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", md: "center" },
                        gap: { xs: 3, md: 4 },
                    }}>
                    {/* Logo & Brand Section */}
                    <Box sx={{ maxWidth: { xs: "100%", md: 500 } }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontWeight: 600,
                                    color: "#CBA135",
                                    fontSize: 24,
                                }}>
                                Deras
                            </Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#A0A0A0",
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                lineHeight: 1.6,
                            }}>
                            Premium order management platform for modern
                            businesses. Streamline your operations with elegant
                            simplicity.
                        </Typography>
                    </Box>

                    {/* Contact Info */}
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 600,
                                mb: 2,
                                color: "#FFFFFF",
                            }}>
                            Contact
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#A0A0A0",
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: 14,
                                }}>
                                support@deras.com
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#A0A0A0",
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: 14,
                                }}>
                                +1 (555) 123-4567
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#A0A0A0",
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: 14,
                                    mt: 1,
                                }}>
                                Available 24/7 for premium support
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Divider */}
                <Divider
                    sx={{
                        my: 3,
                        borderColor: "rgba(203, 161, 53, 0.2)",
                    }}
                />

                {/* Copyright */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexDirection={{ xs: "column", md: "row" }}
                    gap={2}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#A0A0A0",
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: 14,
                        }}>
                        © {currentYear} Deras Order Platform. All rights
                        reserved.
                    </Typography>
                    <Box display="flex" gap={3}>
                        {[
                            { label: "Privacy Policy", href: "/privacy" },
                            { label: "Terms of Service", href: "/terms" },
                            { label: "Cookies", href: "/cookies" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                sx={{
                                    color: "#A0A0A0",
                                    textDecoration: "none",
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: 14,
                                    transition: "color 0.2s ease-in-out",
                                    "&:hover": {
                                        color: "#CBA135",
                                    },
                                }}>
                                {link.label}
                            </Link>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
