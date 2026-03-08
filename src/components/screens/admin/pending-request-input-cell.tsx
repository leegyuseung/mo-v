import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";

type PendingRequestInputCellProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputClassName: string;
  hint?: ReactNode;
};

export default function PendingRequestInputCell({
  value,
  onChange,
  placeholder,
  inputClassName,
  hint,
}: PendingRequestInputCellProps) {
  return (
    <td className="px-4 py-3 text-sm">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
      {hint}
    </td>
  );
}
