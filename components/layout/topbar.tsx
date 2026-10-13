"use client";

import Link from "next/link";
import { Bell, Menu, Plus } from "lucide-react";
import { toast } from "sonner";

import { GlobalSearch } from "@/components/layout/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
        onClick={onOpenMenu}
      >
        <Menu className="size-4" />
      </Button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-1">
        <Link
          href="/incidents/new"
          className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
        >
          <Plus className="size-3.5" />
          New incident
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          onClick={() => toast.info("You're all caught up")}
        >
          <Bell className="size-4" />
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
