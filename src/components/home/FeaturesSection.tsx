// src/components/home/FeaturesSection.tsx
import { Box, Typography, Container } from "@mui/material";
import {
    RestaurantMenu,
    LocalShipping,
    Assessment,
    Schedule,
    Security,
    Support,
} from "@mui/icons-material";

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: <RestaurantMenu sx={{ fontSize: 36 }} />,
        title: "Menu Management",
        description:
            "Effortlessly create and customize your catering menu with dynamic pricing and real-time updates.",
    },
    {
        icon: <LocalShipping sx={{ fontSize: 36 }} />,
        title: "Delivery Tracking",
        description:
            "Monitor every order from preparation to doorstep with live tracking and instant notifications.",
    },
    {
        icon: <Assessment sx={{ fontSize: 36 }} />,
        title: "Business Analytics",
        description:
            "Gain actionable insights with detailed reports on performance, revenue, and customer trends.",
    },
    {
        icon: <Schedule sx={{ fontSize: 36 }} />,
        title: "Smart Scheduling",
        description:
            "Plan ahead with intelligent order scheduling, perfect for events and recurring deliveries.",
    },
    {
        icon: <Security sx={{ fontSize: 36 }} />,
        title: "Enterprise Security",
        description:
            "Bank-level encryption and data protection ensure your information stays private and secure.",
    },
    {
        icon: <Support sx={{ fontSize: 36 }} />,
        title: "Premium Support",
        description:
            "Access our dedicated team around the clock for assistance, guidance, and expert advice.",
    },
];

const FeatureCard = ({ icon, title, description }: Feature) => (
    <Box
        sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            p: { xs: 4, md: 5 },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
                borderColor: "rgba(201, 162, 39, 0.35)",
            },
        }}
    >
        <Box
            sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#C9A227",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000000",
                mb: 3,
                mx: { xs: "auto", md: 0 },
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.6)",
            }}
        >
            {icon}
        </Box>
        <Typography
            sx={{
                fontFamily:
                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: { xs: "17px", md: "20px" },
                fontWeight: 700,
                color: "#111827",
                mb: 1,
                letterSpacing: "-0.01em",
            }}
        >
            {title}
        </Typography>
        <Typography
            sx={{
                fontFamily:
                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: { xs: "13px", md: "15px" },
                color: "#6B7280",
                lineHeight: 1.7,
            }}
        >
            {description}
        </Typography>
    </Box>
);

export const FeaturesSection = () => {
    return (
        <Box
            sx={{
                py: { xs: 10, md: 16 },
                bgcolor: "#FFFFFF",
                position: "relative",
            }}>
            <Container maxWidth="xl">
                {/* Section Header */}
                <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
                    <Typography
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#C9A227",
                            letterSpacing: "2.5px",
                            textTransform: "uppercase",
                            mb: 2,
                        }}>
                        Platform Features
                    </Typography>
                    <Typography
                        component="h2"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: { xs: "32px", md: "48px" },
                            fontWeight: 700,
                            color: "#111827",
                            mb: 2.5,
                            letterSpacing: "-0.025em",
                            lineHeight: 1.15,
                        }}>
                        Everything You Need
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: { xs: "16px", md: "18px" },
                            color: "#6B7280",
                            maxWidth: 650,
                            mx: "auto",
                            lineHeight: 1.7,
                        }}>
                        Powerful tools designed to streamline your operations and delight your customers.
                    </Typography>
                </Box>

                {/* Symmetrical 3x2 Grid */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                        gap: { xs: 2.5, md: 3 },
                        maxWidth: "1200px",
                        mx: "auto",
                    }}
                >
                    {features.map((feature, idx) => (
                        <FeatureCard
                            key={`${feature.title}-${idx}`}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </Box>
            </Container>
        </Box>
    );
};

