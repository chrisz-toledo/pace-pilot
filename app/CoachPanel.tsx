"use client";

import { useState, useEffect } from "react";
import type { Lang } from "@/lib/locales";
import type { CoachResponse } from "./api/coach/route";

interface CoachPanelProps {
  lang: Lang;
  module: string;
  role: string;
  correct: number;
  total: number;
  details?: string;
  onClose: () => void;
}

export default function CoachPanel({ lang, module, role, correct, total, details, onClose }: CoachPanelProps) {
  const isEs = lang === "es";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CoachResponse | null>(null);
  const [error, setError] = useState(false);

  const t = isEs ? {
    title: "Coach IA",
    subtitle: "Retroalimentación conductual personalizada",
    loading: "Analizando tu desempeño...",
    error: "No se pudo conectar con el Coach IA.",
    observation: "Patrón Observado",
    strength: "Fortaleza Identificada",
    growth: "Área de Crecimiento",
    technique: "Técnica Recomendada",
    action: "Acción Concreta — Próximo Turno",
    mantra: "Tu Mantra",
    close: "Cerrar",
  } : {
    title: "AI Coach",
    subtitle: "Personalized behavioral feedback",
    loading: "Analyzing your performance...",
    error: "Could not connect to AI Coach.",
    observation: "Observed Pattern",
    strength: "Identified Strength",
    growth: "Growth Area",
    technique: "Recommended Technique",
    action: "Concrete Action — Next Shift",
    mantra: "Your Mantra",
    close: "Close",
  };

  // Fetch on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ module, role, correct, total, details, lang }),
        });
        if (!res.ok) throw new Error("HTTP error");
        const json: CoachResponse = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-onyx flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-8 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-black text-gold uppercase tracking-widest">🧠 {t.title}</p>
              <p className="text-xs text-white/40 mt-0.5">{t.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[11px] font-bold text-white/40 px-2 py-1 rounded-lg bg-white/10"
            >
              {t.close}
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              <p className="text-[11px] text-white/40">{t.loading}</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-card rounded-2xl p-4 text-center">
              <p className="text-sm text-white/50">{t.error}</p>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Headline */}
              <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 text-center">
                <p className="text-lg font-black text-gold">{data.headline}</p>
              </div>

              {/* Observation */}
              <CoachCard label={t.observation} icon="🔍" color="blue">
                {data.observation}
              </CoachCard>

              {/* Strength */}
              <CoachCard label={t.strength} icon="💪" color="green">
                {data.strength}
              </CoachCard>

              {/* Growth */}
              <CoachCard label={t.growth} icon="📈" color="orange">
                {data.growth_area}
              </CoachCard>

              {/* Technique */}
              <CoachCard label={t.technique} icon="🧪" color="purple">
                {data.technique}
              </CoachCard>

              {/* Action */}
              <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4">
                <p className="text-[9px] font-black text-gold/60 uppercase tracking-widest mb-2">⚡ {t.action}</p>
                <p className="text-[13px] font-bold text-cream leading-snug">{data.action}</p>
              </div>

              {/* Mantra */}
              <div className="rounded-2xl p-5 text-center bg-gradient-to-b from-white/5 to-transparent border border-white/10">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">{t.mantra}</p>
                <p className="text-base font-black text-white italic leading-snug">"{data.mantra}"</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const CARD_COLORS = {
  blue:   { bg: "bg-blue-950/20",    border: "border-blue-500/20",    text: "text-blue-400/70" },
  green:  { bg: "bg-emerald-950/20", border: "border-emerald-500/20", text: "text-emerald-400/70" },
  orange: { bg: "bg-orange-950/20",  border: "border-orange-500/20",  text: "text-orange-400/70" },
  purple: { bg: "bg-purple-950/20",  border: "border-purple-500/20",  text: "text-purple-400/70" },
};

function CoachCard({
  label,
  icon,
  color,
  children,
}: {
  label: string;
  icon: string;
  color: "blue" | "green" | "orange" | "purple";
  children: string;
}) {
  const { bg, border, text } = CARD_COLORS[color];
  return (
    <div className={`${bg} ${border} border rounded-2xl p-4`}>
      <p className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${text}`}>
        {icon} {label}
      </p>
      <p className="text-[12px] text-white/70 leading-relaxed">{children}</p>
    </div>
  );
}
