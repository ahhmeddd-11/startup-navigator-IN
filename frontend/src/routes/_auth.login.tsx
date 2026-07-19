import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({ meta: [{ title: "Sign in — Startup Navigator" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isCheckingAuth, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated — respects full auth state including refresh token cycle
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated && user) {
      const target = user.is_staff || user.is_superuser ? "/admin" : "/app/dashboard";
      void navigate({ to: target, replace: true });
    }
  }, [isAuthenticated, isCheckingAuth, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.success) {
        toast.success("Signed in successfully");
        const u = res?.data?.user;
        const target = u?.is_staff || u?.is_superuser ? "/admin" : "/app/dashboard";
        void navigate({ to: target });
      } else {
        toast.error(res?.message || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Invalid email or password. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Don't flash the form while auth resolves (could be silently refreshing the access token)
  if (isCheckingAuth || isAuthenticated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue to your workspace.</p>
      <form onSubmit={handleLogin} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="em">Email</Label>
          <Input
            id="em"
            type="email"
            required
            placeholder="you@company.in"
            className="mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pw">Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot?
            </Link>
          </div>
          <Input
            id="pw"
            type="password"
            required
            className="mt-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="rm" />
          <Label htmlFor="rm" className="text-sm font-normal text-muted-foreground">
            Keep me signed in
          </Label>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <Separator className="flex-1" /> OR <Separator className="flex-1" />
      </div>
      <Button variant="outline" className="w-full">
        Continue with Google
      </Button>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-medium text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
