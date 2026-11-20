"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { SidebarContent } from "@/components/layout/sidebar";
import type { ShellSection } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";

/** Mobile drawer version of the sidebar. */
export function MobileNav({ section }: { section: ShellSection }) {
  const [open, setOpen] = React.useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy-950/40 lg:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-lift focus:outline-none lg:hidden"
        >
          <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
          <SidebarContent section={section} onNavigate={() => setOpen(false)} />
          <DialogPrimitive.Close
            className="absolute right-3 top-4 rounded-md p-1.5 text-navy-400 hover:bg-surface hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
