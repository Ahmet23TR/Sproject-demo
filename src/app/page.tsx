"use client";
import { Box, CircularProgress } from "@mui/material";
import { useHomePage } from "../hooks/useHomePage";
import { HeroSection } from "../components/home/HeroSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { ShowcaseSection } from "../components/home/ShowcaseSection";
import { SocialProofSection } from "../components/home/SocialProofSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { CTASection } from "../components/home/CTASection";

export default function Home() {
    const { user, authLoading } = useHomePage();

    // Auth durumu yüklenirken veya yönlendirme yapılırken boş bir ekran göster
    if (
        authLoading ||
        (user &&
            (user.role === "ADMIN" ||
                user.role === "CHEF" ||
                user.role === "DRIVER" ||
                user.role === "DISTRIBUTOR" ||
                user.role === "CLIENT"))
    ) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    bgcolor: "#000000",
                }}>
                <CircularProgress sx={{ color: "#C9A227" }} />
            </Box>
        );
    }

    // Landing page for non-authenticated users
    return (
        <Box>
            <HeroSection />
            <ShowcaseSection />
            <FeaturesSection />
            <SocialProofSection />
            <HowItWorksSection />
            <CTASection />
        </Box>
    );
}
