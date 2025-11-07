import React from "react";
import {
    Box,
    TextField,
    Card,
    CardContent,
    CardHeader,
    Alert,
    MenuItem,
    InputAdornment,
    type SxProps,
    type Theme,
} from "@mui/material";
import { LoadingButton } from "../ui/LoadingButton";
import { User } from "../../types/data";
import { FormEvent, ChangeEvent } from "react";

interface EditUserFormProps {
    user: User;
    formState: Partial<User>;
    isUpdating: boolean;
    updateError: string | null;
    isDirty?: boolean;
    onFormChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onFormSubmit: (e: FormEvent) => void;
    isActivating: boolean;
    activationError: string | null;
    onActivate: () => void;
    onDeactivate: () => void;
    currentUser: User;
    // Rol değiştirme propları
    isChangingRole: boolean;
    roleChangeError: string | null;
    roleChangeSuccess: string | null;
    onRoleChange: (newRole: User["role"]) => void;
    // Price list props
    priceLists?: Array<{ id: string; name: string; isDefault: boolean }>;
    onPriceListChange?: (priceListId: string | null) => void;
    cardSx?: SxProps<Theme>;
    hideHeader?: boolean;
}

export const EditUserForm = ({
    user,
    formState,
    isUpdating,
    updateError,
    isDirty = false,
    onFormChange,
    onFormSubmit,
    currentUser,
    isChangingRole,
    roleChangeError,
    roleChangeSuccess,
    onRoleChange,
    priceLists,
    onPriceListChange,
    cardSx,
    hideHeader = false,
}: EditUserFormProps) => {
    const [selectedRole, setSelectedRole] = React.useState<User["role"]>(
        user.role
    );

    // Validation regexes
    const phoneRegex = /^\+\d{1,3}\d{4,14}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isPhoneValid = !formState.phone || phoneRegex.test(formState.phone);
    const isEmailValid = !formState.email || emailRegex.test(formState.email);

    // Prevent user from changing their own role
    const isCurrentUser = user.id === currentUser.id;

    // Only ADMIN, CHEF, DRIVER, DISTRIBUTOR roles can be changed
    const canChangeRole =
        !isCurrentUser &&
        user.isActive &&
        ["ADMIN", "CHEF", "DRIVER", "DISTRIBUTOR"].includes(user.role);

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();

        // If role has changed, update role first
        if (canChangeRole && selectedRole !== user.role) {
            onRoleChange(selectedRole);
        }

        // Then update form information
        onFormSubmit(e);
    };

    React.useEffect(() => {
        setSelectedRole(user.role);
    }, [user.role]);

    return (
        <Card sx={cardSx}>
            {!hideHeader && <CardHeader title="Edit User Information" />}
            <CardContent>
                <Box
                    component="form"
                    onSubmit={handleFormSubmit}
                    display="grid"
                    gap={2}>
                    <TextField
                        label="First Name"
                        name="name"
                        value={formState.name || ""}
                        onChange={onFormChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Last Name"
                        name="surname"
                        value={formState.surname || ""}
                        onChange={onFormChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formState.email || ""}
                        onChange={onFormChange}
                        fullWidth
                        required
                        error={!isEmailValid}
                        helperText={
                            !isEmailValid
                                ? "Please enter a valid email address"
                                : undefined
                        }
                    />

                    <TextField
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={(formState.phone || "").replace(/^\+971/, "")}
                        onChange={(e) => {
                            const digitsOnly = e.target.value.replace(
                                /\D/g,
                                ""
                            );
                            const limited = digitsOnly.slice(0, 12);
                            const full = limited ? `+971${limited}` : "";
                            onFormChange({
                                target: { name: "phone", value: full },
                            } as unknown as ChangeEvent<HTMLInputElement>);
                        }}
                        fullWidth
                        inputProps={{
                            inputMode: "tel",
                            pattern: "^\\d{1,12}$",
                            maxLength: 9,
                        }}
                        error={!isPhoneValid}
                        helperText={
                            !isPhoneValid
                                ? "Phone must be in E.164 format (e.g. +971500000001)"
                                : undefined
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    +971
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Company name only for CLIENT users */}
                    {user.role === "CLIENT" && (
                        <TextField
                            label="Company Name"
                            name="companyName"
                            value={formState.companyName || ""}
                            onChange={onFormChange}
                            fullWidth
                        />
                    )}

                    {/* Role selection only for appropriate users */}
                    {canChangeRole && (
                        <TextField
                            select
                            label="User Role"
                            value={selectedRole}
                            onChange={(e) =>
                                setSelectedRole(e.target.value as User["role"])
                            }
                            fullWidth
                            disabled={isUpdating || isChangingRole}>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="CHEF">Chef</MenuItem>
                            <MenuItem value="DRIVER">Driver</MenuItem>
                            <MenuItem value="DISTRIBUTOR">Distributor</MenuItem>
                        </TextField>
                    )}

                    {/* Product group selection only for CHEF users */}
                    {user.role === "CHEF" && (
                        <TextField
                            select
                            label="Product Group"
                            name="productGroup"
                            value={formState.productGroup || ""}
                            onChange={onFormChange}
                            fullWidth
                            disabled={isUpdating}>
                            <MenuItem value="">Not Set</MenuItem>
                            <MenuItem value="SWEETS">Sweets</MenuItem>
                            <MenuItem value="BAKERY">Bakery</MenuItem>
                        </TextField>
                    )}

                    {/* Price list assignment for CLIENT and DISTRIBUTOR users */}
                    {(user.role === "CLIENT" || user.role === "DISTRIBUTOR") && priceLists && (
                        <TextField
                            select
                            label={
                                user.role === "DISTRIBUTOR"
                                    ? "Admin Base Price List (Wholesale)"
                                    : "Assigned Price List"
                            }
                            value={formState.priceListId ?? ""}
                            onChange={(e) =>
                                onPriceListChange?.(e.target.value || null)
                            }
                            fullWidth
                            helperText={
                                user.role === "DISTRIBUTOR"
                                    ? "This is the wholesale price list from admin that distributor will see as reference"
                                    : undefined
                            }>
                            <MenuItem value="">(None)</MenuItem>
                            {priceLists.map((pl) => (
                                <MenuItem key={pl.id} value={pl.id}>
                                    {pl.name} {pl.isDefault ? "(Default)" : ""}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {/* Address only for CLIENT users */}
                    {user.role === "CLIENT" && (
                        <TextField
                            label="Address"
                            name="address"
                            value={formState.address || ""}
                            onChange={onFormChange}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    )}

                    {updateError && (
                        <Alert severity="error">{updateError}</Alert>
                    )}
                    {roleChangeSuccess && (
                        <Alert severity="success">{roleChangeSuccess}</Alert>
                    )}
                    {roleChangeError && (
                        <Alert severity="error">{roleChangeError}</Alert>
                    )}

                    <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={isUpdating || isChangingRole}
                        disabled={
                            !isDirty ||
                            !isEmailValid ||
                            !isPhoneValid ||
                            !formState.name?.trim() ||
                            !formState.surname?.trim()
                        }
                        sx={{ mt: 2 }}
                        loadingLabel="Updating...">
                        Update Information
                    </LoadingButton>
                </Box>

                {/* <Divider sx={{ my: 3 }} />

                <Box>
                    <Typography variant="h6" gutterBottom>
                        Account Status
                    </Typography>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between">
                        <Chip
                            label={
                                user.isActive
                                    ? "Active"
                                    : "Pending Approval / Inactive"
                            }
                            color={user.isActive ? "success" : "warning"}
                        />
                        {user.id !== currentUser?.id &&
                            (user.isActive ? (
                                <LoadingButton
                                    type="button"
                                    variant="outlined"
                                    color="warning"
                                    onClick={onDeactivate}
                                    loading={isActivating}
                                    loadingLabel="Deactivating..."
                                >
                                    Deactivate
                                </LoadingButton>
                            ) : (
                                <LoadingButton
                                    type="button"
                                    variant="contained"
                                    color="success"
                                    onClick={onActivate}
                                    loading={isActivating}
                                    loadingLabel="Activating..."
                                >
                                    Activate
                                </LoadingButton>
                            ))}
                    </Box>
                    {activationError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {activationError}
                        </Alert>
                    )}
                </Box> */}
            </CardContent>
        </Card>
    );
};
