import { cn } from "cn";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import type { User } from "@/lib/types";

export function UserAvatar({
  user,
  className,
  textClassName,
}: {
  user: Pick<User, "name" | "avatarColor"> | null | undefined;
  className?: string;
  textClassName?: string;
}) {
  return (
    <Avatar className={cn("size-8 border border-black/5 dark:border-white/10", className)}>
      <AvatarFallback
        className={cn(
          "text-[11px] font-semibold text-white",
          user?.avatarColor ?? "bg-zinc-400",
          textClassName,
        )}
      >
        {user ? initials(user.name) : "?"}
      </AvatarFallback>
    </Avatar>
  );
}
