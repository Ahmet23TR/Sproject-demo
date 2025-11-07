import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    CircularProgress,
    Alert,
    Paper,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Product } from "../../../../../services/productService";
import { useProductOptions } from "../../../../../hooks/product/useProductOptions";

interface ProductOptionsSectionProps {
    product: Product | null;
}

const ProductOptionsSection = ({ product }: ProductOptionsSectionProps) => {
    const {
        detailedProduct,
        loading,
        error,
        addGroup,
        deleteGroup,
        addItem,
        deleteItem,
    } = useProductOptions(product);
    const [newGroupName, setNewGroupName] = useState("");
    const [newItemNames, setNewItemNames] = useState<Record<string, string>>(
        {}
    );
    const [newItemPrices, setNewItemPrices] = useState<Record<string, string>>(
        {}
    );
    const [newItemMultipliers, setNewItemMultipliers] = useState<
        Record<string, string>
    >({});
    const [expandedGroups, setExpandedGroups] = useState<
        Record<string, boolean>
    >({});

    // Auto-expand all groups when product is loaded
    useEffect(() => {
        if (detailedProduct?.optionGroups) {
            const expanded: Record<string, boolean> = {};
            detailedProduct.optionGroups.forEach((group) => {
                expanded[group.id] = true; // Set all groups to expanded
            });
            setExpandedGroups(expanded);
        }
    }, [detailedProduct]);

    // Auto-expand newly added groups
    useEffect(() => {
        if (detailedProduct?.optionGroups) {
            detailedProduct.optionGroups.forEach((group) => {
                if (!(group.id in expandedGroups)) {
                    setExpandedGroups((prev) => ({
                        ...prev,
                        [group.id]: true,
                    }));
                }
            });
        }
    }, [detailedProduct?.optionGroups, expandedGroups]);

    const handleAddGroup = async () => {
        if (newGroupName.trim()) {
            await addGroup(newGroupName.trim());
            setNewGroupName("");
        }
    };

    const handleAddItem = async (groupId: string) => {
        const itemName = newItemNames[groupId]?.trim();
        const priceValue = newItemPrices[groupId]?.trim();
        const multiplierValue = newItemMultipliers[groupId]?.trim();

        // Ensure only one value is provided
        if (!itemName) return;

        if (priceValue && multiplierValue) {
            // This shouldn't happen due to UI constraints, but just in case
            return;
        }

        if (!priceValue && !multiplierValue) {
            // At least one value must be provided
            return;
        }

        const itemPrice = priceValue ? parseFloat(priceValue) : 0;
        const itemMultiplier = multiplierValue
            ? parseFloat(multiplierValue)
            : undefined;

        if (priceValue && isNaN(itemPrice)) return;
        if (multiplierValue && (isNaN(itemMultiplier!) || itemMultiplier! <= 0))
            return;

        await addItem(groupId, itemName, itemPrice, itemMultiplier);
        setNewItemNames((prev) => ({ ...prev, [groupId]: "" }));
        setNewItemPrices((prev) => ({ ...prev, [groupId]: "" }));
        setNewItemMultipliers((prev) => ({ ...prev, [groupId]: "" }));
    };

    const handleGroupExpand =
        (groupId: string) =>
        (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpandedGroups((prev) => ({
                ...prev,
                [groupId]: isExpanded,
            }));
        };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Option Groups */}
            <Box display="flex" flexDirection="column" gap={2}>
                {detailedProduct?.optionGroups?.length ? (
                    detailedProduct.optionGroups.map((group) => (
                        <Accordion
                            key={group.id}
                            expanded={expandedGroups[group.id] ?? true}
                            onChange={handleGroupExpand(group.id)}
                            sx={{
                                borderRadius: "12px !important",
                                "&:before": { display: "none" },
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}>
                            <Box sx={{ position: "relative" }}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        borderRadius: 3,
                                        "&:hover": {
                                            bgcolor: "action.hover",
                                        },
                                        "& .MuiAccordionSummary-content": {
                                            alignItems: "center",
                                            margin: "16px 0",
                                        },
                                    }}>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        width="100%">
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}>
                                            {group.name}
                                        </Typography>
                                        <Chip
                                            label={`${group.items.length} options`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mr: 6 }}
                                        />
                                    </Box>
                                </AccordionSummary>
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteGroup(group.id);
                                    }}
                                    size="small"
                                    aria-label="Delete Group"
                                    sx={{
                                        position: "absolute",
                                        top: 12,
                                        right: 48,
                                        zIndex: 10,
                                        bgcolor: "background.paper",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        "&:hover": {
                                            bgcolor: "error.light",
                                            borderColor: "error.main",
                                            color: "error.main",
                                        },
                                    }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            <AccordionDetails sx={{ pt: 0 }}>
                                <Divider sx={{ mb: 2 }} />

                                {/* Option Items List */}
                                <List dense sx={{ px: 0, mb: 2 }}>
                                    {group.items.length ? (
                                        group.items.map((item) => (
                                            <ListItem
                                                key={item.id}
                                                sx={{
                                                    pl: 0,
                                                    borderRadius: 1,
                                                    mb: 1,
                                                    "&:hover": {
                                                        bgcolor: "action.hover",
                                                    },
                                                }}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() =>
                                                            deleteItem(item.id)
                                                        }
                                                        aria-label="Delete Option"
                                                        size="small">
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                }>
                                                <ListItemText
                                                    primary={
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 1,
                                                            }}>
                                                            <Typography variant="body1">
                                                                {item.name}
                                                            </Typography>
                                                            {item.price !==
                                                                undefined &&
                                                                item.price >
                                                                    0 && (
                                                                    <Chip
                                                                        label={`+${item.price} AED`}
                                                                        size="small"
                                                                        color="primary"
                                                                        variant="outlined"
                                                                    />
                                                                )}
                                                            {item.multiplier !==
                                                                undefined &&
                                                                item.multiplier !==
                                                                    null &&
                                                                Number(
                                                                    item.multiplier
                                                                ) !== 1 && (
                                                                    <Chip
                                                                        label={`x${item.multiplier}`}
                                                                        size="small"
                                                                        color="secondary"
                                                                        variant="outlined"
                                                                    />
                                                                )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ textAlign: "center", py: 2 }}>
                                            No options added yet
                                        </Typography>
                                    )}
                                </List>

                                {/* Add New Item Form */}
                                <Box
                                    display="flex"
                                    gap={2}
                                    alignItems="center"
                                    sx={{ mt: 1 }}>
                                    <TextField
                                        size="small"
                                        label="Option Name"
                                        value={newItemNames[group.id] || ""}
                                        onChange={(e) =>
                                            setNewItemNames((prev) => ({
                                                ...prev,
                                                [group.id]: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                        sx={{ flex: 1 }}
                                        placeholder="e.g., Large, Extra Cheese..."
                                    />
                                    <TextField
                                        size="small"
                                        label="Price (AED)"
                                        type="number"
                                        value={newItemPrices[group.id] || ""}
                                        onChange={(e) => {
                                            setNewItemPrices((prev) => ({
                                                ...prev,
                                                [group.id]: e.target.value,
                                            }));
                                            // Clear multiplier when price is entered
                                            if (e.target.value.trim()) {
                                                setNewItemMultipliers(
                                                    (prev) => ({
                                                        ...prev,
                                                        [group.id]: "",
                                                    })
                                                );
                                            }
                                        }}
                                        variant="outlined"
                                        sx={{ width: 120 }}
                                        inputProps={{ min: 0, step: 0.01 }}
                                        disabled={
                                            !!newItemMultipliers[
                                                group.id
                                            ]?.trim()
                                        }
                                    />
                                    <TextField
                                        size="small"
                                        label="Multiplier"
                                        type="number"
                                        value={
                                            newItemMultipliers[group.id] || ""
                                        }
                                        onChange={(e) => {
                                            setNewItemMultipliers((prev) => ({
                                                ...prev,
                                                [group.id]: e.target.value,
                                            }));
                                            // Clear price when multiplier is entered
                                            if (e.target.value.trim()) {
                                                setNewItemPrices((prev) => ({
                                                    ...prev,
                                                    [group.id]: "",
                                                }));
                                            }
                                        }}
                                        variant="outlined"
                                        sx={{ width: 100 }}
                                        inputProps={{ min: 0, step: 0.1 }}
                                        placeholder="e.g., 1.5, 2"
                                        disabled={
                                            !!newItemPrices[group.id]?.trim()
                                        }
                                        helperText={
                                            newItemPrices[group.id]?.trim()
                                                ? "Disabled (using price)"
                                                : ""
                                        }
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleAddItem(group.id)}
                                        startIcon={<AddIcon />}
                                        disabled={
                                            !newItemNames[group.id]?.trim() ||
                                            (!newItemPrices[group.id]?.trim() &&
                                                !newItemMultipliers[
                                                    group.id
                                                ]?.trim())
                                        }
                                        sx={{ minWidth: 100 }}>
                                        Add
                                    </Button>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))
                ) : (
                    <Paper
                        variant="outlined"
                        sx={{ p: 4, textAlign: "center" }}>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ mb: 1 }}>
                            No Option Groups
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Add your first option group to get started with
                            product variants
                        </Typography>
                    </Paper>
                )}
            </Box>

            {/* Add New Group */}
            <Divider sx={{ my: 4 }} />
            <Paper variant="outlined" sx={{ p: 3, bgcolor: "primary.50" }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Add New Option Group
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                    <TextField
                        size="small"
                        label="Group Name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        variant="outlined"
                        sx={{ flex: 1 }}
                        placeholder="e.g., Size, Toppings, Flavor..."
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddGroup}
                        startIcon={<AddIcon />}
                        disabled={!newGroupName.trim()}
                        sx={{ minWidth: 120 }}>
                        Add Group
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ProductOptionsSection;
