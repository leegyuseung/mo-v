"use client";

import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";

/** EditableCell에서 지원하는 셀 타입 */
type EditableCellType = "text" | "select";

/** select 타입일 때 사용되는 옵션 */
type SelectOption = {
  value: string;
  label: string;
};

type EditableCellProps = {
  /** 편집 모드 여부 */
  isEditing: boolean;
  /** 현재 값 */
  value: string;
  /** 값 변경 핸들러 */
  onChange: (value: string) => void;
  /** 셀 타입 (기본: text) */
  type?: EditableCellType;
  /** Input placeholder */
  placeholder?: string;
  /** select 타입일 때 옵션 목록 */
  options?: SelectOption[];
  /** Input/select에 적용할 className */
  className?: string;
  /** 편집 모드가 아닐 때 표시할 커스텀 렌더링 (기본: value 또는 "-" 텍스트) */
  displayValue?: ReactNode;
};

/**
 * 편집 가능한 테이블 셀 공통 컴포넌트
 *
 * 편집 모드일 때 Input 또는 Select를 렌더링하고,
 * 아닐 때는 텍스트(또는 커스텀 렌더링)를 표시하는 반복 패턴을 추상화한다.
 */
export function EditableCell({
  isEditing,
  value,
  onChange,
  type = "text",
  placeholder,
  options = [],
  className,
  displayValue,
}: EditableCellProps) {
  /* 편집 모드가 아닐 때는 displayValue 또는 기본 텍스트 표시 */
  if (!isEditing) {
    return <>{displayValue ?? <span className="text-gray-500 text-xs">{value || "-"}</span>}</>;
  }

  /* select 타입: <select> 렌더링 */
  if (type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className ?? "h-8 px-2 border rounded-md text-sm bg-white"}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  /* text 타입: <Input> 렌더링 */
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className ?? "h-8 text-sm w-32"}
    />
  );
}
