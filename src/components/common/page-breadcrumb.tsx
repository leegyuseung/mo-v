import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageBreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function PageBreadcrumb({
  items,
  className = "",
}: PageBreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={`flex flex-wrap items-center gap-1 text-sm text-gray-500 ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="cursor-pointer transition-colors hover:text-gray-800"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-gray-700" : ""}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight className="h-3.5 w-3.5 text-gray-400" /> : null}
          </div>
        );
      })}
    </nav>
  );
}
