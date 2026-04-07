"use client";

import { useState } from "react";
import type { Lang } from "@/lib/locales";
import { EQUIPMENT_MANUALS, type EquipmentManual, type EquipmentIssue } from "@/lib/equipment-manuals";

type ManualView = "equipment" | "issues" | "detail";

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
    subtitle: "Diagnóstico y soluciones de problemas",
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
  } : {
    title: "Equipment Manuals",
    subtitle: "Troubleshooting and solutions",
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
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_MANUALS.map((eq) => (
            <button
              key={eq.id}
              onClick={() => { setEquipment(eq); setView("issues"); }}
              className="bg-card rounded-2xl p-4 flex flex-col gap-2 active:scale-[0.97] transition-transform text-left"
            >
              <span className="text-3xl leading-none">{eq.emoji}</span>
              <p className="text-[12px] font-black text-cream leading-snug">{isEs ? eq.nameEs : eq.nameEn}</p>
              <p className="text-[10px] text-white/40">{eq.issues.length} {t.issues}</p>
            </button>
          ))}
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
