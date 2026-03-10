type SupportersBadgeProps = {
  supporters: string | null | undefined;
  className?: string;
};

export default function SupportersBadge({
  supporters,
  className = "",
}: SupportersBadgeProps) {
  const value = supporters?.trim();
  if (!value) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 ${className}`.trim()}
    >
      {value}
    </span>
  );
}
