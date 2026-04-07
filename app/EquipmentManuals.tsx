"use client";

import { useState } from "react";
import type { Lang } from "@/lib/locales";
import { EQUIPMENT_MANUALS, type EquipmentManual, type EquipmentIssue, type EquipmentRef } from "@/lib/equipment-manuals";

type ManualView = "equipment" | "issues" | "detail" | "manual";

const SEVERITY_STYLE: Record<string, string> = {
  low:      "bg-emerald-900/30 text-emerald-400 border-emerald-500/20",
  medium:   "bg-yellow-900/30 text-yellow-400 border-yellow-500/20",
  high:     "bg-orange-900/30 text-orange-400 border-orange-500/20",
  critical: "bg-red-900/30 text-red-400 border-red-500/30",
};

const SEVERITY_LABEL_ES: Record<string, string> = {
  low: "Bajo", medium: "Medio", high: "Alto", critical: "CRÍTICO",
};
const SEVERITY_LABEL_EN: Record<string, string> = {
  low: "Low", medium: "Medium", high: "High", critical: "CRITICAL",
};

export default function EquipmentManuals({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose: () => void;
}) {
  const isEs = lang === "es";

  const [view, setView] = useState<ManualView>("equipment");
  const [equipment, setEquipment] = useState<EquipmentManual | null>(null);
  const [issue, setIssue] = useState<EquipmentIssue | null>(null);

  const t = isEs ? {
    title: "Manuales de Equipos",
    subtitle: "Diagnóstico, soluciones y referencia operacional",
    choose: "Elige un equipo:",
    issues: "problemas documentados",
    back: "← Atrás",
    close: "✕ Cerrar",
    symptom: "Síntoma",
    cause: "Causa probable",
    steps: "Pasos de solución",
    escalate: "¿Cuándo escalar?",
    severity: "Severidad",
    model: "Modelo",
    read_manual: "📖 Leer Manual",
    view_issues: "🔧 Ver Problemas",
    overview: "Descripción del Equipo",
    specs: "Especificaciones",
    daily: "Mantenimiento Diario",
    preventive: "Mantenimiento Preventivo",
    warnings: "⚠️ Advertencias de Seguridad",
    no_manual: "Manual detallado próximamente.",
    at_time: "Horario",
    task: "Tarea",
  } : {
    title: "Equipment Manuals",
    subtitle: "Troubleshooting, solutions and operational reference",
    choose: "Choose equipment:",
    issues: "documented issues",
    back: "← Back",
    close: "✕ Close",
    symptom: "Symptom",
    cause: "Probable cause",
    steps: "Solution steps",
    escalate: "When to escalate?",
    severity: "Severity",
    model: "Model",
    read_manual: "📖 Read Manual",
    view_issues: "🔧 View Issues",
    overview: "Equipment Overview",
    specs: "Specifications",
    daily: "Daily Maintenance",
    preventive: "Preventive Maintenance",
    warnings: "⚠️ Safety Warnings",
    no_manual: "Detailed manual coming soon.",
    at_time: "Time",
    task: "Task",
  };

  // ── Equipment list ────────────────────────────────────────────────────────
  if (view === "equipment") {
    return (
      <div className="flex flex-col gap-4 p-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-gold uppercase tracking-widest">{t.title}</p>
            <p className="text-xs text-white/40 mt-0.5">{t.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-[11px] font-bold text-white/40 px-2 py-1 rounded-lg bg-white/10">
            {t.close}
          </button>
        </div>

        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.choose}</p>
        <div className="flex flex-col gap-2">
          {EQUIPMENT_MANUALS.map((eq) => (
            <div
              key={eq.id}
              className="bg-card rounded-2xl p-4 flex items-center gap-3"
            >
              <span className="text-3xl leading-none shrink-0">{eq.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-cream">{isEs ? eq.nameEs : eq.nameEn}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{eq.issues.length} {t.issues}</p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {eq.ref && (
                  <button
                    onClick={() => { setEquipment(eq); setView("manual"); }}
                    className="text-[10px] font-black px-2.5 py-1.5 rounded-xl bg-gold/20 text-gold active:scale-95 transition-transform"
                  >
                    {t.read_manual}
                  </button>
                )}
                <button
                  onClick={() => { setEquipment(eq); setView("issues"); }}
                  className="text-[10px] font-black px-2.5 py-1.5 rounded-xl bg-white/10 text-white/60 active:scale-95 transition-transform"
                >
                  {t.view_issues}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Manual view ───────────────────────────────────────────────────────────
  if (view === "manual" && equipment) {
    const ref = equipment.ref;
    if (!ref) return (
      <div className="p-4">
        <button onClick={() => setView("equipment")} className="text-[11px] font-bold text-white/50">{t.back}</button>
        <p className="text-sm text-white/40 mt-4">{t.no_manual}</p>
      </div>
    );

    return (
      <div className="flex flex-col gap-4 p-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView("equipment")} className="text-[11px] font-bold text-white/50 shrink-0">{t.back}</button>
          <p className="text-sm font-black text-gold flex items-center gap-2 flex-1">
            <span>{equipment.emoji}</span>
            <span>{isEs ? equipment.nameEs : equipment.nameEn}</span>
          </p>
        </div>

        {/* Quick access: issues button */}
        <button
          onClick={() => setView("issues")}
          className="w-full py-2.5 rounded-xl bg-white/10 text-[11px] font-black text-white/60 uppercase tracking-widest active:scale-[0.98] transition-transform"
        >
          🔧 {t.view_issues} ({equipment.issues.length})
        </button>

        {/* Overview */}
        <div className="bg-card rounded-2xl p-4">
          <p className="text-[9px] font-black text-gold/60 uppercase tracking-widest mb-2">{t.overview}</p>
          <p className="text-[12px] text-white/75 leading-relaxed">
            {isEs ? ref.overviewEs : ref.overviewEn}
          </p>
          {equipment.model && (
            <p className="text-[10px] text-white/30 italic mt-2">📋 {t.model}: {equipment.model}</p>
          )}
        </div>

        {/* Specs */}
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-[9px] font-black text-gold/60 uppercase tracking-widest">
              📐 {isEs ? ref.specs.titleEs : ref.specs.titleEn}
            </p>
          </div>
          {ref.specs.items.map((item, i) => (
            <div key={i} className={`flex items-start justify-between px-4 py-3 gap-3 ${i > 0 ? "border-t border-white/5" : ""}`}>
              <span className="text-[11px] text-white/50 flex-1 leading-snug">{isEs ? item.labelEs : item.labelEn}</span>
              <span className="text-[11px] font-black text-cream text-right shrink-0">{isEs ? item.valueEs : item.valueEn}</span>
            </div>
          ))}
        </div>

        {/* Daily Maintenance */}
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-[9px] font-black text-emerald-400/70 uppercase tracking-widest">
              🗓 {t.daily}
            </p>
          </div>
          {ref.dailyMaintenance.map((task, i) => (
            <div key={i} className={`px-4 py-3 flex flex-col gap-1 ${i > 0 ? "border-t border-white/5" : ""}`}>
              <span className="text-[9px] font-black text-gold/60 uppercase tracking-wide">
                {isEs ? task.timeEs : task.timeEn}
              </span>
              <p className="text-[11px] text-white/70 leading-relaxed">
                {isEs ? task.taskEs : task.taskEn}
              </p>
            </div>
          ))}
        </div>

        {/* Preventive Maintenance */}
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-[9px] font-black text-blue-400/70 uppercase tracking-widest">
              🔩 {t.preventive}
            </p>
          </div>
          {ref.preventiveMaintenance.items.map((item, i) => (
            <div key={i} className={`flex items-start justify-between px-4 py-3 gap-3 ${i > 0 ? "border-t border-white/5" : ""}`}>
              <span className="text-[11px] text-white/50 flex-1 leading-snug">{isEs ? item.labelEs : item.labelEn}</span>
              <span className="text-[11px] font-black text-cream text-right shrink-0 max-w-[45%]">{isEs ? item.valueEs : item.valueEn}</span>
            </div>
          ))}
        </div>

        {/* Safety Warnings */}
        <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-4">
          <p className="text-[9px] font-black text-red-400/80 uppercase tracking-widest mb-3">{t.warnings}</p>
          <div className="flex flex-col gap-2.5">
            {ref.safetyWarnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-400 text-sm shrink-0 mt-0.5">⚠</span>
                <p className="text-[11px] text-red-200/70 leading-relaxed">{isEs ? w.es : w.en}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Issue list ────────────────────────────────────────────────────────────
  if (view === "issues" && equipment) {
    return (
      <div className="flex flex-col gap-3 p-4 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("equipment")} className="text-[11px] font-bold text-white/50 shrink-0">{t.back}</button>
          <p className="text-sm font-black text-gold flex items-center gap-2 flex-1">
            <span>{equipment.emoji}</span>
            <span>{isEs ? equipment.nameEs : equipment.nameEn}</span>
          </p>
        </div>

        {equipment.model && (
          <p className="text-[10px] text-white/30 italic">{t.model}: {equipment.model}</p>
        )}

        {equipment.ref && (
          <button
            onClick={() => setView("manual")}
            className="w-full py-2.5 rounded-xl bg-gold/20 text-gold text-[11px] font-black uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            {t.read_manual}
          </button>
        )}

        <div className="flex flex-col gap-2">
          {equipment.issues.map((iss) => {
            const sevLabel = isEs ? SEVERITY_LABEL_ES[iss.severity] : SEVERITY_LABEL_EN[iss.severity];
            return (
              <button
                key={iss.id}
                onClick={() => { setIssue(iss); setView("detail"); }}
                className="bg-card rounded-2xl p-4 flex items-start gap-3 active:scale-[0.98] transition-transform text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-black text-cream leading-snug">
                    {isEs ? iss.symptom : iss.symptomEn}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${SEVERITY_STYLE[iss.severity]}`}>
                      {sevLabel}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {(isEs ? iss.steps : iss.stepsEn).length} {isEs ? "pasos" : "steps"}
                    </span>
                  </div>
                </div>
                <span className="text-white/30 text-lg shrink-0 mt-0.5">›</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Issue detail ──────────────────────────────────────────────────────────
  if (view === "detail" && equipment && issue) {
    const steps = isEs ? issue.steps : issue.stepsEn;
    const sevLabel = isEs ? SEVERITY_LABEL_ES[issue.severity] : SEVERITY_LABEL_EN[issue.severity];

    return (
      <div className="flex flex-col gap-4 p-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView("issues")} className="text-[11px] font-bold text-white/50 shrink-0">{t.back}</button>
          <p className="text-sm font-black text-gold flex-1 truncate">
            {equipment.emoji} {isEs ? equipment.nameEs : equipment.nameEn}
          </p>
        </div>

        {/* Severity */}
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border self-start ${SEVERITY_STYLE[issue.severity]}`}>
          {t.severity}: {sevLabel}
        </span>

        {/* Symptom */}
        <div className="bg-card rounded-2xl p-4">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{t.symptom}</p>
          <p className="text-[13px] font-bold text-cream leading-snug">
            {isEs ? issue.symptom : issue.symptomEn}
          </p>
        </div>

        {/* Cause */}
        <div className="bg-card rounded-2xl p-4">
          <p className="text-[9px] font-black text-yellow-400/60 uppercase tracking-widest mb-1">{t.cause}</p>
          <p className="text-[12px] text-white/70 leading-snug">
            {isEs ? issue.cause : issue.causeEn}
          </p>
        </div>

        {/* Steps */}
        <div className="bg-card rounded-2xl p-4">
          <p className="text-[9px] font-black text-gold/60 uppercase tracking-widest mb-3">{t.steps}</p>
          <div className="flex flex-col gap-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-gold">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-black text-cream leading-snug">{s.step}</p>
                  <p className="text-[10px] text-white/50 leading-snug mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation */}
        <div className={`rounded-2xl p-4 border ${issue.severity === "critical" ? "bg-red-950/40 border-red-500/30" : "bg-orange-950/30 border-orange-500/20"}`}>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${issue.severity === "critical" ? "text-red-400" : "text-orange-400"}`}>
            🚨 {t.escalate}
          </p>
          <p className="text-[11px] text-white/70 leading-relaxed">
            {isEs ? issue.escalate : issue.escalateEn}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
