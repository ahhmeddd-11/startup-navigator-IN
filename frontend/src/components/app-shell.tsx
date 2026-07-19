import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  BookmarkIcon,
  CheckCheck,
  Command,
  Compass,
  Files,
  History,
  LayoutDashboard,
  Landmark,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  User,
  LogOut,
  ArrowRight,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useArticles } from "@/hooks/use-articles";
import { useResources } from "@/hooks/use-resources";
import { useSchemes } from "@/hooks/use-schemes";
import { Badge } from "@/components/ui/badge";

const mainNavItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/articles", label: "Articles", icon: Files },
  { to: "/app/resources", label: "Resources", icon: Compass },
  { to: "/app/schemes", label: "Government schemes", icon: Landmark },
  { to: "/app/ai", label: "AI Assistant", icon: Sparkles },
  { to: "/app/bookmarks", label: "Bookmarks", icon: BookmarkIcon },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/recommendations", label: "Recommendations", icon: MessageSquare },
] as const;

const bottomNavItems = [
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <span className="text-sm font-semibold">Notifications</span>
          <CheckCheck className="h-4 w-4 text-muted-foreground" />
        </div>
        <DropdownMenuSeparator />
        <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
          <Bell className="h-8 w-8 text-muted-foreground/40" />
          <div className="text-sm font-medium text-foreground">No notifications yet</div>
          <div className="text-xs text-muted-foreground">You're all caught up. Check back later.</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: articles = [] } = useArticles();
  const { data: resources = [] } = useResources();
  const { data: schemes = [] } = useSchemes();

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <>
      <div
        className="relative hidden max-w-md flex-1 md:block cursor-pointer"
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-label="Open global search"
        onKeyDown={(e) => e.key === "Enter" && toggle()}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent pl-9 pr-14 text-sm text-muted-foreground ring-offset-background transition-colors hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring">
          Search articles, schemes, resources…
        </div>
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </div>
      {/* Mobile search button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9"
        aria-label="Search"
        onClick={toggle}
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search articles, schemes, resources…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {articles.length > 0 && (
            <CommandGroup heading="Articles">
              {articles.slice(0, 5).map((article) => (
                <CommandItem
                  key={article.slug}
                  value={`article-${article.title}`}
                  onSelect={() => {
                    void navigate({ to: "/app/articles/$slug", params: { slug: article.slug } });
                    setOpen(false);
                  }}
                >
                  <Files className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{article.title}</span>
                  {article.category?.name && (
                    <Badge variant="outline" className="ml-2 rounded-full text-[10px]">
                      {article.category.name}
                    </Badge>
                  )}
                </CommandItem>
              ))}
              <CommandItem
                value="view-all-articles"
                onSelect={() => {
                  void navigate({ to: "/app/articles" });
                  setOpen(false);
                }}
                className="text-muted-foreground"
              >
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                View all articles
              </CommandItem>
            </CommandGroup>
          )}

          {resources.length > 0 && (
            <CommandGroup heading="Resources">
              {resources.slice(0, 5).map((resource) => (
                <CommandItem
                  key={resource.slug}
                  value={`resource-${resource.title}`}
                  onSelect={() => {
                    void navigate({ to: "/app/resources" });
                    setOpen(false);
                  }}
                >
                  <Compass className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{resource.title}</span>
                  <Badge variant="outline" className="ml-2 rounded-full text-[10px]">
                    {resource.resource_type}
                  </Badge>
                </CommandItem>
              ))}
              <CommandItem
                value="view-all-resources"
                onSelect={() => {
                  void navigate({ to: "/app/resources" });
                  setOpen(false);
                }}
                className="text-muted-foreground"
              >
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                View all resources
              </CommandItem>
            </CommandGroup>
          )}

          {schemes.length > 0 && (
            <CommandGroup heading="Government Schemes">
              {schemes.slice(0, 5).map((scheme) => (
                <CommandItem
                  key={scheme.slug}
                  value={`scheme-${scheme.name}`}
                  onSelect={() => {
                    void navigate({ to: "/app/schemes" });
                    setOpen(false);
                  }}
                >
                  <Landmark className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{scheme.name}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">{scheme.ministry}</span>
                </CommandItem>
              ))}
              <CommandItem
                value="view-all-schemes"
                onSelect={() => {
                  void navigate({ to: "/app/schemes" });
                  setOpen(false);
                }}
                className="text-muted-foreground"
              >
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                View all schemes
              </CommandItem>
            </CommandGroup>
          )}

          <CommandGroup heading="Quick navigation">
            <CommandItem
              value="ask-ai"
              onSelect={() => {
                void navigate({ to: "/app/ai" });
                setOpen(false);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              Ask AI Assistant
            </CommandItem>
            <CommandItem
              value="recommendations"
              onSelect={() => {
                void navigate({ to: "/app/recommendations" });
                setOpen(false);
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              View Recommendations
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <Logo />
        </div>
        <nav aria-label="Main navigation" className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </div>
          {mainNavItems.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          {bottomNavItems.map((it) => {
            const active = pathname === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{it.label}</span>
              </Link>
            );
          })}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mt-3 flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-background/40 p-2 text-left hover:bg-background/80 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{user?.full_name || "Startup Founder"}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{user?.email || "Workspace Account"}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/app/profile">View profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-4 md:px-6">
            <GlobalSearch />
            <div className="flex flex-1 items-center justify-end gap-1">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                <Link to="/app/ai">
                  <Sparkles className="mr-1.5 h-4 w-4" /> Ask AI
                </Link>
              </Button>
              <NotificationDropdown />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className={cn(
          "min-w-0 flex-1",
          pathname === "/app/ai"
            ? "h-[calc(100dvh-3.5rem-3.5rem)] md:h-[calc(100dvh-3.5rem)] overflow-hidden pb-0"
            : "pb-24 md:pb-0"
        )}>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 h-14 border-t border-border bg-background/95 backdrop-blur md:hidden">
          <div className="grid h-full grid-cols-5">
            {[mainNavItems[0], mainNavItems[1], mainNavItems[4], mainNavItems[3], bottomNavItems[1]].map((it) => {
              const active = pathname === it.to || pathname.startsWith(it.to + "/");
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2 text-[10px]",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{it.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
