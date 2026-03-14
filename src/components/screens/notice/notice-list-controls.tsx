"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchInput from "@/components/common/search-input";
import type { NoticeSearchField } from "@/types/notice";

type NoticeListControlsProps = {
  initialKeyword: string;
  initialSearchField: NoticeSearchField;
};

export default function NoticeListControls({
  initialKeyword,
  initialSearchField,
}: NoticeListControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchField, setSearchField] = useState<NoticeSearchField>(initialSearchField);

  function navigate(nextKeyword: string, nextSearchField: NoticeSearchField) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextKeyword.trim()) {
      params.set("q", nextKeyword.trim());
    } else {
      params.delete("q");
    }

    if (nextSearchField === "title_content") {
      params.delete("filter");
    } else {
      params.set("filter", nextSearchField);
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSearch() {
    navigate(keyword, searchField);
  }

  return (
    <form
      className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        handleSearch();
      }}
    >
      <SearchInput
        value={keyword}
        onChange={setKeyword}
        onSearchClick={handleSearch}
        placeholder="공지사항을 검색해 주세요"
        containerClassName="w-full md:w-64"
        inputClassName="h-9 border-gray-200 bg-white"
      />
      <select
        value={searchField}
        onChange={(event) => {
          const nextField = event.target.value as NoticeSearchField;
          setSearchField(nextField);
        }}
        className="h-9 min-w-32 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900"
        aria-label="검색 필터"
      >
        <option value="title_content">제목+내용</option>
        <option value="title">제목</option>
        <option value="content">내용</option>
      </select>
    </form>
  );
}
