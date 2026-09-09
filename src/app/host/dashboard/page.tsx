"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/icons/Icon";
import { Camera01Icon, ArrowLeft01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { mockVisitors } from "@/data/mock-data";
import { DEFAULT_SESSIONS } from "@/lib/mock-session";
import { ID_TYPE_LABEL, VISITOR_TYPE_LABEL } from "@/lib/labels";
import { cn, formatDate } from "@/lib/utils";
import type { Visitor, VisitorStatus } from "@/lib/types";

const TABS: { value: VisitorStatus | "all"; label: string; heading: string }[] = [
  { value: "all", label: "All visitors", heading: "ALL VISITORS" },
  { value: "awaiting_approval", label: "Awaiting", heading: "AWAITING VISITORS" },
  { value: "submitted", label: "Submitted", heading: "SUBMITTED VISITORS" },
  { value: "signed_in", label: "Signed in", heading: "SIGN IN VISITORS" },
  { value: "signed_out", label: "Signed out", heading: "SIGN OUT VISITORS" },
];

const inputClass =
  "h-11 w-full rounded-[4px] border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-border focus:border-primary";

const COUNTRIES = [
  { label: "Nigeria", value: "Nigeria" },
  { label: "Ghana", value: "Ghana" },
];
const RANKS = [
  { label: "Major", value: "Major" },
  { label: "Colonel", value: "Colonel" },
  { label: "Lieutenant", value: "Lieutenant" },
];
const VISITOR_TYPES = [
  { label: "Family", value: "family" },
  { label: "Friend", value: "friend" },
  { label: "Official", value: "official" },
  { label: "Relative", value: "relative" },
];

const STATUS_DOT: Record<VisitorStatus, string> = {
  signed_in: "bg-primary",
  signed_out: "bg-red",
  cancelled: "bg-red",
  awaiting_approval: "bg-gold-header",
  submitted: "bg-gold-header",
  confirmed: "bg-gold-header",
};

const STATUS_LABEL: Record<VisitorStatus, string> = {
  signed_in: "Signed in",
  signed_out: "Signed out",
  cancelled: "Cancelled",
  awaiting_approval: "Awaiting approval",
  submitted: "Submitted",
  confirmed: "Confirmed",
};

export default function HostDashboardPage() {
  const session = DEFAULT_SESSIONS.host;
  const [tab, setTab] = useState<VisitorStatus | "all">("all");
  const [mode, setMode] = useState<"form" | "list">("form");
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [query, setQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const myVisitors = useMemo(() => mockVisitors.filter((v) => v.host.name === session.name), [session.name]);
  const active = TABS.find((t) => t.value === tab)!;

  const rows = useMemo(() => {
    const byTab = tab === "all" ? myVisitors : myVisitors.filter((v) => v.status === tab);
    return query ? byTab.filter((v) => v.name.toLowerCase().includes(query.toLowerCase())) : byTab;
  }, [myVisitors, tab, query]);

  // The design groups the feed by day, with a "Yesterday" divider.
  const today = rows.slice(0, Math.ceil(rows.length / 2));
  const yesterday = rows.slice(Math.ceil(rows.length / 2));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setConfirmOpen(true);
  }

  return (
    <div>
      {/* Action bar */}
      <div className="flex flex-wrap items-stretch bg-white">
        <div className="flex items-center px-8 py-6">
          <Button
            className="h-12 px-7"
            variant={mode === "form" ? "primary" : "outline"}
            onClick={() => {
              setMode("form");
              setSelected(null);
            }}
          >
            Submit New Visitor
          </Button>
        </div>
        <div className="w-px bg-divider" />
        <div className="flex flex-wrap items-center gap-4 px-8 py-6">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTab(t.value);
                setMode("list");
                setSelected(null);
              }}
              className={cn(
                "rounded-[6px] px-4 py-2.5 text-sm transition-colors",
                mode === "list" && tab === t.value
                  ? "bg-primary font-semibold text-white"
                  : "bg-grey text-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-b border-divider" />

      <div className="relative px-6 py-8">

        {mode === "form" ? (
          <div className="relative mx-auto w-[788px] max-w-full overflow-hidden rounded-[8px] border border-border bg-white">
            <div className="border-b border-border py-5 text-center text-lg font-bold tracking-wide text-ink">
              SUBMIT NEW VISITOR TO THE GATE
            </div>

            <div className="flex justify-center border-b border-border py-8">
              <div className="relative">
                <Image
                  src="/branding/avatar-placeholder.png"
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow">
                  <Icon icon={Camera01Icon} size={16} />
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-[136px] py-8">
              <Field label="Visitor's country">
                <Dropdown className="h-11 w-full" value="Nigeria" options={COUNTRIES} onChange={() => {}} />
              </Field>
              <Field label="Full name">
                <input className={inputClass} placeholder="Full name" required />
              </Field>
              <Field label="Phone number">
                <input className={inputClass} placeholder="Phone number" type="tel" required />
              </Field>
              <Field label="ID type">
                <input className={inputClass} placeholder="Enter ID type" required />
              </Field>
              <Field label="Host name">
                <input className={inputClass} placeholder="Host name" defaultValue={session.name} required />
              </Field>
              <Field label="Host rank">
                <Dropdown className="h-11 w-full" value="Major" options={RANKS} onChange={() => {}} />
              </Field>
              <Field label="Host department">
                <input className={inputClass} placeholder="Host Department" required />
              </Field>
              <Field label="Type of visitor">
                <Dropdown className="h-11 w-full" value="family" options={VISITOR_TYPES} onChange={() => {}} />
              </Field>
              <Field label="Escort">
                <input className={inputClass} type="number" min={0} defaultValue={0} />
              </Field>
              <Field label="Escort Names">
                <input className={inputClass} placeholder="Enter escort names" />
              </Field>
              <Field label="Expected date">
                <input className={inputClass} type="date" required />
              </Field>
              <Field label="Expected time ( FRO/TO)">
                <input className={inputClass} placeholder="9:00 AM - 8:00 AM" required />
              </Field>

              <Button type="submit" fullWidth className="mt-3 h-[52px]">
                Submit
              </Button>
            </form>
          </div>
        ) : (
          <div className="relative mx-auto w-[935px] max-w-full overflow-hidden rounded-[8px] border border-border bg-white">
            <div className="border-b border-border py-5 text-center text-xl font-bold tracking-wide text-ink">
              {active.heading}
            </div>

            {selected ? (
              <VisitorDetail visitor={selected} onBack={() => setSelected(null)} />
            ) : (
              <>
                <div className="flex items-center justify-center gap-4 border-b border-border px-8 py-6">
                  <div className="relative w-[350px]">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                      <Icon icon={Search01Icon} size={18} strokeWidth={1.75} />
                    </span>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search"
                      className="h-12 w-full rounded-[4px] border border-border bg-white pl-11 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
                    />
                  </div>
                  <Button className="px-8">Search</Button>
                </div>

                {rows.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="max-h-[620px] overflow-y-auto">
                    {today.map((v) => (
                      <VisitorRow key={v._id} visitor={v} onView={() => setSelected(v)} />
                    ))}
                    {yesterday.length > 0 && (
                      <>
                        <p className="px-8 pb-2 pt-6 text-sm font-semibold text-muted">Yesterday</p>
                        {yesterday.map((v) => (
                          <VisitorRow key={v._id} visitor={v} onView={() => setSelected(v)} />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} hideHeader className="w-[280px]">
        <div className="flex h-[280px] items-center justify-center">
          <Image src="/branding/success-check.png" alt="Submitted" width={72} height={72} />
        </div>
      </Modal>
    </div>
  );
}

function VisitorRow({ visitor, onView }: { visitor: Visitor; onView: () => void }) {
  return (
    <div className="flex items-center gap-4 border-b border-divider px-8 py-4">
      <div className="relative shrink-0">
        <Image
          src={visitor.photoUrl || "/branding/avatar-placeholder.png"}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover"
        />
        <span
          className={cn(
            "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white",
            STATUS_DOT[visitor.status],
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{visitor.name}</p>
        <p className="text-sm text-muted">{VISITOR_TYPE_LABEL[visitor.visitorType]}</p>
      </div>
      <button onClick={onView} className="shrink-0 text-sm text-primary hover:underline">
        view
      </button>
    </div>
  );
}

function DetailRow({ label, value, valueClass }: { label: string; value?: string | number; valueClass?: string }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start gap-4 py-[7px]">
      <span className="w-[190px] shrink-0 text-sm text-muted">{label}:</span>
      <span className={cn("text-sm text-ink", valueClass)}>{value}</span>
    </div>
  );
}

function VisitorDetail({ visitor, onBack }: { visitor: Visitor; onBack: () => void }) {
  return (
    <div className="px-8 py-6">
      <button onClick={onBack} className="text-ink transition-opacity hover:opacity-60" aria-label="Back">
        <Icon icon={ArrowLeft01Icon} size={22} strokeWidth={1.75} />
      </button>

      <div className="flex flex-col items-center gap-1 pb-5 pt-2">
        <div className="relative">
          <Image
            src={visitor.photoUrl || "/branding/avatar-placeholder.png"}
            alt=""
            width={155}
            height={155}
            className="h-[155px] w-[155px] rounded-full object-cover"
          />
          <span
            className={cn(
              "absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white",
              STATUS_DOT[visitor.status],
            )}
          />
        </div>
        <p className="mt-2 text-lg font-bold text-ink">{visitor.name}</p>
        <p className="text-sm text-muted">{VISITOR_TYPE_LABEL[visitor.visitorType]}</p>
      </div>

      <div className="mx-auto max-w-[440px]">
        <DetailRow label="Host name" value={visitor.host.name} />
        <DetailRow label="Phone number" value={visitor.phone} />
        <DetailRow label="Host rank" value={visitor.host.rank} />
        <DetailRow label="Visitor's country" value={visitor.country} />
        <DetailRow label="ID type" value={ID_TYPE_LABEL[visitor.idType]} />
        <DetailRow label="Host department" value={visitor.host.department} />
        <DetailRow label="Escort" value={visitor.escortCount} />
        <DetailRow label="Escort names" value={visitor.escortNames.join(", ")} />
        <DetailRow
          label="Status"
          value={STATUS_LABEL[visitor.status]}
          valueClass={visitor.status === "signed_in" ? "text-primary" : visitor.status === "cancelled" ? "text-red" : ""}
        />
        <DetailRow label="Expected date" value={formatDate(visitor.expectedDate)} />
        <DetailRow label="Expected time (FRO/TO)" value={`${visitor.expectedTimeFrom} - ${visitor.expectedTimeTo}`} />
        <DetailRow label="Sign in time" value={visitor.signInTime} />
        <DetailRow label="Sign in agent" value={visitor.signInAgent} />

        <Button variant="destructive" fullWidth className="mt-6 h-[52px]">
          End appointment
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}
