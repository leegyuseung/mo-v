import { useQuery } from "@tanstack/react-query";
import { fetchCrewCodeNames } from "@/api/crews";

export function useCrewCodeNames() {
  return useQuery({
    queryKey: ["crew-code-names"],
    queryFn: fetchCrewCodeNames,
  });
}
