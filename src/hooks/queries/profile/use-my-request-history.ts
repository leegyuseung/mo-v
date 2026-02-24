import { useQuery } from "@tanstack/react-query";
import { fetchMyRequestHistory } from "@/api/profile-requests";

export function useMyRequestHistory(userId?: string) {
  return useQuery({
    queryKey: ["profile", "my-request-history", userId],
    queryFn: () => fetchMyRequestHistory(userId as string),
    enabled: Boolean(userId),
  });
}
