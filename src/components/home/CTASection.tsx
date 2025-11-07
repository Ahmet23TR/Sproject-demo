// src/components/home/CTASection.tsx
import { Box, Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowForward } from "@mui/icons-material";

export const CTASection = () => {
    const router = useRouter();

    return (
        <Box
            sx={{
                py: { xs: 12, md: 20 },
                bgcolor: "#FFFFFF",
                color: "#111827",
                position: "relative",
                overflow: "hidden",
            }}>
            {/* Subtle Background Glow */}
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "800px",
                    height: "800px",
                    background:
                        "radial-gradient(circle, rgba(201, 162, 39, 0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <Container maxWidth="md">
                <Box
                    sx={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: 1,
                    }}>
                    {/* Heading */}
                    <Typography
                        component="h2"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: { xs: "40px", md: "64px" },
                            fontWeight: 700,
                            color: "#111827",
                            mb: 4,
                            lineHeight: 1.15,
                            letterSpacing: "-0.02em",
                        }}>
                        Ready to Begin?
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: { xs: "18px", md: "20px" },
                            color: "#6B7280",
                            mb: 8,
                            lineHeight: 1.7,
                            maxWidth: 650,
                            mx: "auto",
                        }}>
                        Join forward-thinking catering businesses who trust our
                        platform to deliver excellence every day.
                    </Typography>

                    {/* CTA Button */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: 3,
                            justifyContent: "center",
                            flexDirection: { xs: "column", sm: "row" },
                            px: { xs: 2, sm: 0 },
                            mb: 12,
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
                                px: 7,
                                py: 2.5,
                                borderRadius: 2,
                                textTransform: "none",
                                boxShadow:
                                    "0 8px 32px rgba(201, 162, 39, 0.35)",
                                transition:
                                    "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                    bgcolor: "#E0C097",
                                    transform: "translateY(-2px)",
                                    boxShadow:
                                        "0 12px 48px rgba(201, 162, 39, 0.45)",
                                },
                            }}>
                            Create Account
                        </Button>
                        <Button
                            onClick={() => router.push("/login")}
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 600,
                                fontSize: 16,
                                color: "#111827",
                                px: 7,
                                py: 2.5,
                                borderRadius: 2,
                                textTransform: "none",
                                border: "1px solid rgba(0, 0, 0, 0.12)",
                                backdropFilter: "blur(10px)",
                                bgcolor: "rgba(0, 0, 0, 0.04)",
                                transition:
                                    "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                    borderColor: "rgba(201, 162, 39, 0.5)",
                                    bgcolor: "rgba(201, 162, 39, 0.12)",
                                },
                            }}>
                            Sign In
                        </Button>
                    </Box>

                    {/* Trust Indicators - Minimalist */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: { xs: 2, sm: 4 },
                            flexWrap: "wrap",
                            pt: 8,
                            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                        }}>
                        {[
                            "No credit card required",
                            "Cancel anytime",
                            "Premium support",
                        ].map((text, index) => (
                            <Typography
                                key={index}
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: "13px",
                                    color: "#6B7280",
                                    letterSpacing: "0.5px",
                                }}>
                                {text}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

