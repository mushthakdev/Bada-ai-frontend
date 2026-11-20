"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AgencyGate } from "@/components/agency/use-agency";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BusinessForm } from "@/features/businesses/business-form";
import { errorMessage } from "@/lib/api";
import { humanize } from "@/lib/utils";
import { agencyService, type Agency } from "@/services/agency";

function Clients({ agency }: { agency: Agency }) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["agency-clients", agency.id],
    queryFn: () => agencyService.clients(agency.id),
  });
  const assign = useMutation({
    mutationFn: (businessId: string) => agencyService.assignClient(agency.id, businessId),
    onSuccess: () => {
      toast.success("Client added");
      void qc.invalidateQueries({ queryKey: ["agency-clients", agency.id] });
      setOpen(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`Businesses managed by ${agency.name}.`}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Add client
          </Button>
        }
      />
      <Card className="overflow-hidden">
        {isPending ? (
          <div className="p-4">
            <TableSkeleton rows={4} cols={4} />
          </div>
        ) : isError ? (
          <div className="p-4">
            <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="Add a client business to start creating campaigns on their behalf."
            action={<Button onClick={() => setOpen(true)}>Add your first client</Button>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.client_id}>
                  <TableCell className="font-medium">
                    <Link className="text-brand-700 hover:underline" href={`/businesses/${c.business.id}`}>
                      {c.business.name}
                    </Link>
                  </TableCell>
                  <TableCell>{humanize(c.business.category)}</TableCell>
                  <TableCell>{c.business.city ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add a client business</DialogTitle>
            <DialogDescription>Create the business, then it is linked to your agency automatically.</DialogDescription>
          </DialogHeader>
          <BusinessForm submitLabel="Create and add client" onSaved={(b) => assign.mutate(b.id)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AgencyClientsPage() {
  return <AgencyGate>{(agency) => <Clients agency={agency} />}</AgencyGate>;
}
