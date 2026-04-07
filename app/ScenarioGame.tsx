"use client";

import { useState } from "react";
import type { Lang } from "@/lib/locales";
import { SCENARIO_STATIONS, type ScenarioStation, type Scenario } from "@/lib/training-data";

type ScenView = "stations" | "scenarios" | "playing" | "result";

export default function ScenarioGame({
  lang,
  onClose,
  onCoach,
}: {
  lang: Lang;
  onClose: () => void;
  onCoach?: (correct: number, total: number, details: string) => void;
}) {
  const isEs = lang === "es";

  const [view, setView] = useState<ScenView>("stations");
  const [station, setStation] = useState<ScenarioStation | null>(null);
  const [scenIdx, setScenIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [wrongHistory, setWrongHistory] = useState<string[]>([]);

  const t = isEs ? {
    title: "Sandbox Shift Manager",
    subtitle: "Simulador de crisis operacionales",
    choose_zone: "Elige una zona de supervisión:",
    scenarios: "escenarios",
    back: "← Atrás",
    close: "✕ Cerrar",
    metric: "Métrica en peligro",
    question: "¿Cuál es tu respuesta operativa?",
    correct: "✓ Operación Salvada",
    wrong: "✗ Oportunidad de Aprendizaje",
    next: "Siguiente escenario →",
    finish: "Finalizar sandbox",
    session_complete: "Sesión Completada",
    accuracy: "Tasa de acierto",
    try_again: "Repetir zona",
    choose_zone_btn: "Elegir otra zona",
    coach_btn: "Consultar Coach IA",
    back_zones: "Ver zonas",
  } : {
    title: "Shift Manager Sandbox",
    subtitle: "Operational crisis simulator",
    choose_zone: "Choose a supervision zone:",
    scenarios: "scenarios",
    back: "← Back",
    close: "✕ Close",
    metric: "Metric at risk",
    question: "What is your operational response?",
    correct: "✓ Operation Saved",
    wrong: "✗ Learning Opportunity",
    next: "Next scenario →",
    finish: "Finish sandbox",
    session_complete: "Session Complete",
    accuracy: "Accuracy rate",
    try_again: "Repeat zone",
    choose_zone_btn: "Choose another zone",
    coach_btn: "Consult AI Coach",
    back_zones: "Back to zones",
  };

  function startStation(s: ScenarioStation) {
    setStation(s);
    setScenIdx(0);
    setChosen(null);
    setScore({ correct: 0, wrong: 0 });
    setWrongHistory([]);
    setView("playing");
  }

  function handleChoose(idx: number) {
    if (chosen !== null || !station) return;
    setChosen(idx);
    const scenario = station.scenarios[scenIdx];
    const isCorrect = scenario.options[idx].isCorrect;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      wrong: score.wrong + (isCorrect ? 0 : 1),
    };
    setScore(newScore);
    if (!isCorrect) {
      setWrongHistory((h) => [...h, scenario.title]);
    }
  }

  function handleNext() {
    if (!station) return;
    if (scenIdx + 1 >= station.scenarios.length) {
      setView("result");
      if (onCoach) {
        const total = station.scenarios.length;
        const details = wrongHistory.length > 0 ? `Wrong scenarios: ${wrongHistory.join(", ")}` : "";
        onCoach(score.correct, total, details);
      }
    } else {
      setScenIdx((i) => i + 1);
      setChosen(null);
    }
  }

  // ── Zone list ─────────────────────────────────────────────────────────────
  if (view === "stations") {
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

        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.choose_zone}</p>
        <div className="flex flex-col gap-2">
          {SCENARIO_STATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => startStation(s)}
              className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <span className="text-3xl leading-none shrink-0">{s.emoji}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-black text-cream">{isEs ? s.nameEs : s.nameEn}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{s.scenarios.length} {t.scenarios}</p>
              </div>
              <span className="text-white/30 text-lg">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  if (view === "playing" && station) {
    const scenario: Scenario = station.scenarios[scenIdx];
    const selectedOption = chosen !== null ? scenario.options[chosen] : null;
    const isCorrect = selectedOption?.isCorrect ?? false;
    const progress = scenIdx / station.scenarios.length;

    return (
      <div className="flex flex-col gap-3 p-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView("stations")} className="text-[11px] font-bold text-white/50 shrink-0">
            {t.back}
          </button>
          <p className="text-sm font-black text-gold flex-1 truncate">
            {station.emoji} {isEs ? station.nameEs : station.nameEn}
          </p>
          <span className="text-[11px] font-black text-white/50 shrink-0">
            {scenIdx + 1}/{station.scenarios.length}
          </span>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Metric badge */}
        {scenario.metric && (
          <div className="bg-red-950/40 border border-red-500/20 rounded-xl px-3 py-2">
            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-0.5">{t.metric}</p>
            <p className="text-[11px] text-red-300 font-bold">{scenario.metric}</p>
          </div>
        )}

        {/* Scenario card */}
        <div className="bg-card rounded-2xl p-4">
          <p className="text-[10px] font-black text-gold/60 uppercase tracking-widest mb-1">{scenario.title}</p>
          <p className="text-[12px] text-white/80 leading-relaxed">{scenario.context}</p>
        </div>

        {/* Options */}
        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t.question}</p>
        <div className="flex flex-col gap-2">
          {scenario.options.map((opt, i) => {
            const wasChosen = chosen === i;
            const showResult = chosen !== null;
            let cls = "bg-card text-cream";
            if (showResult && wasChosen) {
              cls = opt.isCorrect
                ? "bg-emerald-900/40 border border-emerald-500/40 text-emerald-300"
                : "bg-red-900/40 border border-red-500/40 text-red-300";
            } else if (showResult && opt.isCorrect) {
              cls = "bg-emerald-900/20 border border-emerald-500/20 text-emerald-400/60";
            }
            return (
              <button
                key={i}
                onClick={() => handleChoose(i)}
                disabled={chosen !== null}
                className={`w-full text-left px-4 py-3.5 rounded-2xl text-[12px] font-semibold leading-snug transition-all duration-150 ${cls} ${chosen === null ? "active:scale-[0.98]" : ""}`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>

        {/* Consequence */}
        {selectedOption && (
          <div className={`rounded-2xl px-4 py-3 ${isCorrect ? "bg-emerald-900/20 border border-emerald-500/20" : "bg-red-900/20 border border-red-500/20"}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
              {isCorrect ? t.correct : t.wrong}
            </p>
            <p className="text-[11px] text-white/70 leading-relaxed">{selectedOption.consequence}</p>
          </div>
        )}

        {/* Next button */}
        {chosen !== null && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-gold text-black font-black text-sm mt-1"
          >
            {scenIdx + 1 < station.scenarios.length ? t.next : t.finish}
          </button>
        )}
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (view === "result" && station) {
    const total = station.scenarios.length;
    const accuracy = total > 0 ? Math.round((score.correct / total) * 100) : 0;

    return (
      <div className="flex flex-col items-center gap-5 p-6 text-center pb-10">
        <span className="text-5xl mt-2">{station.emoji}</span>
        <div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t.session_complete}</p>
          <p className="text-3xl font-black text-cream">{accuracy}%</p>
          <p className="text-[11px] text-gold/60 mt-0.5">{t.accuracy}</p>
        </div>

        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xl font-black text-emerald-400">{score.correct}</p>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">OK</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-red-400">{score.wrong}</p>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Error</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          {onCoach && (
            <button
              onClick={() => {
                const details = wrongHistory.length > 0 ? `Wrong scenarios: ${wrongHistory.join(", ")}` : "";
                onCoach(score.correct, total, details);
              }}
              className="w-full py-3.5 rounded-2xl bg-gold text-black font-black text-sm"
            >
              🧠 {t.coach_btn}
            </button>
          )}
          <button
            onClick={() => startStation(station)}
            className="w-full py-3.5 rounded-2xl bg-white/10 text-white/70 font-black text-sm"
          >
            {t.try_again}
          </button>
          <button
            onClick={() => setView("stations")}
            className="w-full py-3 rounded-2xl bg-card text-white/50 font-bold text-sm"
          >
            {t.back_zones}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
