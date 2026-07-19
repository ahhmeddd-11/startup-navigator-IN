import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { useAuth } from "@/context/auth-context";

const footerColumns = [
  {
    title: "Product",
    links: [
      { to: "/features", label: "Features" },
      { to: "/pricing", label: "Pricing" },
      { to: "/app/ai", label: "AI Assistant" },
      { to: "/app/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/articles", label: "Articles" },
      { to: "/schemes", label: "Government schemes" },
      { to: "/resources", label: "Templates & guides" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
] as const;

export function PublicFooter() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            The intelligent operating system for Indian founders. AI-guided journeys, government schemes, and expert
            playbooks — in one calm workspace.
          </p>
        </div>
        {footerColumns.map((c) => (
          <div key={c.title}>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{c.title}</div>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to === "/app/dashboard" && (user?.is_staff || user?.is_superuser) ? "/admin" : l.to}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Startup Navigator. Made for Indian founders.</span>
          <span>Independent platform. Not affiliated with DPIIT or Startup India.</span>
        </div>
      </div>
    </footer>
  );
}
