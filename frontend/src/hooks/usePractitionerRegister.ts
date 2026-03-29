"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export const usePractitionerRegister = () => {
  const { register, isRegistering: isLoading, registerError: apiError, clearRegisterError } = useAuth();

  useEffect(() => { clearRegisterError(); }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", username: "", email: "",
    password: "", confirmPassword: "",
    clinicName: "", licenseNumber: "", specialty: ""
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!formData.firstName.trim()) newErrors.firstName = "Required";
    if (!formData.lastName.trim()) newErrors.lastName = "Required";
    if (!formData.username.trim()) newErrors.username = "Required";
    else if (!usernameRegex.test(formData.username)) newErrors.username = "3-20 chars (a-z, 0-9, _)";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email";
    if (formData.password.length < 8) newErrors.password = "Min 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords must match";
    if (!formData.clinicName.trim()) newErrors.clinicName = "Required";
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "Required";
    if (!formData.specialty) newErrors.specialty = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await register({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      username: formData.username,
      email: formData.email,
      password: formData.password,
      clinic_name: formData.clinicName,
      specialization: formData.specialty, // matches backend field name
    }, "practitioner");
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return { formData, updateField, handleFormSubmit, isLoading, error: apiError, errors };
};