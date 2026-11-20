"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminService.dashboard(),
  });

  const stats = [
    { label: "Users", value: data?.users },
    { label: "Businesses", value: data?.businesses },
    { label: "Agencies", value: data?.agencies },
    { label: "Campaigns", value: data?.campaigns },
    { label: "Active campaigns", value: data?.active_campaigns },
    { label: "Payments", value: data?.payments },
    { label: "Revenue", value: data?.revenue, currency: true },
    { label: "Leads", value: data?.leads },
    { label: "AI generations", value: data?.ai_generations },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Platform-wide users, campaigns, revenue, and AI usage."
      />
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs uppercase tracking-wide text-navy-400">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-navy-900">
              {s.currency
                ? formatCurrency(Number(s.value || 0))
                : formatNumber(Number(s.value || 0))}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
