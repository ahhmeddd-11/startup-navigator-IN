import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Startup Navigator" }] }),
  component: SettingsPage,
});

type Preferences = {
  email_notifications: boolean;
  sectors: string[];
  stage: string;
  onboarding_completed: boolean;
};

function SettingsPage() {
  const { theme, setTheme, mounted } = useTheme();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: prefs, isLoading: prefsLoading } = useQuery<Preferences>({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const res = await api.get("/api/users/preferences/");
      return res.data?.data as Preferences;
    },
  });

  const prefsMutation = useMutation({
    mutationFn: async (patch: Partial<Preferences>) => {
      await api.patch("/api/users/preferences/", patch);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
      toast.success("Preferences updated");
    },
    onError: () => toast.error("Failed to update preferences"),
  });

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account, preferences and privacy.</p>

      <div className="mt-8 space-y-6">
        <Section title="Account" desc="Basic account information.">
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Display name</div>
              <div className="mt-1 font-medium">{user?.full_name || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="mt-1 font-medium">{user?.email || "—"}</div>
            </div>
          </div>
        </Section>

        <Section title="Notifications" desc="Choose what to hear from us.">
          {prefsLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Email notifications</div>
                <div className="text-xs text-muted-foreground">Receive scheme alerts, digests and product updates.</div>
              </div>
              <Switch
                checked={prefs?.email_notifications ?? true}
                onCheckedChange={(checked) => prefsMutation.mutate({ email_notifications: checked })}
                disabled={prefsMutation.isPending}
              />
            </div>
          )}
        </Section>

        <Section title="Appearance" desc="Pick a theme for your workspace.">
          <div className="grid grid-cols-3 gap-3">
            {(["light", "dark", "system"] as const).map((t) => {
              const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
              const selected = mounted && theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  aria-pressed={mounted && theme === t}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-sm capitalize transition-colors",
                    selected ? "border-foreground bg-accent" : "border-border hover:bg-accent/40"
                  )}
                >
                  <Icon className="h-4 w-4" /> {t}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Privacy" desc="Control your data.">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-destructive">Sign out</div>
              <div className="text-xs text-muted-foreground">Log out of your account on this device.</div>
            </div>
            <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => void logout()}>
              Sign out
            </Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-destructive">Delete account</div>
              <div className="text-xs text-muted-foreground">Permanently remove your workspace and all data.</div>
            </div>
            <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10">
              Delete
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}
