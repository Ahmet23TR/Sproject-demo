import {
    Modal,
    Box,
    Typography,
    TextField,
    Alert,
    MenuItem,
    Grid,
} from "@mui/material";
import { LoadingButton } from "../../../../components/ui/LoadingButton";
import { useAsyncAction } from "../../../../hooks/useAsyncAction";
import { useToast } from "../../../../components/ui/ToastProvider";
import { Product } from "../../../../services/productService";
import { useProductForm } from "../../../../hooks/product/useProductForm";
import { ProductImageDropzone } from "./ProductImageDropzone";
import { useEffect, useState } from "react";
import {
    fetchCategories,
    Category,
    deleteProduct,
} from "../../../../services/productService";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { useAuth } from "../../../../context/AuthContext";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

interface ProductFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (updatedProduct?: Product) => void;
    productToEdit: Product | null;
    onOptimisticUpdateIsActive?: (id: string, isActive: boolean) => void;
}

export const ProductFormModal = ({
    open,
    onClose,
    onSuccess,
    productToEdit,
    onOptimisticUpdateIsActive,
}: ProductFormModalProps) => {
    const {
        formState,
        previewUrl,
        loading,
        error,
        isEditMode,
        isDirty,
        handleInputChange,
        handleFileAccepted,
        handleRemoveImage,
        handleSubmit,
    } = useProductForm(productToEdit, (updatedProduct?: Product) => {
        onSuccess(updatedProduct);
        onClose();
    });

    // Fetch categories
    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        if (open) fetchCategories().then(setCategories);
    }, [open]);

    const { token } = useAuth();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { showSuccess } = useToast();

    // Product deletion process with useAsyncAction
    const { run: runDelete, loading: deleteLoading } = useAsyncAction(
        async () => {
            if (!productToEdit || !token) return;
            await deleteProduct(productToEdit.id, token);
        },
        {
            onSuccess: () => {
                showSuccess("Product deleted successfully.");
                onSuccess(); // No product for deletion
                onClose();
                setDeleteDialogOpen(false);
            },
            showToastOnError: false, // We'll handle error manually
            errorMessage: "Product deletion failed. Please try again.",
        }
    );

    const handleDeleteProduct = () => {
        runDelete();
    };

    // Function to update active status immediately
    const handleActiveSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(e);
        if (productToEdit && onOptimisticUpdateIsActive) {
            onOptimisticUpdateIsActive(productToEdit.id, e.target.checked);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 550,
                    maxHeight: "96vh",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: "absolute", top: 8, right: 8 }}>
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" component="h2" mb={2}>
                    {isEditMode ? "Edit Product" : "Add New Product"}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Product Name"
                                    name="name"
                                    value={formState.name}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    margin="normal"
                                />
                                <TextField
                                    select
                                    label="Main Group"
                                    name="productGroup"
                                    value={formState.productGroup}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    margin="normal">
                                    <MenuItem value="SWEETS">Sweets</MenuItem>
                                    <MenuItem value="BAKERY">
                                        Bakery Products
                                    </MenuItem>
                                </TextField>
                                <TextField
                                    select
                                    label="Category"
                                    name="categoryId"
                                    value={formState.categoryId || ""}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    margin="normal">
                                    {categories.map((category) => (
                                        <MenuItem
                                            key={category.id}
                                            value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    label="Unit"
                                    name="unit"
                                    value={formState.unit}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    margin="normal">
                                    <MenuItem value="PIECE">Piece</MenuItem>
                                    <MenuItem value="KG">Kilogram</MenuItem>
                                    <MenuItem value="TRAY">Tray</MenuItem>
                                </TextField>
                                <TextField
                                    label="Description"
                                    name="description"
                                    value={formState.description}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                    multiline
                                    minRows={7}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formState.isActive}
                                            onChange={handleActiveSwitch}
                                            name="isActive"
                                            color="primary"
                                        />
                                    }
                                    label={
                                        formState.isActive
                                            ? "Product Status: Active"
                                            : "Product Status: Inactive"
                                    }
                                    sx={{
                                        mb: 2,
                                        mt: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                />
                                <Box my={2}>
                                    <ProductImageDropzone
                                        onFileAccepted={handleFileAccepted}
                                        previewUrl={previewUrl}
                                        onRemoveImage={handleRemoveImage}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        loading={loading}
                        disabled={!isEditMode ? false : !isDirty}
                        loadingLabel={isEditMode ? "Updating..." : "Adding..."}>
                        {isEditMode ? "Update" : "Add"}
                    </LoadingButton>
                </form>
                {/* Delete button only in edit mode */}
                {isEditMode && (
                    <LoadingButton
                        variant="outlined"
                        color="error"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={loading}>
                        Delete Product
                    </LoadingButton>
                )}
                {/* Delete confirmation dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this product? This
                            action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <LoadingButton
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deleteLoading}>
                            Cancel
                        </LoadingButton>
                        <LoadingButton
                            onClick={handleDeleteProduct}
                            color="error"
                            loading={deleteLoading}
                            loadingLabel="Deleting...">
                            Yes, Delete
                        </LoadingButton>
                    </DialogActions>
                </Dialog>
            </Box>
        </Modal>
    );
};
