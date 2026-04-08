"use client";

import { useState, useMemo, useRef } from "react";
import type { Lang } from "@/lib/locales";
import { MENU_ITEMS, CATEGORY_META, type MenuItem, type MenuCategory } from "@/lib/menu-items";

// ─── Ingredient visual lookup ──────────────────────────────────────────────────

interface IngredientVisual {
  emoji: string;
  labelEn: string;
  labelEs: string;
}

const STEP_VISUALS: Array<{ pattern: RegExp } & IngredientVisual> = [
  { pattern: /toast.*muffin|english muffin/i,          emoji: "🫓", labelEn: "Toast Muffin", labelEs: "Tostar Muffin" },
  { pattern: /heel|bottom.*bun|bottom.*half/i,          emoji: "🫓", labelEn: "Heel",          labelEs: "Heel" },
  { pattern: /crown|top.*bun|top.*half/i,               emoji: "🍞", labelEn: "Crown",         labelEs: "Crown" },
  { pattern: /biscuit/i,                                emoji: "🥯", labelEn: "Biscuit",       labelEs: "Biscuit" },
  { pattern: /hotcake|pancake/i,                        emoji: "🥞", labelEn: "Hotcake",       labelEs: "Hotcake" },
  { pattern: /hoagie|roll|bun/i,                        emoji: "🥖", labelEn: "Bun",           labelEs: "Pan" },
  { pattern: /canadian bacon/i,                         emoji: "🥓", labelEn: "Can. Bacon",    labelEs: "Bacon" },
  { pattern: /bacon/i,                                  emoji: "🥓", labelEn: "Bacon",         labelEs: "Bacon" },
  { pattern: /sausage patty|sausage/i,                  emoji: "🌭", labelEn: "Sausage",       labelEs: "Salchicha" },
  { pattern: /mcrib|rib patty/i,                        emoji: "🍖", labelEn: "McRib",         labelEs: "McRib" },
  { pattern: /beef patty|beef|patty/i,                  emoji: "🥩", labelEn: "Beef",          labelEs: "Res" },
  { pattern: /fish fillet|filet/i,                      emoji: "🐟", labelEn: "Fish",          labelEs: "Filete" },
  { pattern: /chicken|nugget/i,                         emoji: "🍗", labelEn: "Chicken",       labelEs: "Pollo" },
  { pattern: /round egg|folded egg|scrambled egg|egg/i, emoji: "🥚", labelEn: "Egg",           labelEs: "Huevo" },
  { pattern: /cheddar|american cheese|cheese/i,         emoji: "🧀", labelEn: "Cheese",        labelEs: "Queso" },
  { pattern: /butter/i,                                 emoji: "🧈", labelEn: "Butter",        labelEs: "Mantequilla" },
  { pattern: /whipped cream|whip/i,                     emoji: "🍦", labelEn: "Whip Cream",    labelEs: "Crema" },
  { pattern: /steamed milk|skim milk|milk/i,            emoji: "🥛", labelEn: "Milk",          labelEs: "Leche" },
  { pattern: /pickle/i,                                 emoji: "🥒", labelEn: "Pickles",       labelEs: "Pepinos" },
  { pattern: /onion ring|onion/i,                       emoji: "🧅", labelEn: "Onions",        labelEs: "Cebolla" },
  { pattern: /shredded lettuce|lettuce leaf|lettuce/i,  emoji: "🥬", labelEn: "Lettuce",       labelEs: "Lechuga" },
  { pattern: /tomato/i,                                 emoji: "🍅", labelEn: "Tomato",        labelEs: "Tomate" },
  { pattern: /special sauce|big mac sauce/i,            emoji: "🫙", labelEn: "Sp. Sauce",     labelEs: "Salsa Esp." },
  { pattern: /tartar/i,                                 emoji: "🫙", labelEn: "Tartar",        labelEs: "Tártara" },
  { pattern: /ketchup/i,                                emoji: "🍅", labelEn: "Ketchup",       labelEs: "Ketchup" },
  { pattern: /mustard/i,                                emoji: "💛", labelEn: "Mustard",       labelEs: "Mostaza" },
  { pattern: /mayonnaise|mayo/i,                        emoji: "🤍", labelEn: "Mayo",          labelEs: "Mayo" },
  { pattern: /bbq sauce/i,                              emoji: "🟫", labelEn: "BBQ",           labelEs: "BBQ" },
  { pattern: /maple syrup|syrup/i,                      emoji: "🍯", labelEn: "Syrup",         labelEs: "Jarabe" },
  { pattern: /caramel sauce|caramel drizzle|caramel/i,  emoji: "🍮", labelEn: "Caramel",       labelEs: "Caramelo" },
  { pattern: /chocolate|mocha/i,                        emoji: "🍫", labelEn: "Chocolate",     labelEs: "Chocolate" },
  { pattern: /vanilla syrup|vanilla/i,                  emoji: "🤍", labelEn: "Vanilla",       labelEs: "Vainilla" },
  { pattern: /sauce/i,                                  emoji: "🫙", labelEn: "Sauce",         labelEs: "Salsa" },
  { pattern: /espresso shot|espresso/i,                 emoji: "☕", labelEn: "Espresso",      labelEs: "Espresso" },
  { pattern: /coffee/i,                                 emoji: "☕", labelEn: "Coffee",        labelEs: "Café" },
  { pattern: /ice/i,                                    emoji: "🧊", labelEn: "Ice",           labelEs: "Hielo" },
  { pattern: /foam/i,                                   emoji: "☁️", labelEn: "Foam",          labelEs: "Espuma" },
  { pattern: /cup|fill.*cup|pour/i,                     emoji: "🥤", labelEn: "Cup",           labelEs: "Vaso" },
  { pattern: /oreo|cookie crumble/i,                    emoji: "🍪", labelEn: "Oreo",          labelEs: "Oreo" },
  { pattern: /blend|mix|stir/i,                         emoji: "🌀", labelEn: "Blend",         labelEs: "Mezclar" },
  { pattern: /lid|straw|cover/i,                        emoji: "🔴", labelEn: "Lid",           labelEs: "Tapa" },
  { pattern: /hash brown/i,                             emoji: "🟫", labelEn: "Hash Brown",    labelEs: "Hash Brown" },
  { pattern: /fri|potato|basket/i,                      emoji: "🍟", labelEn: "Fries",         labelEs: "Papas" },
  { pattern: /salt/i,                                   emoji: "🧂", labelEn: "Salt",          labelEs: "Sal" },
  { pattern: /apple|fruit/i,                            emoji: "🍎", labelEn: "Apple",         labelEs: "Manzana" },
  { pattern: /dipping/i,                                emoji: "🫙", labelEn: "Dip Sauce",     labelEs: "Salsa Dip" },
];

function getIngredientVisual(stepText: string): IngredientVisual {
  for (const v of STEP_VISUALS) {
    if (v.pattern.test(stepText)) return { emoji: v.emoji, labelEn: v.labelEn, labelEs: v.labelEs };
  }
  const words = stepText.split(/\s+/).slice(0, 2).join(" ");
  return { emoji: "🍽️", labelEn: words, labelEs: words };
}

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
  visual: IngredientVisual;
}

// ─── Kitchen POV: Drag & Drop Play Screen ─────────────────────────────────────
//
//  Layout (fills full overlay height):
//  ┌──────────────────────────────┐
//  │  header + progress           │  ~54px
//  ├──────────────────────────────┤
//  │  ASSEMBLY TRAY  (flex-1)     │  grows as items placed
//  │  [layer 1 ✓]                 │
//  │  [layer 2 ✓]                 │
//  │  [── ? next ──]  ← drop zone │
//  ├──────────────────────────────┤
//  │  ─── PREP STATION ───        │  ~24px
//  ├──────────────────────────────┤
//  │  [🥩] [🧀] [🥬] [🍅]       │  4-col grid
//  │  [🥒] [🫙] [🧅] [🍞]       │
//  └──────────────────────────────┘

function KitchenPlayScreen({
  item,
  shuffledSteps,
  currentStep,
  tappedCorrect,
  mistakes,
  wrongFlashIdx,
  isEs,
  onBack,
  onDrop,
}: {
  item: MenuItem;
  shuffledSteps: ShuffledStep[];
  currentStep: number;
  tappedCorrect: Set<number>;
  mistakes: number;
  wrongFlashIdx: number | null;
  isEs: boolean;
  onBack: () => void;
  onDrop: (idx: number) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const [isOverDrop, setIsOverDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const trayScrollRef = useRef<HTMLDivElement>(null);

  const totalSteps = item.steps.length;
  const ghostStep = dragIdx !== null ? shuffledSteps[dragIdx] : null;

  // Built layers in correct assembly order
  const builtLayers: Array<{ emoji: string; label: string; step: number }> = [];
  for (let i = 0; i < currentStep; i++) {
    const found = shuffledSteps.find((s) => s.originalIndex === i);
    if (found) {
      builtLayers.push({
        emoji: found.visual.emoji,
        label: isEs ? found.visual.labelEs : found.visual.labelEn,
        step: i + 1,
      });
    }
  }

  function checkOverDrop(x: number, y: number): boolean {
    const rect = dropRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  // Auto-scroll tray to bottom as layers are added
  function scrollTrayBottom() {
    setTimeout(() => {
      trayScrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
    }, 80);
  }

  return (
    <div className={`flex flex-col h-full select-none overflow-hidden${dragIdx !== null ? " touch-none" : ""}`}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 shrink-0">
        <button
          onClick={onBack}
          className="text-[11px] font-bold text-white/40 shrink-0"
        >
          ← {isEs ? "Atrás" : "Back"}
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-lg leading-none shrink-0">{item.emoji}</span>
          <p className="text-sm font-black text-cream truncate">
            {isEs ? item.nameEs : item.name}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {mistakes > 0 && (
            <span className="text-[10px] font-black text-red-400">✗{mistakes}</span>
          )}
          <span className="text-[11px] font-black text-white/30">
            {currentStep}<span className="text-white/15">/{totalSteps}</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 mx-4 mb-2 bg-white/8 rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-gold rounded-full transition-all duration-400"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* ── Assembly Tray (drop zone) ───────────────────────────────── */}
      <div className="flex-1 min-h-0 mx-3 mb-2 flex flex-col overflow-hidden">

        {/* Tray header label */}
        <div className="flex items-center gap-2 mb-1.5 px-1 shrink-0">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
            {isEs ? "🥡 Bandeja de ensamble" : "🥡 Assembly Tray"}
          </span>
          <div className="flex-1 h-px bg-white/6" />
        </div>

        {/* Scrollable built layers + drop slot */}
        <div
          ref={dropRef}
          className={`flex-1 rounded-2xl overflow-hidden flex flex-col transition-all duration-150
            ${isOverDrop
              ? "ring-2 ring-gold/70 shadow-[inset_0_0_30px_rgba(255,188,0,0.08),0_0_20px_rgba(255,188,0,0.15)]"
              : "ring-1 ring-white/6"
            }`}
          style={{ background: "rgba(28,28,30,0.97)" }}
        >
          <div
            ref={trayScrollRef}
            className="flex-1 overflow-y-auto px-3 pt-2 pb-1"
          >
            {/* Empty state */}
            {builtLayers.length === 0 && !isOverDrop && (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
                <span className="text-3xl opacity-20">{item.emoji}</span>
                <p className="text-[10px] text-white/15 italic">
                  {isEs ? "Arrastra el primer ingrediente aquí" : "Drag the first ingredient here"}
                </p>
              </div>
            )}

            {/* Built layer rows */}
            {builtLayers.map((layer, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-white/[0.04] border border-white/[0.06]"
              >
                {/* Step number */}
                <span className="text-[9px] font-black text-white/20 w-4 text-right shrink-0">
                  {layer.step}
                </span>
                {/* Emoji */}
                <span className="text-xl leading-none shrink-0">{layer.emoji}</span>
                {/* Label */}
                <span className="text-xs font-bold text-white/55 flex-1 truncate">
                  {layer.label}
                </span>
                {/* Check */}
                <span className="text-emerald-400/70 text-xs shrink-0">✓</span>
              </div>
            ))}

            {/* Next drop slot */}
            {currentStep < totalSteps && (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl border-2 border-dashed transition-all duration-150
                  ${isOverDrop && ghostStep
                    ? "border-gold/80 bg-gold/10 scale-[1.015]"
                    : "border-white/12 bg-white/[0.02]"
                  }`}
              >
                <span className="text-[9px] font-black text-white/20 w-4 text-right shrink-0">
                  {currentStep + 1}
                </span>
                {isOverDrop && ghostStep ? (
                  <>
                    <span className="text-xl leading-none shrink-0">{ghostStep.visual.emoji}</span>
                    <span className="text-xs font-black text-gold/90 flex-1 truncate">
                      {isEs ? ghostStep.visual.labelEs : ghostStep.visual.labelEn}
                    </span>
                    <span className="text-gold text-xs shrink-0">↓</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl leading-none text-white/10 shrink-0 animate-pulse">?</span>
                    <span className="text-[10px] text-white/15 italic flex-1">
                      {isEs ? "Suelta aquí…" : "Drop here…"}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Prep Counter divider ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 mb-2 shrink-0">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
          {isEs ? "🍳 Estación de Prep" : "🍳 Prep Station"}
        </span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* ── Ingredient tiles (4-col kitchen counter) ─────────────────── */}
      <div className="px-3 pb-4 shrink-0">
        <div className="grid grid-cols-4 gap-2">
          {shuffledSteps.map((step, i) => {
            const isDone = tappedCorrect.has(i);
            const isWrong = wrongFlashIdx === i;
            const isDragging = dragIdx === i;
            const label = isEs ? step.visual.labelEs : step.visual.labelEn;

            /* Already placed — ghost placeholder */
            if (isDone) {
              return (
                <div
                  key={i}
                  className="aspect-square rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <span className="text-emerald-500/30 text-base">✓</span>
                </div>
              );
            }

            return (
              <div
                key={i}
                /* ── Pointer Capture drag ── */
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDragIdx(i);
                  setGhostPos({ x: e.clientX, y: e.clientY });
                  setIsOverDrop(checkOverDrop(e.clientX, e.clientY));
                }}
                onPointerMove={(e) => {
                  if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
                  setGhostPos({ x: e.clientX, y: e.clientY });
                  setIsOverDrop(checkOverDrop(e.clientX, e.clientY));
                }}
                onPointerUp={(e) => {
                  if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
                  if (checkOverDrop(e.clientX, e.clientY)) {
                    onDrop(i);
                    scrollTrayBottom();
                  }
                  setDragIdx(null);
                  setIsOverDrop(false);
                }}
                onPointerCancel={() => {
                  setDragIdx(null);
                  setIsOverDrop(false);
                }}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5
                  cursor-grab touch-none select-none transition-all duration-100
                  ${isDragging
                    ? "opacity-15 scale-90"
                    : isWrong
                    ? "scale-95 ring-1 ring-red-500/60"
                    : "active:scale-95"
                  }
                `}
                style={{
                  background: isDragging
                    ? "rgba(255,255,255,0.03)"
                    : isWrong
                    ? "rgba(220,38,38,0.15)"
                    : "rgba(44,44,46,1)",
                  // Physical "raised" feel via bottom shadow
                  boxShadow: isDragging || isWrong
                    ? "none"
                    : "0 4px 0 rgba(0,0,0,0.45), 0 6px 16px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <span
                  className={`text-3xl leading-none transition-transform duration-100 ${isWrong ? "scale-75" : ""}`}
                >
                  {step.visual.emoji}
                </span>
                <span className="text-[8px] font-bold text-white/40 text-center leading-tight px-1 line-clamp-2 mt-0.5">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Ghost: floating card that follows the finger ──────────────── */}
      {dragIdx !== null && ghostStep && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center justify-center gap-1 rounded-2xl"
          style={{
            left: ghostPos.x - 40,
            top: ghostPos.y - 52,
            width: 80,
            height: 80,
            background: "rgba(44,44,46,0.98)",
            border: `2px solid ${isOverDrop ? "rgba(255,188,0,0.9)" : "rgba(255,255,255,0.15)"}`,
            // Heavy "lifted off counter" shadow
            boxShadow: isOverDrop
              ? "0 16px 40px rgba(0,0,0,0.8), 0 0 24px rgba(255,188,0,0.35)"
              : "0 20px 50px rgba(0,0,0,0.75), 0 8px 20px rgba(0,0,0,0.5)",
            transform: `scale(1.18) rotate(${isOverDrop ? "0deg" : "-4deg"})`,
            transition: "transform 0.1s ease, border-color 0.1s ease, box-shadow 0.1s ease",
          }}
        >
          <span className="text-3xl leading-none">{ghostStep.visual.emoji}</span>
          <span className="text-[8px] font-bold text-white/80 text-center leading-tight px-1.5 line-clamp-2">
            {isEs ? ghostStep.visual.labelEs : ghostStep.visual.labelEn}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

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

  const [shuffledSteps, setShuffledSteps] = useState<ShuffledStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [tappedCorrect, setTappedCorrect] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlashIdx, setWrongFlashIdx] = useState<number | null>(null);
  const [resultStars, setResultStars] = useState<1 | 2 | 3 | null>(null);
  const [resultMistakes, setResultMistakes] = useState(0);

  const t = useMemo(() => isEs ? {
    title: "Practicar Menú",
    chooseCategory: "Elige una categoría",
    back: "← Atrás",
    close: "✕",
    mastered_of: "dominados",
    steps_label: "pasos",
    tryAgain: "Intentar de nuevo",
    nextItem: "Siguiente:",
    backToList: "Ver lista",
    stars3: "¡Perfecto!",
    stars2: "¡Bien hecho!",
    stars1: "¡Sigue practicando!",
  } : {
    title: "Practice Menu",
    chooseCategory: "Choose a category",
    back: "← Back",
    close: "✕",
    mastered_of: "mastered",
    steps_label: "steps",
    tryAgain: "Try again",
    nextItem: "Next:",
    backToList: "Back to list",
    stars3: "Perfect!",
    stars2: "Good job!",
    stars1: "Keep practicing!",
  }, [isEs]);

  const categoryItems = useMemo(
    () => category ? MENU_ITEMS.filter((i) => i.category === category) : [],
    [category]
  );

  function startGame(selected: MenuItem) {
    const shuffled = shuffle(
      selected.steps.map((text, originalIndex) => ({
        text,
        originalIndex,
        visual: getIngredientVisual(text),
      }))
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

  function handleDrop(shuffledIdx: number) {
    if (!item || tappedCorrect.has(shuffledIdx)) return;
    const dropped = shuffledSteps[shuffledIdx];

    if (dropped.originalIndex === currentStep) {
      const newTapped = new Set(tappedCorrect);
      newTapped.add(shuffledIdx);
      setTappedCorrect(newTapped);
      const next = currentStep + 1;
      setCurrentStep(next);

      if (next === item.steps.length) {
        const stars = getStars(mistakes);
        saveMastery(item.id, stars);
        setMastery(loadMastery());
        setResultStars(stars);
        setResultMistakes(mistakes);
        setView("result");
      }
    } else {
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
            className="text-[13px] font-bold text-white/30 w-8 h-8 rounded-full bg-white/8 flex items-center justify-center"
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
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-white/35">
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
          <button onClick={() => setView("categories")} className="text-[11px] font-bold text-white/40 shrink-0">
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
                  <p className="text-[10px] text-white/35 mt-0.5">
                    {menuItem.steps.length} {t.steps_label}
                  </p>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  {[1, 2, 3].map((s) => (
                    <span key={s} className={`text-base leading-none ${stars >= s ? "text-gold" : "text-white/12"}`}>★</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 3. Playing — Kitchen POV drag ─────────────────────────────────────────
  if (view === "playing" && item) {
    return (
      <KitchenPlayScreen
        item={item}
        shuffledSteps={shuffledSteps}
        currentStep={currentStep}
        tappedCorrect={tappedCorrect}
        mistakes={mistakes}
        wrongFlashIdx={wrongFlashIdx}
        isEs={isEs}
        onBack={() => setView("items")}
        onDrop={handleDrop}
      />
    );
  }

  // ── 4. Result ─────────────────────────────────────────────────────────────
  if (view === "result" && item && resultStars !== null) {
    const next = getNextItem();
    const headline = resultStars === 3 ? t.stars3 : resultStars === 2 ? t.stars2 : t.stars1;
    const tip = isEs ? item.tipEs : item.tipEn;
    const assemblyEmojis = item.steps.map((s) => getIngredientVisual(s).emoji);

    return (
      <div className="flex flex-col items-center gap-5 p-6 text-center pb-10">
        <span className="text-6xl mt-2">{item.emoji}</span>
        <div>
          <p className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-2">
            {isEs ? item.nameEs : item.name}
          </p>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`text-4xl leading-none ${resultStars >= s ? "text-gold" : "text-white/12"}`}>★</span>
            ))}
          </div>
          <p className="text-lg font-black text-cream">{headline}</p>
          {resultMistakes > 0 && (
            <p className="text-[11px] text-white/35 mt-1">
              {resultMistakes} {isEs ? "error(es)" : "mistake(s)"}
            </p>
          )}
        </div>

        {/* Correct sequence */}
        <div className="bg-card rounded-2xl px-4 py-3 w-full">
          <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-2 text-left">
            {isEs ? "Secuencia correcta" : "Correct sequence"}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {assemblyEmojis.map((em, i) => (
              <span key={i} className="text-xl leading-none">{em}</span>
            ))}
          </div>
        </div>

        {tip && (
          <div className="bg-card border border-gold/20 rounded-2xl p-4 w-full text-left">
            <p className="text-[10px] font-black text-gold/50 uppercase tracking-widest mb-1">💡 Pro tip</p>
            <p className="text-xs text-white/65 leading-relaxed">{tip}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          <button onClick={() => startGame(item)} className="w-full py-3.5 rounded-2xl bg-white/8 text-white/60 font-black text-sm">
            {t.tryAgain}
          </button>
          {next && (
            <button onClick={() => startGame(next)} className="w-full py-3.5 rounded-2xl bg-gold text-black font-black text-sm">
              {t.nextItem} {next.emoji} {isEs ? next.nameEs : next.name}
            </button>
          )}
          <button onClick={() => setView("items")} className="w-full py-3 rounded-2xl bg-card text-white/40 font-bold text-sm">
            {t.backToList}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
