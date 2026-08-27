import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface",
        className
      )}
      {...props}
    />
  );
}

/** Card with a faint background grid — used for hero panels and visualizations. */
export function GridCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface bg-grid",
        className
      )}
      {...props}
    />
  );
}
