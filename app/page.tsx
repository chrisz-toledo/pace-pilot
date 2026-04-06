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
import { loadEvents, appendEvent, updateEvent, markResolved, seedIfEmpty, clearEvents } from "@/lib/storage";
import { ruleBasedDiagnosis, computeReport } from "@/lib/offline";

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = "events" | "log" | "report";

const STATIONS: Station[] = ["DT_WINDOW", "KITCHEN", "LOBBY", "FRONT_COUNTER", "GRILL", "UHC", "BOC"];
const TYPES: { value: FrictionType; label: string }[] = [
  { value: "WAIT_TIME", label: "Tiempo de espera" },
  { value: "STOCK_OUT", label: "Falta de stock" },
  { value: "DISORDER", label: "Desorden" },
  { value: "EQUIPMENT_FAILURE", label: "Falla de equipo" },
  { value: "PROCEDURE_DEVIATION", label: "Desviación SOP" },
];
const ROLES: { value: UserRole; label: string }[] = [
  { value: "MIT_DIRECTOR", label: "MIT Director" },
  { value: "GM_FACILITY", label: "General Manager" },
  { value: "AREA_SUPERVISOR", label: "Area Supervisor" },
  { value: "CREW_OPERATOR", label: "Crew Operator" },
];

const SEV_COLORS = ["", "bg-emerald-500", "bg-cyan-500", "bg-yellow-500", "bg-orange-500", "bg-red-600"];
const SEV_LABELS = ["", "Bajo", "Menor", "Medio", "Alto", "Crítico"];
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
const FIVE_S_LABEL: Record<FiveSStep, string> = {
  Seiri: "Seiri — Clasificar",
  Seiton: "Seiton — Ordenar",
  Seiso: "Seiso — Limpiar",
  Seiketsu: "Seiketsu — Estandarizar",
  Shitsuke: "Shitsuke — Sostener",
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<Tab>("events");
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

  const refresh = useCallback(() => setEvents(loadEvents()), []);

  useEffect(() => {
    seedIfEmpty();
    refresh();
  }, [refresh]);

  // Auto-generate report when switching to report tab
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

    // Diagnose — try server, fall back to offline
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
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

  // ─── Screens ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[100dvh] bg-onyx overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-gold font-black text-lg tracking-tight">PACE-Pilot</span>
          <span className="text-[10px] font-bold text-gold/50 uppercase tracking-widest">v0.1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white/40 uppercase">{events.length} eventos</span>
          <button
            onClick={handleSeed}
            className="text-[10px] font-bold text-gold/60 uppercase tracking-widest px-2 py-1 rounded border border-gold/20 active:bg-gold/10"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 scrollable">
        {tab === "events" && (
          <EventsTab events={events} onSelect={setSelected} />
        )}
        {tab === "log" && (
          <LogTab
            form={form}
            setForm={setForm}
            onSubmit={handleLog}
            isAnalyzing={isAnalyzing}
            success={logSuccess}
          />
        )}
        {tab === "report" && report && (
          <ReportTab report={report} />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="shrink-0 grid grid-cols-3 bg-surface border-t border-white/10 pb-safe">
        <NavBtn active={tab === "events"} onClick={() => setTab("events")} icon="📋" label="Eventos" />
        <NavBtn active={tab === "log"} onClick={() => setTab("log")} icon="+" label="Registrar" gold />
        <NavBtn active={tab === "report"} onClick={() => setTab("report")} icon="📊" label="Reporte" />
      </nav>

      {/* Event Detail Sheet */}
      {selected && (
        <EventSheet event={selected} onClose={() => setSelected(null)} onResolve={handleResolve} />
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
        gold
          ? "text-gold font-black"
          : active
          ? "text-gold"
          : "text-white/40"
      }`}
    >
      <span className={`text-xl leading-none ${gold ? "text-2xl" : ""}`}>{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab({ events, onSelect }: { events: FrictionEvent[]; onSelect: (e: FrictionEvent) => void }) {
  const unresolved = events.filter((e) => !e.resolved);
  const resolved = events.filter((e) => e.resolved);

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/40 p-8">
        <span className="text-5xl">📋</span>
        <p className="text-center text-sm font-bold uppercase tracking-wide">
          Sin eventos registrados.<br />Usa + para registrar el primero.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Total" value={events.length} />
        <StatCard label="Sin resolver" value={unresolved.length} accent />
        <StatCard
          label="Impacto DT"
          value={`+${events.filter((e) => e.station === "DT_WINDOW").reduce((s, e) => s + e.service_impact_minutes, 0).toFixed(1)}m`}
          accent
        />
      </div>

      {/* Unresolved */}
      {unresolved.length > 0 && (
        <div>
          <SectionLabel>Sin resolver</SectionLabel>
          <div className="flex flex-col gap-2">
            {unresolved.map((ev) => (
              <EventCard key={ev.id} event={ev} onTap={() => onSelect(ev)} />
            ))}
          </div>
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <SectionLabel dim>Resueltos</SectionLabel>
          <div className="flex flex-col gap-2 opacity-50">
            {resolved.map((ev) => (
              <EventCard key={ev.id} event={ev} onTap={() => onSelect(ev)} />
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

function EventCard({ event, onTap }: { event: FrictionEvent; onTap: () => void }) {
  const diag = event.five_s_diagnosis;
  return (
    <button
      onClick={onTap}
      className="bg-card rounded-2xl p-4 text-left active:scale-[0.98] transition-transform w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black bg-white/10 text-white/70 px-2 py-0.5 rounded-full uppercase tracking-widest">
            {event.station}
          </span>
          <span className="text-[10px] font-bold text-white/40 uppercase">{event.event_type.replace("_", " ")}</span>
        </div>
        <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${SEV_COLORS[event.severity]}`} />
      </div>
      <p className="text-sm font-semibold text-cream leading-snug line-clamp-2">{event.description}</p>
      {diag && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] font-black text-gold">
            {FIVE_S_ICON[diag.failing_step]} {diag.failing_step}
          </span>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${URGENCY_STYLE[diag.urgency]}`}>
            {diag.urgency.replace("_", " ")}
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

function LogTab({ form, setForm, onSubmit, isAnalyzing, success }: {
  form: LogFormState;
  setForm: React.Dispatch<React.SetStateAction<LogFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  isAnalyzing: boolean;
  success: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-4">
      <h2 className="text-base font-black uppercase tracking-widest text-gold">Registrar Evento</h2>

      {/* Station */}
      <Field label="Estación">
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
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </Field>

      {/* Type */}
      <Field label="Tipo de fricción">
        <div className="flex flex-col gap-1.5">
          {TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, event_type: value }))}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-colors ${
                form.event_type === value ? "bg-gold text-black" : "bg-card text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>

      {/* Description */}
      <Field label="Descripción">
        <textarea
          required
          minLength={5}
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Describe el problema en detalle..."
          className="w-full bg-card rounded-xl px-3 py-2.5 text-sm text-cream placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-gold/50"
        />
      </Field>

      {/* Severity */}
      <Field label={`Severidad — ${SEV_LABELS[form.severity]} (${form.severity}/5)`}>
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

      {/* Impact */}
      <Field label={`Impacto en servicio — ${form.service_impact_minutes} minutos`}>
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

      {/* Role */}
      <Field label="Reportado por">
        <div className="grid grid-cols-2 gap-1.5">
          {ROLES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, reporter_role: value }))}
              className={`py-2 px-3 rounded-xl text-[11px] font-bold transition-colors ${
                form.reporter_role === value ? "bg-gold text-black" : "bg-card text-white/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>

      {/* Submit */}
      <button
        type="submit"
        disabled={isAnalyzing || !form.description.trim()}
        className="w-full py-4 rounded-2xl bg-gold text-black font-black text-base uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform mt-2"
      >
        {isAnalyzing ? "Analizando..." : success ? "✓ Registrado" : "Registrar + Diagnosticar"}
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

function ReportTab({ report }: { report: PACEReport }) {
  const date = new Date(report.generated_at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  const maxCount = Math.max(...Object.values(report.five_s_breakdown), 1);

  return (
    <div className="p-3 flex flex-col gap-3 pb-6">
      {/* Header card */}
      <div className="bg-card rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Para: {report.total_events > 0 ? "Michael" : "—"}</p>
            <p className="text-lg font-black text-gold mt-0.5">PACE Report</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40">{date}</p>
            <p className="text-[10px] text-white/40">Peak: {report.peak_window}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <MiniStat label="Eventos" value={report.total_events} />
          <MiniStat label="Sin resolver" value={report.unresolved_events} accent />
          <MiniStat label="DT Impact" value={`+${report.dt_impact_minutes}m`} accent />
        </div>
      </div>

      {/* Executive summary */}
      <div className="bg-card rounded-2xl p-4">
        <SLabel>Resumen</SLabel>
        <p className="text-sm text-white/80 leading-relaxed">{report.executive_summary}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-white/40 uppercase font-bold">Falla primaria:</span>
          <span className="text-sm font-black text-gold">
            {FIVE_S_ICON[report.primary_5s_failure]} {report.primary_5s_failure}
          </span>
        </div>
      </div>

      {/* Bottlenecks */}
      {report.bottlenecks.length > 0 && (
        <div className="bg-card rounded-2xl p-4">
          <SLabel>Cuellos de botella</SLabel>
          <div className="flex flex-col gap-2">
            {report.bottlenecks.map((b) => (
              <div key={b.station} className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black text-white/80 uppercase">{b.station}</span>
                  <span className="text-[10px] text-white/40 ml-2">{b.event_count} evento{b.event_count !== 1 ? "s" : ""} · sev {b.avg_severity}</span>
                </div>
                <span className="text-sm font-black text-crimson">+{b.total_impact_minutes}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5S Breakdown */}
      <div className="bg-card rounded-2xl p-4">
        <SLabel>Diagnóstico 5S</SLabel>
        <div className="flex flex-col gap-2.5">
          {(Object.entries(report.five_s_breakdown) as [FiveSStep, number][]).map(([step, count]) => {
            const isPrimary = step === report.primary_5s_failure;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={step}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-black ${isPrimary ? "text-gold" : "text-white/60"}`}>
                    {FIVE_S_ICON[step]} {FIVE_S_LABEL[step]}
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
        <SLabel>Recomendaciones</SLabel>
        <div className="flex flex-col gap-3">
          {report.recommendations.map((rec, i) => {
            const urgencyKeys: string[] = ["IMMEDIATE", "NEXT_SHIFT", "SCHEDULED"];
            const urgency = urgencyKeys[i] ?? "SCHEDULED";
            return (
              <div key={i} className="flex gap-3">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0 h-fit mt-0.5 ${URGENCY_STYLE[urgency]}`}>
                  {urgency.replace("_", " ")}
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

// ─── Event Detail Sheet ───────────────────────────────────────────────────────

function EventSheet({ event, onClose, onResolve }: {
  event: FrictionEvent;
  onClose: () => void;
  onResolve: (id: string) => void;
}) {
  const diag = event.five_s_diagnosis;
  const ts = new Date(event.timestamp).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-surface rounded-t-3xl p-5 flex flex-col gap-4 max-h-[80dvh] overflow-y-auto">
        {/* Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-1" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full uppercase">{event.station}</span>
            <span className="text-[10px] text-white/40">{ts}</span>
          </div>
          <div className={`text-[11px] font-black px-2 py-0.5 rounded-full text-white ${SEV_COLORS[event.severity]}`}>
            {SEV_LABELS[event.severity]}
          </div>
        </div>

        <p className="text-base font-semibold text-cream leading-snug">{event.description}</p>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-card rounded-xl p-3">
            <p className="text-white/40 font-bold uppercase text-[10px] mb-1">Tipo</p>
            <p className="font-black text-cream">{event.event_type.replace(/_/g, " ")}</p>
          </div>
          <div className="bg-card rounded-xl p-3">
            <p className="text-white/40 font-bold uppercase text-[10px] mb-1">Impacto</p>
            <p className="font-black text-crimson">+{event.service_impact_minutes} min</p>
          </div>
        </div>

        {/* 5S Diagnosis */}
        {diag && (
          <div className="bg-card rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Diagnóstico 5S</p>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${URGENCY_STYLE[diag.urgency]}`}>
                {diag.urgency.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{FIVE_S_ICON[diag.failing_step]}</span>
              <div>
                <p className="text-sm font-black text-gold">{FIVE_S_LABEL[diag.failing_step]}</p>
                <p className="text-[10px] text-white/40">{Math.round(diag.confidence * 100)}% confianza</p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">{diag.rationale}</p>
            <div className="border-t border-white/10 pt-3">
              <p className="text-[10px] font-black uppercase text-white/40 mb-1">Acción recomendada</p>
              <p className="text-xs text-gold leading-relaxed font-semibold">{diag.recommended_action}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {!event.resolved && (
          <button
            onClick={() => onResolve(event.id)}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-transform"
          >
            ✓ Marcar como resuelto
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white/10 text-white/60 font-bold text-sm"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
