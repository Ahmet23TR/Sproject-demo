import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import type { FileWithPath } from "react-dropzone";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface ProductImageDropzoneProps {
    onFileAccepted: (file: File, url: string) => void;
    previewUrl: string | null;
}

const ProductImageDropzone: React.FC<ProductImageDropzoneProps> = ({
    onFileAccepted,
    previewUrl,
}) => {
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
        useDropzone({
            accept: {
                "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
            },
            maxFiles: 1,
            maxSize: MAX_IMAGE_SIZE,
            onDrop: (acceptedFiles: FileWithPath[]) => {
                setUploadError(null); // Clear any previous errors

                if (acceptedFiles[0]) {
                    const file = acceptedFiles[0];

                    // Validate file type
                    if (!file.type.startsWith("image/")) {
                        setUploadError("Please select a valid image file");
                        return;
                    }

                    // Create blob URL immediately for preview
                    const url = URL.createObjectURL(file);
                    onFileAccepted(file, url);
                }
            },
            onDropRejected: (rejectedFiles) => {
                const rejection = rejectedFiles[0];
                if (rejection?.errors[0]?.code === "file-too-large") {
                    setUploadError("File size must be less than 5MB");
                } else if (rejection?.errors[0]?.code === "file-invalid-type") {
                    setUploadError(
                        "Please select a valid image file (JPEG, PNG, GIF, WebP)"
                    );
                } else {
                    setUploadError("File upload failed. Please try again.");
                }
            },
        });
    return (
        <div>
            <div
                {...getRootProps()}
                style={{
                    border: `2px dashed ${
                        uploadError
                            ? "#f44336"
                            : isDragActive
                            ? "#1976d2"
                            : "#aaa"
                    }`,
                    borderRadius: 8,
                    padding: 20,
                    textAlign: "center",
                    cursor: "pointer",
                    background: isDragActive ? "#e3f2fd" : "#fff",
                    width: "100%",
                    minHeight: 300,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.2s ease-in-out",
                }}>
                <input {...getInputProps()} />

                {previewUrl ? (
                    <div style={{ position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl}
                            alt="Product Preview"
                            style={{
                                maxWidth: 250,
                                maxHeight: 250,
                                borderRadius: 10,
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
                                e.currentTarget.src = "/placeholder.png";
                            }}
                        />
                        <p
                            style={{
                                fontSize: 12,
                                margin: "8px 0 0 0",
                                color: "#666",
                                fontStyle: "italic",
                            }}>
                            Image ready for upload (will be saved when you click
                            Save)
                        </p>
                    </div>
                ) : (
                    <div>
                        <p
                            style={{
                                fontSize: 14,
                                margin: 0,
                                color: "#666",
                                lineHeight: 1.4,
                            }}>
                            {isDragActive
                                ? "Drop your image here..."
                                : "Drag and drop or click to select image"}
                        </p>
                        <p
                            style={{
                                fontSize: 12,
                                margin: "4px 0 0 0",
                                color: "#999",
                            }}>
                            Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                        </p>
                    </div>
                )}
            </div>

            {/* Display upload errors */}
            {uploadError && (
                <div
                    style={{
                        color: "#f44336",
                        fontSize: 13,
                        margin: "8px 0 0 0",
                        padding: "8px 12px",
                        backgroundColor: "#ffebee",
                        borderRadius: 4,
                        border: "1px solid #ffcdd2",
                    }}>
                    {uploadError}
                </div>
            )}

            {/* Display file rejection errors */}
            {fileRejections.length > 0 && !uploadError && (
                <div
                    style={{
                        color: "#f44336",
                        fontSize: 13,
                        margin: "8px 0 0 0",
                        padding: "8px 12px",
                        backgroundColor: "#ffebee",
                        borderRadius: 4,
                        border: "1px solid #ffcdd2",
                    }}>
                    {fileRejections[0].errors[0]?.message ||
                        "File upload failed"}
                </div>
            )}
        </div>
    );
};

export default ProductImageDropzone;
