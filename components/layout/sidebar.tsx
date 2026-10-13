"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { OPEN_STATES } from "@/lib/constants";
import { permissionsFor } from "@/lib/rbac";
import { useCurrentUser, useStore } from "@/lib/store";

import { navSections } from "./nav-config";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const permissions = permissionsFor(user);

  const openIncidents = useStore((state) =>
    state.tickets.filter((ticket) => OPEN_STATES.includes(ticket.state)).length,
  );
  const activeRequests = useStore(
    (state) =>
      state.requests.filter(
        (request) => request.state !== "Fulfilled" && request.state !== "Rejected",
      ).length,
  );

  const counts: Record<string, number> = {
    "/incidents": openIncidents,
    "/requests": activeRequests,
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/" onClick={onNavigate}>
          <BrandLockup />
        </Link>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              const count = counts[item.href];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-current",
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {count ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                        active
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {permissions.canResetData ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => {
              useStore.getState().resetDemoData();
              toast.success("Demo data restored");
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset demo data
          </Button>
        ) : (
          <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
            Helix ITSM demo · data is stored locally in your browser.
          </p>
        )}
      </div>
    </aside>
  );
}
