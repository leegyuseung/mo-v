import { useQuery } from "@tanstack/react-query";
import { fetchUserSanctions } from "@/api/admin";

export function useUserSanctions(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "user-sanctions", userId],
    queryFn: () => fetchUserSanctions(userId),
    enabled,
  });
}
