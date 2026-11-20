"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api";
import { adminService } from "@/services/admin";
import type { Row } from "@/types";

export function ApprovalActions({ row }: { row: Row }) {
  const qc = useQueryClient();
  const decide = useMutation({
    mutationFn: (decision: "approved" | "rejected") => adminService.decideCreative(String(row.id), decision),
    onSuccess: (_, decision) => {
      toast.success(`Creative ${decision}`);
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" loading={decide.isPending && decide.variables === "approved"} disabled={decide.isPending} onClick={() => decide.mutate("approved")}>
        <Check /> Approve
      </Button>
      <Button size="sm" variant="secondary" loading={decide.isPending && decide.variables === "rejected"} disabled={decide.isPending} onClick={() => decide.mutate("rejected")}>
        <X /> Reject
      </Button>
    </div>
  );
}
