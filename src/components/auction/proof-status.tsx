import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RealVerificationStep {
  id: string;
  label: string;
  passed: boolean;
}

export function VerificationPanel({ steps }: { steps: RealVerificationStep[] }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step) => (
        <div
          key={step.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border p-3.5",
            step.passed ? "border-border" : "border-warning/30 bg-warning-soft"
          )}
        >
          {step.passed ? (
            <CheckCircle2 size={16} className="shrink-0 text-success" />
          ) : (
            <Circle size={16} className="shrink-0 text-warning" />
          )}
          <span className="text-sm">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
