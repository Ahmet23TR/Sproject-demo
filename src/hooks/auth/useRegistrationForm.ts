"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import { register as registerUser, RegisterPayload } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/errorHandler';

// Formun state tipi için RegisterPayload'u genişletelim
interface RegisterForm extends RegisterPayload {
    confirmPassword: string;
}

const initialForm: RegisterForm = {
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "", // Optional - will be filled during onboarding
    address: "", // Optional - will be filled during onboarding
    phone: "", // Optional - will be filled during onboarding
};

export const useRegistrationForm = () => {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formErrors, setFormErrors] = useState<{ email?: string }>({});

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setFormErrors({});
        setSuccess("");
        
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        setLoading(true);
        try {
            await registerUser({
                email: form.email,
                name: form.name,
                surname: form.surname,
                password: form.password,
                // Optional fields - can be empty for now, will be filled during onboarding
                companyName: form.companyName || "",
                address: form.address || "",
                phone: form.phone || undefined,
            });
            setSuccess("Registration successful! We'll help you complete your profile after you sign in.");
            setForm(initialForm); // Formu sıfırla
        } catch (err: unknown) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return { form, loading, error, success, formErrors, handleChange, handleSubmit };
};
