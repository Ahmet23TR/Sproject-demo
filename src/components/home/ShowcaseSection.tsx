// src/components/home/ShowcaseSection.tsx
import { Box, Typography, Container } from "@mui/material";
import Image from "next/image";

export const ShowcaseSection = () => {
    return (
        <Box
            sx={{
                py: { xs: 8, md: 12 },
                bgcolor: "#FFFFFF",
                position: "relative",
                overflow: "hidden",
            }}>
            {/* Subtle glow */}
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "1000px",
                    height: "1000px",
                    background:
                        "radial-gradient(circle, rgba(201, 162, 39, 0.05) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                {/* Section Header */}
                <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
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
                        Our Premium Offerings
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
                        Crafted with Excellence
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
                        From our kitchen to your table, every detail matters.
                    </Typography>
                </Box>

                {/* Large Feature Image */}
                <Box
                    sx={{
                        position: "relative",
                        height: { xs: "400px", md: "600px" },
                        borderRadius: 4,
                        overflow: "hidden",
                        boxShadow: "0 40px 100px rgba(0, 0, 0, 0.15)",
                        mb: { xs: 4, md: 6 },
                    }}>
                    <Image
                        src="/elegant-event.jpg"
                        alt="Unforgettable event experiences with premium catering and elegant presentation"
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 1200px"
                        quality={100}
                        priority
                        unoptimized
                    />
                    {/* Lighter gradient overlay for better image clarity */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: { xs: 4, md: 6 },
                            background:
                                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
                        }}>
                        <Typography
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: { xs: "28px", md: "40px" },
                                fontWeight: 700,
                                color: "#FFFFFF",
                                mb: 2,
                                letterSpacing: "-0.01em",
                            }}>
                            Unforgettable Event Experiences
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: { xs: "16px", md: "18px" },
                                color: "rgba(255, 255, 255, 0.9)",
                                maxWidth: 600,
                                lineHeight: 1.7,
                            }}>
                            From elegant table settings to exquisite Turkish
                            delicacies, we transform every gathering into a
                            memorable celebration with style and sophistication.
                        </Typography>
                    </Box>
                </Box>

                {/* Two Column Images */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: { xs: 4, md: 6 },
                    }}>
                    {/* Food Preparation Image */}
                    <Box
                        sx={{
                            position: "relative",
                            height: { xs: "300px", md: "400px" },
                            borderRadius: 3,
                            overflow: "hidden",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
                            transition:
                                "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                                transform: "translateY(-8px)",
                                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.5)",
                            },
                        }}>
                        <Image
                            src="/food-preparation.jpg"
                            alt="Artisan food preparation with premium ingredients"
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 4,
                                background:
                                    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                            }}>
                            <Typography
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: { xs: "22px", md: "26px" },
                                    fontWeight: 600,
                                    color: "#FFFFFF",
                                    mb: 1,
                                }}>
                                Artisan Craftsmanship
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: "15px",
                                    color: "rgba(255, 255, 255, 0.9)",
                                    lineHeight: 1.6,
                                }}>
                                Every dish crafted with premium ingredients
                                and traditional techniques.
                            </Typography>
                        </Box>
                    </Box>

                    {/* Premium Packaging Image */}
                    <Box
                        sx={{
                            position: "relative",
                            height: { xs: "300px", md: "400px" },
                            borderRadius: 3,
                            overflow: "hidden",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
                            transition:
                                "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                                transform: "translateY(-8px)",
                                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.5)",
                            },
                        }}>
                        <Image
                            src="/premium-packaging.jpg"
                            alt="Luxury packaging and presentation"
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 4,
                                background:
                                    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                            }}>
                            <Typography
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: { xs: "22px", md: "26px" },
                                    fontWeight: 600,
                                    color: "#FFFFFF",
                                    mb: 1,
                                }}>
                                Premium Presentation
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: "15px",
                                    color: "rgba(255, 255, 255, 0.9)",
                                    lineHeight: 1.6,
                                }}>
                                Every order packaged with care in elegant,
                                luxury presentation.
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

