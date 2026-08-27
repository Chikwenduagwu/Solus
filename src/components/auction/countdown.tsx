"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CountdownProps {
  target: string;
  className?: string;
}

export function Countdown({ target, className }: CountdownProps) {
  const targetDate = new Date(target);
  const [label, setLabel] = useState(() => formatCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setLabel(formatCountdown(targetDate));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return <span className={cn("font-mono tabular", className)}>{label}</span>;
}
