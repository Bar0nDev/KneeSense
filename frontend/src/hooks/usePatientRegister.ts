"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const usePatientRegister = () => {
  const { register, isLoading, error: apiError } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", username: "", email: "",
    password: "", confirmPassword: "",
    month: "", day: "", year: "",
    sex: "", weight: "", height: ""
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
    if (!formData.month || !formData.day || !formData.year) newErrors.dob = "Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const monthNum = MONTHS.indexOf(formData.month) + 1;
    const birthday = `${formData.year}-${String(monthNum).padStart(2, "0")}-${String(formData.day).padStart(2, "0")}`;

    await register({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      username: formData.username,
      email: formData.email,
      password: formData.password,
      birthday,
      sex: formData.sex.toLowerCase(),
      weight_kg: formData.weight ? parseFloat(formData.weight) : null,
      height_cm: formData.height ? parseFloat(formData.height) : null,
    }, "patient");
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