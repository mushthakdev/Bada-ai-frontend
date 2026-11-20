"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DATE_RANGES } from "@/lib/constants";
import type { DateRange } from "@/types";

export function RangeTabs({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void }) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as DateRange)}>
      <TabsList aria-label="Date range">
        {DATE_RANGES.map((r) => (
          <TabsTrigger key={r.value} value={r.value}>
            {r.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
