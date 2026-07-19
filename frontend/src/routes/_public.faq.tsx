import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_public/faq")({
  head: () => ({
    meta: [{ title: "FAQ — Startup Navigator" }, { name: "description", content: "Frequently asked questions." }],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "Is Startup Navigator affiliated with the Government of India?",
    a: "No. We're an independent product. We link to official sources for every scheme and clearly label our editorial commentary.",
  },
  {
    q: "How current are the scheme details?",
    a: "Our regulatory team reviews every scheme quarterly, and major updates within 5 working days of gazette notifications.",
  },
  {
    q: "Is the AI Assistant reliable?",
    a: "The Assistant grounds answers in our indexed articles and cites sources. For legal or tax decisions, always consult a qualified professional.",
  },
  {
    q: "Do you offer discounts for DPIIT-recognised startups?",
    a: "Yes — 50% off Plus, verified via your DPIIT recognition certificate.",
  },
  {
    q: "How does the free plan compare to Plus?",
    a: "Free includes unlimited articles and schemes, plus 50 AI messages per month. Plus removes limits, unlocks personalised journeys and exports.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Cancellation is instant from Settings → Billing. You keep access until the end of the billing period.",
  },
];

function FaqPage() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Frequently asked questions</h1>
        <p className="mt-3 text-muted-foreground">Can't find what you need? Email hello@startupnavigator.in.</p>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
