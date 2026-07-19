import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/articles", label: "Articles" },
  { to: "/schemes", label: "Schemes" },
  { to: "/resources", label: "Resources" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isCheckingAuth, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-14 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
            {!isCheckingAuth && user?.is_staff && (
              <Link
                to="/admin"
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-foreground"
                activeProps={{ className: "text-primary-foreground bg-primary/10" }}
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* Desktop auth buttons — hidden while checking to prevent flash */}
          {!isCheckingAuth && (
            <div className="hidden items-center gap-1 md:flex">
              {isAuthenticated ? (
                <Button size="sm" asChild>
                  <Link to={user?.is_staff || user?.is_superuser ? "/admin" : "/app/dashboard"}>Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                {n.label}
              </Link>
            ))}
            {!isCheckingAuth && user?.is_staff && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-accent"
              >
                Admin Panel
              </Link>
            )}
            {!isCheckingAuth && (
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                {isAuthenticated ? (
                  <Button className="flex-1" asChild>
                    <Link to={user?.is_staff || user?.is_superuser ? "/admin" : "/app/dashboard"} onClick={() => setOpen(false)}>
                      Go to Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                    </Button>
                    <Button className="flex-1" asChild>
                      <Link to="/register" onClick={() => setOpen(false)}>Get started</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

