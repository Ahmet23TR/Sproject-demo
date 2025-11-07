"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { type Category as ProductCategory } from "@/services/productService";

export interface CategoriesModalProps {
    open: boolean;
    onClose: () => void;
    categories: ProductCategory[];
    creating?: boolean;
    updating?: boolean;
    deleting?: boolean;
    onCreate: (payload: { name: string; parentId?: string | null }) => void | Promise<void>;
    onUpdate: (id: string, payload: { name?: string; parentId?: string | null }) => void | Promise<void>;
    onDelete: (id: string) => void | Promise<void>;
}

export const CategoriesModal = ({
    open,
    onClose,
    categories,
    creating,
    updating,
    deleting,
    onCreate,
    onUpdate,
    onDelete,
}: CategoriesModalProps) => {
    const [name, setName] = useState("");
    const [parentId, setParentId] = useState<string | "" | null>("");
    const [editId, setEditId] = useState<string | null>(null);
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (!open) {
            setName("");
            setParentId("");
            setEditId(null);
        }
    }, [open]);

    const isEditMode = useMemo(() => Boolean(editId), [editId]);

    const handleSubmit = async () => {
        const payload = { name: name.trim(), parentId: parentId || null };
        if (!payload.name) return;
        if (isEditMode && editId) {
            await onUpdate(editId, payload);
        } else {
            await onCreate(payload);
        }
        setName("");
        setParentId("");
        setEditId(null);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                Manage Categories
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", gap: 2, flexDirection: "column", mt: 3 }}>
                    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                        <TextField
                            label={isEditMode ? "Edit category name" : "New category name"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            inputRef={nameInputRef}
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={creating || updating || !name.trim()}
                            sx={{
                                backgroundColor: "#C9A227",
                                color: "#000000",
                                fontWeight: 600,
                                borderRadius: "8px",
                            }}
                        >
                            {isEditMode ? "Update" : "Add"}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: "#6B7280" }}>
                            Existing Categories
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {categories.map((c) => (
                                <Box
                                    key={c.id}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "8px",
                                        p: 1.5,
                                    }}
                                >
                                    <Typography>{c.name}</Typography>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setEditId(c.id);
                                                setName(c.name);
                                                setParentId("");
                                                setTimeout(() => nameInputRef.current?.focus(), 0);
                                            }}
                                        >
                                            <EditOutlinedIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => onDelete(c.id)} disabled={Boolean(deleting)}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default CategoriesModal;

