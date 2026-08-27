import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridCard } from "@/components/ui/card";
import { PrivacyLegend } from "@/components/auction/privacy-indicator";
import { SealedBidActivity } from "@/components/auction/bid-activity-viz";

// Static illustrative bar heights for the hero's sealed-auction visual —
// this is a design element, not auction data, and never claims to be real.
const heroActivityBars = [38, 62, 24, 71, 45, 88, 33, 58, 20, 66, 41, 29];

const howItWorks = [
  { title: "Create auction", detail: "Define the token, allocation, and settlement terms." },
  { title: "Lock allocation", detail: "Tokens for sale are locked before bidding opens." },
  { title: "Submit private bids", detail: "Bidders commit amount and price without revealing either." },
  { title: "Auction closes", detail: "The bidding window ends at the scheduled time." },
  { title: "Compute clearing price", detail: "The mechanism determines price from all commitments at once." },
  { title: "Settle allocations", detail: "Winning bidders receive tokens; the result is published." },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-border bg-grid bg-grid-fade">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20 md:pb-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-8">
            <div>
              <p className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 py-1 text-xs text-muted">
                <Lock size={11} />
                Sealed-bid token auctions
              </p>
              <h1 className="font-display text-[2.6rem] leading-[1.06] tracking-tight sm:text-6xl">
                Private bids.
                <br />
                Publicly verifiable
                <br />
                outcomes.
              </h1>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
                Run token auctions where bid intent stays private until the
                market is ready to reveal the result.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/auctions">
                    Explore Auctions <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/create">Create Auction</Link>
                </Button>
              </div>
              <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-2">
                <ShieldCheck size={13} />
                Built on Midnight
              </p>
            </div>

            {/* Sealed auction visual */}
            <GridCard className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs text-white">
                    N
                  </span>
                  <div>
                    <p className="font-mono text-sm">NOVA</p>
                    <p className="text-xs text-muted-2">Sealed auction · active</p>
                  </div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong bg-surface text-muted">
                  <Lock size={13} />
                </span>
              </div>

              <SealedBidActivity bars={heroActivityBars} className="mb-6" />

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
                <div>
                  <p className="text-xs text-muted-2">Bidders</p>
                  <p className="mt-1 flex items-center gap-1.5 font-mono text-sm">
                    <Users size={13} className="text-muted" /> 128
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-2">Clearing price</p>
                  <p className="mt-1 font-display text-lg">
                    Hidden <span className="text-xs text-muted-2 font-sans">until close</span>
                  </p>
                </div>
              </div>
            </GridCard>
          </div>
        </div>
      </section>

      {/* Explanation */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p className="text-lg leading-relaxed text-foreground/90">
            Traditional token sales expose demand before allocation. This
            creates information leakage, strategic bidding and unnecessary
            market signaling. Our auction keeps bid terms private while
            preserving verifiable settlement.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="mb-10 font-mono text-xs uppercase tracking-widest text-muted-2">
            How it works
          </p>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="border-t border-border pt-4">
                <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 font-medium">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Midnight */}
      <section className="border-b border-border bg-grid">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-2">
            Built on Midnight
          </p>
          <h2 className="mt-4 font-display text-3xl leading-snug sm:text-4xl">
            Programmable privacy for
            <br className="hidden sm:block" /> financial coordination.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted">
            Midnight lets applications choose exactly what stays public and
            what stays private, and prove the rest without revealing it.
            Seal uses that model to keep bid terms confidential while
            settlement remains checkable by anyone.
          </p>
        </div>
      </section>

      {/* Privacy legend */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-2">
            What&apos;s public, private, and verifiable
          </p>
          <PrivacyLegend />
        </div>
      </section>
    </div>
  );
}
