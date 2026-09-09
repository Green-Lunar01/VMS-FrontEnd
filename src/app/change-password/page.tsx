"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { authApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";

/**
 * Forced first-login password change. Accounts created by someone else carry
 * `mustChangePassword`; the API also revokes the refresh token here, so the user
 * is sent back to log in with the new password.
 */
export default function ForcedChangePasswordPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("The new passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      // change-password revokes the refresh token, so re-login is required.
      await logout();
      router.replace("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Unable to change your password.");
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-ink">Set a new password</h2>
          <p className="mt-1 text-sm text-muted">
            Your account was created with a temporary password. Choose your own before continuing.
          </p>
        </div>

        <Input
          label="Current password"
          type="password"
          placeholder="••••••••••"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          placeholder="••••••••••"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          placeholder="••••••••••"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
