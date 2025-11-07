// src/components/OptimizedImage.tsx
"use client";

import Image from "next/image";
import { Box, BoxProps } from "@mui/material";
import { getImageUrl } from "../utils/image";

interface OptimizedImageProps extends Omit<BoxProps, "children"> {
    src: string | null | undefined;
    alt: string;
    fallbackSrc?: string;
    priority?: boolean;
    sizes?: string;
    objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
    objectPosition?: string;
}

export default function OptimizedImage({
    src,
    alt,
    fallbackSrc = "/placeholder.png",
    priority = false,
    sizes = "100vw",
    objectFit = "cover",
    objectPosition = "center",
    sx,
    ...boxProps
}: OptimizedImageProps) {
    const imageSrc = src ? getImageUrl(src) || fallbackSrc : fallbackSrc;

    // Use regular img tag for blob URLs (preview images)
    const isBlobUrl = imageSrc.startsWith("blob:");

    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                ...sx,
            }}
            {...boxProps}>
            {isBlobUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={imageSrc}
                    alt={alt}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit,
                        objectPosition,
                    }}
                />
            ) : (
                <Image
                    src={imageSrc}
                    alt={alt}
                    fill
                    priority={priority}
                    sizes={sizes}
                    style={{
                        objectFit,
                        objectPosition,
                    }}
                />
            )}
        </Box>
    );
}
