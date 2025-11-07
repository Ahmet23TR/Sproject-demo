import { useState, useEffect } from "react";
import {
    Product,
    createProduct,
    updateProduct,
    uploadProductImage,
    deleteProductImage,
} from "../../services/productService";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errorHandler";

const initialFormState = {
    name: "",
    description: "",
    unit: "PIECE" as "PIECE" | "KG" | "TRAY",
    categoryId: "",
    imageUrl: null as string | null,
    isActive: true,
    productGroup: "SWEETS" as "SWEETS" | "BAKERY",
};

export const useProductForm = (
    productToEdit: Product | null,
    onSuccess: (updatedProduct?: Product) => void
) => {
    const { token } = useAuth();
    const [formState, setFormState] = useState(initialFormState);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [initialForm, setInitialForm] = useState<
        typeof initialFormState | null
    >(null);

    const isEditMode = Boolean(productToEdit);

    useEffect(() => {
        if (isEditMode && productToEdit) {
            setFormState({
                name: productToEdit.name || "",
                description: productToEdit.description || "",
                unit: productToEdit.unit || "PIECE",
                categoryId: productToEdit.categoryId || "",
                imageUrl: productToEdit.imageUrl || null,
                isActive: productToEdit.isActive,
                productGroup: productToEdit.productGroup || "SWEETS",
            });
            setInitialForm({
                name: productToEdit.name || "",
                description: productToEdit.description || "",
                unit: productToEdit.unit || "PIECE",
                categoryId: productToEdit.categoryId || "",
                imageUrl: productToEdit.imageUrl || null,
                isActive: productToEdit.isActive,
                productGroup: productToEdit.productGroup || "SWEETS",
            });
            // Only set previewUrl if it's not a blob URL (which would be invalid after refresh)
            const existingImageUrl = productToEdit.imageUrl || null;
            if (existingImageUrl && !existingImageUrl.startsWith("blob:")) {
                setPreviewUrl(existingImageUrl);
            } else {
                setPreviewUrl(null);
            }
            setImageFile(null); // Önceki resim dosyasını temizle
        } else {
            setFormState(initialFormState); // Yeni ürün eklerken formu sıfırla
            setInitialForm(initialFormState);
            setPreviewUrl(null);
            setImageFile(null); // Önceki resim dosyasını temizle
        }
    }, [productToEdit, isEditMode]);

    // Cleanup blob URLs when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | { name?: string; value: unknown }
        >
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        if (type === "checkbox") {
            setFormState({ ...formState, [name!]: checked });
        } else {
            setFormState({ ...formState, [name!]: value as string });
        }
    };

    const handleFileAccepted = (file: File, blobUrl: string) => {
        // Clean up any existing blob URL first
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setImageFile(file);
        setPreviewUrl(blobUrl); // This is only for preview - never sent to backend

        // CRITICAL: Clear formState.imageUrl when new file is selected
        // This ensures we don't accidentally send old/blob URLs to backend
        setFormState({ ...formState, imageUrl: null });
    };

    const handleRemoveImage = () => {
        // Clean up blob URL if it exists
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }
        setImageFile(null);
        setPreviewUrl(null);
        setFormState({ ...formState, imageUrl: null });
    };

    const handleDeleteImage = async () => {
        if (
            !token ||
            !isEditMode ||
            !productToEdit ||
            !productToEdit.imageUrl
        ) {
            setError(
                "Cannot delete image: product not available or no image exists"
            );
            return;
        }

        setIsDeleting(true);
        setError("");

        try {
            // Delete image from backend
            const updatedProduct = await deleteProductImage(
                productToEdit.id,
                token
            );

            // Update form state to reflect the deleted image
            setFormState({ ...formState, imageUrl: null });

            // Clean up any preview
            if (previewUrl) {
                if (previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
            }

            // Clear any selected file
            setImageFile(null);

            // Update initial form state to reflect the change
            if (initialForm) {
                setInitialForm({ ...initialForm, imageUrl: null });
            }

            // Notify parent component with updated product
            onSuccess(updatedProduct);
        } catch (error) {
            const errorMessage = getApiErrorMessage(error);

            // Handle specific delete errors
            if (errorMessage.includes("no image to delete")) {
                setError("This product has no image to delete.");
            } else {
                setError(`Image deletion failed: ${errorMessage}`);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const isDirty = (() => {
        if (!initialForm) return false;
        return (
            formState.name !== initialForm.name ||
            formState.description !== initialForm.description ||
            formState.unit !== initialForm.unit ||
            formState.categoryId !== initialForm.categoryId ||
            formState.imageUrl !== initialForm.imageUrl ||
            formState.isActive !== initialForm.isActive ||
            formState.productGroup !== initialForm.productGroup ||
            Boolean(imageFile)
        );
    })();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!formState.name) {
            return setError("Product name is required.");
        }
        if (!formState.categoryId) {
            return setError("Category selection is required.");
        }
        if (!token) return;

        setLoading(true);
        try {
            let updatedProduct: Product;

            if (isEditMode && productToEdit) {
                // If there's a new image file, upload it first
                if (imageFile) {
                    try {
                        updatedProduct = await uploadProductImage(
                            productToEdit.id,
                            imageFile,
                            token
                        );

                        // Clean up the blob URL immediately after successful upload
                        if (previewUrl && previewUrl.startsWith("blob:")) {
                            URL.revokeObjectURL(previewUrl);
                            setPreviewUrl(updatedProduct.imageUrl);
                        }

                        // Update form state with new image URL
                        setFormState((prev) => ({
                            ...prev,
                            imageUrl: updatedProduct.imageUrl,
                        }));
                    } catch (uploadError) {
                        console.error("❌ Image upload failed:", uploadError);
                        setError(
                            `Image upload failed: ${getApiErrorMessage(
                                uploadError
                            )}. Please try again.`
                        );
                        return;
                    }
                }

                // Now update other product fields if needed
                const payload = { ...formState };

                // Update the product with current form data
                updatedProduct = await updateProduct(
                    productToEdit.id,
                    payload,
                    token
                );
            } else {
                // For new products, create first then upload image if provided
                const payload = { ...formState, imageUrl: null }; // Create without image first
                updatedProduct = await createProduct(payload, token);

                // If there's an image file, upload it after product creation
                if (imageFile) {
                    try {
                        updatedProduct = await uploadProductImage(
                            updatedProduct.id,
                            imageFile,
                            token
                        );

                        // Clean up the blob URL immediately after successful upload
                        if (previewUrl && previewUrl.startsWith("blob:")) {
                            URL.revokeObjectURL(previewUrl);
                            setPreviewUrl(updatedProduct.imageUrl);
                        }
                    } catch (uploadError) {
                        console.error("❌ Image upload failed:", uploadError);
                        setError(
                            `Product created but image upload failed: ${getApiErrorMessage(
                                uploadError
                            )}. You can try uploading the image again later.`
                        );
                        // Don't return here - product was created successfully
                    }
                }
            }

            onSuccess(updatedProduct); // Pass the updated/created product to callback
        } catch (err) {
            console.error("❌ Product operation failed:", err);

            // Handle errors
            const errorMessage = getApiErrorMessage(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
            setImageFile(null); // Form submit sonrası resim dosyasını temizle

            // Clean up any remaining blob URLs on error or completion
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
        }
    };

    return {
        formState,
        previewUrl,
        loading,
        isDeleting,
        error,
        isEditMode,
        isDirty,
        handleInputChange,
        handleFileAccepted,
        handleRemoveImage,
        handleDeleteImage,
        handleSubmit,
    };
};
