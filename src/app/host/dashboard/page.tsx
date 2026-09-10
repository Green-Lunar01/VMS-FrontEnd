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
import { visitorsApi } from "@/lib/api/endpoints";
import { useApi } from "@/lib/api/useApi";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ID_TYPE_LABEL, ID_TYPE_OPTIONS, VISITOR_STATUS_LABEL, VISITOR_TYPE_LABEL } from "@/lib/labels";
import { agentName, cn, formatDate, timeRange } from "@/lib/utils";
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

export default function HostDashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<VisitorStatus | "all">("all");
  const [mode, setMode] = useState<"form" | "list">("form");
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [country, setCountry] = useState("Nigeria");
  const [hostRank, setHostRank] = useState("Major");
  const [visitorType, setVisitorType] = useState("family");
  const [idType, setIdType] = useState("nin");

  const active = TABS.find((t) => t.value === tab)!;

  const { data, loading, error, reload, setData } = useApi<Visitor[]>(
    () =>
      visitorsApi.mine({
        status: tab === "all" ? undefined : tab,
        q: submittedQuery || undefined,
      }),
    [tab, submittedQuery],
    mode === "list",
  );

  const rows = useMemo(() => data ?? [], [data]);

  function patchRow(updated: Visitor) {
    setData((prev) => (prev ?? []).map((v) => (v._id === updated._id ? updated : v)));
    setSelected((cur) => (cur && cur._id === updated._id ? updated : cur));
  }

  // The design groups the feed by day, with a "Yesterday" divider.
  const today = rows.slice(0, Math.ceil(rows.length / 2));
  const yesterday = rows.slice(Math.ceil(rows.length / 2));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const escortNames = String(form.get("escortNames") ?? "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    setBusy(true);
    setFormError(null);
    try {
      await visitorsApi.submit({
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        country,
        idType,
        visitorType,
        escortCount: Number(form.get("escortCount") ?? 0),
        escortNames,
        expectedDate: String(form.get("expectedDate") ?? ""),
        expectedTimeFrom: String(form.get("expectedTimeFrom") ?? ""),
        expectedTimeTo: String(form.get("expectedTimeTo") ?? ""),
        phoneOrLaptop: false,
      });
      // e.currentTarget is nulled by the time the await above resolves, so the
      // element reference has to be captured beforehand.
      formEl.reset();
      setConfirmOpen(true);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages.join(" ") : "Could not submit this visitor.");
    } finally {
      setBusy(false);
    }
  }

  async function act(kind: "confirm" | "cancel" | "end", visitor: Visitor) {
    setBusy(true);
    try {
      if (kind === "confirm") patchRow(await visitorsApi.confirm(visitor._id));
      if (kind === "cancel") patchRow(await visitorsApi.cancel(visitor._id));
      if (kind === "end") patchRow(await visitorsApi.endAppointment(visitor._id));
    } catch (err) {
      window.alert(err instanceof ApiError ? err.messages.join(" ") : "That action failed.");
    } finally {
      setBusy(false);
    }
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
                <Dropdown className="h-11 w-full" value={country} options={COUNTRIES} onChange={setCountry} />
              </Field>
              <Field label="Full name">
                <input name="name" className={inputClass} placeholder="Full name" required />
              </Field>
              <Field label="Phone number">
                <input name="phone" className={inputClass} placeholder="Phone number" type="tel" required />
              </Field>
              <Field label="ID type">
                <Dropdown className="h-11 w-full" value={idType} options={ID_TYPE_OPTIONS} onChange={setIdType} />
              </Field>
              <Field label="Host name">
                <input name="hostName" className={inputClass} placeholder="Host name" defaultValue={user?.name ?? ""} readOnly />
              </Field>
              <Field label="Host rank">
                <Dropdown className="h-11 w-full" value={hostRank} options={RANKS} onChange={setHostRank} />
              </Field>
              <Field label="Host department">
                <input name="hostDepartment" className={inputClass} placeholder="Host Department" />
              </Field>
              <Field label="Type of visitor">
                <Dropdown className="h-11 w-full" value={visitorType} options={VISITOR_TYPES} onChange={setVisitorType} />
              </Field>
              <Field label="Escort">
                <input name="escortCount" className={inputClass} type="number" min={0} defaultValue={0} />
              </Field>
              <Field label="Escort Names">
                <input name="escortNames" className={inputClass} placeholder="e.g. John Doe, Jane Doe" />
                <p className="text-xs text-muted">Separate multiple names with commas.</p>
              </Field>
              <Field label="Expected date">
                <input name="expectedDate" className={inputClass} type="date" required />
              </Field>
              <Field label="Expected time ( FRO/TO)">
                <div className="flex gap-3">
                  <input name="expectedTimeFrom" className={inputClass} placeholder="9:00 AM" required />
                  <input name="expectedTimeTo" className={inputClass} placeholder="8:00 AM" required />
                </div>
              </Field>

              {formError && (
                <p role="alert" className="rounded-[4px] bg-red-light px-4 py-3 text-sm text-red">
                  {formError}
                </p>
              )}

              <Button type="submit" fullWidth className="mt-3 h-[52px]" disabled={busy}>
                {busy ? "Submitting\u2026" : "Submit"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="relative mx-auto w-[935px] max-w-full overflow-hidden rounded-[8px] border border-border bg-white">
            <div className="border-b border-border py-5 text-center text-xl font-bold tracking-wide text-ink">
              {active.heading}
            </div>

            {selected ? (
              <VisitorDetail visitor={selected} onBack={() => setSelected(null)} busy={busy} onAct={act} />
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
                      onKeyDown={(e) => e.key === "Enter" && setSubmittedQuery(query)}
                      placeholder="Search"
                      className="h-12 w-full rounded-[4px] border border-border bg-white pl-11 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
                    />
                  </div>
                  <Button className="px-8" onClick={() => setSubmittedQuery(query)}>Search</Button>
                </div>

                {loading ? (
                  <p className="py-16 text-center text-sm text-muted">Loading&hellip;</p>
                ) : error ? (
                  <button onClick={reload} className="block w-full py-16 text-center text-sm text-red">
                    {error} &mdash; retry
                  </button>
                ) : rows.length === 0 ? (
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

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} hideHeader className="w-[340px]">
        <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
          <Image src="/branding/success-check.png" alt="" width={72} height={72} />
          <div>
            <p className="text-base font-bold text-ink">Visitor submitted</p>
            <p className="mt-1 text-sm text-muted">
              Security has been notified and will sign your visitor in on arrival.
            </p>
          </div>
          <Button fullWidth onClick={() => setConfirmOpen(false)}>
            Done
          </Button>
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

function VisitorDetail({
  visitor,
  onBack,
  busy,
  onAct,
}: {
  visitor: Visitor;
  onBack: () => void;
  busy: boolean;
  onAct: (kind: "confirm" | "cancel" | "end", visitor: Visitor) => void;
}) {
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
          value={VISITOR_STATUS_LABEL[visitor.status]}
          valueClass={visitor.status === "signed_in" ? "text-primary" : visitor.status === "cancelled" ? "text-red" : ""}
        />
        <DetailRow label="Expected date" value={visitor.expectedDate ? formatDate(visitor.expectedDate) : undefined} />
        <DetailRow label="Expected time (FRO/TO)" value={timeRange(visitor.expectedTimeFrom, visitor.expectedTimeTo)} />
        <DetailRow label="Sign in time" value={visitor.signInTime} />
        <DetailRow label="Sign in agent" value={agentName(visitor.signInAgent)} />

        <div className="mt-6 flex flex-col gap-3">
          {/* A walk-in raised by Security must be confirmed before it can be signed in. */}
          {visitor.status === "awaiting_approval" && (
            <Button fullWidth className="h-[52px]" disabled={busy} onClick={() => onAct("confirm", visitor)}>
              Confirm visitor
            </Button>
          )}
          {visitor.status === "signed_in" && (
            <Button
              variant="destructive"
              fullWidth
              className="h-[52px]"
              disabled={busy}
              onClick={() => onAct("end", visitor)}
            >
              End appointment
            </Button>
          )}
          {(visitor.status === "submitted" ||
            visitor.status === "confirmed" ||
            visitor.status === "awaiting_approval") && (
            <Button
              variant="secondary"
              fullWidth
              className="h-[52px]"
              disabled={busy}
              onClick={() => onAct("cancel", visitor)}
            >
              Cancel visitation
            </Button>
          )}
        </div>
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
