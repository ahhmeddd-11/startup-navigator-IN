import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/terms")({
  head: () => ({ meta: [{ title: "Terms — Startup Navigator" }, { name: "description", content: "Terms of service." }] }),
  component: TermsPage,
});

const sections = [
  ["Acceptance", "By accessing Startup Navigator you agree to these Terms. If you don't agree, don't use the service."],
  ["Editorial content", "Articles and scheme summaries are for information only and don't constitute legal, tax, or investment advice."],
  ["Accounts", "You are responsible for the confidentiality of your credentials. Notify us immediately of any unauthorised use."],
  ["Payments", "Paid plans renew automatically. Cancel any time from Settings → Billing to prevent the next renewal."],
  ["Limitation of liability", "To the maximum extent permitted by law, Startup Navigator is not liable for indirect or consequential damages."],
  ["Governing law", "These Terms are governed by the laws of India. Disputes will be resolved in the courts at Bengaluru."],
];

function TermsPage() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated 1 June 2026</p>
        <div className="mt-10 space-y-8">
          {sections.map(([h, p]) => (
            <section key={h}>
              <h2 className="text-lg font-semibold">{h}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
