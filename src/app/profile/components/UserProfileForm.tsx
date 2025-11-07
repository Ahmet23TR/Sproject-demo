import {
    TextField,
    Alert,
    InputAdornment,
    Box,
    Typography,
    Chip,
} from "@mui/material";
import { LoadingButton } from "../../../components/ui/LoadingButton";
import { User } from "../../../types/data";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CakeIcon from "@mui/icons-material/Cake";

interface UserProfileFormProps {
    form: {
        name: string;
        surname: string;
        email: string;
        companyName: string;
        phone?: string;
        address?: string;
    };
    profile: User | null;
    success: string | null;
    error: string | null;
    loading?: boolean;
    isDirty?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const UserProfileForm = ({
    form,
    profile,
    success,
    error,
    loading = false,
    isDirty = false,
    onChange,
    onSubmit,
}: UserProfileFormProps) => {
    // E.164 format validation for phone (backend expects this format)
    const phoneRegex = /^\+\d{1,3}\d{4,14}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Fix phone validation: allow empty phone or valid E.164 format
    const isPhoneValid = !form.phone || phoneRegex.test(form.phone);
    const isEmailValid = emailRegex.test(form.email);
    const localPhone = (form.phone || "").replace(/^\+971/, "");

    const handleLocalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digitsOnly = e.target.value.replace(/\D/g, "");
        const limited = digitsOnly.slice(0, 12);
        const full = limited ? `+971${limited}` : "";
        onChange({
            target: { name: "phone", value: full },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        onSubmit(e);
    };

    return (
        <form onSubmit={handleFormSubmit} style={{ width: "100%" }}>
            <Box display="flex" flexDirection="column" gap={4}>
                {/* Personal Information Section */}
                <Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={3}
                        sx={{
                            "&::after": {
                                content: '""',
                                flex: 1,
                                height: 1,
                                background:
                                    "linear-gradient(to right, rgba(201, 162, 39, 0.3), transparent)",
                                ml: 2,
                            },
                        }}>
                        <PersonIcon sx={{ color: "secondary.main" }} />
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ color: "#111827" }}>
                            Personal Information
                        </Typography>
                    </Box>

                    <Box
                        display="grid"
                        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                        gap={3}>
                        <TextField
                            label="First Name"
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            fullWidth
                            required
                            placeholder="Enter your first name"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 20,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    },
                                },
                            }}
                        />
                        <TextField
                            label="Last Name"
                            name="surname"
                            value={form.surname}
                            onChange={onChange}
                            fullWidth
                            required
                            placeholder="Enter your last name"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 20,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    },
                                },
                            }}
                        />
                    </Box>
                </Box>

                {/* Contact Information Section */}
                <Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={3}
                        sx={{
                            "&::after": {
                                content: '""',
                                flex: 1,
                                height: 1,
                                background:
                                    "linear-gradient(to right, rgba(201, 162, 39, 0.3), transparent)",
                                ml: 2,
                            },
                        }}>
                        <EmailIcon sx={{ color: "secondary.main" }} />
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ color: "#111827" }}>
                            Contact Information
                        </Typography>
                    </Box>

                    <Box
                        display="grid"
                        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                        gap={3}>
                        <TextField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            fullWidth
                            required
                            error={!isEmailValid}
                            helperText={
                                !isEmailValid
                                    ? "Please enter a valid email address"
                                    : undefined
                            }
                            placeholder="you@example.com"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 20,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    },
                                },
                            }}
                        />
                        <TextField
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={localPhone}
                            onChange={handleLocalPhoneChange}
                            fullWidth
                            inputProps={{
                                inputMode: "tel",
                                pattern: "^\\d{1,12}$",
                                maxLength: 12,
                            }}
                            error={!isPhoneValid}
                            helperText={
                                !isPhoneValid
                                    ? "Phone must be in valid format"
                                    : "UAE format (+971)"
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 20,
                                                mr: 0.5,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "text.secondary",
                                                fontWeight: 500,
                                            }}>
                                            +971
                                        </Typography>
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="5XXXXXXXXX"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    },
                                },
                            }}
                        />
                    </Box>
                </Box>
                {profile?.role === "CLIENT" && (
                    <Box>
                        <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={3}
                            sx={{
                                "&::after": {
                                    content: '""',
                                    flex: 1,
                                    height: 1,
                                    background:
                                        "linear-gradient(to right, rgba(201, 162, 39, 0.3), transparent)",
                                    ml: 2,
                                },
                            }}>
                            <BusinessIcon sx={{ color: "secondary.main" }} />
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ color: "#111827" }}>
                                Company Information
                            </Typography>
                        </Box>

                        <Box
                            display="grid"
                            gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                            gap={3}>
                            <TextField
                                label="Company Name"
                                name="companyName"
                                value={form.companyName}
                                onChange={onChange}
                                fullWidth
                                placeholder="Company LLC"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BusinessIcon
                                                sx={{
                                                    color: "text.secondary",
                                                    fontSize: 20,
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 3,
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-1px)",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.1)",
                                        },
                                    },
                                }}
                            />
                            <TextField
                                label="Address"
                                name="address"
                                value={form.address}
                                onChange={onChange}
                                fullWidth
                                placeholder="Office / Delivery address"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationOnIcon
                                                sx={{
                                                    color: "text.secondary",
                                                    fontSize: 20,
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 3,
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-1px)",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.1)",
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                )}

                {profile?.role === "CHEF" && (
                    <Box>
                        <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={3}
                            sx={{
                                "&::after": {
                                    content: '""',
                                    flex: 1,
                                    height: 1,
                                    background:
                                        "linear-gradient(to right, rgba(201, 162, 39, 0.3), transparent)",
                                    ml: 2,
                                },
                            }}>
                            <RestaurantIcon sx={{ color: "secondary.main" }} />
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ color: "#111827" }}>
                                Assignment
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                background:
                                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                                border: "1px solid rgba(0,0,0,0.06)",
                            }}>
                            {profile?.productGroup ? (
                                <Box display="flex" alignItems="center" gap={2}>
                                    {profile.productGroup === "SWEETS" ? (
                                        <CakeIcon
                                            sx={{
                                                color: "primary.main",
                                                fontSize: 24,
                                            }}
                                        />
                                    ) : (
                                        <RestaurantIcon
                                            sx={{
                                                color: "secondary.main",
                                                fontSize: 24,
                                            }}
                                        />
                                    )}
                                    <Box>
                                        <Chip
                                            label={
                                                profile.productGroup ===
                                                "SWEETS"
                                                    ? "Sweets Department"
                                                    : "Bakery Department"
                                            }
                                            color={
                                                profile.productGroup ===
                                                "SWEETS"
                                                    ? "primary"
                                                    : "secondary"
                                            }
                                            variant="filled"
                                            sx={{
                                                fontWeight: 600,
                                                textTransform: "capitalize",
                                                borderRadius: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: "block", mt: 1 }}>
                                            Managed by administrator
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Box display="flex" alignItems="center" gap={2}>
                                    <RestaurantIcon
                                        sx={{
                                            color: "text.secondary",
                                            fontSize: 24,
                                        }}
                                    />
                                    <Box>
                                        <Chip
                                            label="Not Assigned"
                                            color="default"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 500,
                                                borderRadius: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: "block", mt: 1 }}>
                                            Contact your administrator to assign
                                            a product group
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Messages Section */}
                {(success || error) && (
                    <Box>
                        {success && (
                            <Alert
                                severity="success"
                                sx={{
                                    mb: 2,
                                    borderRadius: 3,
                                    boxShadow:
                                        "0 4px 12px rgba(22, 163, 74, 0.15)",
                                    border: "1px solid rgba(22, 163, 74, 0.2)",
                                }}>
                                {success}
                            </Alert>
                        )}
                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    borderRadius: 3,
                                    boxShadow:
                                        "0 4px 12px rgba(239, 68, 68, 0.15)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                )}

                {/* Submit Button */}
                <Box mt={2}>
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        loading={loading}
                        disabled={
                            loading ||
                            !isDirty ||
                            !form.name.trim() ||
                            !form.surname.trim() ||
                            !isEmailValid ||
                            !isPhoneValid
                        }
                        sx={{
                            py: 2,
                            borderRadius: 3,
                            fontWeight: 600,
                            fontSize: "1.1rem",
                            textTransform: "none",
                            background:
                                "linear-gradient(135deg, #C9A227 0%, #E0C097 100%)",
                            color: "#000000",
                            boxShadow: "0 8px 24px rgba(201, 162, 39, 0.25)",
                            "&:hover": {
                                background:
                                    "linear-gradient(135deg, #E0C097 0%, #C9A227 100%)",
                                transform: "translateY(-2px)",
                                boxShadow:
                                    "0 12px 32px rgba(201, 162, 39, 0.35)",
                            },
                            "&:disabled": {
                                background: "#f5f5f5",
                                color: "#9ca3af",
                                boxShadow: "none",
                                transform: "none",
                            },
                            transition: "all 0.2s ease-in-out",
                        }}>
                        {loading ? "Updating Profile..." : "Update Information"}
                    </LoadingButton>
                </Box>
            </Box>
        </form>
    );
};
