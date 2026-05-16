// hooks/useExecutions.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { executionApi } from "@/lib/api";
import { DEMO_MODE, mockExecutions } from "@/lib/mock-data";

export const useExecutions = (workflowId: string, params?: { page?: number }) => {
  return useQuery({
    queryKey: ["executions", workflowId, params],
    queryFn: DEMO_MODE
      ? async () => ({
          executions: mockExecutions[workflowId] ?? [],
          meta: { total: (mockExecutions[workflowId] ?? []).length, page: 1, limit: 10, totalPages: 1 },
        })
      : () => executionApi.byWorkflow(workflowId, params).then((r) => r.data.data),
    enabled: !!workflowId,
    refetchInterval: DEMO_MODE ? false : 5000,
  });
};

export const useExecution = (id: string) => {
  return useQuery({
    queryKey: ["execution", id],
    queryFn: () => executionApi.get(id).then((r) => r.data.data),
    enabled: !!id && !DEMO_MODE,
    refetchInterval: 3000,
  });
};
