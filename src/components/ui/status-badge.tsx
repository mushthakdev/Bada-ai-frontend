import { Badge, type BadgeProps } from "@/components/ui/badge";
import { humanize } from "@/lib/utils";

const STATUS_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  // campaign
  draft: "neutral",
  creative_generating: "brand",
  ready_for_review: "warning",
  payment_pending: "warning",
  pending_payment: "warning",
  pending_review: "warning",
  failed: "danger",
  approved: "brand",
  scheduled: "brand",
  active: "success",
  paused: "warning",
  completed: "navy",
  rejected: "danger",
  cancelled: "danger",
  // payments
  paid: "success",
  succeeded: "success",
  pending: "warning",
  refunded: "neutral",
  created: "neutral",
  // leads
  new: "brand",
  contacted: "warning",
  qualified: "brand",
  converted: "success",
  lost: "neutral",
  // generic
  verified: "success",
  inactive: "neutral",
  processing: "brand",
  queued: "neutral",
  generated: "brand",
  ready: "success",
};

export function StatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
  const key = (status ?? "").toLowerCase();
  return (
    <Badge variant={STATUS_VARIANT[key] ?? "neutral"} className={className}>
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-current opacity-70"
      />
      {humanize(status)}
    </Badge>
  );
}
