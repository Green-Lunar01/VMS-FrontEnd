"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth, ROLE_HOME } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      // Accounts provisioned by someone else must set their own password first.
      router.replace(user.mustChangePassword ? "/change-password" : ROLE_HOME[user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Unable to log in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
        <Input
          label="Email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••••"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </Button>
      </form>
    </AuthLayout>
  );
}
