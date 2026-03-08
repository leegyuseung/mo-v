import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteHomeBroadcast } from "@/api/home-broadcast";

export function useDeleteAdminHomeBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHomeBroadcast,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "home-broadcasts"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["home", "broadcasts"],
      });
    },
  });
}
