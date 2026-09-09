"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resolveRoleFromEmail, setMockSession, ROLE_HOME, DEFAULT_SESSIONS } from "@/lib/mock-session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const role = resolveRoleFromEmail(email || "dhq@greenlunar.com");
    const session = { ...DEFAULT_SESSIONS[role], email: email || DEFAULT_SESSIONS[role].email };
    setMockSession(session);
    router.push(ROLE_HOME[role]);
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
        <Input
          label="Email"
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </Button>
      </form>
    </AuthLayout>
  );
}
