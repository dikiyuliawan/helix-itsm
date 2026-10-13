import { BrandMark } from "@/components/brand";
import { Skeleton } from "@/components/ui/skeleton";

export function Splash() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="flex items-center gap-3">
        <BrandMark className="animate-pulse" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
    </div>
  );
}
