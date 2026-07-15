"use client";

import { useMemo, useState } from "react";
import type { Slug } from "@/components/flag-globe";
import { FlagChip } from "@/components/flag-globe/flag-chip";
import { order, countries as countryData } from "@/components/flag-globe/data/countries";
import type { GlobeConfig } from "@/lib/globe-config";
import { SeminarStage } from "../seminar-stage";
import { Card, Segmented, Toggle } from "./controls";

const ACCENT = "#c0703a";
const SWATCHES = [
  { name: "Copper", hex: "#c0703a" },
  { name: "Emerald", hex: "#2f9e6b" },
  { name: "Crimson", hex: "#c0392b" },
  { name: "Indigo", hex: "#5b6ee1" },
  { name: "Gold", hex: "#d9a441" },
  { name: "Ice", hex: "#4d9de0" },
];

type Status = "idle" | "saving" | "saved" | "error";

export function AdminDashboard({ initialConfig }: { initialConfig: GlobeConfig }) {
  const [saved, setSaved] = useState<GlobeConfig>(initialConfig);
  const [draft, setDraft] = useState<GlobeConfig>(initialConfig);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved]
  );

  const update = (patch: Partial<GlobeConfig>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setStatus("idle");
  };

  const inPool = useMemo(
    () => new Set<Slug>(draft.pool === "all" ? order : draft.pool),
    [draft.pool]
  );
  const togglePool = (slug: Slug) => {
    const next = new Set(inPool);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    const arr = order.filter((s) => next.has(s));
    update({ pool: arr.length === order.length ? "all" : arr });
  };

  async function save() {
    setStatus("saving");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json().catch(() => ({}))) as {
        config?: GlobeConfig;
        error?: string;
      };
      if (!res.ok || !data.config) {
        setErrorMsg(data.error ?? "Failed to save.");
        setStatus("error");
        return;
      }
      setSaved(data.config);
      setDraft(data.config);
      setStatus("saved");
    } catch {
      setErrorMsg("Network error while saving.");
      setStatus("error");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const statusLabel =
    status === "saving"
      ? "Saving…"
      : status === "error"
        ? "Save failed"
        : dirty
          ? "Unsaved changes"
          : status === "saved"
            ? "Saved ✓"
            : "Up to date";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#eef1f5]/85 px-6 py-3 backdrop-blur">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-lg font-bold tracking-tight">
            Atlas <span style={{ color: ACCENT }}>Admin</span>
          </span>
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#5b6b7d]">
            Live seminar globe
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[0.7rem] tracking-wide"
            style={{ color: status === "error" ? "#c0392b" : dirty ? ACCENT : "#5b6b7d" }}
          >
            {statusLabel}
          </span>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-black/10 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-[#3a4655] transition hover:border-black/25"
          >
            View site ↗
          </a>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || status === "saving"}
            className="rounded-lg px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-white transition disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-black/10 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-[#3a4655] transition hover:border-black/25"
          >
            Logout
          </button>
        </div>
      </header>

      {status === "error" && errorMsg && (
        <div className="mx-auto max-w-[1240px] px-6 pt-4">
          <p
            role="alert"
            className="rounded-lg border border-[#c0392b]/30 bg-[#c0392b]/8 px-4 py-2.5 font-mono text-[0.72rem] text-[#c0392b]"
          >
            {errorMsg}
          </p>
        </div>
      )}

      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#5b6b7d]">
              Live preview — exactly how the landing page will render
            </p>
            <div className="relative h-[460px] overflow-hidden rounded-2xl border border-black/10 bg-white/40 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.5)]">
              <SeminarStage config={draft} />
            </div>
          </div>

          <Card title={`Countries · click to set host — currently ${countryData[draft.hub].name}`}>
            <div className="overflow-hidden rounded-lg border border-black/5">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="font-mono text-[0.62rem] uppercase tracking-wider text-[#8a97a6]">
                    <th className="px-3 py-2 font-normal">Flag</th>
                    <th className="px-3 py-2 font-normal">Country</th>
                    <th className="px-3 py-2 font-normal">ISO</th>
                    <th className="px-3 py-2 font-normal">Centroid</th>
                    <th className="px-3 py-2 font-normal">In pool</th>
                  </tr>
                </thead>
                <tbody>
                  {order.map((slug) => {
                    const c = countryData[slug];
                    const isHub = slug === draft.hub;
                    return (
                      <tr
                        key={slug}
                        onClick={() => update({ hub: slug })}
                        className="cursor-pointer border-t border-black/5 transition hover:bg-black/[0.03]"
                        style={isHub ? { background: "rgba(192,112,58,0.08)" } : undefined}
                      >
                        <td className="px-3 py-1.5">
                          <FlagChip slug={slug} size={16} />
                        </td>
                        <td className="px-3 py-1.5 text-[0.82rem] text-[#28323f]">
                          {c.name}
                          {isHub && (
                            <span className="ml-2 font-mono text-[0.6rem] uppercase" style={{ color: ACCENT }}>
                              host
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[0.72rem] text-[#5b6b7d]">{c.iso}</td>
                        <td className="px-3 py-1.5 font-mono text-[0.72rem] text-[#5b6b7d]">
                          {c.centroid[1].toFixed(1)}, {c.centroid[0].toFixed(1)}
                        </td>
                        <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => togglePool(slug)}
                            aria-pressed={inPool.has(slug)}
                            className="rounded border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide transition"
                            style={
                              inPool.has(slug)
                                ? { borderColor: ACCENT, color: ACCENT }
                                : { borderColor: "rgba(0,0,0,0.12)", color: "#9aa6b3" }
                            }
                          >
                            {inPool.has(slug) ? "in" : "out"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-5">
          <Card title="Seminar">
            <label className="mb-2 block">
              <span className="mb-1 block font-mono text-[0.64rem] uppercase tracking-wider text-[#5b6b7d]">
                Title
              </span>
              <input
                type="text"
                value={draft.seminarTitle}
                onChange={(e) => update({ seminarTitle: e.target.value })}
                maxLength={60}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-[#c0703a]"
              />
            </label>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block font-mono text-[0.64rem] uppercase tracking-wider text-[#5b6b7d]">
                  Base count
                </span>
                <input
                  type="number"
                  min={0}
                  value={draft.baseAttendees}
                  onChange={(e) => update({ baseAttendees: Number(e.target.value) })}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-[#c0703a]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-[0.64rem] uppercase tracking-wider text-[#5b6b7d]">
                  End count
                </span>
                <input
                  type="number"
                  min={0}
                  value={draft.endAttendees}
                  onChange={(e) => update({ endAttendees: Number(e.target.value) })}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-[#c0703a]"
                />
              </label>
            </div>
            <p className="mb-3 font-mono text-[0.6rem] leading-relaxed text-[#8a97a6]">
              Counter ramps base → end, then hovers just below end (connect/disconnect
              churn). Set end to 0 to just count up per join.
            </p>
            <div className="flex flex-col gap-2">
              <Toggle label="Demo joins" on={draft.demoJoins} onChange={(v) => update({ demoJoins: v })} />
              <Toggle label="Live feed" on={draft.showFeed} onChange={(v) => update({ showFeed: v })} />
            </div>
          </Card>

          <Card title="Appearance · accent">
            <div className="mb-3 grid grid-cols-3 gap-1.5">
              {SWATCHES.map((s) => (
                <button
                  key={s.hex}
                  type="button"
                  onClick={() => update({ accent: s.hex })}
                  className="flex items-center gap-2 rounded-lg border px-2 py-1.5 font-mono text-[0.66rem] transition"
                  style={
                    draft.accent.toLowerCase() === s.hex
                      ? { borderColor: s.hex, color: s.hex }
                      : { borderColor: "rgba(0,0,0,0.1)", color: "#5b6b7d" }
                  }
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: s.hex }} />
                  {s.name}
                </button>
              ))}
            </div>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-3 py-2">
              <span className="font-mono text-[0.7rem] uppercase tracking-wider text-[#3a4655]">Custom</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-[0.72rem] text-[#5b6b7d]">{draft.accent}</span>
                <input
                  type="color"
                  value={draft.accent}
                  onChange={(e) => update({ accent: e.target.value })}
                  className="h-6 w-8 cursor-pointer rounded border border-black/10 bg-transparent"
                  aria-label="Custom accent colour"
                />
              </span>
            </label>
          </Card>

          <Card title="Display">
            <div className="flex flex-col gap-2">
              <Toggle label="Auto-rotate" on={draft.autoRotate} onChange={(v) => update({ autoRotate: v })} />
              <Toggle label="Atmosphere" on={draft.showAtmosphere} onChange={(v) => update({ showAtmosphere: v })} />
            </div>
          </Card>

          <Card title="Quality">
            <Segmented
              options={["high", "medium", "low"] as const}
              value={draft.quality}
              onChange={(v) => update({ quality: v })}
            />
            <p className="mt-2 font-mono text-[0.62rem] leading-relaxed text-[#8a97a6]">
              segments 128/96/64 · texture 2048/1536/1024. Lower for weak GPUs.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
