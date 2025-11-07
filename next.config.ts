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
            {
                protocol: "http",
                hostname: "localhost",
                port: "8080",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
