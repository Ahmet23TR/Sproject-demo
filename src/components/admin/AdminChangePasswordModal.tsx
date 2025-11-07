import { TextField, Button, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAdminChangePassword } from '@/hooks/admin/useAdminChangePassword';

interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

export const AdminChangePasswordModal = ({ open, onClose, userId }: ChangePasswordModalProps) => {
    const { form, loading, error, success, handleChange, handleSubmit } = useAdminChangePassword(userId, onClose);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle fontWeight={700}>Change User Password</DialogTitle>
            <DialogContent>
                <form id="admin-password-form" onSubmit={handleSubmit}>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="newPassword"
                        label="New Password"
                        type="password"
                        value={form.newPassword}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        margin="dense"
                        name="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                </form>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    type="submit"
                    form="admin-password-form"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Save Password'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
