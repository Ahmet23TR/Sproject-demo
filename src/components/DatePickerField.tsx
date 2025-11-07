import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface DatePickerFieldProps extends Omit<TextFieldProps, 'type' | 'onChange' | 'value'> {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    size?: 'small' | 'medium';
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
    label = 'Select Date',
    value,
    onChange,
    min,
    max,
    size = 'medium',
    ...rest
}) => (
    <TextField
        label={label}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min, max }}
        size={size}
        {...rest}
    />
); 