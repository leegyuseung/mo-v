import { useQuery } from "@tanstack/react-query";
import { fetchEntityInfoEditRequests } from "@/api/admin-streamers";

export function useEntityInfoEditRequests() {
  return useQuery({
    queryKey: ["admin", "entity-info-edit-requests"],
    queryFn: fetchEntityInfoEditRequests,
  });
}
