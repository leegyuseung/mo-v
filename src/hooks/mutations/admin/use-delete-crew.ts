import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCrew } from "@/api/admin-crews";
import { toast } from "sonner";

export function useDeleteCrew() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (crewId: number) => deleteCrew(crewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "crews"] });
      toast.success("크루가 삭제되었습니다.");
    },
    onError: () => {
      toast.error("크루 삭제에 실패했습니다.");
    },
  });
}
