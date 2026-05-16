// lib/api.ts
// Centralized Axios instance — all API calls go through here

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global response error handler — redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/users/me"),
  dashboardStats: () => api.get("/users/dashboard-stats"),
};

// ── Workflows ────────────────────────────────────────────────────────────────
export const workflowApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get("/workflows", { params }),
  get: (id: string) => api.get(`/workflows/${id}`),
  create: (data: unknown) => api.post("/workflows", data),
  update: (id: string, data: unknown) => api.put(`/workflows/${id}`, data),
  delete: (id: string) => api.delete(`/workflows/${id}`),
};

// ── Events ────────────────────────────────────────────────────────────────────
export const eventApi = {
  fire: (data: { type: string; payload: Record<string, unknown> }) =>
    api.post("/events", data),
  list: () => api.get("/events"),
};

// ── Executions ────────────────────────────────────────────────────────────────
export const executionApi = {
  byWorkflow: (workflowId: string, params?: { page?: number }) =>
    api.get(`/executions/workflow/${workflowId}`, { params }),
  get: (id: string) => api.get(`/executions/${id}`),
};

// ── Health ────────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => api.get("/health"),
};

export default api;
