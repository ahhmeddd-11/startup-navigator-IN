import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookmarkCheck,
  Compass,
  FileText,
  Landmark,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_public/")({
  head: () => ({
    meta: [
      { title: "Startup Navigator — The intelligent OS for Indian founders" },
      {
        name: "description",
        content:
          "AI-guided journeys, government schemes, and expert playbooks in one calm workspace built for Indian founders.",
      },
    ],
  }),
  component: LandingPage,
});

const logos = ["NSRCEL", "T-Hub", "iCreate", "AIC-BIMTECH", "IIM-B", "IIT Madras"];

const features = [
  {
    icon: Sparkles,
    title: "AI Assistant, trained on Indian regulations",
    body: "Ask anything about DPIIT recognition, GST filings, or fundraising — get sourced answers grounded in current policy.",
  },
  {
    icon: Landmark,
    title: "340+ government schemes, indexed",
    body: "Search by ministry, sector or stage. See eligibility, benefits, and links to official portals without the guesswork.",
  },
  {
    icon: FileText,
    title: "Playbooks by operators, not writers",
    body: "Deep guides on incorporation, fundraising, hiring and compliance — updated by practitioners who ship every week.",
  },
  {
    icon: Compass,
    title: "Personalised journeys",
    body: "Tell us where you are — pre-idea, incorporated, raising — and we sequence the next 3 things that will actually move you.",
  },
  {
    icon: BookmarkCheck,
    title: "One workspace, forever",
    body: "Bookmark schemes, save templates, and build your own reading list. Search everything you've ever touched, instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Independent and trustworthy",
    body: "We're not a government agency. We link to primary sources, cite our references, and never sell your data.",
  },
];

function LandingPage() {
  const { isAuthenticated, isCheckingAuth, user } = useAuth();
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
        <div className="container-page relative flex flex-col items-center py-24 text-center md:py-32">
          <Badge variant="outline" className="rounded-full border-border bg-background/60 px-3 py-1 backdrop-blur">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-success" />
            Now live · India Startup Guide 2026
          </Badge>
          <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold tracking-tight text-gradient md:text-6xl">
            Navigate the Indian startup journey with clarity.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            AI-guided answers, government schemes, and operator-grade playbooks — in one calm, professional workspace built
            for founders in India.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            {!isCheckingAuth && (
              isAuthenticated ? (
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link to={user?.is_staff || user?.is_superuser ? "/admin" : "/app/dashboard"}>
                    Open Workspace <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="w-full sm:w-auto" asChild>
                    <Link to="/register">
                      Start free — no card required <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                    <Link to="/app/ai">Try the AI Assistant</Link>
                  </Button>
                </>
              )
            )}
          </div>
          <div className="mt-14 grid w-full max-w-4xl grid-cols-2 gap-y-6 text-xs text-muted-foreground sm:grid-cols-3 md:grid-cols-6">
            {logos.map((l) => (
              <div key={l} className="text-center font-medium uppercase tracking-widest opacity-70">
                {l}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview card */}
      <section className="border-b border-border bg-surface">
        <div className="container-page py-16">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-muted" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted" />
              <div className="ml-4 text-xs text-muted-foreground">app.startupnavigator.in / dashboard</div>
            </div>
            <div className="grid grid-cols-12 gap-0">
              <div className="col-span-12 border-b border-border p-4 md:col-span-3 md:border-b-0 md:border-r">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Journey</div>
                <ul className="space-y-1.5 text-sm">
                  <li className="rounded-md bg-accent px-2 py-1.5">Dashboard</li>
                  <li className="px-2 py-1.5 text-muted-foreground">Articles</li>
                  <li className="px-2 py-1.5 text-muted-foreground">Schemes</li>
                  <li className="px-2 py-1.5 text-muted-foreground">AI Assistant</li>
                </ul>
              </div>
              <div className="col-span-12 p-6 md:col-span-9">
                <div className="text-xs text-muted-foreground">Good morning, Arjun</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">Your next three moves</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { t: "File DPIIT recognition", s: "Est. 20 min", i: Zap },
                    { t: "Apply to SISFS via NSRCEL", s: "Est. 1h", i: Landmark },
                    { t: "Review founders' agreement", s: "Est. 40 min", i: FileText },
                  ].map((c) => (
                    <div
                      key={c.t}
                      className="rounded-xl border border-border bg-background p-4 transition-colors hover:bg-accent/50"
                    >
                      <c.i className="h-4 w-4 text-muted-foreground" />
                      <div className="mt-3 text-sm font-medium">{c.t}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{c.s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="container-page py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Everything you need</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              One workspace for the entire startup journey
            </h2>
            <p className="mt-4 text-muted-foreground">
              From incorporation and DPIIT recognition to your first ten hires and your Series A — Startup Navigator stays
              with you.
            </p>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="rounded-none border-0 bg-card shadow-none">
                <CardContent className="p-6">
                  <f.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="mt-4 text-base font-medium">{f.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-10 py-20 md:grid-cols-4">
          {[
            { k: "12,400+", v: "founders using Startup Navigator" },
            { k: "340", v: "central & state schemes indexed" },
            { k: "180+", v: "operator-authored playbooks" },
            { k: "4.9 / 5", v: "average founder rating" },
          ].map((s) => (
            <div key={s.v}>
              <div className="text-3xl font-semibold tracking-tight md:text-4xl">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container-page py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Ready to move faster?</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Create your workspace in under a minute. Free forever for solo founders.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!isCheckingAuth && (
                isAuthenticated ? (
                  <Button size="lg" asChild>
                    <Link to={user?.is_staff || user?.is_superuser ? "/admin" : "/app/dashboard"}>Open Workspace</Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild>
                      <Link to="/register">Create free account</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/features">Explore features</Link>
                    </Button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
