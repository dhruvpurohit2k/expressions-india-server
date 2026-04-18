import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { login } from "#/features/auth/api/login";
import { getStoredUser, isAuthenticated } from "#/lib/auth";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  beforeLoad: () => {
    // Already authenticated → skip login page
    if (isAuthenticated()) {
      throw redirect({ to: "/admin", replace: true });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      // After login: go to the redirect target if present and internal,
      // otherwise admin panel for admins or course list for regular users.
      if (redirectTo && redirectTo.startsWith("/")) {
        window.location.replace(redirectTo);
        return;
      }
      const user = getStoredUser();
      navigate({ to: user?.isAdmin ? "/admin" : "/courses", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-block rounded bg-red px-6 py-2 text-white font-delius text-2xl mb-2">
            Expressions India
          </div>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-xl shadow-sm p-8 space-y-5"
        >
          <h1 className="text-xl font-semibold text-center">Sign in</h1>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2 text-center">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
