import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_auth/register")({
  head: () => ({ meta: [{ title: "Create account — Startup Navigator" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, isCheckingAuth, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated — waits for token refresh to complete
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated && user) {
      const target = user.is_staff || user.is_superuser ? "/admin" : "/app/dashboard";
      void navigate({ to: target, replace: true });
    }
  }, [isAuthenticated, isCheckingAuth, user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(email, fullName, password);
      if (res?.success) {
        toast.success("Account created successfully!");
        const u = res?.data?.user || res?.data;
        const target = u?.is_staff || u?.is_superuser ? "/admin" : "/app/dashboard";
        void navigate({ to: target });
      } else {
        toast.error(res?.message || "Registration failed. Please check details.");
      }
    } catch (err: any) {
      const errors = err.response?.data?.data || {};
      const errorMsg =
        errors.email?.[0] ||
        errors.password?.[0] ||
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Don't flash the form while auth resolves
  if (isCheckingAuth || isAuthenticated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Free forever for solo founders. No card required.</p>
      <form onSubmit={handleRegister} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="nm">Full name</Label>
          <Input
            id="nm"
            required
            className="mt-1.5"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="em">Work email</Label>
          <Input
            id="em"
            type="email"
            required
            className="mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pw">Password</Label>
          <Input
            id="pw"
            type="password"
            required
            minLength={8}
            className="mt-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters, with a number.</p>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox id="tos" required className="mt-0.5" />
          <Label htmlFor="tos" className="text-xs font-normal text-muted-foreground">
            I agree to the{" "}
            <Link to="/terms" className="text-foreground underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-foreground underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </Label>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
