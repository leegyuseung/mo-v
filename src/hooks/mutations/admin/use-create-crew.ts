import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCrew } from "@/api/admin-crews";
import type { CrewUpsertInput } from "@/types/admin";
import { toast } from "sonner";

export function useCreateCrew() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CrewUpsertInput) => createCrew(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "crews"] });
      toast.success("크루가 추가되었습니다.");
    },
    onError: () => {
      toast.error("크루 추가에 실패했습니다.");
    },
  });
}
