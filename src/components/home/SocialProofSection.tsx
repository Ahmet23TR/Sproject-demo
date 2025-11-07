// src/components/home/SocialProofSection.tsx
import { Box, Typography, Container, Grid } from "@mui/material";
import Image from "next/image";

export const SocialProofSection = () => {
    return (
        <Box
            sx={{
                pt: { xs: 8, md: 12 },
                pb: { xs: 4, md: 6 },
                bgcolor: "#FFFFFF",
                position: "relative",
            }}>
            <Container maxWidth="lg">
                {/* Section Header */}
                <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
                    <Typography
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#C9A227",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            mb: 2,
                        }}>
                        Our Service Promise
                    </Typography>
                    <Typography
                        component="h2"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: { xs: "36px", md: "56px" },
                            fontWeight: 700,
                            color: "#111827",
                            mb: 3,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                        }}>
                        Every Event, Perfectly Executed
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: { xs: "17px", md: "19px" },
                            color: "#6B7280",
                            maxWidth: 700,
                            mx: "auto",
                            lineHeight: 1.7,
                        }}>
                        From corporate gatherings to special celebrations,
                        our team ensures seamless service.
                    </Typography>
                </Box>

                {/* Large Hero Image with Stats */}
                <Box
                    sx={{
                        position: "relative",
                        height: { xs: "400px", md: "500px" },
                        borderRadius: 4,
                        overflow: "hidden",
                        mb: { xs: 1.5, md: 2 },
                        boxShadow: "0 30px 80px rgba(0, 0, 0, 0.12)",
                    }}>
                    <Image
                        src="/service-promise.jpg"
                        alt="Our Service Promise hero image"
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="1200px"
                        priority
                    />
                    {/* Dark Overlay */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                                "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)",
                        }}
                    />
                    {/* Content Overlay */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: { xs: 4, md: 6 },
                        }}>
                        <Grid container spacing={4}>
                            {[
                                {
                                    number: "500+",
                                    label: "Events Catered",
                                },
                                {
                                    number: "98%",
                                    label: "Customer Satisfaction",
                                },
                                {
                                    number: "50+",
                                    label: "Corporate Clients",
                                },
                            ].map((stat, index) => (
                                <Grid size={{ xs: 12, sm: 4 }} key={index}>
                                    <Box
                                        sx={{
                                            textAlign: {
                                                xs: "center",
                                                sm: "left",
                                            },
                                        }}>
                                        <Typography
                                            sx={{
                                                fontFamily:
                                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                                fontSize: {
                                                    xs: "48px",
                                                    md: "64px",
                                                },
                                                fontWeight: 700,
                                                color: "#C9A227",
                                                lineHeight: 1,
                                                mb: 1,
                                            }}>
                                            {stat.number}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontFamily:
                                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                                fontSize: "16px",
                                                color: "rgba(255, 255, 255, 0.9)",
                                                fontWeight: 500,
                                            }}>
                                            {stat.label}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

