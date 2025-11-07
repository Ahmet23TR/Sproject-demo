"use client";
import { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchProfile, updateProfile } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { User, UpdateProfilePayload } from '../../types/data';

export const useUserProfile = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [form, setForm] = useState({ name: '', surname: '', email: '', companyName: '', phone: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [initialForm, setInitialForm] = useState<{ name: string; surname: string; email: string; companyName: string; phone: string; address: string } | null>(null);

    const loadProfile = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchProfile(token);
            setProfile(data);
            const nextForm = { name: data.name, surname: data.surname, email: data.email, companyName: data.companyName ?? '', phone: data.phone ?? '', address: data.address ?? '' };
            setForm(nextForm);
            setInitialForm(nextForm);
        } catch (error) {
            setError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        setError(null);
        setSuccess(null);
        if (!token) {
            setError('Authentication token not found');
            return;
        }
        
        // Clean up form data before sending
        const cleanedForm: UpdateProfilePayload = {
            name: form.name.trim(),
            surname: form.surname.trim(),
            email: form.email.trim(),
            companyName: form.companyName.trim(),
        };
        
        // Only include phone if it has a valid value
        if (form.phone && form.phone.trim()) {
            cleanedForm.phone = form.phone.trim();
        }
        // Include address (can be empty string → send null to clear)
        cleanedForm.address = form.address?.trim() ? form.address.trim() : null;
        
        setUpdating(true);
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            setError('Request timeout. Please try again.');
            setUpdating(false);
        }, 30000);
        
        try {
            const result = await updateProfile(cleanedForm, token);
            setSuccess('Profile updated successfully.');
            // Update profile state directly with the returned data instead of reloading
            setProfile(result);
            const updatedForm = { 
                name: result.name, 
                surname: result.surname, 
                email: result.email, 
                companyName: result.companyName ?? '', 
                phone: result.phone ?? '', 
                address: result.address ?? '' 
            };
            setForm(updatedForm);
            setInitialForm(updatedForm);
        } catch (error) {
            setError(getApiErrorMessage(error));
            // Ensure updating state is set to false even if there's an error
            setUpdating(false);
        } finally {
            clearTimeout(timeoutId);
            setUpdating(false);
        }
    };

    const isDirty = (() => {
        if (!initialForm) return false;
        return (
            form.name !== initialForm.name ||
            form.surname !== initialForm.surname ||
            form.email !== initialForm.email ||
            form.companyName !== (initialForm.companyName ?? '') ||
            (form.phone || '') !== (initialForm.phone || '') ||
            (form.address || '') !== (initialForm.address || '')
        );
    })();

    return { profile, form, loading, updating, error, success, isDirty, handleChange, handleSubmit };
};
