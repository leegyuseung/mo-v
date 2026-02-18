import { useQuery } from "@tanstack/react-query";
import { fetchIdolGroups } from "@/api/admin";

export function useIdolGroups() {
  return useQuery({
    queryKey: ["admin", "idol-groups"],
    queryFn: fetchIdolGroups,
  });
}
