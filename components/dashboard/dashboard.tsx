"use client";

import Link from "next/link";
import { BookOpen, Plus, Store } from "lucide-react";

import { DashboardCharts } from "@/components/dashboard/charts";
import { MyOpenWork, RecentActivity, TeamWorkload } from "@/components/dashboard/side-panels";
import { StatCards } from "@/components/dashboard/stat-cards";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/store";
import { cn } from "cn";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const user = useCurrentUser();
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={`${greeting()}, ${firstName}`}
        description="A snapshot of your service desk — incidents, SLAs, and activity."
      >
        <Link
          href="/catalog"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Store className="size-3.5" />
          Catalog
        </Link>
        <Link
          href="/kb"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <BookOpen className="size-3.5" />
          Knowledge
        </Link>
        <Link href="/incidents/new" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="size-3.5" />
          New incident
        </Link>
      </PageHeader>

      <div className="space-y-6">
        <StatCards />
        <DashboardCharts />
        <div className="grid gap-4 lg:grid-cols-3">
          <MyOpenWork />
          <RecentActivity />
          <TeamWorkload />
        </div>
      </div>
    </div>
  );
}
