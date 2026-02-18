import { useQuery } from "@tanstack/react-query";
import { fetchIdolGroupCards } from "@/api/groups";

export function useIdolGroupCards() {
  return useQuery({
    queryKey: ["idol-group-cards"],
    queryFn: fetchIdolGroupCards,
  });
}
