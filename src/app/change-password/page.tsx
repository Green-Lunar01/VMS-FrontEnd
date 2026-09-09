"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { authApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";

/**
 * Forced first-login password change. Accounts created by someone else carry
 * `mustChangePassword`; the API also revokes the refresh token here, so the user
 * logs in again with the new password.
 *
 * Values are read from the form on submit rather than from React state: password
 * managers can autofill the DOM without firing React's onChange, which would
 * otherwise send an empty "current password" and get it rejected.
 */
export default function ForcedChangePasswordPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    setError(null);
    if (!currentPassword) {
      setError("Enter the temporary password from your credentials email.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The new passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Unable to change your password.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="flex w-full flex-col gap-4">
          <h2 className="text-lg font-bold text-ink">Password updated</h2>
          <p className="text-sm text-muted">
            Changing your password ends every signed-in session. Log in again with your new password.
          </p>
          <Button fullWidth onClick={() => void logout()}>
            Go to login
          </Button>
        </div>
      </AuthLayout>
    );
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
          name="currentPassword"
          label="Temporary password"
          type="password"
          placeholder="••••••••••"
          autoComplete="off"
          hint={
            user?.role === "host"
              ? "The password from your credentials email."
              : "The password whoever created your account set for you."
          }
          required
        />
        <Input
          name="newPassword"
          label="New password"
          type="password"
          placeholder="••••••••••"
          autoComplete="new-password"
          required
        />
        <Input
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          placeholder="••••••••••"
          autoComplete="new-password"
          required
        />

        {error && (
          <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>

        <button
          type="button"
          onClick={() => void logout()}
          className="text-sm text-muted hover:text-ink hover:underline"
        >
          Back to login
        </button>
      </form>
    </AuthLayout>
  );
}
