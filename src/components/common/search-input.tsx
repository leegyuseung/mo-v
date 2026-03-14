import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  onSearchClick?: () => void;
  containerClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  iconButtonClassName?: string;
};

/**
 * 돋보기 아이콘이 포함된 공통 검색 입력 컴포넌트.
 * 왜: live/vlist/group/crew/contents/live-box의 동일 UI 패턴을 한 곳에서 유지하기 위함.
 */
export default function SearchInput({
  value,
  onChange,
  onSearchClick,
  containerClassName,
  inputClassName,
  iconClassName,
  iconButtonClassName,
  ...inputProps
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      {onSearchClick ? (
        <button
          type="button"
          onClick={onSearchClick}
          className={cn(
            "absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center text-gray-400 transition-colors hover:text-gray-600",
            iconButtonClassName
          )}
          aria-label="검색"
          title="검색"
        >
          <Search className={cn("h-4 w-4", iconClassName)} />
        </button>
      ) : (
        <Search
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400",
            iconClassName
          )}
        />
      )}
      <Input
        {...inputProps}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("pl-9", inputClassName)}
      />
    </div>
  );
}
