"use client";
import type React from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { User } from "@/types/data";
import { EditUserForm } from "../../../../../components/admin/EditUserForm";
import { sectionCardSx } from "./clientDetailUtils";

interface EditCustomerModalProps {
    open: boolean;
    onClose: () => void;
    user: User;
    formState: Partial<User>;
    isUpdating: boolean;
    updateError: string | null;
    isDirty?: boolean;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFormSubmit: (e: React.FormEvent) => void;
    isActivating: boolean;
    activationError: string | null;
    onActivate: () => void;
    onDeactivate: () => void;
    currentUser: User | null;
    isChangingRole: boolean;
    roleChangeError: string | null;
    roleChangeSuccess: string | null;
    onRoleChange: (newRole: User["role"]) => void;
    priceLists?: Array<{ id: string; name: string; isDefault: boolean }>;
    onPriceListChange?: (priceListId: string | null) => void;
    onChangePassword: () => void;
    onDeleteCustomer: () => void;
    deleteError: string | null;
}

export const EditCustomerModal = ({
    open,
    onClose,
    user,
    formState,
    isUpdating,
    updateError,
    isDirty,
    onFormChange,
    onFormSubmit,
    isActivating,
    activationError,
    onActivate,
    onDeactivate,
    currentUser,
    isChangingRole,
    roleChangeError,
    roleChangeSuccess,
    onRoleChange,
    priceLists,
    onPriceListChange,
    onChangePassword,
    onDeleteCustomer,
    deleteError,
}: EditCustomerModalProps) => (
    <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
            sx: {
                mx: { xs: 1, sm: 2 },
                width: { xs: "calc(100% - 16px)", sm: "100%" },
                maxHeight: { xs: "95vh", sm: "90vh" },
            },
        }}>
        <DialogTitle sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: { xs: 1, sm: 2 },
            pl: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
        }}>
            <Stack spacing={0.5}>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                    Edit Customer Information
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                    {user.name} {user.surname}
                </Typography>
            </Stack>
            <IconButton onClick={onClose} sx={{ borderRadius: 1 }}>
                <CloseRoundedIcon fontSize="small" />
            </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Stack spacing={3}>
                <EditUserForm
                    user={user}
                    formState={formState}
                    isUpdating={isUpdating}
                    updateError={updateError}
                    isDirty={isDirty}
                    onFormChange={onFormChange}
                    onFormSubmit={onFormSubmit}
                    isActivating={isActivating}
                    activationError={activationError}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    currentUser={currentUser ?? user}
                    isChangingRole={isChangingRole}
                    roleChangeError={roleChangeError}
                    roleChangeSuccess={roleChangeSuccess}
                    onRoleChange={onRoleChange}
                    priceLists={priceLists}
                    onPriceListChange={onPriceListChange}
                    cardSx={{ boxShadow: "none", border: "none", borderRadius: 0 }}
                    hideHeader
                />

                <Paper sx={{ ...sectionCardSx, p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={1.5}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
                            Security
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            Reset the customer password from here whenever they need help getting back into the platform.
                        </Typography>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => {
                                onClose();
                                onChangePassword();
                            }}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2,
                                py: { xs: 1, sm: 1.2 },
                            }}>
                            Change Password
                        </Button>
                    </Stack>
                </Paper>

                <Paper
                    sx={{
                        ...sectionCardSx,
                        border: "1px solid rgba(248, 113, 113, 0.45)",
                        p: { xs: 2, sm: 3 },
                    }}>
                    <Stack spacing={1.5}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            color="error"
                            sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
                            Delete Client
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            Permanently remove this customer and their access. This action cannot be undone.
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            onClick={() => {
                                onClose();
                                onDeleteCustomer();
                            }}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2,
                                py: { xs: 1, sm: 1.2 },
                            }}>
                            Delete Customer
                        </Button>
                        {deleteError && (
                            <Alert severity="error">{deleteError}</Alert>
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            {/* <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 600 }}>
                Close
            </Button> */}
        </DialogActions>
    </Dialog>
);
