import { cn } from "cn";
import { Hexagon } from "lucide-react";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm",
        className,
      )}
    >
      <Hexagon className="size-5 fill-white/20" strokeWidth={2.4} />
    </div>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Helix ITSM
        </span>
        <span className="text-[11px] text-muted-foreground">Service workspace</span>
      </div>
    </div>
  );
}
