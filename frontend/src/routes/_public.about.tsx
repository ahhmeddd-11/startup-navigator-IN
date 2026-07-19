import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Compass, Landmark, Cpu, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_public/about")({
  head: () => ({
    meta: [
      { title: "About — Startup Navigator" },
      { name: "description", content: "Our mission is to make building a company in India radically more accessible." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-4xl">
        <Badge variant="outline" className="rounded-full">About Us</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl text-gradient">
          The Operating System for Indian Founders.
        </h1>
        
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Startup Navigator is designed to simplify the complex journey of launching and scaling a business in India. We consolidate regulations, government schemes, and operator guides into a unified, calm workspace.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card className="p-6 border-border/80 bg-accent/20">
            <h2 className="text-xl font-medium tracking-tight">Our Mission</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              To make entrepreneurship in India accessible to everyone by removing regulatory friction and information asymmetry. We want founders to focus on customers and product, not paperwork.
            </p>
          </Card>

          <Card className="p-6 border-border/80 bg-accent/20">
            <h2 className="text-xl font-medium tracking-tight">Our Vision</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              To empower the next generation of Indian innovators with self-serve compliance, instant policy intelligence, and operator-grade templates, contributing to a vibrant, friction-free startup ecosystem.
            </p>
          </Card>
        </div>

        <hr className="my-12 border-border/60" />

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Why Startup Navigator Exists</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Indian startup ecosystem is growing rapidly, supported by initiatives like Startup India and DPIIT recognition. However, critical information remains scattered across dozens of government portals, regulatory frameworks (RBI, SEBI, MCA, GSTN), and scattered guidelines. First-time founders often spend weeks figuring out basic incorporation steps, tax exemptions, or eligibility for seed funds. We consolidate this knowledge, making it instantly searchable and actionable.
          </p>
        </section>

        <hr className="my-12 border-border/60" />

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Platform Overview & AI Features</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <Compass className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <h3 className="font-medium text-sm">Personalised Journeys</h3>
                <p className="mt-1 text-xs text-muted-foreground">Actionable sequences guiding you step-by-step from ideation to growth.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Landmark className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <h3 className="font-medium text-sm">340+ Schemes Indexed</h3>
                <p className="mt-1 text-xs text-muted-foreground">State and central government schemes with clear eligibility criteria and application guides.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Sparkles className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <h3 className="font-medium text-sm">AI Consulting Assistant</h3>
                <p className="mt-1 text-xs text-muted-foreground">AI model optimized for the Indian legal, tax, and fundraising landscape to validate ideas and models.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Cpu className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <h3 className="font-medium text-sm">Expert Playbooks</h3>
                <p className="mt-1 text-xs text-muted-foreground">Practical templates, founders agreements, and checklists authored by active operators.</p>
              </div>
            </div>
          </div>
        </section>

        <hr className="my-12 border-border/60" />

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Technology Stack</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Startup Navigator is built on a modern, robust, and highly secure technical architecture:
          </p>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 text-center">
            <div className="rounded-xl border border-border p-3">
              <div className="font-semibold text-sm">React & TS</div>
              <div className="text-[10px] text-muted-foreground mt-1">Frontend App</div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <div className="font-semibold text-sm">Django REST</div>
              <div className="text-[10px] text-muted-foreground mt-1">Backend API</div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <div className="font-semibold text-sm">PostgreSQL</div>
              <div className="text-[10px] text-muted-foreground mt-1">Database</div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <div className="font-semibold text-sm">Google Gemini</div>
              <div className="text-[10px] text-muted-foreground mt-1">AI Service</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

