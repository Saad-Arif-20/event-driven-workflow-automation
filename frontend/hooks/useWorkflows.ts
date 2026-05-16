// hooks/useWorkflows.ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowApi, authApi } from "@/lib/api";
import { DEMO_MODE, mockWorkflows } from "@/lib/mock-data";
import { toast } from "sonner";

export const useWorkflows = (params?: { page?: number }) => {
  return useQuery({
    queryKey: ["workflows", params],
    queryFn: DEMO_MODE
      ? async () => ({
          workflows: mockWorkflows,
          meta: { total: mockWorkflows.length, page: 1, limit: 10, totalPages: 1 },
        })
      : () => workflowApi.list(params).then((r) => r.data.data),
    staleTime: 30_000,
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => authApi.dashboardStats().then((r) => r.data.data),
    staleTime: 10_000,
    enabled: !DEMO_MODE,
  });
};

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: ["workflow", id],
    queryFn: DEMO_MODE
      ? async () => mockWorkflows.find((w) => w.id === id) ?? null
      : () => workflowApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
};

export const useCreateWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: DEMO_MODE
      ? async (data: any) => {
          await new Promise((r) => setTimeout(r, 600));
          toast.success("Workflow created!");
          return { data: { data: { ...data, id: `wf_${Date.now()}` } } };
        }
      : (data: unknown) => workflowApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      if (!DEMO_MODE) toast.success("Workflow created!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create workflow");
    },
  });
};

export const useUpdateWorkflow = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => workflowApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      qc.invalidateQueries({ queryKey: ["workflow", id] });
      toast.success("Workflow updated!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update");
    },
  });
};

export const useDeleteWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: DEMO_MODE
      ? async (_id: string) => { await new Promise((r) => setTimeout(r, 400)); }
      : async (id: string) => { await workflowApi.delete(id); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow deleted");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete");
    },
  });
};
