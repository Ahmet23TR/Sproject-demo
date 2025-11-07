import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from '@mui/material';
import { User } from '../../types/data';

interface DeleteUserConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: User | null;
    loading: boolean;
}

export const DeleteUserConfirmationModal = ({ open, onClose, onConfirm, user, loading }: DeleteUserConfirmationModalProps) => {
    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Delete User</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to permanently delete user **{user.name} {user.surname}**? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Yes, Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
