import { useMutation } from "@tanstack/react-query";
import { createContentInfoEditRequest } from "@/api/contents";

export function useCreateContentInfoEditRequest() {
  return useMutation({
    mutationFn: createContentInfoEditRequest,
  });
}
