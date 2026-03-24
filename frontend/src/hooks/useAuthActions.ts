import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import { userService } from "@/services/userService";

export const useAuthActions = () => {
  const { logout: clearAuthContext } = useAuth();
  const { login: setAuthContext } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await userService.login(username, password);
      setAuthContext(userData);
      router.push(userData.role === "practitioner" ? "/practitioner-dashboard" : "/dashboard");
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
        role: role
      });

      // 2. LOGIN TO GET PROFILE_ID
      const userData = await userService.login(formData.username, formData.password);
      const profileId = userData.profile_id;

      // 3. UPDATE PROFILE DETAILS
      if (profileId && role === "patient") {
        const profilePayload = {
          name: formData.name || "",
          birthday: formData.birthday || null, 
          sex: formData.sex || "",
          height_cm: formData.height_cm ?? null,
          weight_kg: formData.weight_kg ?? null,
          practitioner_id: null,
          notes: "",
          is_active: true
        };
        console.log("Patient profile PUT payload:", JSON.stringify(profilePayload, null, 2));
        await userService.updatePatientProfile(profileId, profilePayload);
      }
      if (profileId && role === "practitioner") {
        const profilePayload = {
          clinic_name: formData.clinic_name || "",
          specialization: formData.specialization || ""
        };
        console.log("Practitioner profile PUT payload:", JSON.stringify(profilePayload, null, 2));

        if (userService.updatePractitionerProfile) {
          await userService.updatePractitionerProfile(profileId, profilePayload);
        }
      }

      setAuthContext(userData);
      router.push(role === "patient" ? "/dashboard" : "/practitioner-dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token"); 
    clearAuthContext(); 
    router.push("/"); 
  };

  return { login, register, logout, isLoading, error };
};