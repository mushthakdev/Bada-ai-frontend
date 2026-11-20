"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { formatNumber } from "@/lib/utils";
import type { TimeseriesPoint } from "@/types";

const BRAND = "#5B5CF2";
const SOFT = "#B0ABF8";

function tickDate(v: string) {
  const d = parseISO(v);
  return isValid(d) ? format(d, "d MMM") : v;
}

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: "#8a8aa3" },
} as const;

const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid #ebebf0",
  boxShadow: "0 4px 18px rgb(20 20 31 / 0.08)",
  fontSize: 13,
};

export function TrafficChart({ data }: { data: TimeseriesPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="impr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.22} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#ebebf0" />
          <XAxis dataKey="date" tickFormatter={tickDate} {...axisProps} minTickGap={24} />
          <YAxis tickFormatter={(v: number) => formatNumber(v, true)} {...axisProps} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(l) => tickDate(String(l))}
            formatter={(v) => formatNumber(Number(v))}
          />
          <Area type="monotone" dataKey="impressions" name="Impressions" stroke={BRAND} strokeWidth={2.5} fill="url(#impr)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadsChart({ data }: { data: TimeseriesPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} stroke="#ebebf0" />
          <XAxis dataKey="date" tickFormatter={tickDate} {...axisProps} minTickGap={24} />
          <YAxis allowDecimals={false} {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => tickDate(String(l))} cursor={{ fill: "#f6f6f9" }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="leads" name="Leads" fill={BRAND} radius={[6, 6, 0, 0]} />
          <Bar dataKey="qr_scans" name="QR scans" fill={SOFT} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PincodeChart({ data }: { data: Array<{ pincode: string; leads?: number }> }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} stroke="#ebebf0" />
          <XAxis type="number" allowDecimals={false} {...axisProps} />
          <YAxis type="category" dataKey="pincode" width={64} {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f6f6f9" }} />
          <Bar dataKey="leads" name="Leads" fill={BRAND} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const FUNNEL_LABELS: Record<string, string> = {
  impressions: "Impressions",
  qr_scans: "QR scans",
  website_visits: "Website visits",
  whatsapp_inquiries: "WhatsApp inquiries",
  leads: "Leads",
};

/** Simple proportional bars. `engagement` is a modelled value on the API and is intentionally not shown. */
export function FunnelBars({ funnel }: { funnel: Record<string, number> }) {
  const rows = Object.entries(FUNNEL_LABELS)
    .filter(([k]) => typeof funnel[k] === "number")
    .map(([k, label]) => ({ key: k, label, value: funnel[k] }));
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-navy-600">{r.label}</span>
            <span className="tabular font-medium text-navy-900">{formatNumber(r.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
