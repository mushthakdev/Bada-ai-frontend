import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  badges?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, backHref, backLabel = "Back", badges, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-navy-400 hover:text-navy-900"
          >
            <ChevronLeft className="size-4" /> {backLabel}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-navy-900 sm:text-[28px]">{title}</h1>
          {badges}
        </div>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-navy-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
