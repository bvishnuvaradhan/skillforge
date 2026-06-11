import { apiFetch } from "./api";
import { LoginInput, SignupInput } from "./validations/auth";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "student" | "mentor" | "admin";
  plan: "free" | "premium";
  onboardingComplete: boolean;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export async function loginUser(body: LoginInput) {
  const response = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function registerUser(
  body: Omit<SignupInput, "confirmPassword" | "terms"> & { role: "student" | "mentor" | "admin" }
) {
  const response = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function logoutUser() {
  const response = await apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
  });
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiFetch<{ user: UserProfile }>("/users/me", {
    method: "GET",
  });
  return response.data.user;
}
