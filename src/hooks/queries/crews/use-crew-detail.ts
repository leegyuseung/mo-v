import { useQuery } from "@tanstack/react-query";
import { fetchCrewDetailByCode } from "@/api/crews";

export function useCrewDetail(crewCode: string) {
  return useQuery({
    queryKey: ["crew-detail", crewCode],
    queryFn: () => fetchCrewDetailByCode(crewCode),
    enabled: Boolean(crewCode),
  });
}
