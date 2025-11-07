import React, { useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    Product,
    uploadProductImage,
    deleteProductImage,
} from "../../../../../services/productService";
import DeleteIcon from "@mui/icons-material/Delete";
import ProductImageDropzone from "../../../../../components/ProductImageDropzone";
import { getImageUrl } from "../../../../../utils/image";
import { getApiErrorMessage } from "../../../../../utils/errorHandler";
import { useAuth } from "../../../../../context/AuthContext";

interface ProductImageSectionProps {
    product: Product | null;
    onImageChange: (imageUrl: string | null) => void;
    onImageUpload?: (updatedProduct: Product) => void;
    onImageDelete?: (updatedProduct: Product) => void;
    // Optional handlers that will be called instead of direct API calls
    uploadHandler?: (file: File) => Promise<Product>;
    deleteHandler?: () => Promise<Product>;
}

const ProductImageSection = ({
    product,
    onImageChange,
    onImageUpload,
    onImageDelete,
    uploadHandler,
    deleteHandler,
}: ProductImageSectionProps) => {
    const { token } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploadError, setUploadError] = useState<string>("");
    const [deleteError, setDeleteError] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileAccepted = async (file: File, blobUrl: string) => {
        if (!product || !token) {
            setUploadError("Product or authentication not available");
            return;
        }

        // Set preview immediately for better UX
        setPreviewUrl(blobUrl);
        setUploading(true);
        setUploadError("");

        try {
            if (uploadHandler) {
                // Use provided upload handler (from parent hook)
                const updatedProduct = await uploadHandler(file);

                // Clean up blob URL
                URL.revokeObjectURL(blobUrl);
                setPreviewUrl(null);

                // Clear any errors since upload was successful
                setUploadError("");

                // Update the form state immediately with the new image URL
                onImageChange(updatedProduct.imageUrl);

                // Notify parent component about the updated product
                if (onImageUpload) {
                    onImageUpload(updatedProduct);
                }
            } else {
                // Fallback to direct API call (original behavior)
                const updatedProduct = await uploadProductImage(
                    product.id,
                    file,
                    token
                );

                // Clean up blob URL
                URL.revokeObjectURL(blobUrl);
                setPreviewUrl(null);

                // Update the form with the new image URL
                onImageChange(updatedProduct.imageUrl);

                // Notify parent component about the updated product
                if (onImageUpload) {
                    onImageUpload(updatedProduct);
                }
            }
        } catch (error) {
            console.error("❌ Upload failed:", error);
            const errorMessage = getApiErrorMessage(error);
            setUploadError(`Upload failed: ${errorMessage}`);

            // Clean up blob URL on error
            URL.revokeObjectURL(blobUrl);
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!product || !token || !product.imageUrl) {
            setDeleteError(
                "Cannot delete image: product or authentication not available, or no image exists"
            );
            return;
        }

        // Confirm deletion
        if (
            !window.confirm(
                "Are you sure you want to delete this image? This action cannot be undone."
            )
        ) {
            return;
        }

        setDeleting(true);
        setDeleteError("");
        setUploadError(""); // Clear any upload errors

        try {
            if (deleteHandler) {
                // Use provided delete handler (from parent hook)
                const updatedProduct = await deleteHandler();

                // Clear any errors since delete was successful
                setDeleteError("");

                // Update the form state immediately with null image URL
                onImageChange(updatedProduct.imageUrl);

                // Notify parent component about the updated product
                if (onImageDelete) {
                    onImageDelete(updatedProduct);
                }
            } else {
                // Fallback to direct API call (original behavior)
                const updatedProduct = await deleteProductImage(
                    product.id,
                    token
                );

                // Update the form with null image URL
                onImageChange(updatedProduct.imageUrl);

                // Notify parent component about the updated product
                if (onImageDelete) {
                    onImageDelete(updatedProduct);
                }
            }
        } catch (error) {
            console.error("❌ Delete failed:", error);
            const errorMessage = getApiErrorMessage(error);

            // Handle specific delete errors
            if (errorMessage.includes("no image to delete")) {
                setDeleteError("This product has no image to delete.");
            } else {
                setDeleteError(`Delete failed: ${errorMessage}`);
            }
        } finally {
            setDeleting(false);
        }
    };

    const handleRemoveImage = () => {
        // Clean up any preview URL
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setUploadError("");
        setDeleteError("");
        onImageChange(null);
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Product Image
            </Typography>

            <Box
                sx={{
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    mb: 2,
                    flex: 1,
                    minHeight: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                {product?.imageUrl || previewUrl ? (
                    <>
                        <Box
                            component="img"
                            src={previewUrl || getImageUrl(product?.imageUrl)}
                            alt={product?.name || "Product image"}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 2,
                                bgcolor: "#f5f5f5",
                                opacity: uploading ? 0.7 : 1,
                            }}
                        />

                        {(uploading || deleting) && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 1,
                                }}>
                                <CircularProgress size={40} />
                                <Typography variant="body2" color="primary">
                                    {uploading ? "Uploading..." : "Deleting..."}
                                </Typography>
                            </Box>
                        )}

                        <IconButton
                            onClick={
                                previewUrl && previewUrl.startsWith("blob:")
                                    ? handleRemoveImage
                                    : handleDeleteImage
                            }
                            disabled={uploading || deleting}
                            sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                bgcolor: "rgba(255, 255, 255, 0.9)",
                                "&:hover": {
                                    bgcolor: "rgba(255, 255, 255, 1)",
                                },
                            }}
                            size="small"
                            title={
                                previewUrl && previewUrl.startsWith("blob:")
                                    ? "Remove preview"
                                    : "Delete image from server"
                            }>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </>
                ) : (
                    <ProductImageDropzone
                        onFileAccepted={handleFileAccepted}
                        previewUrl={null}
                    />
                )}
            </Box>

            {/* Error display */}
            {uploadError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {uploadError}
                </Alert>
            )}

            {deleteError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {deleteError}
                </Alert>
            )}

            {/* Upload new image button - only show if no image exists */}
            {!product?.imageUrl && !previewUrl && (
                <Alert severity="info" sx={{ mt: 2, fontSize: "0.875rem" }}>
                    <Typography variant="body2">
                        <strong>Recommended:</strong> Upload a square image (1:1
                        ratio) for best results.
                        <br />
                        <strong>File formats:</strong> JPG, PNG, WebP
                        <br />
                        <strong>Max size:</strong> 5MB
                    </Typography>
                </Alert>
            )}
        </Box>
    );
};

export default ProductImageSection;
