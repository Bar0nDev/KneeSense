import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { userService } from "@/services/userService";

export const useAuthActions = () => {
  const { saveSession, clearSession } = useAuth();
  const { setUserProfile, clearUserProfile } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. LOGIN — get session data (user_id, role, profile_id)
      const sessionData = await userService.login(username, password);
      saveSession(sessionData); // → AuthContext

      // 2. FETCH PROFILE — get name + role-specific fields
      const profileData = sessionData.role === "patient"
        ? await userService.getPatientProfile(sessionData.user_id)
        : await userService.getPractitionerProfile(sessionData.profile_id);

      setUserProfile({ ...sessionData, profile: profileData }); // → UserContext

      router.push(sessionData.role === "practitioner" ? "/practitioner-dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any, role: "patient" | "practitioner") => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. CREATE ACCOUNT
      await userService.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role,
      });

      // 2. LOGIN TO GET SESSION
      const sessionData = await userService.login(formData.username, formData.password);
      saveSession(sessionData); // → AuthContext

      // 3. UPDATE ROLE-SPECIFIC PROFILE
      if (sessionData.profile_id && role === "patient") {
        await userService.updatePatientProfile(sessionData.profile_id, {
          name: formData.name || "",
          birthday: formData.birthday || null,
          sex: formData.sex || "",
          height_cm: formData.height_cm ?? null,
          weight_kg: formData.weight_kg ?? null,
          practitioner_id: null,
          notes: "",
          is_active: true,
        });
      }
      if (sessionData.profile_id && role === "practitioner") {
        await userService.updatePractitionerProfile(sessionData.profile_id, {
          clinic_name: formData.clinic_name || "",
          specialization: formData.specialization || "",
        });
      }

      // 4. FETCH FULL PROFILE and populate UserContext
      const profileData = role === "patient"
        ? await userService.getPatientProfile(sessionData.user_id)
        : await userService.getPractitionerProfile(sessionData.profile_id);

      setUserProfile({ ...sessionData, profile: profileData }); // → UserContext

      router.push(role === "patient" ? "/dashboard" : "/practitioner-dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();      // clears AuthContext + localStorage session
    clearUserProfile();  // clears UserContext + localStorage userProfile
    router.push("/");
  };

  return { login, register, logout, isLoading, error };
};