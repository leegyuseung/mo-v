"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/common/pagination";

type NoticePaginationControlsProps = {
  page: number;
  totalPages: number;
};

export default function NoticePaginationControls({
  page,
  totalPages,
}: NoticePaginationControlsProps) {
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
