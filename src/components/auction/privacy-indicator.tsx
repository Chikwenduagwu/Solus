import { Lock, Eye, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrivacyIndicator({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full border border-border-strong bg-[#F7F7F4] text-muted",
        className
      )}
      title="Bid terms remain private"
    >
      <Lock size={13} />
    </span>
  );
}

const legendItems = [
  {
    icon: Eye,
    label: "Public",
    description: "Visible on-chain / marketplace",
  },
  {
    icon: Lock,
    label: "Private",
    description: "Protected user state",
  },
  {
    icon: ShieldCheck,
    label: "Verifiable",
    description: "Cryptographically provable condition",
  },
];

export function PrivacyLegend({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-3", className)}>
      {legendItems.map(({ icon: Icon, label, description }) => (
        <div key={label} className="flex items-start gap-3 rounded-lg border border-border p-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Icon size={15} />
          </span>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
