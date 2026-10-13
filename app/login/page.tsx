"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, LifeBuoy, ShieldCheck, Sparkles } from "lucide-react";

import { BrandLockup, BrandMark } from "@/components/brand";
import { UserAvatar } from "@/components/user-avatar";
import { Card } from "@/components/ui/card";
import { ROLE_LABEL } from "@/lib/rbac";
import { useHydrated, useStore } from "@/lib/store";
import { cn } from "cn";

const highlights = [
  {
    icon: LifeBuoy,
    title: "Resolve incidents faster",
    description: "Prioritise by impact and urgency with live SLA tracking.",
  },
  {
    icon: Sparkles,
    title: "Seamless self-service",
    description: "Order services from the catalog and track every request.",
  },
  {
    icon: ShieldCheck,
    title: "Role-aware workspace",
    description: "Agents and employees see exactly what they need.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const users = useStore((state) => state.users);
  const currentUserId = useStore((state) => state.currentUserId);
  const login = useStore((state) => state.login);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && currentUserId) {
      router.replace("/");
    }
  }, [hydrated, currentUserId, router]);

  function signIn(userId: string) {
    setPending(userId);
    login(userId);
    router.replace("/");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 p-10 text-white lg:flex">
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <BrandMark className="bg-white/15 backdrop-blur" />
          <span className="text-sm font-semibold tracking-tight">Helix ITSM</span>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            <h1 className="max-w-md text-3xl font-semibold tracking-tight text-balance">
              The service workspace your teams actually enjoy using.
            </h1>
            <p className="max-w-md text-sm text-white/80">
              A modern IT service management demo for incidents, service requests, and
              knowledge — built for seamless day-to-day operations.
            </p>
          </div>
          <ul className="space-y-4">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="block text-xs text-white/70">{item.description}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          Demo environment · no real data is stored on a server.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandLockup />
          </div>

          <div className="mb-6 space-y-1">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Sign in to Helix
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a demo account to explore the workspace.
            </p>
          </div>

          <Card className="gap-2 p-3">
            {dashboardNote()}
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={!hydrated || pending !== null}
                onClick={() => signIn(user.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors",
                  "hover:border-border hover:bg-muted/60 disabled:opacity-60",
                )}
              >
                <UserAvatar user={user} className="size-9" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    {user.name}
                    {user.role !== "user" ? (
                      <BadgeCheck className="size-3.5 text-primary" />
                    ) : null}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {ROLE_LABEL[user.role]} · {user.title}
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </button>
            ))}
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Authentication is mocked for this demo. Pick any account to continue.
          </p>
        </div>
      </div>
    </div>
  );
}

function dashboardNote() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      <Sparkles className="size-3.5 text-primary" />
      Tip: agents and admins see assignment and state controls.
    </div>
  );
}
