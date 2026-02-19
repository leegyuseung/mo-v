import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCrew } from "@/api/admin-crews";
import type { CrewUpsertInput } from "@/types/crew";
import { toast } from "sonner";

export function useUpdateCrew() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crewId, payload }: { crewId: number; payload: CrewUpsertInput }) =>
      updateCrew(crewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "crews"] });
      toast.success("크루가 수정되었습니다.");
    },
    onError: () => {
      toast.error("크루 수정에 실패했습니다.");
    },
  });
}
