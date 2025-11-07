// src/app/admin/products/components/ManageOptionsModal.tsx
import { Modal, Box, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Divider, CircularProgress, Alert, Paper, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { Product } from '../../../../services/productService';
import { useProductOptions } from '../../../../hooks/product/useProductOptions';
import { useState } from 'react';

interface ManageOptionsModalProps {
    open: boolean;
    onClose: () => void;
    product: Product | null;
}

export const ManageOptionsModal = ({ open, onClose, product }: ManageOptionsModalProps) => {
    const { detailedProduct, loading, error, addGroup, deleteGroup, addItem, deleteItem } = useProductOptions(product);
    const [newGroupName, setNewGroupName] = useState('');
    const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
    const [newItemPrices, setNewItemPrices] = useState<Record<string, string>>({});

    const handleAddItem = (groupId: string) => {
        const itemName = newItemNames[groupId]?.trim();
        const price = parseFloat(newItemPrices[groupId] || '0');

        if (itemName && itemName.length > 0 && !isNaN(price)) {
            addItem(groupId, itemName, price);
            setNewItemNames(prev => ({ ...prev, [groupId]: '' }));
            setNewItemPrices(prev => ({ ...prev, [groupId]: '' }));
        }
    };

    const handleAddGroup = () => {
        const groupName = newGroupName.trim();
        if (groupName && groupName.length > 0) {
            addGroup(groupName);
            setNewGroupName('');
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95vw', sm: 500, md: 600 }, bgcolor: 'background.paper', boxShadow: 24, p: { xs: 2, sm: 4 }, borderRadius: 4, maxHeight: '90vh', overflowY: 'auto' }}>
                {/* Title and close */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
                        {product?.name ? `"${product.name}" Options` : 'Manage Options'}
                    </Typography>
                    <IconButton onClick={onClose} size="large" aria-label="Close">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {loading && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Alert>}

                {/* Option Groups */}
                <Box display="flex" flexDirection="column" gap={2}>
                    {detailedProduct?.optionGroups?.length ? (
                        detailedProduct.optionGroups.map(group => (
                            <Paper key={group.id} elevation={2} sx={{ borderRadius: 3, p: 2, bgcolor: '#fafbfc' }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: 17 }}>{group.name}</Typography>
                                    <IconButton onClick={() => deleteGroup(group.id)} size="small" aria-label="Delete Group">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Divider sx={{ mb: 1 }} />
                                <List dense sx={{ px: 0 }}>
                                    {group.items.length ? group.items.map(item => (
                                        <ListItem key={item.id} sx={{ pl: 0 }}
                                            secondaryAction={
                                                <IconButton edge="end" onClick={() => deleteItem(item.id)} aria-label="Delete Option" size="small">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            }>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography>{item.name}</Typography>
                                                        <Chip
                                                            label={`${item.price} AED`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    )) : (
                                        <Typography color="text.secondary" fontStyle="italic" px={1} py={1}>
                                            No options in this group yet.
                                        </Typography>
                                    )}
                                </List>
                                <Box display="flex" gap={1} mt={1}>
                                    <TextField
                                        size="small"
                                        label="Option Name"
                                        value={newItemNames[group.id] || ''}
                                        onChange={(e) => setNewItemNames(prev => ({ ...prev, [group.id]: e.target.value }))}
                                        sx={{ flex: 2 }}
                                        variant="outlined"
                                    />
                                    <TextField
                                        size="small"
                                        label="Price Adjustment (AED)"
                                        type="number"
                                        value={newItemPrices[group.id] || ''}
                                        onChange={(e) => setNewItemPrices(prev => ({ ...prev, [group.id]: e.target.value }))}
                                        sx={{ flex: 1 }}
                                        variant="outlined"
                                        inputProps={{ step: 0.01 }}
                                        placeholder="0.00"
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleAddItem(group.id)}
                                        sx={{ minWidth: 44, px: 2 }}
                                        startIcon={<AddIcon />}
                                        disabled={!newItemNames[group.id]?.trim()}
                                    >
                                        Add
                                    </Button>
                                </Box>
                            </Paper>
                        ))
                    ) : (
                        <Paper elevation={0} sx={{ bgcolor: '#f5f6fa', borderRadius: 3, p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" fontStyle="italic">
                                No option groups added yet.
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* Add New Group */}
                <Divider sx={{ my: 3 }} />
                <Box display="flex" gap={1} alignItems="center" mt={2}>
                    <TextField size="small" label="New Option Group" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} variant="outlined" sx={{ width: '75%' }} />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddGroup}
                        sx={{ minWidth: 30, px: 2 }}
                        startIcon={<AddIcon />}
                        disabled={!newGroupName.trim()}
                    >
                        Add Group
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};