import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_public/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Startup Navigator" },
      { name: "description", content: "Simple, founder-friendly pricing. Free forever for solo founders." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Solo",
    price: "Free",
    tag: "Forever free",
    desc: "Everything you need to plan and incorporate.",
    features: [
      "Unlimited articles & schemes",
      "AI Assistant — 50 messages/month",
      "Personal bookmarks",
      "Community support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Plus",
    price: "₹499",
    suffix: "/month",
    tag: "Most popular",
    desc: "For founders in build, raise, or scale mode.",
    features: [
      "Everything in Solo",
      "Unlimited AI Assistant",
      "Personalised journeys",
      "Priority scheme alerts",
      "Export to PDF & Notion",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "₹1,499",
    suffix: "/month",
    tag: "For co-founders",
    desc: "Shared workspace for founding teams.",
    features: [
      "Everything in Plus",
      "Up to 5 seats",
      "Shared bookmarks & journeys",
      "Comments & mentions",
      "Priority email support",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

function PricingPage() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="rounded-full">Pricing</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Simple pricing. Founder-friendly.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Free forever for solo founders. Upgrade when your work compounds.
        </p>
      </div>
      <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={cn(
              "flex flex-col rounded-2xl border bg-card p-6 shadow-xs",
              t.highlighted ? "border-foreground/40 shadow-md" : "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{t.name}</div>
              <Badge variant={t.highlighted ? "default" : "outline"} className="rounded-full">
                {t.tag}
              </Badge>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">{t.price}</span>
              {t.suffix && <span className="text-sm text-muted-foreground">{t.suffix}</span>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-6" variant={t.highlighted ? "default" : "outline"} asChild>
              <Link to={t.cta.toLowerCase().includes("contact") ? "/contact" : "/register"}>
                {t.cta}
              </Link>
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        Prices exclude 18% GST. Educational institutions and DPIIT-recognised startups get 50% off Plus.
      </p>
    </div>
  );
}
