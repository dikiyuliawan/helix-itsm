import Link from "next/link";

import { BrandLockup } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <BrandLockup />
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you are looking for may have been moved or no longer exists.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/" className={buttonVariants({ size: "sm" })}>
          Back to dashboard
        </Link>
        <Link
          href="/incidents"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View incidents
        </Link>
      </div>
    </div>
  );
}
