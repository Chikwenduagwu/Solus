import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong py-16 text-center", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon size={20} />
      </span>
      <p className="font-medium">{title}</p>
      <p className="max-w-xs text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}
