"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { authApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ArrowLeft01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export function ChangePasswordCard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = String(form.get("newPassword") ?? "");
    if (next !== String(form.get("confirmPassword") ?? "")) {
      setError("The new passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authApi.changePassword(String(form.get("currentPassword") ?? ""), next);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(" ") : "Could not change your password.");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <Icon icon={CheckmarkCircle02Icon} size={56} color="var(--color-primary)" />
        <h1 className="text-xl font-bold text-ink">Password changed</h1>
        <p className="text-sm text-muted">
          Changing your password signs out every device, including this one. Log in again with the new password.
        </p>
        <Button onClick={() => void logout()} className="mt-2">
          Log in again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon icon={ArrowLeft01Icon} size={18} />
        Back to profile
      </button>

      <Card>
        <h1 className="mb-1 text-xl font-bold text-ink">Change password</h1>
        <p className="mb-6 text-sm text-muted">This will sign you out of any other devices you&apos;re logged in on.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input name="currentPassword" label="Current password" type="password" placeholder="••••••••••" required />
          <Input name="newPassword" label="New password" type="password" placeholder="••••••••••" required />
          <Input name="confirmPassword" label="Confirm new password" type="password" placeholder="••••••••••" required />
          {error && (
            <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth className="mt-2" disabled={busy}>
            {busy ? "Updating\u2026" : "Update password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
