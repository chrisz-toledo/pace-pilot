"use client";

import { useState, useMemo } from "react";
import type { Lang } from "@/lib/locales";
import { MENU_ITEMS, CATEGORY_META, type MenuItem, type MenuCategory } from "@/lib/menu-items";

// ─── Ingredient visual lookup ──────────────────────────────────────────────────

interface IngredientVisual {
  emoji: string;
  labelEn: string;
  labelEs: string;
}

const STEP_VISUALS: Array<{ pattern: RegExp } & IngredientVisual> = [
  // Breads & Buns
  { pattern: /toast.*muffin|english muffin/i,          emoji: "🫓", labelEn: "Toast Muffin", labelEs: "Tostar" },
  { pattern: /heel|bottom.*bun|bottom.*half/i,          emoji: "🫓", labelEn: "Heel",          labelEs: "Heel" },
  { pattern: /crown|top.*bun|top.*half/i,               emoji: "🍞", labelEn: "Crown",         labelEs: "Crown" },
  { pattern: /biscuit/i,                                emoji: "🥯", labelEn: "Biscuit",       labelEs: "Biscuit" },
  { pattern: /hotcake|pancake/i,                        emoji: "🥞", labelEn: "Hotcake",       labelEs: "Hotcake" },
  { pattern: /hoagie|roll|bun/i,                        emoji: "🥖", labelEn: "Bun",           labelEs: "Pan" },
  // Proteins
  { pattern: /canadian bacon/i,                         emoji: "🥓", labelEn: "Can. Bacon",    labelEs: "Bacon" },
  { pattern: /bacon/i,                                  emoji: "🥓", labelEn: "Bacon",         labelEs: "Bacon" },
  { pattern: /sausage patty|sausage/i,                  emoji: "🌭", labelEn: "Sausage",       labelEs: "Salchicha" },
  { pattern: /mcrib|rib patty/i,                        emoji: "🍖", labelEn: "McRib",         labelEs: "McRib" },
  { pattern: /beef patty|beef|patty/i,                  emoji: "🥩", labelEn: "Beef",          labelEs: "Res" },
  { pattern: /fish fillet|filet/i,                      emoji: "🐟", labelEn: "Fish Fillet",   labelEs: "Filete" },
  { pattern: /chicken|nugget/i,                         emoji: "🍗", labelEn: "Chicken",       labelEs: "Pollo" },
  { pattern: /round egg|folded egg|scrambled egg|egg/i, emoji: "🥚", labelEn: "Egg",           labelEs: "Huevo" },
  // Dairy
  { pattern: /cheddar|american cheese|cheese/i,         emoji: "🧀", labelEn: "Cheese",        labelEs: "Queso" },
  { pattern: /butter/i,                                 emoji: "🧈", labelEn: "Butter",        labelEs: "Mantequilla" },
  { pattern: /whipped cream|whip/i,                     emoji: "🍦", labelEn: "Whip Cream",    labelEs: "Crema" },
  { pattern: /steamed milk|skim milk|milk/i,            emoji: "🥛", labelEn: "Milk",          labelEs: "Leche" },
  // Vegetables
  { pattern: /pickle/i,                                 emoji: "🥒", labelEn: "Pickles",       labelEs: "Pepinos" },
  { pattern: /onion ring|onion/i,                       emoji: "🧅", labelEn: "Onions",        labelEs: "Cebolla" },
  { pattern: /shredded lettuce|lettuce leaf|lettuce/i,  emoji: "🥬", labelEn: "Lettuce",       labelEs: "Lechuga" },
  { pattern: /tomato/i,                                 emoji: "🍅", labelEn: "Tomato",        labelEs: "Tomate" },
  // Sauces
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
  // Drinks
  { pattern: /espresso shot|espresso/i,                 emoji: "☕", labelEn: "Espresso",      labelEs: "Espresso" },
  { pattern: /coffee/i,                                 emoji: "☕", labelEn: "Coffee",        labelEs: "Café" },
  { pattern: /ice/i,                                    emoji: "🧊", labelEn: "Ice",           labelEs: "Hielo" },
  { pattern: /foam/i,                                   emoji: "☁️", labelEn: "Foam",          labelEs: "Espuma" },
  { pattern: /cup|fill.*cup|pour/i,                     emoji: "🥤", labelEn: "Cup",           labelEs: "Vaso" },
  // Toppings
  { pattern: /oreo|cookie crumble/i,                    emoji: "🍪", labelEn: "Oreo",          labelEs: "Oreo" },
  { pattern: /blend|mix|stir/i,                         emoji: "🌀", labelEn: "Blend",         labelEs: "Mezclar" },
  { pattern: /lid|straw|cover/i,                        emoji: "🔴", labelEn: "Lid",           labelEs: "Tapa" },
  // Sides
  { pattern: /hash brown/i,                             emoji: "🟫", labelEn: "Hash Brown",    labelEs: "Hash Brown" },
  { pattern: /fri|potato|basket/i,                      emoji: "🍟", labelEn: "Fries",         labelEs: "Papas" },
  { pattern: /salt/i,                                   emoji: "🧂", labelEn: "Salt",          labelEs: "Sal" },
  { pattern: /apple|fruit/i,                            emoji: "🍎", labelEn: "Apple",         labelEs: "Manzana" },
  { pattern: /dipping/i,                                emoji: "🫙", labelEn: "Dip Sauce",     labelEs: "Salsa" },
];

function getIngredientVisual(stepText: string): IngredientVisual {
  for (const v of STEP_VISUALS) {
    if (v.pattern.test(stepText)) {
      return { emoji: v.emoji, labelEn: v.labelEn, labelEs: v.labelEs };
    }
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
    buildInstruction: "¿Cuál va a continuación?",
    builtSoFar: "Armado",
    tapFirst: "Empieza a armar",
    mistakesLabel: "error(es)",
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
    buildInstruction: "What goes next?",
    builtSoFar: "Built",
    tapFirst: "Start building",
    mistakesLabel: "mistake(s)",
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

  // ── Game actions ──────────────────────────────────────────────────────────

  function startGame(selected: MenuItem) {
    // Always use EN steps for visual matching; display ES text is only for tips
    const stepsEn = selected.steps;
    const shuffled = shuffle(
      stepsEn.map((text, originalIndex) => ({
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

  function handleTap(shuffledIdx: number) {
    if (!item || tappedCorrect.has(shuffledIdx)) return;
    const tapped = shuffledSteps[shuffledIdx];

    if (tapped.originalIndex === currentStep) {
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
                    {menuItem.steps.length} {t.steps_label}
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

  // ── 3. Playing — Visual Grid ──────────────────────────────────────────────
  if (view === "playing" && item) {
    const totalSteps = item.steps.length;

    // Built so far: collect emojis in correct order
    const builtEmojis: string[] = [];
    for (let i = 0; i < currentStep; i++) {
      const found = shuffledSteps.find((s) => s.originalIndex === i);
      builtEmojis.push(found?.visual.emoji ?? "🍽️");
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
            {currentStep}/{totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Mistakes */}
        {mistakes > 0 && (
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
            ✗ {mistakes} {t.mistakesLabel}
          </p>
        )}

        {/* Visual assembly strip */}
        <div className="bg-card rounded-2xl px-3 py-2.5 min-h-[52px] flex flex-col gap-1">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
            {t.builtSoFar}
          </p>
          {builtEmojis.length === 0 ? (
            <p className="text-[10px] text-white/20 italic">{t.tapFirst}</p>
          ) : (
            <div className="flex flex-wrap gap-1 items-center">
              {builtEmojis.map((em, i) => (
                <span key={i} className="text-xl leading-none">{em}</span>
              ))}
              {currentStep < totalSteps && (
                <span className="text-base text-white/20 animate-pulse ml-1">?</span>
              )}
            </div>
          )}
        </div>

        {/* Instruction */}
        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest text-center">
          {t.buildInstruction}
        </p>

        {/* Visual ingredient grid */}
        <div className="grid grid-cols-3 gap-2">
          {shuffledSteps.map((step, i) => {
            const isDone = tappedCorrect.has(i);
            const isWrong = wrongFlashIdx === i;
            const label = isEs ? step.visual.labelEs : step.visual.labelEn;
            return (
              <button
                key={i}
                onClick={() => !isDone && handleTap(i)}
                disabled={isDone}
                aria-label={label}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl p-3 aspect-square transition-all duration-150
                  ${isDone
                    ? "bg-emerald-900/20 opacity-25 cursor-default scale-95"
                    : isWrong
                    ? "bg-red-600/20 border border-red-500/40 scale-95"
                    : "bg-card active:scale-95 active:bg-white/10"
                  }`}
              >
                {isDone ? (
                  <span className="text-3xl leading-none text-emerald-500">✓</span>
                ) : (
                  <>
                    <span className={`text-4xl leading-none transition-transform ${isWrong ? "scale-90" : ""}`}>
                      {step.visual.emoji}
                    </span>
                    <span className="text-[9px] font-bold text-white/50 text-center leading-tight max-w-full line-clamp-2 px-0.5">
                      {label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 4. Result ─────────────────────────────────────────────────────────────
  if (view === "result" && item && resultStars !== null) {
    const next = getNextItem();
    const headline = resultStars === 3 ? t.stars3 : resultStars === 2 ? t.stars2 : t.stars1;
    const tip = isEs ? item.tipEs : item.tipEn;

    // Show ingredient strip in correct assembly order
    const assemblyEmojis = item.steps.map((s) => getIngredientVisual(s).emoji);

    return (
      <div className="flex flex-col items-center gap-5 p-6 text-center pb-10">
        {/* Item emoji + stars */}
        <span className="text-6xl mt-2">{item.emoji}</span>
        <div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
            {isEs ? item.nameEs : item.name}
          </p>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`text-4xl leading-none transition-all ${resultStars >= s ? "text-gold" : "text-white/15"}`}
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

        {/* Correct assembly sequence — visual */}
        <div className="bg-card rounded-2xl px-4 py-3 w-full">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 text-left">
            {isEs ? "Secuencia correcta" : "Correct sequence"}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {assemblyEmojis.map((em, i) => (
              <span key={i} className="text-xl leading-none">{em}</span>
            ))}
          </div>
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
