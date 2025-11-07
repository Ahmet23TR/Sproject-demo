import { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/userService';

export const usePasswordChange = (onSuccess: () => void) => {
    const { token } = useAuth();
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
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
        if (form.newPassword !== form.confirmPassword) {
            return setError('New passwords do not match.');
        }
        if (!token) return;
        setLoading(true);
        try {
            await changePassword(form.oldPassword, form.newPassword, token);
            setSuccess('Password changed successfully.');
            setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(onSuccess, 1500); // Başarı mesajını gösterip modal'ı kapat
        } catch (e: unknown) {
            const message = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Password could not be changed.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return { form, loading, error, success, handleChange, handleSubmit };
};