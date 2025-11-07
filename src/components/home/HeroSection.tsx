// src/components/home/HeroSection.tsx
import { Box, Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowForward } from "@mui/icons-material";

export const HeroSection = () => {
    const router = useRouter();

    return (
        <Box
            sx={{
                position: "relative",
                minHeight: { xs: "85vh", md: "100vh" },
                display: "flex",
                alignItems: "center",
                bgcolor: "#0A0A0A",
                color: "#FFFFFF",
                overflow: "hidden",
            }}>
            {/* Background Image Overlay */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(/hero-chef.jpg)',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                            "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)",
                    },
                }}
            />

            {/* Subtle Grain Texture */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.03,
                    backgroundImage:
                        "url(data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E)",
                    zIndex: 1,
                }}
            />

            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
                <Box
                    sx={{
                        maxWidth: 900,
                        mx: "auto",
                        textAlign: "center",
                        py: { xs: 8, md: 12 },
                    }}>


                    {/* Main Heading */}
                    <Typography
                        component="h1"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: {
                                xs: "48px",
                                sm: "64px",
                                md: "80px",
                                lg: "96px",
                            },
                            fontWeight: 700,
                            lineHeight: 1.1,
                            mb: 4,
                            letterSpacing: "-0.02em",
                            color: "#FFFFFF",
                        }}>
                        Elevate Your
                        <br />
                        <Box
                            component="span"
                            sx={{
                                background:
                                    "linear-gradient(135deg, #C9A227 0%, #E0C097 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                            Catering
                        </Box>{" "}
                        Experience
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: { xs: "18px", sm: "20px", md: "22px" },
                            fontWeight: 400,
                            color: "rgba(255, 255, 255, 0.75)",
                            mb: 6,
                            lineHeight: 1.7,
                            maxWidth: 650,
                            mx: "auto",
                        }}>
                        A sophisticated platform designed for modern catering
                        businesses. Seamlessly manage orders, streamline
                        operations, and deliver excellence.
                    </Typography>

                    {/* CTA Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: { xs: 2, sm: 3 },
                            justifyContent: "center",
                            flexDirection: { xs: "column", sm: "row" },
                            px: { xs: 2, sm: 0 },
                            mb: { xs: 6, md: 10 },
                        }}>
                        <Button
                            onClick={() => router.push("/register")}
                            endIcon={<ArrowForward />}
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 600,
                                fontSize: 16,
                                bgcolor: "#C9A227",
                                color: "#000000",
                                px: 6,
                                py: 2.5,
                                borderRadius: 2,
                                textTransform: "none",
                                width: { xs: "100%", sm: "auto" },
                                boxShadow:
                                    "0 8px 32px rgba(201, 162, 39, 0.35)",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                    bgcolor: "#E0C097",
                                    transform: "translateY(-2px)",
                                    boxShadow:
                                        "0 12px 48px rgba(201, 162, 39, 0.45)",
                                },
                            }}>
                            Start Your Journey
                        </Button>
                        <Button
                            onClick={() => router.push("/login")}
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 600,
                                fontSize: 16,
                                color: "#FFFFFF",
                                px: 6,
                                py: 2.5,
                                borderRadius: 2,
                                textTransform: "none",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                backdropFilter: "blur(10px)",
                                bgcolor: "rgba(255, 255, 255, 0.06)",
                                width: { xs: "100%", sm: "auto" },
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                    borderColor: "rgba(201, 162, 39, 0.5)",
                                    bgcolor: "rgba(201, 162, 39, 0.12)",
                                },
                            }}>
                            Sign In
                        </Button>
                    </Box>

                    {/* Minimalist Stats */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: { xs: 4, md: 8 },
                            flexWrap: "wrap",
                            pt: 4,
                            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                        }}>
                        {[
                            { value: "24/7", label: "Support" },
                            { value: "100%", label: "Secure" },
                            { value: "Fast", label: "Delivery" },
                        ].map((stat, index) => (
                            <Box
                                key={index}
                                sx={{
                                    textAlign: "center",
                                    minWidth: 100,
                                }}>
                                <Typography
                                    sx={{
                                        fontFamily:
                                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                        fontSize: "24px",
                                        fontWeight: 600,
                                        color: "#C9A227",
                                        mb: 0.5,
                                        letterSpacing: "-0.01em",
                                    }}>
                                    {stat.value}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily:
                                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                        fontSize: "13px",
                                        color: "rgba(255, 255, 255, 0.55)",
                                        letterSpacing: "0.5px",
                                        textTransform: "uppercase",
                                    }}>
                                    {stat.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

