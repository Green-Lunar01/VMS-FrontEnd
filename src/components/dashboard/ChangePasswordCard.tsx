"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { ArrowLeft01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export function ChangePasswordCard({ backHref }: { backHref: string }) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <Icon icon={CheckmarkCircle02Icon} size={56} color="var(--color-primary)" />
        <h1 className="text-xl font-bold text-ink">Password changed</h1>
        <p className="text-sm text-muted">
          You&apos;ve been signed out of other devices for security. Use your new password next time you log in.
        </p>
        <Button onClick={() => router.push(backHref)} className="mt-2">
          Back to profile
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
          <Input label="Current password" type="password" placeholder="••••••••••" required />
          <Input label="New password" type="password" placeholder="••••••••••" required />
          <Input label="Confirm new password" type="password" placeholder="••••••••••" required />
          <Button type="submit" fullWidth className="mt-2">
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
