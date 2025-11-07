"use client";
import { useRegistrationForm } from "../../hooks/auth/useRegistrationForm";
import { RegistrationForm } from "./components/RegistrationForm";

export default function RegisterPage() {
    const { form, loading, error, success, handleChange, handleSubmit } = useRegistrationForm();

    return (
        <RegistrationForm
            form={form}
            loading={loading}
            error={error}
            success={success}
            onChange={handleChange}
            onSubmit={handleSubmit}
        />
    );
}