import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
  {
    variants: {
      variant: {
        active: "border-success/20 bg-success-soft text-success",
        upcoming: "border-accent/20 bg-accent-soft text-accent",
        settled: "border-border-strong bg-[#F2F2EF] text-muted",
        won: "border-success/20 bg-success-soft text-success",
        warning: "border-warning/20 bg-warning-soft text-warning",
        neutral: "border-border bg-surface text-muted",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dotted?: boolean;
}

export function Badge({ className, variant, dotted, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dotted && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "active" || variant === "won"
              ? "bg-success"
              : variant === "upcoming"
              ? "bg-accent"
              : "bg-muted-2"
          )}
        />
      )}
      {children}
    </span>
  );
}
