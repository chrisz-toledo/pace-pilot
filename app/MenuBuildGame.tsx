"use client";

import { useState, useMemo, useCallback } from "react";
import type { Lang } from "@/lib/locales";
import { MENU_ITEMS, CATEGORY_META, type MenuItem, type MenuCategory } from "@/lib/menu-items";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getStars(mistakes: number): 1 | 2 | 3 {
  if (mistakes === 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

function loadMastery(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("pace_mastery") ?? "{}"); }
  catch { return {}; }
}

function saveMastery(id: string, stars: number) {
  try {
    const m = loadMastery();
    if (!m[id] || m[id] < stars) m[id] = stars;
    localStorage.setItem("pace_mastery", JSON.stringify(m));
  } catch { /* noop */ }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GameView = "categories" | "items" | "playing" | "result";

interface ShuffledStep {
  text: string;
  originalIndex: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MenuBuildGame({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose: () => void;
}) {
  const isEs = lang === "es";

  const [mastery, setMastery] = useState<Record<string, number>>(loadMastery);
  const [view, setView] = useState<GameView>("categories");
  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [item, setItem] = useState<MenuItem | null>(null);

  // Game state
  const [shuffledSteps, setShuffledSteps] = useState<ShuffledStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [tappedCorrect, setTappedCorrect] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlashIdx, setWrongFlashIdx] = useState<number | null>(null);
  const [resultStars, setResultStars] = useState<1 | 2 | 3 | null>(null);
  const [resultMistakes, setResultMistakes] = useState(0);

  // ── Labels ────────────────────────────────────────────────────────────────
  const t = useMemo(() => isEs ? {
    title: "Practicar Menú",
    chooseCategory: "Elige una categoría para practicar",
    chooseItem: "Elige un producto",
    back: "← Atrás",
    close: "✕ Cerrar",
    mastered_of: "dominados",
    steps_label: "pasos",
    buildInstruction: "Toca los pasos en el orden correcto:",
    builtSoFar: "Armado hasta ahora",
    mistakesLabel: "error(es)",
    step: "Paso",
    perfect: "¡Perfecto! Sin errores",
    great: "¡Bien! Pocos errores",
    practice: "Sigue practicando",
    tryAgain: "Intentar de nuevo",
    nextItem: "Siguiente:",
    backToList: "Ver lista",
    stars3: "¡Maestro!",
    stars2: "¡Bueno!",
    stars1: "¡Practica más!",
  } : {
    title: "Practice Menu",
    chooseCategory: "Choose a category to practice",
    chooseItem: "Choose an item",
    back: "← Back",
    close: "✕ Close",
    mastered_of: "mastered",
    steps_label: "steps",
    buildInstruction: "Tap the steps in the correct order:",
    builtSoFar: "Built so far",
    mistakesLabel: "mistake(s)",
    step: "Step",
    perfect: "Perfect! No mistakes",
    great: "Great! Few mistakes",
    practice: "Keep practicing",
    tryAgain: "Try again",
    nextItem: "Next:",
    backToList: "Back to list",
    stars3: "Mastered!",
    stars2: "Good!",
    stars1: "Keep Practicing!",
  }, [isEs]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const categoryItems = useMemo(
    () => category ? MENU_ITEMS.filter((i) => i.category === category) : [],
    [category]
  );

  const getItemSteps = useCallback(
    (i: MenuItem) => isEs ? i.stepsEs : i.steps,
    [isEs]
  );

  // ── Game actions ──────────────────────────────────────────────────────────

  function startGame(selected: MenuItem) {
    const steps = getItemSteps(selected);
    const shuffled = shuffle(
      steps.map((text, originalIndex) => ({ text, originalIndex }))
    );
    setItem(selected);
    setShuffledSteps(shuffled);
    setCurrentStep(0);
    setTappedCorrect(new Set());
    setMistakes(0);
    setWrongFlashIdx(null);
    setResultStars(null);
    setView("playing");
  }

  function handleTap(shuffledIdx: number) {
    if (!item || tappedCorrect.has(shuffledIdx)) return;
    const tapped = shuffledSteps[shuffledIdx];
    const steps = getItemSteps(item);

    if (tapped.originalIndex === currentStep) {
      // ✓ Correct step
      const newTapped = new Set(tappedCorrect);
      newTapped.add(shuffledIdx);
      setTappedCorrect(newTapped);
      const next = currentStep + 1;
      setCurrentStep(next);

      if (next === steps.length) {
        const stars = getStars(mistakes);
        saveMastery(item.id, stars);
        setMastery(loadMastery());
        setResultStars(stars);
        setResultMistakes(mistakes);
        setView("result");
      }
    } else {
      // ✗ Wrong step
      setMistakes((m) => m + 1);
      setWrongFlashIdx(shuffledIdx);
      setTimeout(() => setWrongFlashIdx(null), 500);
    }
  }

  function getNextItem(): MenuItem | null {
    if (!category || !item) return null;
    const items = MENU_ITEMS.filter((i) => i.category === category);
    const idx = items.findIndex((i) => i.id === item.id);
    return items[(idx + 1) % items.length] ?? null;
  }

  // ── SCREENS ───────────────────────────────────────────────────────────────

  // ── 1. Category Selection ─────────────────────────────────────────────────
  if (view === "categories") {
    const cats = Object.entries(CATEGORY_META) as [MenuCategory, typeof CATEGORY_META[MenuCategory]][];
    return (
      <div className="flex flex-col gap-4 p-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-gold uppercase tracking-widest">{t.title}</p>
            <p className="text-xs text-white/40 mt-0.5">{t.chooseCategory}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] font-bold text-white/40 px-2 py-1 rounded-lg bg-white/10"
          >
            {t.close}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {cats.map(([key, meta]) => {
            const items = MENU_ITEMS.filter((i) => i.category === key);
            const masteredCount = items.filter((i) => mastery[i.id] === 3).length;
            const pct = Math.round((masteredCount / items.length) * 100);
            return (
              <button
                key={key}
                onClick={() => { setCategory(key); setView("items"); }}
                className="bg-card rounded-2xl p-4 flex flex-col gap-2 active:scale-[0.97] transition-transform text-left"
              >
                <span className="text-4xl leading-none">{meta.emoji}</span>
                <p className="text-sm font-black text-cream">
                  {isEs ? meta.labelEs : meta.labelEn}
                </p>
                <div className="flex flex-col gap-1">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/40">
                    {masteredCount}/{items.length} {t.mastered_of}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 2. Item List ──────────────────────────────────────────────────────────
  if (view === "items" && category) {
    const meta = CATEGORY_META[category];
    return (
      <div className="flex flex-col gap-3 p-4 pb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("categories")}
            className="text-[11px] font-bold text-white/50 shrink-0"
          >
            {t.back}
          </button>
          <p className="text-base font-black text-gold flex items-center gap-2">
            <span>{meta.emoji}</span>
            <span>{isEs ? meta.labelEs : meta.labelEn}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {categoryItems.map((menuItem) => {
            const stars = mastery[menuItem.id] ?? 0;
            const steps = getItemSteps(menuItem);
            return (
              <button
                key={menuItem.id}
                onClick={() => startGame(menuItem)}
                className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <span className="text-2xl leading-none shrink-0">{menuItem.emoji}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-black text-cream truncate">
                    {isEs ? menuItem.nameEs : menuItem.name}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {steps.length} {t.steps_label}
                  </p>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`text-base leading-none ${stars >= s ? "text-gold" : "text-white/15"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 3. Playing ────────────────────────────────────────────────────────────
  if (view === "playing" && item) {
    const steps = getItemSteps(item);

    // Reconstruct built steps in correct order from tappedCorrect
    const builtSteps: string[] = [];
    for (let i = 0; i < currentStep; i++) {
      const found = shuffledSteps.find((s) => s.originalIndex === i);
      builtSteps.push(found?.text ?? steps[i]);
    }

    return (
      <div className="flex flex-col gap-3 p-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("items")}
            className="text-[11px] font-bold text-white/50 shrink-0"
          >
            {t.back}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-cream truncate">
              {item.emoji} {isEs ? item.nameEs : item.name}
            </p>
          </div>
          <span className="text-[11px] font-black text-white/50 shrink-0">
            {currentStep}/{steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Mistakes */}
        {mistakes > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
              ✗ {mistakes} {t.mistakesLabel}
            </span>
          </div>
        )}

        {/* Built so far */}
        {builtSteps.length > 0 && (
          <div className="bg-card rounded-2xl p-3">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
              {t.builtSoFar}
            </p>
            <div className="flex flex-col gap-1.5">
              {builtSteps.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] font-black text-gold/70 shrink-0 w-5 pt-0.5">
                    {i + 1}.
                  </span>
                  <span className="text-[11px] text-white/70 leading-snug flex-1">{s}</span>
                  <span className="text-emerald-400 text-xs shrink-0">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step picker */}
        <div>
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
            {t.buildInstruction}
          </p>
          <div className="flex flex-col gap-2">
            {shuffledSteps.map((step, i) => {
              const isDone = tappedCorrect.has(i);
              const isWrong = wrongFlashIdx === i;
              return (
                <button
                  key={i}
                  onClick={() => !isDone && handleTap(i)}
                  disabled={isDone}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl text-[12px] font-semibold leading-snug transition-all duration-150
                    ${isDone
                      ? "bg-emerald-900/30 text-emerald-500/60 line-through cursor-default"
                      : isWrong
                      ? "bg-red-600/20 text-red-400 scale-[0.98] border border-red-500/30"
                      : "bg-card text-cream active:scale-[0.97] active:bg-white/10"
                    }`}
                >
                  {step.text}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── 4. Result ─────────────────────────────────────────────────────────────
  if (view === "result" && item && resultStars !== null) {
    const next = getNextItem();
    const headline = resultStars === 3 ? t.stars3 : resultStars === 2 ? t.stars2 : t.stars1;
    const tip = isEs ? item.tipEs : item.tipEn;

    return (
      <div className="flex flex-col items-center gap-5 p-6 text-center pb-10">
        {/* Emoji + stars */}
        <span className="text-6xl mt-2">{item.emoji}</span>
        <div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
            {isEs ? item.nameEs : item.name}
          </p>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`text-4xl leading-none transition-all ${
                  resultStars >= s ? "text-gold" : "text-white/15"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-lg font-black text-cream">{headline}</p>
          {resultMistakes > 0 && (
            <p className="text-[11px] text-white/40 mt-1">
              {resultMistakes} {t.mistakesLabel}
            </p>
          )}
        </div>

        {/* Pro tip */}
        {tip && (
          <div className="bg-card border border-gold/20 rounded-2xl p-4 w-full text-left">
            <p className="text-[10px] font-black text-gold/60 uppercase tracking-widest mb-1">
              💡 Pro tip
            </p>
            <p className="text-xs text-white/70 leading-relaxed">{tip}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => startGame(item)}
            className="w-full py-3.5 rounded-2xl bg-white/10 text-white/70 font-black text-sm"
          >
            {t.tryAgain}
          </button>
          {next && (
            <button
              onClick={() => startGame(next)}
              className="w-full py-3.5 rounded-2xl bg-gold text-black font-black text-sm"
            >
              {t.nextItem} {next.emoji} {isEs ? next.nameEs : next.name}
            </button>
          )}
          <button
            onClick={() => setView("items")}
            className="w-full py-3 rounded-2xl bg-card text-white/50 font-bold text-sm"
          >
            {t.backToList}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
