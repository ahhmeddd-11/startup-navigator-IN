import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Startup Navigator" }, { name: "description", content: "Privacy policy." }] }),
  component: () => <LegalPage title="Privacy Policy" body={privacy} />,
});

const privacy = [
  ["Overview", "We collect the minimum data necessary to run Startup Navigator. We do not sell personal data, and we do not use your prompts to train third-party models."],
  ["What we collect", "Account details you provide (name, email), usage telemetry (pages viewed, features used), and your bookmarks and journey progress."],
  ["How we use it", "To personalise your workspace, improve product quality, and communicate essential updates. Marketing communications are opt-in."],
  ["Retention", "We retain account data while your account is active. On deletion, we purge personal data within 30 days, retaining only anonymised telemetry."],
  ["Contact", "Reach our Data Protection Officer at privacy@startupnavigator.in."],
];

function LegalPage({ title, body }: { title: string; body: string[][] }) {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated 1 June 2026</p>
        <div className="mt-10 space-y-8">
          {body.map(([h, p]) => (
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
