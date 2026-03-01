import { useQuery } from "@tanstack/react-query";
import { fetchPendingErrorReports } from "@/api/admin-error-reports";

export function usePendingErrorReports() {
  return useQuery({
    queryKey: ["admin", "pending-error-reports"],
    queryFn: fetchPendingErrorReports,
  });
}

