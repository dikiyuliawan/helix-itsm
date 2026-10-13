import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Store,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "KPIs, trends, and recent activity",
      },
    ],
  },
  {
    label: "IT Service Management",
    items: [
      {
        href: "/incidents",
        label: "Incidents",
        icon: TriangleAlert,
        description: "Track and resolve disruptions",
      },
      {
        href: "/requests",
        label: "Service Requests",
        icon: ClipboardList,
        description: "Track catalog requests",
      },
    ],
  },
  {
    label: "Self-service",
    items: [
      {
        href: "/catalog",
        label: "Service Catalog",
        icon: Store,
        description: "Order IT services and equipment",
      },
      {
        href: "/kb",
        label: "Knowledge Base",
        icon: BookOpen,
        description: "Browse how-to guides and articles",
      },
    ],
  },
];
