import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CheckSquare,
  CreditCard,
  Film,
  Gauge,
  History,
  LayoutDashboard,
  Link2,
  MapPinned,
  Megaphone,
  MessageSquare,
  Radio,
  Receipt,
  Settings,
  Sparkles,
  Store,
  Tag,
  Target,
  UserCog,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const APP_NAV: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Campaigns", href: "/campaigns", icon: Megaphone },
      { label: "Omnichannel", href: "/campaigns/omnichannel/new", icon: Radio },
      { label: "Marketplace", href: "/marketplace", icon: MapPinned },
      { label: "AI Studio", href: "/studio", icon: Sparkles },
      { label: "Bada Agent", href: "/assistant", icon: MessageSquare },
      { label: "Creatives", href: "/creatives", icon: Film },
      { label: "Leads", href: "/leads", icon: Target },
      { label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Businesses", href: "/businesses", icon: Store },
      { label: "Integrations", href: "/integrations", icon: Link2 },
      { label: "Billing", href: "/billing", icon: Receipt },
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const AGENCY_NAV: NavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/agency/dashboard", icon: LayoutDashboard },
      { label: "Clients", href: "/agency/clients", icon: Briefcase },
      { label: "Team", href: "/agency/team", icon: Users },
      { label: "Billing", href: "/agency/billing", icon: Receipt },
      { label: "Settings", href: "/agency/settings", icon: Settings },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Approvals", href: "/admin/approvals", icon: CheckSquare },
      { label: "Campaigns", href: "/admin/campaigns", icon: Megaphone },
    ],
  },
  {
    title: "Directory",
    items: [
      { label: "Users", href: "/admin/users", icon: UserCog },
      { label: "Businesses", href: "/admin/businesses", icon: Store },
      { label: "Agencies", href: "/admin/agencies", icon: Building2 },
    ],
  },
  {
    title: "Supply & pricing",
    items: [
      { label: "Publishers", href: "/admin/publishers", icon: Radio },
      { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
      { label: "Local listings", href: "/admin/local-inventory", icon: MapPinned },
      { label: "Pricing", href: "/admin/pricing", icon: Tag },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    title: "System",
    items: [
      { label: "AI logs", href: "/admin/ai-logs", icon: History },
      { label: "Settings", href: "/admin/settings", icon: Gauge },
    ],
  },
];

export const NAV_BY_SECTION = {
  app: { groups: APP_NAV, suffix: undefined as string | undefined },
  agency: { groups: AGENCY_NAV, suffix: "Agency" },
  admin: { groups: ADMIN_NAV, suffix: "Admin" },
} as const;

export type ShellSection = keyof typeof NAV_BY_SECTION;
