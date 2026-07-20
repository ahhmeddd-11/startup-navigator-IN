import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Startup Navigator" }] }),
  component: ResetPage,
});

function ResetPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Choose a password you haven't used elsewhere.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Password updated");
        }}
        className="mt-8 space-y-4"
      >
        <div>
          <Label htmlFor="np">New password</Label>
          <PasswordInput id="np" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="cp">Confirm password</Label>
          <PasswordInput id="cp" required className="mt-1.5" />
        </div>
        <Button type="submit" className="w-full">
          Update password
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
