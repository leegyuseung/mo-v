import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  containerClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
};

/**
 * 돋보기 아이콘이 포함된 공통 검색 입력 컴포넌트.
 * 왜: live/vlist/group/crew/contents/live-box의 동일 UI 패턴을 한 곳에서 유지하기 위함.
 */
export default function SearchInput({
  value,
  onChange,
  containerClassName,
  inputClassName,
  iconClassName,
  ...inputProps
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400",
          iconClassName
        )}
      />
      <Input
        {...inputProps}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("pl-9", inputClassName)}
      />
    </div>
  );
}
