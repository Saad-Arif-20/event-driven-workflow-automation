// lib/auth.ts
// Auth helpers — token + user management in localStorage

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export const setAuth = (token: string, user: AuthUser) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const getUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
