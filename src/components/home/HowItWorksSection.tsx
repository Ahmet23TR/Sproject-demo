// src/components/home/HowItWorksSection.tsx
import { Box, Typography, Container } from "@mui/material";
import {
    PersonAdd,
    ShoppingCart,
    Kitchen,
    CheckCircle,
} from "@mui/icons-material";

interface Step {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}

const steps: Step[] = [
    {
        number: "01",
        icon: <PersonAdd sx={{ fontSize: 40 }} />,
        title: "Create Your Account",
        description:
            "Sign up in seconds and get instant access to our platform. No credit card required.",
    },
    {
        number: "02",
        icon: <ShoppingCart sx={{ fontSize: 40 }} />,
        title: "Browse & Order",
        description:
            "Explore our menu, customize your order, and schedule delivery at your convenience.",
    },
    {
        number: "03",
        icon: <Kitchen sx={{ fontSize: 40 }} />,
        title: "We Prepare",
        description:
            "Our professional chefs prepare your order with premium ingredients and attention to detail.",
    },
    {
        number: "04",
        icon: <CheckCircle sx={{ fontSize: 40 }} />,
        title: "Enjoy & Track",
        description:
            "Track your delivery in real-time and enjoy premium quality catering services.",
    },
];

export const HowItWorksSection = () => {
    return (
        <Box
            sx={{
                pt: { xs: 6, md: 8 },
                pb: { xs: 12, md: 16 },
                bgcolor: "#FFFFFF",
            }}>
            <Container maxWidth="lg">
                {/* Section Header */}
                <Box sx={{ textAlign: "center", mb: { xs: 8, md: 12 } }}>
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
                        Simple Process
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
                        Getting Started is Effortless
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
                        Four simple steps to transform your catering operations.
                    </Typography>
                </Box>

                {/* Steps Timeline */}
                <Box
                    sx={{
                        maxWidth: 900,
                        mx: "auto",
                        position: "relative",
                    }}>
                    {steps.map((step, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                gap: { xs: 3, md: 6 },
                                mb: { xs: 6, md: 8 },
                                position: "relative",
                                alignItems: "flex-start",
                                flexDirection: { xs: "column", sm: "row" },
                            }}>
                            {/* Step Number & Icon */}
                            <Box
                                sx={{
                                    position: "relative",
                                    minWidth: { xs: "auto", sm: 120 },
                                }}>
                                <Box
                                    sx={{
                                        width: { xs: 64, md: 80 },
                                        height: { xs: 64, md: 80 },
                                        borderRadius: 2,
                                        bgcolor: "rgba(201, 162, 39, 0.08)",
                                        border:
                                            "1px solid rgba(201, 162, 39, 0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#C9A227",
                                        transition:
                                            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        "&:hover": {
                                            bgcolor: "#C9A227",
                                            color: "#000000",
                                            transform: "scale(1.05)",
                                        },
                                    }}>
                                    {step.icon}
                                </Box>
                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            left: 40,
                                            top: 90,
                                            width: "1px",
                                            height: { xs: 60, md: 80 },
                                            background:
                                                "linear-gradient(180deg, rgba(201, 162, 39, 0.3) 0%, rgba(201, 162, 39, 0.1) 100%)",
                                            display: {
                                                xs: "none",
                                                sm: "block",
                                            },
                                        }}
                                    />
                                )}
                            </Box>

                            {/* Content */}
                            <Box sx={{ flex: 1, pt: 1 }}>
                                <Box
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 2,
                                    }}>
                                    <Typography
                                        sx={{
                                            fontFamily:
                                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: "#C9A227",
                                            letterSpacing: "1px",
                                        }}>
                                        STEP {step.number}
                                    </Typography>
                                </Box>
                                <Typography
                                    sx={{
                                        fontFamily:
                                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                        fontSize: { xs: "24px", md: "28px" },
                                        fontWeight: 600,
                                        color: "#111827",
                                        mb: 2,
                                        letterSpacing: "-0.01em",
                                    }}>
                                    {step.title}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily:
                                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                        fontSize: "16px",
                                        color: "#6B7280",
                                        lineHeight: 1.7,
                                    }}>
                                    {step.description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
};

