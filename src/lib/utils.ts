import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a USDC-style settlement amount. */
export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 10 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a raw token amount with thousands separators. */
export function formatToken(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Returns a HH:MM:SS style countdown string from now until `target`. */
export function formatCountdown(target: Date, now: Date = new Date()): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "00:00:00";
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Short, non-cryptographic-looking display id, e.g. cmt_7f9a...2b6e */
export function shortId(prefix: string, seed: string): string {
  return `${prefix}_${seed.slice(0, 4)}...${seed.slice(-4)}`;
}

/** Deterministic accent color per token symbol, so the same token always
 * renders with the same color across the auction list and detail pages,
 * without a token logo registry. */
export function colorForSymbol(symbol: string): string {
  const palette = ["#3538CD", "#111318", "#B45309", "#0F766E", "#7C3AED", "#B91C1C"];
  let hash = 0;
  for (const ch of symbol) hash = (hash * 31 + ch.charCodeAt(0)) % palette.length;
  return palette[hash];
}
