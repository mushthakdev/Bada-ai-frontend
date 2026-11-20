"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { adminService } from "@/services/admin";
import type { Row } from "@/types";

/** Edit button + dialog for a system setting row (`PUT /admin/settings/{key}`). */
export function SettingEditButton({ row }: { row: Row }) {
  const key = String(row.key ?? "");
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(String(row.value ?? ""));
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: () => adminService.updateSetting(key, value, row.description ? String(row.description) : undefined),
    onSuccess: () => {
      toast.success(`Updated ${key}`);
      void qc.invalidateQueries({ queryKey: ["admin"] });
      setOpen(false);
    },
  });

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          setValue(String(row.value ?? ""));
          save.reset();
          setOpen(true);
        }}
      >
        <Pencil /> Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit setting</DialogTitle>
            <DialogDescription>
              <code className="rounded bg-surface px-1.5 py-0.5 text-xs">{key}</code>
              {row.description ? ` — ${String(row.description)}` : null}
            </DialogDescription>
          </DialogHeader>
          <FormError message={save.isError ? errorMessage(save.error) : null} />
          <Input aria-label="Setting value" value={value} onChange={(e) => setValue(e.target.value)} />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={save.isPending} onClick={() => save.mutate()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
