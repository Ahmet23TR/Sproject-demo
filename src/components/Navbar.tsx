// src/components/Navbar.tsx
"use client";
import { AppBar, Toolbar, Box, CircularProgress } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { useNavbar } from "../hooks/useNavbar";

export default function Navbar() {
    const { loading, logoHref } = useNavbar();

    if (loading) {
        return (
            <AppBar
                position="static"
                color="default"
                elevation={0}
                sx={{ borderBottom: "1px solid #e0e0e0" }}>
                <Toolbar sx={{ justifyContent: "center" }}>
                    <CircularProgress size={24} />
                </Toolbar>
            </AppBar>
        );
    }

    return (
        <AppBar
            position="static"
            color="default"
            elevation={0}
            sx={{
                bgcolor: "background.paper",
                borderBottom: "1px solid #e0e0e0",
            }}>
            <Toolbar
                sx={{
                    justifyContent: "space-between",
                    minHeight: 72,
                    px: { xs: 2, md: 4 },
                }}>
                <Link href={logoHref} passHref>
                    <Box
                        sx={{
                            height: 100,
                            width: "auto",
                            cursor: "pointer",
                            position: "relative",
                            minWidth: 120, // Ensure proper aspect ratio
                        }}>
                        <Image
                            src="/deras-logo.jpg"
                            alt="Deras Logo"
                            fill
                            priority
                            sizes="120px"
                            style={{
                                objectFit: "contain",
                                objectPosition: "center",
                            }}
                        />
                    </Box>
                </Link>
            </Toolbar>
        </AppBar>
    );
}
