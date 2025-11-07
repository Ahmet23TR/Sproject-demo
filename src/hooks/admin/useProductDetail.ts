import { useState, useEffect, useCallback } from "react";
import {
    Product,
    fetchAdminProductDetail,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    deleteProductImage,
    ProductPayload,
} from "../../services/productService";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errorHandler";
import { useToast } from "../../components/ui/ToastProvider";
import { useRouter } from "next/navigation";

interface ProductFormData {
    name: string;
    description: string;
    categoryId: string;
    unit: "PIECE" | "KG" | "TRAY";
    productGroup: "SWEETS" | "BAKERY";
    isActive: boolean;
    imageUrl?: string | null;
}

export const useProductDetail = (productId: string) => {
    const { token } = useAuth();
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string>("");
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        categoryId: "",
        unit: "PIECE",
        productGroup: "SWEETS",
        isActive: true,
        imageUrl: null,
    });
    const [originalFormData, setOriginalFormData] =
        useState<ProductFormData | null>(null);

    // Form değişiklik kontrolü (imageUrl excluded since images are saved immediately)
    const isFormDirty = originalFormData
        ? JSON.stringify({
              name: formData.name,
              description: formData.description,
              categoryId: formData.categoryId,
              unit: formData.unit,
              productGroup: formData.productGroup,
              isActive: formData.isActive,
          }) !==
          JSON.stringify({
              name: originalFormData.name,
              description: originalFormData.description,
              categoryId: originalFormData.categoryId,
              unit: originalFormData.unit,
              productGroup: originalFormData.productGroup,
              isActive: originalFormData.isActive,
          })
        : false;

    // Ürün detaylarını getir
    const fetchProduct = useCallback(async () => {
        if (!token || !productId) return;

        setLoading(true);
        setError("");

        try {
            const data = await fetchAdminProductDetail(productId, token);
            setProduct(data);

            const newFormData: ProductFormData = {
                name: data.name,
                description: data.description || "",
                categoryId: data.categoryId || "",
                unit: data.unit,
                productGroup: data.productGroup,
                isActive: data.isActive,
                imageUrl: data.imageUrl,
            };

            setFormData(newFormData);
            setOriginalFormData(newFormData);
        } catch (error) {
            const errorMessage = getApiErrorMessage(error);
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [productId, token, showError]);

    // Form verilerini güncelle
    const handleFormChange = useCallback(
        (field: keyof ProductFormData, value: string | boolean) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        },
        []
    );

    // Resim değiştir
    const handleImageChange = useCallback((imageUrl: string | null) => {
        setFormData((prev) => ({
            ...prev,
            imageUrl,
        }));
    }, []);

    // Handle image file upload
    const handleImageUpload = useCallback(
        async (file: File) => {
            if (!token || !product)
                throw new Error("Product or token not available");

            setIsUploading(true);
            try {
                // Upload image to backend
                const updatedProduct = await uploadProductImage(
                    product.id,
                    file,
                    token
                );

                // Update product state with new image URL
                setProduct(updatedProduct);
                handleImageChange(updatedProduct.imageUrl);

                showSuccess("Image uploaded successfully!");
                return updatedProduct;
            } catch (error) {
                const errorMessage = getApiErrorMessage(error);
                showError(`Image upload failed: ${errorMessage}`);
                throw error;
            } finally {
                setIsUploading(false);
            }
        },
        [token, product, handleImageChange, showSuccess, showError]
    );

    // Handle image deletion
    const handleImageDelete = useCallback(async () => {
        if (!token || !product || !product.imageUrl)
            throw new Error("Cannot delete: no product or image");

        setIsDeleting(true);
        try {
            // Delete image from backend
            const updatedProduct = await deleteProductImage(product.id, token);

            // Update product state with imageUrl set to null
            setProduct(updatedProduct);
            handleImageChange(updatedProduct.imageUrl);

            showSuccess("Image deleted successfully!");
            return updatedProduct;
        } catch (error) {
            const errorMessage = getApiErrorMessage(error);

            // Handle specific delete errors
            if (errorMessage.includes("no image to delete")) {
                showError("This product has no image to delete.");
            } else {
                showError(`Image deletion failed: ${errorMessage}`);
            }
            throw error;
        } finally {
            setIsDeleting(false);
        }
    }, [token, product, handleImageChange, showSuccess, showError]);

    // Ürün kaydet
    const handleSaveProduct = useCallback(async () => {
        if (!token || !product || !isFormDirty) return;

        setSaving(true);

        try {
            const payload: ProductPayload = {
                name: formData.name,
                description: formData.description || undefined,
                categoryId: formData.categoryId || undefined,
                unit: formData.unit,
                productGroup: formData.productGroup,
                isActive: formData.isActive,
                // imageUrl excluded - images are saved immediately via separate API calls
            };

            const updatedProduct = await updateProduct(
                product.id,
                payload,
                token
            );
            setProduct(updatedProduct);
            setOriginalFormData(formData);
            showSuccess("Product updated successfully!");
        } catch (error) {
            const errorMessage = getApiErrorMessage(error);
            showError(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [token, product, formData, isFormDirty, showSuccess, showError]);

    // Ürün sil
    const handleDeleteProduct = useCallback(async () => {
        if (!token || !product) return;

        setSaving(true);

        try {
            await deleteProduct(product.id, token);
            showSuccess("Product deleted successfully!");
            router.push("/admin/products");
        } catch (error) {
            const errorMessage = getApiErrorMessage(error);
            showError(errorMessage);
            setSaving(false);
        }
    }, [token, product, showSuccess, showError, router]);

    // İlk yükleme
    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    return {
        product,
        loading,
        error,
        saving,
        isUploading,
        isDeleting,
        formData,
        isFormDirty,
        handleFormChange,
        handleImageChange,
        handleImageUpload,
        handleImageDelete,
        handleSaveProduct,
        handleDeleteProduct,
        refetchProduct: fetchProduct,
    };
};
