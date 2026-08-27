import { cn } from "@/lib/utils";

interface TokenAvatarProps {
  symbol: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function TokenAvatar({ symbol, color, size = "md", className }: TokenAvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-mono font-medium text-white",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {symbol.slice(0, 1)}
    </div>
  );
}
