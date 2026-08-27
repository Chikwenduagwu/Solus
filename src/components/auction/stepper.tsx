import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Progress">
      {steps.map((step, i) => {
        const state = i < currentStep ? "done" : i === currentStep ? "current" : "upcoming";
        return (
          <li key={step} className="flex flex-1 items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                  state === "done" && "border-accent bg-accent text-white",
                  state === "current" && "border-accent text-accent",
                  state === "upcoming" && "border-border-strong text-muted-2"
                )}
              >
                {state === "done" ? <Check size={12} /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs sm:inline",
                  state === "upcoming" ? "text-muted-2" : "text-foreground"
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-px flex-1", state === "done" ? "bg-accent" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
