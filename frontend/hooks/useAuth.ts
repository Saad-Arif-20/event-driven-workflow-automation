// hooks/useAuth.ts
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { setAuth, clearAuth, getUser, getToken, type AuthUser } from "@/lib/auth";
import { DEMO_MODE, mockUser } from "@/lib/mock-data";
import { toast } from "sonner";

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setUser(mockUser as AuthUser);
      setLoading(false);
      return;
    }
    const u = getUser();
    setUser(u);
    setLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: DEMO_MODE
      ? async () => {
          await new Promise((r) => setTimeout(r, 800));
          return { data: { data: { token: "demo-jwt-token", user: mockUser } } };
        }
      : authApi.login,
    onSuccess: (res: any) => {
      const { token, user } = res.data.data;
      if (!DEMO_MODE) setAuth(token, user);
      setUser(user);
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: DEMO_MODE
      ? async () => {
          await new Promise((r) => setTimeout(r, 800));
          return { data: { data: { token: "demo-jwt-token", user: mockUser } } };
        }
      : authApi.register,
    onSuccess: (res: any) => {
      const { token, user } = res.data.data;
      if (!DEMO_MODE) setAuth(token, user);
      setUser(user);
      toast.success("Account created!");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Registration failed");
    },
  });

  const logout = () => {
    clearAuth();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    loading,
    isAuthenticated: DEMO_MODE ? true : !!getToken(),
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
  };
};
