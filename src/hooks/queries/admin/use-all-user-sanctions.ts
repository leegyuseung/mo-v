import { useQuery } from "@tanstack/react-query";
import { fetchAllUserSanctions } from "@/api/admin";

export function useAllUserSanctions() {
  return useQuery({
    queryKey: ["admin", "all-user-sanctions"],
    queryFn: fetchAllUserSanctions,
  });
}
