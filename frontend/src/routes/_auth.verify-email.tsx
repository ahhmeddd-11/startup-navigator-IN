import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/_auth/verify-email")({
  head: () => ({ meta: [{ title: "Verify email — Startup Navigator" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary">
        <Mail className="h-5 w-5" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Check your inbox</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a verification link to your email. Click the link to activate your workspace.
      </p>
      <div className="mt-8 flex flex-col gap-2">
        <Button variant="outline">Resend email</Button>
        <Button variant="ghost" asChild>
          <Link to="/login">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
