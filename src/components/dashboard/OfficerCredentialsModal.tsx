"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import type { Officer } from "@/lib/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-1">
      <span className="w-[110px] shrink-0 text-sm text-muted">{label}:</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

/**
 * "Login Credential" popup shown after creating an officer, and when opening one
 * from the list. The generated password is only ever shown here — the API has no
 * endpoint that reveals it again, only one that issues a fresh one.
 */
export function OfficerCredentialsModal({
  officer,
  open,
  onClose,
  password = "KbJZGLrhx",
}: {
  officer: Officer | null;
  open: boolean;
  onClose: () => void;
  password?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Login Credential" hideHeader className="w-[414px]">
      <div className="relative px-8 pb-9 pt-14">
        <div className="mb-8 flex h-[68px] items-center justify-center rounded-[2px] bg-primary">
          <p className="text-2xl font-bold text-white">Login Credential</p>
        </div>

        <div className="flex justify-center pb-6">
          <Image
            src={officer?.photoUrl || "/branding/avatar-placeholder.png"}
            alt=""
            width={120}
            height={120}
            className="h-[120px] w-[120px] rounded-full object-cover"
          />
        </div>

        <div className="pl-2">
          <Row label="Username" value={officer?.name ?? ""} />
          <Row label="Email" value={officer?.email ?? ""} />
          <Row label="Password" value={password} />
        </div>

        <div className="mt-8 text-center">
          <button className="text-sm font-semibold text-primary hover:underline">
            Share credential with account owner
          </button>
          <p className="mt-1 text-sm text-muted">{officer?.email}</p>
        </div>
      </div>
    </Modal>
  );
}
