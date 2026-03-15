"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/common/pagination";

type CommunityPaginationControlsProps = {
  page: number;
  totalPages: number;
};

export default function CommunityPaginationControls({
  page,
  totalPages,
}: CommunityPaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={(nextPage) => {
        const params = new URLSearchParams(searchParams.toString());

        if (nextPage <= 1) {
          params.delete("page");
        } else {
          params.set("page", String(nextPage));
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      }}
    />
  );
}
