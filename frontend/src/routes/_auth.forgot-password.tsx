import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Startup Navigator" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter your email and we'll send a link to reset your password.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Reset email sent");
        }}
        className="mt-8 space-y-4"
      >
        <div>
          <Label htmlFor="em">Email</Label>
          <Input id="em" type="email" required className="mt-1.5" />
        </div>
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
