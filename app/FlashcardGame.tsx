"use client";

import { useState } from "react";
import type { Lang } from "@/lib/locales";
import { FLASHCARD_STATIONS, type FlashcardStation } from "@/lib/training-data";

type CardView = "stations" | "studying" | "result";

export default function FlashcardGame({
  lang,
  onClose,
  onCoach,
}: {
  lang: Lang;
  onClose: () => void;
  onCoach?: (correct: number, total: number) => void;
}) {
  const isEs = lang === "es";

  const [view, setView] = useState<CardView>("stations");
  const [station, setStation] = useState<FlashcardStation | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const t = isEs ? {
    title: "Flashcards de Estándares",
    subtitle: "Estándares y temperaturas operacionales",
    choose: "Elige una estación para estudiar:",
    cards: "tarjetas",
    flip: "Toca para revelar el estándar",
    know: "✓ Lo domino",
    review: "↺ Necesito repasar",
    back: "← Atrás",
    close: "✕ Cerrar",
    complete: "Estación Completada",
    correct_label: "Dominadas",
    wrong_label: "A repasar",
    accuracy: "Precisión",
    try_again: "Repetir estación",
    coach_btn: "Consultar Coach IA",
    next_station: "Siguiente estación",
    back_stations: "Ver estaciones",
  } : {
    title: "Standard Flashcards",
    subtitle: "Operational standards and temperatures",
    choose: "Choose a station to study:",
    cards: "cards",
    flip: "Tap to reveal the standard",
    know: "✓ Got it",
    review: "↺ Need review",
    back: "← Back",
    close: "✕ Close",
    complete: "Station Complete",
    correct_label: "Mastered",
    wrong_label: "To review",
    accuracy: "Accuracy",
    try_again: "Repeat station",
    coach_btn: "Consult AI Coach",
    next_station: "Next station",
    back_stations: "Back to stations",
  };

  function startStation(s: FlashcardStation) {
    setStation(s);
    setIndex(0);
    setFlipped(false);
    setScore({ correct: 0, wrong: 0 });
    setView("studying");
  }

  function handleAnswer(correct: boolean) {
    const newScore = { ...score, [correct ? "correct" : "wrong"]: score[correct ? "correct" : "wrong"] + 1 };
    setScore(newScore);
    setFlipped(false);
    setTimeout(() => {
      if (station && index + 1 >= station.cards.length) {
        setView("result");
        if (onCoach) onCoach(newScore.correct, station.cards.length);
      } else {
        setIndex((i) => i + 1);
      }
    }, 200);
  }

  function getNextStation(): FlashcardStation | null {
    if (!station) return null;
    const idx = FLASHCARD_STATIONS.findIndex((s) => s.id === station.id);
    return FLASHCARD_STATIONS[(idx + 1) % FLASHCARD_STATIONS.length] ?? null;
  }

  // ── Station list ──────────────────────────────────────────────────────────
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

        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.choose}</p>
        <div className="flex flex-col gap-2">
          {FLASHCARD_STATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => startStation(s)}
              className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <span className="text-3xl leading-none shrink-0">{s.emoji}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-black text-cream">{isEs ? s.nameEs : s.nameEn}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{s.cards.length} {t.cards}</p>
              </div>
              <span className="text-white/30 text-lg">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Studying ──────────────────────────────────────────────────────────────
  if (view === "studying" && station) {
    const card = station.cards[index];
    const progress = index / station.cards.length;

    return (
      <div className="flex flex-col gap-3 p-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView("stations")} className="text-[11px] font-bold text-white/50 shrink-0">
            {t.back}
          </button>
          <p className="text-sm font-black text-gold flex-1">
            {station.emoji} {isEs ? station.nameEs : station.nameEn}
          </p>
          <span className="text-[11px] font-black text-white/50 shrink-0">
            {index + 1}/{station.cards.length}
          </span>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Score badges */}
        <div className="flex gap-2">
          <span className="text-[10px] font-black text-emerald-400">✓ {score.correct}</span>
          <span className="text-[10px] font-black text-red-400">✗ {score.wrong}</span>
        </div>

        {/* Card */}
        <button
          onClick={() => setFlipped((f) => !f)}
          className="bg-card rounded-2xl p-5 flex flex-col gap-3 min-h-[200px] justify-center active:scale-[0.98] transition-transform text-left"
        >
          <span className="text-[9px] font-black text-gold/60 uppercase tracking-widest">
            {card.type}
          </span>

          {!flipped ? (
            <>
              <p className="text-base font-black text-cream leading-snug">{card.question}</p>
              <p className="text-[10px] text-white/30 mt-auto italic">{t.flip}</p>
            </>
          ) : (
            <>
              <p className="text-[11px] text-white/50 leading-snug">{card.question}</p>
              <div className="border-t border-gold/20 pt-3">
                <p className="text-lg font-black text-gold leading-snug">{card.answer}</p>
              </div>
            </>
          )}
        </button>

        {/* Answer buttons */}
        {flipped && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-3.5 rounded-2xl bg-red-600/20 text-red-400 font-black text-sm"
            >
              {t.review}
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-3.5 rounded-2xl bg-emerald-600/20 text-emerald-400 font-black text-sm"
            >
              {t.know}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (view === "result" && station) {
    const total = station.cards.length;
    const accuracy = total > 0 ? Math.round((score.correct / total) * 100) : 0;
    const next = getNextStation();

    return (
      <div className="flex flex-col items-center gap-5 p-6 text-center pb-10">
        <span className="text-5xl mt-2">{station.emoji}</span>
        <div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t.complete}</p>
          <p className="text-2xl font-black text-cream">{accuracy}%</p>
          <p className="text-[11px] text-gold/60 mt-0.5">{t.accuracy}</p>
        </div>

        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xl font-black text-emerald-400">{score.correct}</p>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{t.correct_label}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-red-400">{score.wrong}</p>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{t.wrong_label}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          {onCoach && (
            <button
              onClick={() => onCoach(score.correct, total)}
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
          {next && (
            <button
              onClick={() => startStation(next)}
              className="w-full py-3 rounded-2xl bg-card text-white/50 font-bold text-sm"
            >
              {t.next_station}: {next.emoji} {isEs ? next.nameEs : next.nameEn}
            </button>
          )}
          <button
            onClick={() => setView("stations")}
            className="w-full py-3 rounded-2xl bg-card text-white/50 font-bold text-sm"
          >
            {t.back_stations}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
