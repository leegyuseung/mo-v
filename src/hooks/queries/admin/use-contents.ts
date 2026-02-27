import { useQuery } from "@tanstack/react-query";
import { fetchAdminContents } from "@/api/admin-contents";

export function useContents() {
  return useQuery({
    queryKey: ["admin", "contents"],
    queryFn: fetchAdminContents,
  });
}
