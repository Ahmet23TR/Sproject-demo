import React, { useState, useEffect } from "react";
import {
    TextField,
    MenuItem,
    Switch,
    FormControlLabel,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
} from "@mui/material";
import {
    fetchCategories,
    Category,
} from "../../../../../services/productService";

interface ProductFormData {
    name: string;
    description: string;
    categoryId: string;
    unit: "PIECE" | "KG" | "TRAY";
    productGroup: "SWEETS" | "BAKERY";
    isActive: boolean;
    imageUrl?: string | null;
}

interface ProductEditFormProps {
    formData: ProductFormData;
    onChange: (field: keyof ProductFormData, value: string | boolean) => void;
    onDelete: () => void;
}

const ProductEditForm = ({
    formData,
    onChange,
    onDelete,
}: ProductEditFormProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        setCategoriesLoading(true);
        fetchCategories()
            .then(setCategories)
            .finally(() => setCategoriesLoading(false));
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        onChange(name as keyof ProductFormData, value);
    };

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange("isActive", event.target.checked);
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        onDelete();
        setDeleteDialogOpen(false);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Product Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                    />

                    <TextField
                        select
                        label="Main Group"
                        name="productGroup"
                        value={formData.productGroup}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined">
                        <MenuItem value="SWEETS">Sweets</MenuItem>
                        <MenuItem value="BAKERY">Bakery Products</MenuItem>
                    </TextField>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isActive}
                                onChange={handleSwitchChange}
                                name="isActive"
                                color="primary"
                            />
                        }
                        label={
                            formData.isActive
                                ? "Product Status: Active"
                                : "Product Status: Inactive"
                        }
                        sx={{
                            mt: 2,
                            display: "flex",
                            justifyContent: "flex-start",
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        select
                        label="Category"
                        name="categoryId"
                        value={
                            formData.categoryId &&
                            categories.some(
                                (cat) => cat.id === formData.categoryId
                            )
                                ? formData.categoryId
                                : ""
                        }
                        onChange={handleInputChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        disabled={categoriesLoading}
                        helperText={
                            categoriesLoading ? "Loading categories..." : ""
                        }>
                        {categories.length === 0 && !categoriesLoading && (
                            <MenuItem value="" disabled>
                                No categories available
                            </MenuItem>
                        )}
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined">
                        <MenuItem value="PIECE">Piece</MenuItem>
                        <MenuItem value="KG">Kilogram</MenuItem>
                        <MenuItem value="TRAY">Tray</MenuItem>
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <TextField
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={4}
                        variant="outlined"
                        placeholder="Enter product description..."
                    />
                </Grid>
            </Grid>

            {/* Delete Button */}
            <Box
                sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteClick}
                    fullWidth>
                    Delete Product
                </Button>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description">
                <DialogTitle id="delete-dialog-title">
                    Delete Product
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete &quot;{formData.name}
                        &quot;? This action cannot be undone. All associated
                        data will be permanently removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductEditForm;
