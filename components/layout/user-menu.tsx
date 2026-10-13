"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, RefreshCw, UserRound } from "lucide-react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABEL } from "@/lib/rbac";
import { useCurrentUser, useStore } from "@/lib/store";

export function UserMenu() {
  const router = useRouter();
  const user = useCurrentUser();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg py-1 pr-2 pl-1.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
        <UserAvatar user={user} className="size-7" />
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-xs font-medium">{user.name}</span>
          <span className="text-[11px] text-muted-foreground">
            {ROLE_LABEL[user.role]}
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2 py-1.5">
          <UserAvatar user={user} className="size-8" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => toast.info("Profile settings are not part of this demo")}
        >
          <UserRound className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => toast.info("Impersonation is not part of this demo")}
        >
          <RefreshCw className="size-4" />
          Impersonate user
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            useStore.getState().logout();
            router.replace("/login");
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
