import { useQuery } from "@tanstack/react-query";
import { fetchCrews } from "@/api/admin-crews";

export function useCrews() {
  return useQuery({
    queryKey: ["admin", "crews"],
    queryFn: fetchCrews,
  });
}
