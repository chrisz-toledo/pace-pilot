"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  FrictionEvent,
  FrictionType,
  Station,
  UserRole,
  FiveSDiagnosis,
  PACEReport,
  FiveSStep,
} from "@/lib/types";
import { loadEvents, appendEvent, markResolved, seedIfEmpty, clearEvents } from "@/lib/storage";
import { ruleBasedDiagnosis, computeReport } from "@/lib/offline";
import { getLocale, type Lang } from "@/lib/locales";
import {
  getPQRGReference,
  UHC_STANDARDS,
  GOLD_STANDARD_BUILDS,
  SAFETY_PROTOCOLS,
  SHELF_LIFE_INDEX,
  SERVICE_TARGETS,
} from "@/lib/mcmit-data";

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = "events" | "log" | "report" | "train";

const STATIONS: Station[] = ["DT_WINDOW", "KITCHEN", "LOBBY", "FRONT_COUNTER", "GRILL", "UHC", "BOC"];
const FRICTION_KEYS: FrictionType[] = ["WAIT_TIME", "STOCK_OUT", "DISORDER", "EQUIPMENT_FAILURE", "PROCEDURE_DEVIATION"];
const ROLE_KEYS: UserRole[] = ["MIT_DIRECTOR", "GM_FACILITY", "AREA_SUPERVISOR", "CREW_OPERATOR"];
const FIVE_S_STEPS: FiveSStep[] = ["Seiri", "Seiton", "Seiso", "Seiketsu", "Shitsuke"];

const SEV_COLORS = ["", "bg-emerald-500", "bg-cyan-500", "bg-yellow-500", "bg-orange-500", "bg-red-600"];
const URGENCY_STYLE: Record<string, string> = {
  IMMEDIATE: "bg-red-600 text-white",
  NEXT_SHIFT: "bg-yellow-500 text-black",
  SCHEDULED: "bg-emerald-600 text-white",
};
const FIVE_S_ICON: Record<FiveSStep, string> = {
  Seiri: "🗂",
  Seiton: "📐",
  Seiso: "🧹",
  Seiketsu: "📋",
  Shitsuke: "🔄",
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<Tab>("events");
  const [lang, setLang] = useState<Lang>("es");
  const [events, setEvents] = useState<FrictionEvent[]>([]);
  const [selected, setSelected] = useState<FrictionEvent | null>(null);
  const [report, setReport] = useState<PACEReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [form, setForm] = useState({
    station: "DT_WINDOW" as Station,
    event_type: "WAIT_TIME" as FrictionType,
    description: "",
    severity: 3,
    reporter_role: "GM_FACILITY" as UserRole,
    service_impact_minutes: 0,
  });

  const L = getLocale(lang);
  const refresh = useCallback(() => setEvents(loadEvents()), []);

  useEffect(() => {
    seedIfEmpty();
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (tab === "report") setReport(computeReport(events));
  }, [tab, events]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  async function handleLog(e: React.FormEvent) {
    e.preventDefault();
    const id = crypto.randomUUID();
    const event: FrictionEvent = {
      ...form,
      id,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, lang }),
      });
      const diagnosis: FiveSDiagnosis = await res.json();
      event.five_s_diagnosis = diagnosis;
    } catch {
      event.five_s_diagnosis = ruleBasedDiagnosis(event);
    }
    setIsAnalyzing(false);

    appendEvent(event);
    refresh();
    setForm({ station: "DT_WINDOW", event_type: "WAIT_TIME", description: "", severity: 3, reporter_role: "GM_FACILITY", service_impact_minutes: 0 });
    setLogSuccess(true);
    setTimeout(() => setLogSuccess(false), 2500);
    setTab("events");
  }

  function handleResolve(id: string) {
    markResolved(id);
    refresh();
    setSelected(null);
  }

  function handleSeed() {
    clearEvents();
    seedIfEmpty();
    refresh();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[100dvh] bg-onyx overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-gold font-black text-lg tracking-tight">PACE-Pilot</span>
          <span className="text-[10px] font-bold text-gold/50 uppercase tracking-widest">v0.1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white/40 uppercase">{L.app.events_count(events.length)}</span>
          <button
            onClick={() => setLang((l) => (l === "es" ? "en" : "es"))}
            className="text-[10px] font-black text-white/60 uppercase tracking-widest px-2 py-1 rounded border border-white/20 active:bg-white/10 min-w-[36px] text-center"
            title="Toggle language / Cambiar idioma"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <button
            onClick={handleSeed}
            className="text-[10px] font-bold text-gold/60 uppercase tracking-widest px-2 py-1 rounded border border-gold/20 active:bg-gold/10"
          >
            {L.header.reset}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 scrollable">
        {tab === "events" && <EventsTab events={events} onSelect={setSelected} L={L} />}
        {tab === "log" && (
          <LogTab
            form={form}
            setForm={setForm}
            onSubmit={handleLog}
            isAnalyzing={isAnalyzing}
            success={logSuccess}
            L={L}
          />
        )}
        {tab === "report" && report && <ReportTab report={report} L={L} />}
        {tab === "train" && <TrainingTab L={L} />}
      </main>

      {/* Bottom Nav — 4 columns */}
      <nav className="shrink-0 grid grid-cols-4 bg-surface border-t border-white/10 pb-safe">
        <NavBtn active={tab === "events"} onClick={() => setTab("events")} icon="📋" label={L.nav.events} />
        <NavBtn active={tab === "log"} onClick={() => setTab("log")} icon="+" label={L.nav.log} gold />
        <NavBtn active={tab === "report"} onClick={() => setTab("report")} icon="📊" label={L.nav.report} />
        <NavBtn active={tab === "train"} onClick={() => setTab("train")} icon="📚" label={L.nav.train} />
      </nav>

      {/* Event Detail Sheet */}
      {selected && (
        <EventSheet event={selected} onClose={() => setSelected(null)} onResolve={handleResolve} L={L} />
      )}
    </div>
  );
}

// ─── Nav Button ───────────────────────────────────────────────────────────────

function NavBtn({ active, onClick, icon, label, gold }: {
  active: boolean; onClick: () => void; icon: string; label: string; gold?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
        gold ? "text-gold font-black" : active ? "text-gold" : "text-white/40"
      }`}
    >
      <span className={`text-xl leading-none ${gold ? "text-2xl" : ""}`}>{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab({ events, onSelect, L }: {
  events: FrictionEvent[];
  onSelect: (e: FrictionEvent) => void;
  L: ReturnType<typeof getLocale>;
}) {
  const unresolved = events.filter((e) => !e.resolved);
  const resolved = events.filter((e) => e.resolved);

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/40 p-8">
        <span className="text-5xl">📋</span>
        <p className="text-center text-sm font-bold uppercase tracking-wide">
          {L.events.empty_title}<br />{L.events.empty_hint}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label={L.events.stat_total} value={events.length} />
        <StatCard label={L.events.stat_unresolved} value={unresolved.length} accent />
        <StatCard
          label={L.events.stat_dt_impact}
          value={`+${events.filter((e) => e.station === "DT_WINDOW").reduce((s, e) => s + e.service_impact_minutes, 0).toFixed(1)}m`}
          accent
        />
      </div>

      {unresolved.length > 0 && (
        <div>
          <SectionLabel>{L.events.unresolved}</SectionLabel>
          <div className="flex flex-col gap-2">
            {unresolved.map((ev) => (
              <EventCard key={ev.id} event={ev} onTap={() => onSelect(ev)} L={L} />
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <SectionLabel dim>{L.events.resolved}</SectionLabel>
          <div className="flex flex-col gap-2 opacity-50">
            {resolved.map((ev) => (
              <EventCard key={ev.id} event={ev} onTap={() => onSelect(ev)} L={L} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="bg-card rounded-xl p-3 flex flex-col gap-1">
      <span className={`text-xl font-black ${accent ? "text-gold" : "text-cream"}`}>{value}</span>
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide">{label}</span>
    </div>
  );
}

function SectionLabel({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <p className={`text-[10px] font-black uppercase tracking-widest px-1 pb-1 ${dim ? "text-white/30" : "text-white/50"}`}>
      {children}
    </p>
  );
}

function EventCard({ event, onTap, L }: {
  event: FrictionEvent;
  onTap: () => void;
  L: ReturnType<typeof getLocale>;
}) {
  const diag = event.five_s_diagnosis;
  const stationLabel = (L.stations as Record<string, string>)[event.station] ?? event.station;
  const urgencyLabel = diag ? (L.urgency as Record<string, string>)[diag.urgency] ?? diag.urgency : "";
  return (
    <button
      onClick={onTap}
      className="bg-card rounded-2xl p-4 text-left active:scale-[0.98] transition-transform w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black bg-white/10 text-white/70 px-2 py-0.5 rounded-full uppercase tracking-widest">
            {stationLabel}
          </span>
          <span className="text-[10px] font-bold text-white/40 uppercase">
            {(L.friction_types as Record<string, string>)[event.event_type] ?? event.event_type}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${SEV_COLORS[event.severity]}`} />
      </div>
      <p className="text-sm font-semibold text-cream leading-snug line-clamp-2">{event.description}</p>
      {diag && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] font-black text-gold">
            {FIVE_S_ICON[diag.failing_step]} {(L.five_s as Record<string, string>)[diag.failing_step] ?? diag.failing_step}
          </span>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${URGENCY_STYLE[diag.urgency]}`}>
            {urgencyLabel}
          </span>
        </div>
      )}
    </button>
  );
}

// ─── Log Tab ──────────────────────────────────────────────────────────────────

interface LogFormState {
  station: Station;
  event_type: FrictionType;
  description: string;
  severity: number;
  reporter_role: UserRole;
  service_impact_minutes: number;
}

function LogTab({ form, setForm, onSubmit, isAnalyzing, success, L }: {
  form: LogFormState;
  setForm: React.Dispatch<React.SetStateAction<LogFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  isAnalyzing: boolean;
  success: boolean;
  L: ReturnType<typeof getLocale>;
}) {
  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-4">
      <h2 className="text-base font-black uppercase tracking-widest text-gold">{L.log.title}</h2>

      <Field label={L.log.station_label}>
        <div className="grid grid-cols-4 gap-1.5">
          {STATIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((f) => ({ ...f, station: s }))}
              className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-colors ${
                form.station === s ? "bg-gold text-black" : "bg-card text-white/60"
              }`}
            >
              {(L.stations as Record<string, string>)[s] ?? s}
            </button>
          ))}
        </div>
      </Field>

      <Field label={L.log.type_label}>
        <div className="flex flex-col gap-1.5">
          {FRICTION_KEYS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, event_type: value }))}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-colors ${
                form.event_type === value ? "bg-gold text-black" : "bg-card text-white/70"
              }`}
            >
              {(L.friction_types as Record<string, string>)[value] ?? value}
            </button>
          ))}
        </div>
      </Field>

      <Field label={L.log.desc_label}>
        <textarea
          required
          minLength={5}
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder={L.log.desc_placeholder}
          className="w-full bg-card rounded-xl px-3 py-2.5 text-sm text-cream placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-gold/50"
        />
      </Field>

      <Field label={L.log.severity_label(form.severity, L.severity[form.severity])}>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm((f) => ({ ...f, severity: n }))}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-colors ${
                form.severity === n ? SEV_COLORS[n] + " text-white" : "bg-card text-white/40"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </Field>

      <Field label={L.log.impact_label(form.service_impact_minutes)}>
        <input
          type="range"
          min={0}
          max={15}
          step={0.5}
          value={form.service_impact_minutes}
          onChange={(e) => setForm((f) => ({ ...f, service_impact_minutes: parseFloat(e.target.value) }))}
          className="w-full accent-gold"
        />
      </Field>

      <Field label={L.log.role_label}>
        <div className="grid grid-cols-2 gap-1.5">
          {ROLE_KEYS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, reporter_role: value }))}
              className={`py-2 px-3 rounded-xl text-[11px] font-bold transition-colors ${
                form.reporter_role === value ? "bg-gold text-black" : "bg-card text-white/60"
              }`}
            >
              {(L.roles as Record<string, string>)[value] ?? value}
            </button>
          ))}
        </div>
      </Field>

      <button
        type="submit"
        disabled={isAnalyzing || !form.description.trim()}
        className="w-full py-4 rounded-2xl bg-gold text-black font-black text-base uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform mt-2"
      >
        {isAnalyzing ? L.log.analyzing : success ? L.log.success : L.log.submit}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/50">{label}</label>
      {children}
    </div>
  );
}

// ─── Report Tab ───────────────────────────────────────────────────────────────

function ReportTab({ report, L }: { report: PACEReport; L: ReturnType<typeof getLocale> }) {
  const date = new Date(report.generated_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const maxCount = Math.max(...Object.values(report.five_s_breakdown), 1);

  return (
    <div className="p-3 flex flex-col gap-3 pb-6">
      {/* Header card — no "Para: Michael", just Resumen Operacional */}
      <div className="bg-card rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {L.report.summary_header}
            </p>
            <p className="text-lg font-black text-gold mt-0.5">{L.report.title}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40">{date}</p>
            <p className="text-[10px] text-white/40">{L.report.peak}: {report.peak_window}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <MiniStat label={L.report.stat_events} value={report.total_events} />
          <MiniStat label={L.report.stat_unresolved} value={report.unresolved_events} accent />
          <MiniStat label={L.report.stat_dt} value={`+${report.dt_impact_minutes}m`} accent />
        </div>
      </div>

      {/* Executive summary */}
      <div className="bg-card rounded-2xl p-4">
        <SLabel>{L.report.summary_title}</SLabel>
        <p className="text-sm text-white/80 leading-relaxed">{report.executive_summary}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-white/40 uppercase font-bold">{L.report.primary_failure}</span>
          <span className="text-sm font-black text-gold">
            {FIVE_S_ICON[report.primary_5s_failure]} {(L.five_s as Record<string, string>)[report.primary_5s_failure] ?? report.primary_5s_failure}
          </span>
        </div>
      </div>

      {/* Bottlenecks */}
      {report.bottlenecks.length > 0 && (
        <div className="bg-card rounded-2xl p-4">
          <SLabel>{L.report.bottlenecks_title}</SLabel>
          <div className="flex flex-col gap-2">
            {report.bottlenecks.map((b) => (
              <div key={b.station} className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black text-white/80 uppercase">
                    {(L.stations as Record<string, string>)[b.station] ?? b.station}
                  </span>
                  <span className="text-[10px] text-white/40 ml-2">
                    {L.report.event_count(b.event_count)} · {L.report.sev_label} {b.avg_severity}
                  </span>
                </div>
                <span className="text-sm font-black text-crimson">+{b.total_impact_minutes}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5S Breakdown */}
      <div className="bg-card rounded-2xl p-4">
        <SLabel>{L.report.five_s_title}</SLabel>
        <div className="flex flex-col gap-2.5">
          {(Object.entries(report.five_s_breakdown) as [FiveSStep, number][]).map(([step, count]) => {
            const isPrimary = step === report.primary_5s_failure;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={step}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-black ${isPrimary ? "text-gold" : "text-white/60"}`}>
                    {FIVE_S_ICON[step]} {(L.five_s as Record<string, string>)[step] ?? step}
                    {isPrimary && " ◀"}
                  </span>
                  <span className="text-[10px] text-white/40">{count}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isPrimary ? "bg-gold" : "bg-white/30"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card rounded-2xl p-4">
        <SLabel>{L.report.recs_title}</SLabel>
        <div className="flex flex-col gap-3">
          {report.recommendations.map((rec, i) => {
            const urgencyKeys = ["IMMEDIATE", "NEXT_SHIFT", "SCHEDULED"];
            const urgency = urgencyKeys[i] ?? "SCHEDULED";
            return (
              <div key={i} className="flex gap-3">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0 h-fit mt-0.5 ${URGENCY_STYLE[urgency]}`}>
                  {(L.urgency as Record<string, string>)[urgency] ?? urgency}
                </span>
                <p className="text-xs text-white/80 leading-relaxed">{rec}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className={`text-lg font-black leading-none ${accent ? "text-gold" : "text-cream"}`}>{value}</span>
      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{children}</p>;
}

// ─── Training Tab ─────────────────────────────────────────────────────────────

function TrainingTab({ L }: { L: ReturnType<typeof getLocale> }) {
  const dtMins = Math.floor(SERVICE_TARGETS.DT_WINDOW.target_seconds / 60);
  const dtSecs = SERVICE_TARGETS.DT_WINDOW.target_seconds % 60;
  const fcMins = Math.floor(SERVICE_TARGETS.FRONT_COUNTER.target_seconds / 60);
  const fcSecs = SERVICE_TARGETS.FRONT_COUNTER.target_seconds % 60;

  return (
    <div className="p-3 flex flex-col gap-4 pb-8">
      {/* Module header */}
      <div className="bg-card rounded-2xl p-4 border border-gold/20">
        <p className="text-[10px] font-black text-gold/60 uppercase tracking-widest mb-1">{L.train.subtitle}</p>
        <p className="text-xl font-black text-gold">{L.train.title}</p>
        <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{L.train.description}</p>
      </div>

      {/* 5S Methodology */}
      <div>
        <SectionLabel>{L.train.five_s_module}</SectionLabel>
        <div className="flex flex-col gap-2">
          {FIVE_S_STEPS.map((step) => (
            <div key={step} className="bg-card rounded-2xl p-4 flex gap-3">
              <span className="text-2xl leading-none shrink-0 pt-0.5">{FIVE_S_ICON[step]}</span>
              <div>
                <p className="text-sm font-black text-gold">
                  {(L.five_s as Record<string, string>)[step] ?? step}
                </p>
                <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                  {(L.five_s_def as Record<string, string>)[step]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UHC Holding Times */}
      <div>
        <SectionLabel>{L.train.uhc_title}</SectionLabel>
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex-1">Producto</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest w-20 text-right">{L.train.holding_time_label}</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest w-16 text-right">Temp</span>
          </div>
          {UHC_STANDARDS.map((s, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 ${i !== 0 ? "border-t border-white/5" : ""}`}
            >
              <div className="flex-1">
                <p className="text-[11px] font-black text-cream">{s.item}</p>
                <p className="text-[10px] text-white/40">{s.cabinet}</p>
              </div>
              <p className="text-sm font-black text-gold w-20 text-right">≤{s.holding_time}m</p>
              <p className="text-[11px] font-bold text-white/60 w-16 text-right">{s.temp}°F</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gold Standard Builds */}
      <div>
        <SectionLabel>{L.train.gold_standard_title}</SectionLabel>
        <div className="flex flex-col gap-2">
          {GOLD_STANDARD_BUILDS.map((build) => (
            <GoldBuildCard key={build.name} build={build} tapLabel={L.train.tap_to_expand} />
          ))}
        </div>
      </div>

      {/* Safety Protocols */}
      <div>
        <SectionLabel>{L.train.safety_title}</SectionLabel>
        <div className="bg-card rounded-2xl overflow-hidden">
          <TrainRow label={L.train.safety_beef} value={SAFETY_PROTOCOLS.INTERNAL_COOK_TEMP_BEEF} />
          <TrainRow label={L.train.safety_poultry} value={SAFETY_PROTOCOLS.INTERNAL_COOK_TEMP_POULTRY} border />
          <TrainRow label={L.train.safety_cooler} value={SAFETY_PROTOCOLS.STORAGE_COOLER} border />
          <TrainRow label={L.train.safety_freezer} value={SAFETY_PROTOCOLS.STORAGE_FREEZER} border />
        </div>
      </div>

      {/* Service Speed */}
      <div>
        <SectionLabel>{L.train.service_title}</SectionLabel>
        <div className="bg-card rounded-2xl overflow-hidden">
          <TrainRow
            label={`🚗 ${L.train.service_dt}`}
            value={`≤ ${dtMins}:${String(dtSecs).padStart(2, "0")} min`}
          />
          <TrainRow
            label={`🏪 ${L.train.service_fc}`}
            value={`≤ ${fcMins}:${String(fcSecs).padStart(2, "0")} min`}
            border
          />
        </div>
      </div>

      {/* Shelf Life */}
      <div>
        <SectionLabel>{L.train.shelf_life_title}</SectionLabel>
        <div className="bg-card rounded-2xl overflow-hidden">
          {SHELF_LIFE_INDEX.map((s, i) => (
            <TrainRow key={i} label={s.item} value={`${s.secondary_life} min · ${s.condition}`} border={i !== 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GoldBuildCard({
  build,
  tapLabel,
}: {
  build: { readonly name: string; readonly sequence: readonly string[] };
  tapLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 active:bg-white/5 transition-colors"
      >
        <div className="text-left">
          <p className="text-sm font-black text-cream">{build.name}</p>
          {!expanded && (
            <p className="text-[10px] text-white/40 mt-0.5">{tapLabel}</p>
          )}
        </div>
        <span className="text-white/40 text-sm ml-3">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/10 pt-3 flex flex-col gap-1.5">
          {build.sequence.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[10px] font-black text-gold/60 w-5 shrink-0 pt-0.5">{i + 1}.</span>
              <span className="text-[11px] text-white/80 leading-snug">{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrainRow({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${border ? "border-t border-white/5" : ""}`}>
      <span className="text-[11px] font-bold text-white/60 flex-1 pr-4">{label}</span>
      <span className="text-[11px] font-black text-cream text-right">{value}</span>
    </div>
  );
}

// ─── Event Detail Sheet ───────────────────────────────────────────────────────

function EventSheet({ event, onClose, onResolve, L }: {
  event: FrictionEvent;
  onClose: () => void;
  onResolve: (id: string) => void;
  L: ReturnType<typeof getLocale>;
}) {
  const diag = event.five_s_diagnosis;
  const ts = new Date(event.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-surface rounded-t-3xl p-5 flex flex-col gap-4 max-h-[80dvh] overflow-y-auto">
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-1" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full uppercase">
              {(L.stations as Record<string, string>)[event.station] ?? event.station}
            </span>
            <span className="text-[10px] text-white/40">{ts}</span>
          </div>
          <div className={`text-[11px] font-black px-2 py-0.5 rounded-full text-white ${SEV_COLORS[event.severity]}`}>
            {L.severity[event.severity]}
          </div>
        </div>

        <p className="text-base font-semibold text-cream leading-snug">{event.description}</p>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-card rounded-xl p-3">
            <p className="text-white/40 font-bold uppercase text-[10px] mb-1">{L.sheet.type_label}</p>
            <p className="font-black text-cream">
              {(L.friction_types as Record<string, string>)[event.event_type] ?? event.event_type}
            </p>
          </div>
          <div className="bg-card rounded-xl p-3">
            <p className="text-white/40 font-bold uppercase text-[10px] mb-1">{L.sheet.impact_label}</p>
            <p className="font-black text-crimson">+{event.service_impact_minutes} min</p>
          </div>
        </div>

        {/* 5S Diagnosis */}
        {diag && (
          <div className="bg-card rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{L.sheet.diag_title}</p>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${URGENCY_STYLE[diag.urgency]}`}>
                {(L.urgency as Record<string, string>)[diag.urgency] ?? diag.urgency}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{FIVE_S_ICON[diag.failing_step]}</span>
              <div>
                <p className="text-sm font-black text-gold">
                  {(L.five_s as Record<string, string>)[diag.failing_step] ?? diag.failing_step}
                </p>
                <p className="text-[10px] text-white/40">{L.sheet.confidence(Math.round(diag.confidence * 100))}</p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">{diag.rationale}</p>
            <div className="border-t border-white/10 pt-3">
              <p className="text-[10px] font-black uppercase text-white/40 mb-1">{L.sheet.action_label}</p>
              <p className="text-xs text-gold leading-relaxed font-semibold">{diag.recommended_action}</p>
            </div>
          </div>
        )}

        {/* PQRG Reference — McMiT training bridge */}
        {(() => {
          const ref = getPQRGReference(event.station, event.event_type);
          if (!ref) return null;
          return (
            <div className="bg-onyx border border-gold/20 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-gold text-base">📖</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-gold/80">{ref.title}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {ref.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-bold text-white/60 shrink-0">{item.label}</span>
                    <span className="text-[11px] font-black text-cream text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {!event.resolved && (
          <button
            onClick={() => onResolve(event.id)}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-transform"
          >
            {L.sheet.resolve_btn}
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white/10 text-white/60 font-bold text-sm"
        >
          {L.sheet.close_btn}
        </button>
      </div>
    </div>
  );
}
