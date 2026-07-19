import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Startup Navigator" }] }),
  component: ProfilePage,
});

type Preferences = {
  sectors: string[];
  stage: string;
  onboarding_completed: boolean;
  email_notifications: boolean;
};

function ProfilePage() {
  const { user, refetchProfile } = useAuth();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email] = useState(user?.email ?? "");

  useEffect(() => {
    if (user) setFullName(user.full_name);
  }, [user]);

  const { data: prefs } = useQuery<Preferences>({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const res = await api.get("/api/users/preferences/");
      return res.data?.data as Preferences;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.patch("/api/auth/profile/", { full_name: fullName });
    },
    onSuccess: async () => {
      await refetchProfile();
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to save profile"),
  });

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-lg text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user?.full_name || "Your Profile"}</h1>
          <div className="mt-1 text-sm text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Personal details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="profile-fullname">Full name</Label>
              <Input
                id="profile-fullname"
                className="mt-1.5"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" className="mt-1.5" value={email} disabled />
            </div>
            {prefs && (
              <>
                <div>
                  <Label htmlFor="profile-stage">Stage</Label>
                  <Input id="profile-stage" className="mt-1.5" value={prefs.stage || "—"} disabled />
                </div>
                <div>
                  <Label htmlFor="profile-sectors">Sectors</Label>
                  <Input
                    id="profile-sectors"
                    className="mt-1.5"
                    value={prefs.sectors?.join(", ") || "—"}
                    disabled
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFullName(user?.full_name ?? "")}>Discard</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Account info</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Member since</div>
              <div className="mt-0.5 font-medium">
                {user?.date_joined
                  ? new Date(user.date_joined).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Email notifications</div>
              <div className="mt-0.5 font-medium">
                {prefs?.email_notifications ? "Enabled" : "Disabled"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Onboarding</div>
              <div className="mt-0.5 font-medium">
                {prefs?.onboarding_completed ? "Completed" : "Pending"}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
