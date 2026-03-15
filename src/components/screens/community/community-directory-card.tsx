import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type CommunityDirectoryCardProps = {
  href: string;
  title: string;
  icon: LucideIcon;
};

export default function CommunityDirectoryCard({
  href,
  title,
  icon: Icon,
}: CommunityDirectoryCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.28)]"
    >
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-colors group-hover:bg-gray-900 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </Link>
  );
}
