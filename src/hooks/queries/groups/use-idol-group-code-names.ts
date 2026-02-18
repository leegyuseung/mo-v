import { useQuery } from "@tanstack/react-query";
import { fetchIdolGroupCodeNames } from "@/api/groups";

export function useIdolGroupCodeNames() {
  return useQuery({
    queryKey: ["idol-group-code-names"],
    queryFn: fetchIdolGroupCodeNames,
  });
}
