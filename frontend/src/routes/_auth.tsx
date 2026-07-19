import { Outlet, createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-2">
      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between px-6">
          <Logo />
          <ThemeToggle />
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
        <footer className="flex h-14 items-center justify-between border-t border-border px-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Startup Navigator</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </footer>
      </div>
      <aside className="relative hidden overflow-hidden border-l border-border bg-surface lg:block">
        <div className="absolute inset-0 grid-bg opacity-70" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div />
          <div className="max-w-md">
            <blockquote className="text-xl font-medium tracking-tight text-foreground">
              "Startup Navigator turned six months of paperwork research into a two-hour, guided workflow. It's the first
              tool that actually understands the Indian startup ecosystem."
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                RK
              </div>
              <div>
                <div className="text-sm font-medium">Rhea Krishnan</div>
                <div className="text-xs text-muted-foreground">Founder, Ledgerly · DPIIT recognised</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-xs text-muted-foreground">
            <div>
              <div className="text-2xl font-semibold text-foreground">12k+</div>
              <div>founders onboarded</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">340+</div>
              <div>schemes indexed</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">4.9</div>
              <div>avg. rating</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
