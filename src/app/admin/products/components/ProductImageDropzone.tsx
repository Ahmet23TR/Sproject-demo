import { useDropzone, FileWithPath } from "react-dropzone";
import { Box, Typography, IconButton, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getImageUrl } from "../../../../utils/image";
import { useState } from "react";

interface DropzoneProps {
    onFileAccepted: (file: FileWithPath, previewUrl: string) => void;
    previewUrl: string | null;
    onRemoveImage?: () => void;
}

export const ProductImageDropzone = ({
    onFileAccepted,
    previewUrl,
    onRemoveImage,
}: DropzoneProps) => {
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
        useDropzone({
            onDrop: (acceptedFiles) => {
                setUploadError(null); // Clear any previous errors

                if (acceptedFiles.length > 0) {
                    const file = acceptedFiles[0];

                    // Validate file type
                    if (!file.type.startsWith("image/")) {
                        setUploadError("Please select a valid image file");
                        return;
                    }

                    // Create blob URL immediately for preview
                    const blobUrl = URL.createObjectURL(file);
                    onFileAccepted(file, blobUrl);
                }
            },
            onDropRejected: (rejectedFiles) => {
                const rejection = rejectedFiles[0];
                if (rejection?.errors[0]?.code === "file-too-large") {
                    setUploadError("File size must be less than 5MB");
                } else if (rejection?.errors[0]?.code === "file-invalid-type") {
                    setUploadError(
                        "Please select a valid image file (JPEG, PNG, GIF)"
                    );
                } else {
                    setUploadError("File upload failed. Please try again.");
                }
            },
            accept: {
                "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
            },
            maxSize: 5 * 1024 * 1024, // 5MB
            multiple: false,
        });

    return (
        <Box>
            <Box
                {...getRootProps()}
                sx={{
                    border: "2px dashed",
                    borderColor: isDragActive
                        ? "primary.main"
                        : uploadError
                        ? "error.main"
                        : "grey.400",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: isDragActive ? "primary.50" : "#f9f9f9",
                    position: "relative",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "primary.50",
                    },
                }}>
                <input {...getInputProps()} />
                {previewUrl ? (
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={getImageUrl(previewUrl)}
                            alt="Product Preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: 200,
                                borderRadius: "8px",
                                objectFit: "cover",
                                border: "1px solid #e0e0e0",
                            }}
                            onLoad={() => {
                                // Clear any previous errors when image loads successfully
                                setUploadError(null);
                            }}
                            onError={(e) => {
                                console.error(
                                    "Image failed to load:",
                                    previewUrl
                                );
                                // If it's a blob URL that failed, it's likely invalid from a previous session
                                if (
                                    previewUrl?.startsWith("blob:") &&
                                    onRemoveImage
                                ) {
                                    onRemoveImage(); // Clear the invalid preview
                                    setUploadError(
                                        "Invalid image file. Please select a new image."
                                    );
                                } else {
                                    e.currentTarget.src = "/placeholder.png";
                                }
                            }}
                        />
                        {onRemoveImage && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveImage();
                                    setUploadError(null); // Clear errors when removing image
                                }}
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    bgcolor: "rgba(255,255,255,0.9)",
                                    "&:hover": {
                                        bgcolor: "rgba(255,255,255,1)",
                                    },
                                }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                mt: 1,
                                color: "text.secondary",
                            }}>
                            Image ready for upload (will be saved when you click
                            Save)
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        <CloudUploadIcon
                            sx={{ fontSize: 48, color: "grey.400", mb: 1 }}
                        />
                        <Typography color="text.secondary" sx={{ mb: 1 }}>
                            {isDragActive
                                ? "Drop your image here..."
                                : "Drag and drop or click here to upload image"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Display upload errors */}
            {uploadError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {uploadError}
                </Alert>
            )}

            {/* Display file rejection errors */}
            {fileRejections.length > 0 && !uploadError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {fileRejections[0].errors[0]?.message ||
                        "File upload failed"}
                </Alert>
            )}
        </Box>
    );
};
