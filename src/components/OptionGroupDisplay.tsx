import {
    FormControl,
    FormLabel,
    RadioGroup,
    FormGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    Box,
    Typography,
    Chip,
} from "@mui/material";
import type { OptionGroup } from "../services/productService";

interface OptionGroupDisplayProps {
    group: OptionGroup;
    selectedValue: string[]; // Bu grup için seçilmiş olan item ID'leri
    onChange: (group: OptionGroup, itemId: string, isChecked: boolean) => void;
}

export const OptionGroupDisplay = ({
    group,
    selectedValue,
    onChange,
}: OptionGroupDisplayProps) => {
    // Normalize price and multiplier from item payload (resolved by backend)
    const getNormalized = (item: OptionGroup["items"][number]) => {
        let priceNum = 0;
        if (typeof item.price === "number") {
            priceNum = item.price;
        } else if (typeof item.price === "string") {
            priceNum = parseFloat(item.price) || 0;
        }

        let multiplierNum: number | null = null;
        if (item.multiplier !== undefined && item.multiplier !== null) {
            if (typeof item.multiplier === "number") {
                multiplierNum = item.multiplier;
            } else if (typeof item.multiplier === "string") {
                const m = parseFloat(item.multiplier);
                multiplierNum = Number.isNaN(m) ? null : m;
            }
        }

        return { priceNum, multiplierNum };
    };

    return (
        <Box mb={2}>
            <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                    {group.name}{" "}
                    {group.isRequired && (
                        <Typography component="span" color="error">
                            *
                        </Typography>
                    )}
                </FormLabel>
                {group.allowMultiple ? (
                    <FormGroup>
                        {group.items.map((item) => (
                            <FormControlLabel
                                key={item.id}
                                control={
                                    <Checkbox
                                        checked={
                                            selectedValue?.includes(item.id) ||
                                            false
                                        }
                                        onChange={(e) =>
                                            onChange(
                                                group,
                                                item.id,
                                                e.target.checked
                                            )
                                        }
                                    />
                                }
                                label={
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}>
                                        <Typography>{item.name}</Typography>
                                        {(() => {
                                            const { priceNum, multiplierNum } =
                                                getNormalized(item);
                                            const parts: string[] = [];
                                            if (priceNum > 0)
                                                parts.push(`${priceNum} AED`);
                                            if (
                                                multiplierNum &&
                                                multiplierNum !== 1
                                            )
                                                parts.push(`x${multiplierNum}`);
                                            return parts.length ? (
                                                <Chip
                                                    label={parts.join(" • ")}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            ) : null;
                                        })()}
                                    </Box>
                                }
                            />
                        ))}
                    </FormGroup>
                ) : (
                    <RadioGroup
                        value={selectedValue?.[0] || ""}
                        onChange={(e) => onChange(group, e.target.value, true)}>
                        {group.items.map((item) => (
                            <FormControlLabel
                                key={item.id}
                                value={item.id}
                                control={<Radio />}
                                label={
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}>
                                        {group.name === "Tray" ? (
                                            <Typography>
                                                {item.name}{" "}
                                                <Typography
                                                    component="span"
                                                    color="text.secondary">
                                                    (±1kg)
                                                </Typography>
                                            </Typography>
                                        ) : (
                                            <Typography>{item.name}</Typography>
                                        )}
                                        {(() => {
                                            const { priceNum, multiplierNum } =
                                                getNormalized(item);
                                            const parts: string[] = [];
                                            if (priceNum > 0)
                                                parts.push(`${priceNum} AED`);
                                            if (
                                                multiplierNum &&
                                                multiplierNum !== 1
                                            )
                                                parts.push(`x${multiplierNum}`);
                                            return parts.length ? (
                                                <Chip
                                                    label={parts.join(" • ")}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            ) : null;
                                        })()}
                                    </Box>
                                }
                            />
                        ))}
                    </RadioGroup>
                )}
            </FormControl>
        </Box>
    );
};
