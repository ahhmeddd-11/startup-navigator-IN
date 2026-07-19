import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import type { Scheme } from "@/lib/content";

interface SchemeCardProps {
  scheme: Scheme;
  /** Optional callback fired when the user clicks the official site link. */
  onView?: () => void;
}

function schemeStatusVariant(status: Scheme["status"]): "destructive" | "default" | "outline" {
  if (status === "Closing soon") return "destructive";
  if (status === "Open") return "default";
  return "outline";
}

/**
 * Reusable government scheme card used in both the public and app scheme list pages.
 * Renders eligibility, benefits, category badge, and an external link to the scheme website.
 */
export function SchemeCard({ scheme, onView }: SchemeCardProps) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">{scheme.ministry}</div>
          <h3 className="mt-1 text-base font-semibold tracking-tight">{scheme.name}</h3>
        </div>
        <Badge variant={schemeStatusVariant(scheme.status)} className="rounded-full shrink-0">
          {scheme.status}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{scheme.summary}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Eligibility
          </div>
          <ul className="mt-1 space-y-0.5 text-foreground/90">
            {scheme.eligibility.slice(0, 2).map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Benefits
          </div>
          <ul className="mt-1 space-y-0.5 text-foreground/90">
            {scheme.benefits.slice(0, 2).map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Badge variant="outline" className="rounded-full">
          {scheme.category}
        </Badge>
        <Button size="sm" variant="outline" asChild>
          <a
            href={scheme.website}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => onView?.()}
          >
            Official site <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
