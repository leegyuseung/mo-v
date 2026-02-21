import { useMutation } from "@tanstack/react-query";
import { createEntityReportRequest } from "@/api/reports";

export function useCreateEntityReportRequest() {
  return useMutation({
    mutationFn: createEntityReportRequest,
  });
}
