import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // Cloudinary for displaying images (all uploads now handled by backend)
        domains: ["res.cloudinary.com"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                port: "",
                pathname: "/**",
            },
            // Add your backend domain here if it serves images directly
            // {
            //     protocol: "https",
            //     hostname: "your-backend-domain.com",
            //     port: "",
            //     pathname: "/images/**",
            // },
        ],
    },
};

export default nextConfig;
