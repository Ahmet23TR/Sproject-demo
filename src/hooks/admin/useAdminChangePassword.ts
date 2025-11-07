"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changeUserPasswordByAdmin } from '../../services/userService';

export const useAdminChangePassword = (userId: string, onSuccess: () => void) => {
    const { token } = useAuth();
    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (form.newPassword.length < 6) {
            return setError('Password must be at least 6 characters.');
        }
        if (form.newPassword !== form.confirmPassword) {
            return setError('New passwords do not match.');
        }
        if (!token) return;

        setLoading(true);
        try {
            await changeUserPasswordByAdmin(userId, form.newPassword, token);
            setSuccess('Password changed successfully.');
            setForm({ newPassword: '', confirmPassword: '' });
            setTimeout(onSuccess, 1500);
        } catch (e: unknown) {
            const message = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Password could not be changed.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return { form, loading, error, success, handleChange, handleSubmit };
};