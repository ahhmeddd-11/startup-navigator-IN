import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookmarkCheck,
  Compass,
  FileText,
  History,
  Landmark,
  MessageSquare,
  Search,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_public/features")({
  head: () => ({
    meta: [
      { title: "Features — Startup Navigator" },
      { name: "description", content: "AI, schemes, playbooks, and recommendations in one workspace." },
    ],
  }),
  component: FeaturesPage,
});

const items = [
  { icon: Sparkles, t: "AI Assistant", d: "Grounded answers on Indian regulations, taxation, funding, and hiring." },
  { icon: Landmark, t: "Government schemes", d: "340+ central and state schemes with eligibility and benefits." },
  { icon: FileText, t: "Playbooks", d: "Operator-authored articles kept current by domain experts." },
  { icon: Compass, t: "Personalised journeys", d: "Recommendations sequenced by where you are in your build." },
  { icon: BookmarkCheck, t: "Bookmarks & workspaces", d: "Save, annotate, and organise resources by company or phase." },
  { icon: Search, t: "Semantic search", d: "One search box across articles, schemes, prompts, and your own notes." },
  { icon: History, t: "History", d: "Everything you've read or asked, searchable forever." },
  { icon: MessageSquare, t: "Team collaboration", d: "Invite co-founders, share journeys, comment inline (Team plan)." },
  { icon: ShieldCheck, t: "Privacy first", d: "SOC2-aligned practices. Your prompts are never used to train models." },
];

function FeaturesPage() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Everything a founder needs. Nothing they don't.</h1>
        <p className="mt-4 text-muted-foreground">
          Startup Navigator ships as one calm workspace. Each surface is designed to answer a specific question you'll ask
          in your first 24 months.
        </p>
      </div>
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <Card key={f.t} className="rounded-none border-0 shadow-none">
            <CardContent className="p-6">
              <f.icon className="h-5 w-5 text-muted-foreground" />
              <div className="mt-4 text-base font-medium">{f.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-16 text-center">
        <Button size="lg" asChild>
          <Link to="/register">Create your workspace</Link>
        </Button>
      </div>
    </div>
  );
}
