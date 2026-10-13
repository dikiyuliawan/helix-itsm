import {
  AppWindow,
  Laptop,
  KeyRound,
  MailPlus,
  Monitor,
  Package,
  ShieldCheck,
  Smartphone,
  UserCog,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  AppWindow,
  Laptop,
  KeyRound,
  MailPlus,
  Monitor,
  Package,
  ShieldCheck,
  Smartphone,
  UserCog,
};

export function IconByName({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Package;
  return <Icon className={className} />;
}
