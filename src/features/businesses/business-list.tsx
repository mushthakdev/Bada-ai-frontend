"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { BusinessForm } from "@/features/businesses/business-form";
import { useBusinesses } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";

export function BusinessList() {
  const { data, isPending, isError, error, refetch } = useBusinesses();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Businesses"
        description="The businesses you advertise for."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Add business
          </Button>
        }
      />
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No businesses yet"
          description="Add your business to start creating campaigns."
          action={<Button onClick={() => setOpen(true)}>Add business</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((b) => (
            <Link key={b.id} href={`/businesses/${b.id}`} className="group">
              <Card className="h-full p-5 transition-shadow group-hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg font-display text-lg font-semibold text-white"
                      style={{ backgroundColor: b.brand_primary_color ?? "#0B5FFF" }}
                    >
                      {b.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-900 group-hover:text-brand-700">{b.name}</p>
                      <p className="truncate text-sm text-navy-500">{b.category}</p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-4 text-sm text-navy-500">{[b.city, b.state].filter(Boolean).join(", ") || "Location not set"}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add a business</DialogTitle>
            <DialogDescription>You can add brand details after creating it.</DialogDescription>
          </DialogHeader>
          <BusinessForm onSaved={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
