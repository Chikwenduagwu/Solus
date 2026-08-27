"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, ListChecks, PlusCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/components/wallet/wallet-context";

const tabs = [
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/bids", label: "My Bids", icon: ListChecks },
  { href: "/create", label: "Create", icon: PlusCircle },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { wallet, openConnectModal } = useWallet();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-sm md:hidden">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]",
              active ? "text-accent" : "text-muted-2"
            )}
          >
            <Icon size={19} strokeWidth={active ? 2.25 : 1.75} />
            {label}
          </Link>
        );
      })}
      <button
        onClick={openConnectModal}
        className={cn(
          "flex flex-1 cursor-pointer flex-col items-center gap-1 py-2.5 text-[11px]",
          wallet ? "text-success" : "text-muted-2"
        )}
      >
        <Wallet size={19} strokeWidth={1.75} />
        Wallet
      </button>
    </nav>
  );
}
