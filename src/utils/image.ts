const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "") || "";

export function getImageUrl(url: string | null | undefined): string {
    if (!url) return "";

    // Handle blob URLs (for local file previews)
    if (url.startsWith("blob:")) {
        return url;
    }

    // Handle full URLs (http/https) - these are likely Cloudinary or external URLs
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    // Handle relative URLs - ensure proper concatenation
    if (url.startsWith("/")) {
        return `${API_BASE}${url}`;
    } else {
        return `${API_BASE}/${url}`;
    }
}
