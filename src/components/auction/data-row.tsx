import { cn } from "@/lib/utils";

interface DataRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}

export function DataRow({ label, value, mono = true, className }: DataRowProps) {
  return (
    <div className={cn("flex items-center justify-between border-b border-border py-3.5 last:border-0", className)}>
      <span className="text-sm text-muted">{label}</span>
      <span className={cn("text-sm font-medium", mono && "font-mono")}>{value}</span>
    </div>
  );
}
