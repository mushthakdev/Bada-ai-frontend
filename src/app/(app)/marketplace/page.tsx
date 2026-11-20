"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimulatedBadge } from "@/components/ui/data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NativeSelect } from "@/components/ui/input";
import { formatCurrency, formatNumber, humanize } from "@/lib/utils";
import { omnichannelService } from "@/services/omnichannel";

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "ctv_ott", label: "TV & OTT" },
  { value: "video", label: "Video" },
  { value: "social", label: "Social media" },
  { value: "publishers", label: "Digital publishers" },
  { value: "local", label: "Local advertising" },
  { value: "outdoor", label: "Outdoor" },
];

export default function MarketplacePage() {
  const [category, setCategory] = useState("");
  const channels = useQuery({
    queryKey: ["marketplace-channels", category],
    queryFn: () => omnichannelService.channels({ category: category || undefined }),
  });
  const local = useQuery({
    queryKey: ["local-listings"],
    queryFn: () => omnichannelService.localListings({ city: "Kochi" }),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, typeof channels.data>();
    for (const ch of channels.data || []) {
      const list = map.get(ch.category) || [];
      list.push(ch);
      map.set(ch.category, list);
    }
    return map;
  }, [channels.data]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Advertising marketplace"
        description="Discover TV, OTT, YouTube, social, publishers, and local inventory — then plan one omnichannel campaign."
        badges={<SimulatedBadge label="Estimate pricing" />}
        actions={
          <Button asChild>
            <Link href="/campaigns/omnichannel/new">Start omnichannel campaign</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <NativeSelect
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="max-w-xs"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value || "all"} value={c.value}>
              {c.label}
            </option>
          ))}
        </NativeSelect>
        <p className="text-sm text-navy-500">
          Integrations are capability-based. Live buying requires approved provider APIs or partners.
        </p>
      </div>

      {channels.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {[...grouped.entries()].map(([cat, items]) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-lg font-semibold text-navy-900">{humanize(cat)}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items?.map((ch) => (
              <Card key={ch.code}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{ch.name}</CardTitle>
                      <CardDescription>{ch.description}</CardDescription>
                    </div>
                    <Badge variant="neutral">{humanize(ch.integration_mode)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-1.5">
                    {ch.ad_formats.slice(0, 4).map((f) => (
                      <Badge key={f} variant="brand">
                        {humanize(f)}
                      </Badge>
                    ))}
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-navy-600">
                    <div>
                      <dt className="text-xs text-navy-400">Est. CPM</dt>
                      <dd className="font-medium">
                        {ch.estimated_cpm != null ? formatCurrency(ch.estimated_cpm) : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-navy-400">Min budget</dt>
                      <dd className="font-medium">{formatCurrency(ch.minimum_budget)}</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-navy-400">{ch.notes}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">Local inventory (Kochi demo)</h2>
          <SimulatedBadge label="Approved demo listings" />
        </div>
        {local.isLoading && <Skeleton className="h-32 rounded-xl" />}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {local.data?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>
                  {humanize(item.inventory_type)} · {item.city}, {item.pincode}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-navy-600">
                <p>Price from {formatCurrency(item.price)}</p>
                <p>
                  Est. impressions:{" "}
                  {item.estimated_impressions != null ? formatNumber(item.estimated_impressions) : "—"}
                </p>
                <p className="mt-2 text-xs text-navy-400">{item.disclaimer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
