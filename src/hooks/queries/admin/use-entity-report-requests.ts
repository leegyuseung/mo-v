import { useQuery } from "@tanstack/react-query";
import { fetchEntityReportRequests } from "@/api/admin-reports";

export function useEntityReportRequests() {
  return useQuery({
    queryKey: ["admin", "entity-report-requests"],
    queryFn: fetchEntityReportRequests,
  });
}
