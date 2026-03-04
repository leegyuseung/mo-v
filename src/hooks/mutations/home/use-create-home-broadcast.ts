import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHomeBroadcast } from "@/api/home-broadcast";

export function useCreateHomeBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHomeBroadcast,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["home", "broadcasts"],
      });
    },
  });
}

