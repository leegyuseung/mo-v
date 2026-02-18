import { useQuery } from "@tanstack/react-query";
import { fetchIdolGroupDetailByCode } from "@/api/groups";

export function useIdolGroupDetail(groupCode: string) {
  return useQuery({
    queryKey: ["idol-group-detail", groupCode],
    queryFn: () => fetchIdolGroupDetailByCode(groupCode),
    enabled: Boolean(groupCode),
  });
}
