import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BidActivityVizProps {
  bars: number[];
  className?: string;
}

/**
 * Before settlement: a field of bars whose heights are intentionally
 * obscured with a hatch overlay — activity is visible, values are not.
 */
export function SealedBidActivity({ bars, className }: BidActivityVizProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 96 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            className="relative flex-1 overflow-hidden rounded-[3px] bg-accent-soft"
            style={{ height: `${h}%` }}
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, var(--color-accent) 0px, var(--color-accent) 1px, transparent 1px, transparent 5px)",
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <Lock size={12} />
        Encrypted bid commitments
      </div>
    </div>
  );
}

/**
 * After settlement: the demand curve resolves into a clean, legible chart
 * with the clearing price called out — the "reveal" moment.
 */
export function RevealedClearingCurve({
  bars,
  clearingIndex,
  className,
}: BidActivityVizProps & { clearingIndex: number }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 96 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-[3px] transition-colors",
              i === clearingIndex ? "bg-accent" : "bg-border-strong"
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-success">
        Demand curve resolved at settlement
      </div>
    </div>
  );
}
