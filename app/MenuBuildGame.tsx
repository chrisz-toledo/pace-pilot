"use client";
/**
 * MenuBuildGame.tsx — Kitchen POV Edition
 * Reescrito para PACE-Pilot con:
 * - Vista POV de la estación de ensamble de McDonald's
 * - Clasificación de ingredientes por estación (GRILL / UHC / TOASTER / CONDIMENT / PREP / FRYER)
 * - Sistema click-to-place (más rápido y táctil que drag-drop)
 * - Sandwich stack visual que crece desde abajo (cross-section real)
 * - Modo timer opcional para presión real de cocina
 * - Arquitectura expandible: cada sección es un componente independiente
 */

import { useState, useRef, useCallback, useMemo } from "react";
import { MENU_CATEGORIES, MENU_ITEMS } from "@/lib/menu-items";
import type { Lang } from "@/lib/locales";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type GameView = "categories" | "items" | "game" | "results";

type KitchenStation =
  | "GRILL"
  | "UHC"
  | "TOASTER"
  | "CONDIMENT"
  | "PREP"
  | "FRYER"
  | "BLENDER"
  | "MCCAFE";

type FoodLayer =
  | "heel-bun"
  | "crown-bun"
  | "club-bun"
  | "beef-patty"
  | "cheese"
  | "lettuce"
  | "tomato"
  | "onion"
  | "pickle"
  | "sauce"
  | "ketchup"
  | "mustard"
  | "mayo"
  | "egg"
  | "bacon"
  | "crispy-chicken"
  | "fish-fillet"
  | "hash-brown"
  | "nugget"
  | "wrap"
  | "generic";

// ─── Paso bilingual ───────────────────────────────────────────────────────────

interface BilingualStep {
  en: string;
  es: string;
}

// ─── Metadatos de Estación ────────────────────────────────────────────────────

const STATION_META: Record<
  KitchenStation,
  { emoji: string; labelEn: string; labelEs: string; color: string }
> = {
  GRILL:     { emoji: "🔥", labelEn: "Grill",    labelEs: "Parrilla",    color: "#f97316" },
  UHC:       { emoji: "📦", labelEn: "UHC",      labelEs: "UHC",         color: "#eab308" },
  TOASTER:   { emoji: "🟫", labelEn: "Toaster",  labelEs: "Tostador",    color: "#92400e" },
  CONDIMENT: { emoji: "🫙", labelEn: "Sauces",   labelEs: "Salsas",      color: "#dc2626" },
  PREP:      { emoji: "🥬", labelEn: "Prep",     labelEs: "Prep",        color: "#16a34a" },
  FRYER:     { emoji: "⚡", labelEn: "Fryer",    labelEs: "Freidora",    color: "#fbbf24" },
  BLENDER:   { emoji: "🌀", labelEn: "Blender",  labelEs: "Licuadora",   color: "#818cf8" },
  MCCAFE:    { emoji: "☕", labelEn: "McCafé",   labelEs: "McCafé",      color: "#a16207" },
};

// ─── Clasificador de Estación por Texto de Paso ───────────────────────────────

function classifyStation(stepEn: string): KitchenStation {
  const t = stepEn.toLowerCase();
  if (/\bpatty\b|beef patty|pork|grilled chicken fillet|grilled|parrilla/.test(t)) return "GRILL";
  if (/\bbun\b|toast|mcgriddle|english muffin/.test(t)) return "TOASTER";
  if (/sauce|ketchup|mustard|mayo|aioli|ranch|bbq|dressing|condiment|salsa|special sauce/.test(t)) return "CONDIMENT";
  if (/\bcheese\b|\begg\b|queso|huevo/.test(t)) return "UHC";
  if (/lettuce|tomato|onion|pickle|shredded|lechuga|tomate|cebolla|pepinillo|jalapeño/.test(t)) return "PREP";
  if (/fries|hash brown|nugget|crispy|tempura|filet-o|fish|freidora|fry/.test(t)) return "FRYER";
  if (/espresso|milk|frappe|mcflurry|shake|blend|steam|mccafé|coffee/.test(t)) return "MCCAFE";
  return "PREP";
}

// ─── Detector de Tipo de Capa Visual ─────────────────────────────────────────

function detectFoodLayer(stepEn: string): FoodLayer {
  const t = stepEn.toLowerCase();
  if (/heel|base bun|bottom bun/.test(t)) return "heel-bun";
  if (/crown|top bun/.test(t)) return "crown-bun";
  if (/club bun|middle bun/.test(t)) return "club-bun";
  if (/beef patty|patty/.test(t)) return "beef-patty";
  if (/\bcheese\b/.test(t)) return "cheese";
  if (/lettuce|lechuga/.test(t)) return "lettuce";
  if (/tomato|tomate/.test(t)) return "tomato";
  if (/onion|cebolla/.test(t)) return "onion";
  if (/pickle|pepinillo/.test(t)) return "pickle";
  if (/special sauce|big mac sauce/.test(t)) return "sauce";
  if (/ketchup/.test(t)) return "ketchup";
  if (/mustard/.test(t)) return "mustard";
  if (/mayo/.test(t)) return "mayo";
  if (/\begg\b|huevo/.test(t)) return "egg";
  if (/bacon/.test(t)) return "bacon";
  if (/crispy|tempura|mcchicken patty/.test(t)) return "crispy-chicken";
  if (/fish fillet|filet/.test(t)) return "fish-fillet";
  if (/hash brown/.test(t)) return "hash-brown";
  if (/nugget/.test(t)) return "nugget";
  if (/wrap|tortilla/.test(t)) return "wrap";
  return "generic";
}

// ─── Estilos CSS de Capas (pseudo-3D sándwich) ───────────────────────────────

const LAYER_STYLES: Record<FoodLayer, { bg: string; h: string; extra: string; emoji: string }> = {
  "heel-bun":      { bg: "bg-amber-700",  h: "h-5", extra: "rounded-b-2xl rounded-t-sm", emoji: "🍞" },
  "crown-bun":     { bg: "bg-amber-600",  h: "h-6", extra: "rounded-t-2xl rounded-b-sm", emoji: "🍔" },
  "club-bun":      { bg: "bg-amber-700",  h: "h-4", extra: "rounded-sm",                 emoji: "🍞" },
  "beef-patty":    { bg: "bg-amber-950",  h: "h-4", extra: "rounded-sm border border-amber-800", emoji: "🥩" },
  "cheese":        { bg: "bg-yellow-400", h: "h-2", extra: "rounded-sm opacity-90",       emoji: "🧀" },
  "lettuce":       { bg: "bg-green-600",  h: "h-2", extra: "rounded-sm",                 emoji: "🥬" },
  "tomato":        { bg: "bg-red-500",    h: "h-2", extra: "rounded-sm",                 emoji: "🍅" },
  "onion":         { bg: "bg-purple-300", h: "h-1", extra: "rounded-sm opacity-70",       emoji: "🧅" },
  "pickle":        { bg: "bg-green-800",  h: "h-1", extra: "rounded-sm",                 emoji: "🥒" },
  "sauce":         { bg: "bg-orange-300", h: "h-1", extra: "rounded-sm opacity-80",       emoji: "🫙" },
  "ketchup":       { bg: "bg-red-600",    h: "h-1", extra: "rounded-sm opacity-80",       emoji: "🍅" },
  "mustard":       { bg: "bg-yellow-500", h: "h-1", extra: "rounded-sm opacity-80",       emoji: "🟡" },
  "mayo":          { bg: "bg-yellow-100", h: "h-1", extra: "rounded-sm opacity-70",       emoji: "⬜" },
  "egg":           { bg: "bg-yellow-200", h: "h-4", extra: "rounded-full border-2 border-yellow-100", emoji: "🥚" },
  "bacon":         { bg: "bg-red-800",    h: "h-2", extra: "rounded-sm",                 emoji: "🥓" },
  "crispy-chicken":{ bg: "bg-amber-500",  h: "h-5", extra: "rounded-sm",                 emoji: "🍗" },
  "fish-fillet":   { bg: "bg-amber-300",  h: "h-4", extra: "rounded-sm",                 emoji: "🐟" },
  "hash-brown":    { bg: "bg-amber-700",  h: "h-4", extra: "rounded-sm",                 emoji: "🥔" },
  "nugget":        { bg: "bg-amber-500",  h: "h-5", extra: "rounded-xl",                 emoji: "🍗" },
  "wrap":          { bg: "bg-yellow-100", h: "h-6", extra: "rounded-md opacity-90",       emoji: "🌯" },
  "generic":       { bg: "bg-zinc-600",   h: "h-2", extra: "rounded-sm",                 emoji: "•"  },
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

function getStars(errors: number): 0 | 1 | 2 | 3 {
  if (errors === 0) return 3;
  if (errors <= 2) return 2;
  if (errors <= 5) return 1;
  return 0;
}

function saveMastery(itemId: string, stars: number) {
  const key = `pace_menu_${itemId}`;
  const prev = parseInt(localStorage.getItem(key) ?? "0");
  localStorage.setItem(key, String(Math.max(prev, stars)));
}

function getMastery(itemId: string): number {
  return parseInt(localStorage.getItem(`pace_menu_${itemId}`) ?? "0");
}

// ─── Componente: Barra de Estaciones de Cocina ───────────────────────────────

function KitchenBar({
  activeStation,
  isEs,
}: {
  activeStation: KitchenStation;
  isEs: boolean;
}) {
  const stations: KitchenStation[] = ["GRILL", "TOASTER", "UHC", "CONDIMENT", "PREP", "FRYER"];

  return (
    <div className="flex gap-1 px-2 py-2 bg-zinc-950 border-b border-zinc-800">
      {stations.map((s) => {
        const m = STATION_META[s];
        const isActive = s === activeStation;
        return (
          <div
            key={s}
            className="flex-1 text-center py-1.5 rounded-lg transition-all duration-300 text-xs font-mono"
            style={
              isActive
                ? {
                    background: `${m.color}25`,
                    boxShadow: `0 0 10px ${m.color}50`,
                    border: `1px solid ${m.color}60`,
                    color: m.color,
                    transform: "scale(1.05)",
                  }
                : { background: "#18181b", color: "#52525b", border: "1px solid #27272a" }
            }
          >
            <div className="text-base leading-none">{m.emoji}</div>
            <div className="text-[9px] mt-0.5 uppercase tracking-wide">
              {isEs ? m.labelEs : m.labelEn}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Componente: Orden + Errores ──────────────────────────────────────────────

function OrderBadge({
  name,
  nameEs,
  isEs,
  errors,
  stepsDone,
  stepsTotal,
}: {
  name: string;
  nameEs: string;
  isEs: boolean;
  errors: number;
  stepsDone: number;
  stepsTotal: number;
}) {
  const pct = Math.round((stepsDone / stepsTotal) * 100);
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-black border-b border-zinc-800">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
          {isEs ? "Orden #42" : "Order #42"}
        </div>
        <div className="text-white font-bold text-sm truncate">
          {isEs ? nameEs : name}
        </div>
        {/* Progress bar */}
        <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? "#22c55e" : "#eab308",
            }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[10px] text-zinc-600 font-mono">
          {isEs ? "ERRORES" : "ERRORS"}
        </div>
        <div
          className="text-2xl font-bold font-mono"
          style={{
            color: errors === 0 ? "#22c55e" : errors < 3 ? "#eab308" : "#ef4444",
          }}
        >
          {errors}
        </div>
      </div>
    </div>
  );
}

// ─── Componente: Canvas de Sándwich ──────────────────────────────────────────

function SandwichCanvas({
  steps,
  stepsDone,
  currentStepText,
  isEs,
}: {
  steps: BilingualStep[];
  stepsDone: number;
  currentStepText: BilingualStep | null;
  isEs: boolean;
}) {
  const completedSteps = steps.slice(0, stepsDone);

  return (
    <div className="flex flex-col mx-3 my-2 flex-1 min-h-0">
      {/* Label */}
      <div className="text-center text-zinc-600 text-[10px] font-mono tracking-widest mb-1">
        ── {isEs ? "ESTACIÓN DE ENSAMBLE" : "ASSEMBLY STATION"} ──
      </div>

      {/* Assembly area */}
      <div
        className="flex-1 rounded-xl border border-zinc-700 flex flex-col justify-end p-3 gap-0.5 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #111 0%, #1a1a1a 100%)", minHeight: 180 }}
      >
        {/* Wrapper paper base */}
        <div className="w-full flex flex-col-reverse gap-[2px]">
          {/* Build layers from bottom */}
          {completedSteps.map((step, i) => {
            const food = detectFoodLayer(step.en);
            const vis = LAYER_STYLES[food];
            const station = classifyStation(step.en);
            const stMeta = STATION_META[station];

            return (
              <div
                key={i}
                className="w-full relative animate-slide-layer-in"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div
                  className={`w-full ${vis.h} ${vis.bg} ${vis.extra} flex items-center`}
                  style={{ boxShadow: `0 2px 6px ${stMeta.color}25` }}
                >
                  {/* Sesame seeds en bun superior */}
                  {food === "crown-bun" && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-60">
                      {["•","·","•","·","•"].map((s, j) => (
                        <span key={j} className="text-amber-900 text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                  {/* Grill marks en patty */}
                  {food === "beef-patty" && (
                    <div className="absolute inset-0 flex flex-col justify-center gap-0.5 px-2 opacity-50">
                      <div className="h-px bg-black/50 rounded" />
                      <div className="h-px bg-black/50 rounded" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Wrapper base */}
          <div className="w-full">
            <div className="h-1 bg-zinc-600 rounded-sm" />
            <div className="text-center text-zinc-700 text-[9px] font-mono mt-0.5">
              {isEs ? "📋 PAPEL DE ENVOLTURA" : "📋 WRAPPER PAPER"}
            </div>
          </div>
        </div>

        {/* Próximo paso (cuando el canvas está vacío) */}
        {currentStepText && stepsDone === 0 && (
          <div className="text-center text-zinc-600 text-xs mt-4 mb-2">
            {isEs ? "👇 Selecciona el primer ingrediente" : "👇 Select the first ingredient"}
          </div>
        )}
      </div>

      {/* Current step instructions */}
      {currentStepText && (
        <div className="mt-2 px-3 py-2 rounded-lg border border-dashed border-yellow-600/40 bg-yellow-600/5">
          <div className="text-[10px] text-yellow-500 font-mono">
            ▶ {isEs ? "SIGUIENTE PASO" : "NEXT STEP"}
          </div>
          <div className="text-white text-sm font-medium mt-0.5 leading-snug">
            {isEs ? currentStepText.es : currentStepText.en}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente: Grid de Ingredientes ─────────────────────────────────────────

function IngredientGrid({
  steps,
  currentStepIndex,
  isEs,
  onSelect,
  errorIndices,
}: {
  steps: BilingualStep[];
  currentStepIndex: number;
  isEs: boolean;
  onSelect: (idx: number) => void;
  errorIndices: Set<number>;
}) {
  // Shuffle los índices una sola vez al montar
  const shuffled = useRef<number[]>([]);
  if (shuffled.current.length !== steps.length) {
    shuffled.current = Array.from({ length: steps.length }, (_, i) => i).sort(() => Math.random() - 0.5);
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950">
      <div className="text-center text-zinc-600 text-[9px] font-mono tracking-widest py-1.5">
        ── {isEs ? "SELECCIONA EL INGREDIENTE CORRECTO" : "TAP THE CORRECT INGREDIENT"} ──
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        {shuffled.current.map((idx) => {
          const step = steps[idx];
          const isCompleted = idx < currentStepIndex;
          const isError = errorIndices.has(idx);
          const station = classifyStation(step.en);
          const meta = STATION_META[station];
          const food = detectFoodLayer(step.en);
          const vis = LAYER_STYLES[food];

          return (
            <button
              key={idx}
              disabled={isCompleted}
              onClick={() => !isCompleted && onSelect(idx)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl text-left text-sm transition-all duration-150 active:scale-95"
              style={
                isCompleted
                  ? { background: "#111", opacity: 0.3, cursor: "not-allowed" }
                  : isError
                  ? {
                      background: "#450a0a",
                      border: "1px solid #dc2626",
                      animation: "shakeX 0.3s ease",
                    }
                  : {
                      background: "#1c1c1e",
                      border: `1px solid ${meta.color}30`,
                    }
              }
            >
              {/* Station dot */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: isCompleted ? "#555" : meta.color }}
              />

              {/* Food emoji */}
              <span className="text-lg leading-none">{vis.emoji}</span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[9px] font-mono uppercase tracking-wide mb-0.5"
                  style={{ color: isCompleted ? "#555" : `${meta.color}90` }}
                >
                  {meta.emoji} {isEs ? meta.labelEs : meta.labelEn}
                </div>
                <div
                  className="text-xs font-medium line-clamp-2 leading-tight"
                  style={{ color: isCompleted ? "#555" : "#fff" }}
                >
                  {isEs ? step.es : step.en}
                </div>
              </div>

              {/* Checkmark */}
              {isCompleted && (
                <span className="text-green-500 text-xs flex-shrink-0">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente: Pantalla de Resultados ──────────────────────────────────────

function ResultsScreen({
  item,
  errors,
  isEs,
  onRetry,
  onBack,
}: {
  item: (typeof MENU_ITEMS)[number];
  errors: number;
  isEs: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  const stars = getStars(errors);

  const messages = {
    3: { en: "Perfect Build! Gold Standard! 🏆", es: "¡Construcción Perfecta! Gold Standard! 🏆" },
    2: { en: "Good build — a couple of slips.", es: "Buena construcción — un par de errores." },
    1: { en: "Needs more practice. Review steps.", es: "Necesita práctica. Revisa los pasos." },
    0: { en: "Too many errors. Watch the process.", es: "Demasiados errores. Revisa el proceso." },
  } as const;

  const icons = { 3: "🏆", 2: "⭐", 1: "📈", 0: "🔄" } as const;

  return (
    <div className="flex flex-col gap-5 p-5 m-4 bg-zinc-900 rounded-2xl border border-zinc-700 animate-results-in">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-2">{icons[stars]}</div>
        <div className="text-white font-bold text-xl">
          {isEs ? item.nameEs : item.name}
        </div>
        <div className="text-3xl mt-2 tracking-widest">
          {"⭐".repeat(stars)}
          <span className="opacity-25">{"⭐".repeat(3 - stars)}</span>
        </div>
        <div className="text-zinc-400 text-sm mt-2">
          {messages[stars][isEs ? "es" : "en"]}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 justify-center">
        <div className="text-center">
          <div
            className="text-4xl font-bold font-mono"
            style={{ color: errors === 0 ? "#22c55e" : errors < 3 ? "#eab308" : "#ef4444" }}
          >
            {errors}
          </div>
          <div className="text-xs text-zinc-500 mt-1">{isEs ? "Errores" : "Errors"}</div>
        </div>
        <div className="w-px bg-zinc-700" />
        <div className="text-center">
          <div className="text-4xl font-bold font-mono text-yellow-400">{stars}</div>
          <div className="text-xs text-zinc-500 mt-1">{isEs ? "Estrellas" : "Stars"}</div>
        </div>
        <div className="w-px bg-zinc-700" />
        <div className="text-center">
          <div className="text-4xl font-bold font-mono text-blue-400">
            {Math.max(0, 100 - errors * 15)}%
          </div>
          <div className="text-xs text-zinc-500 mt-1">{isEs ? "Precisión" : "Accuracy"}</div>
        </div>
      </div>

      {/* Pro tip */}
      {(item.tipEn || item.tipEs) && (
        <div
          className="rounded-xl p-3 text-sm"
          style={{ background: "#1e3a5f", border: "1px solid #1d4ed8" }}
        >
          <div className="text-[10px] font-mono text-blue-400 mb-1">💡 PRO TIP</div>
          <div className="text-blue-200">{isEs ? item.tipEs : item.tipEn}</div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-black active:scale-95 transition-transform"
          style={{ background: "#eab308" }}
        >
          {isEs ? "🔄 Reintentar" : "🔄 Retry"}
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-zinc-700 active:scale-95 transition-transform"
        >
          {isEs ? "← Items" : "← Items"}
        </button>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function MenuBuildGame({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose?: () => void;
}) {
  const isEs = lang === "es";

  const [view, setView] = useState<GameView>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<(typeof MENU_ITEMS)[number] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());

  // Bridge string[] steps to BilingualStep[] for the game components
  const pairedSteps: BilingualStep[] = useMemo(() => {
    if (!selectedItem) return [];
    return selectedItem.steps.map((en, i) => ({
      en,
      es: selectedItem.stepsEs[i] ?? en,
    }));
  }, [selectedItem]);

  // Ingrediente activo para el paso actual
  const currentStep: BilingualStep | null = pairedSteps[currentStepIndex] ?? null;
  const activeStation: KitchenStation = currentStep ? classifyStation(currentStep.en) : "PREP";

  // Handler: seleccionar ingrediente
  const handleSelect = useCallback(
    (idx: number) => {
      if (!selectedItem) return;

      if (idx === currentStepIndex) {
        // ✓ Correcto
        const next = currentStepIndex + 1;
        setCurrentStepIndex(next);
        setErrorIndices(new Set()); // limpiar errores al avanzar

        if (next >= selectedItem.steps.length) {
          const stars = getStars(errors);
          saveMastery(selectedItem.id, stars);
          setView("results");
        }
      } else {
        // ✗ Incorrecto — flash visual + contador
        setErrors((e) => e + 1);
        setErrorIndices((prev) => {
          const next = new Set(prev);
          next.add(idx);
          return next;
        });
        setTimeout(() => {
          setErrorIndices((prev) => {
            const next = new Set(prev);
            next.delete(idx);
            return next;
          });
        }, 500);
      }
    },
    [currentStepIndex, selectedItem, errors]
  );

  const handleStartGame = useCallback((item: (typeof MENU_ITEMS)[number]) => {
    setSelectedItem(item);
    setCurrentStepIndex(0);
    setErrors(0);
    setErrorIndices(new Set());
    setView("game");
  }, []);

  const handleRetry = useCallback(() => {
    setCurrentStepIndex(0);
    setErrors(0);
    setErrorIndices(new Set());
    setView("game");
  }, []);

  // ── Vista: Categorías ─────────────────────────────────────────────────────
  if (view === "categories") {
    return (
      <div className="flex flex-col gap-4 p-4">
        {/* Header + close */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono tracking-widest">
              ── MENU BUILD GAME ──
            </div>
            <div className="text-white font-bold text-lg mt-0.5">
              {isEs ? "¿Qué estación vas a entrenar?" : "Which station are you training?"}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-500 text-sm px-3 py-1.5 rounded-lg border border-zinc-700 active:bg-zinc-800"
            >
              ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MENU_CATEGORIES.map((cat) => {
            const items = MENU_ITEMS.filter((i) => i.category === cat.id);
            const mastered = items.filter((i) => getMastery(i.id) >= 2).length;
            const pct = items.length > 0 ? (mastered / items.length) * 100 : 0;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setView("items");
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all active:scale-95"
                style={{
                  background: "#18181b",
                  borderColor: pct === 100 ? "#eab30850" : "#27272a",
                }}
              >
                <div className="text-4xl">{cat.emoji}</div>
                <div className="text-white font-bold text-sm text-center">
                  {isEs ? cat.nameEs : cat.nameEn}
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  {mastered}/{items.length} {isEs ? "dominados" : "mastered"}
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? "#22c55e" : "#eab308",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Vista: Items de Categoría ─────────────────────────────────────────────
  if (view === "items") {
    const catItems = MENU_ITEMS.filter((i) => i.category === selectedCategory);
    const cat = MENU_CATEGORIES.find((c) => c.id === selectedCategory);

    return (
      <div className="flex flex-col gap-3 p-4">
        {/* Back */}
        <button
          onClick={() => setView("categories")}
          className="text-zinc-400 text-sm text-left flex items-center gap-1"
        >
          ← {isEs ? "Categorías" : "Categories"}
        </button>

        {/* Category header */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cat?.emoji}</span>
          <span className="text-white font-bold text-lg">
            {isEs ? cat?.nameEs : cat?.nameEn}
          </span>
        </div>

        {/* Item list */}
        <div className="flex flex-col gap-2">
          {catItems.map((item) => {
            const stars = getMastery(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleStartGame(item)}
                className="flex items-center gap-3 p-3 rounded-xl border text-left active:scale-95 transition-all"
                style={{ background: "#18181b", borderColor: "#27272a" }}
              >
                <span className="text-3xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold truncate">
                    {isEs ? item.nameEs : item.name}
                  </div>
                  <div className="text-zinc-500 text-xs">
                    {item.steps.length} {isEs ? "pasos" : "steps"}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg">
                    {"⭐".repeat(stars)}
                    <span className="opacity-20">{"⭐".repeat(3 - stars)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Vista: Juego ──────────────────────────────────────────────────────────
  if (view === "game" && selectedItem) {
    return (
      <div className="flex flex-col h-full" style={{ background: "#0a0a0a" }}>
        {/* Kitchen equipment bar */}
        <KitchenBar activeStation={activeStation} isEs={isEs} />

        {/* Order + progress */}
        <OrderBadge
          name={selectedItem.name}
          nameEs={selectedItem.nameEs}
          isEs={isEs}
          errors={errors}
          stepsDone={currentStepIndex}
          stepsTotal={selectedItem.steps.length}
        />

        {/* Sandwich canvas — flex-1 */}
        <SandwichCanvas
          steps={pairedSteps}
          stepsDone={currentStepIndex}
          currentStepText={currentStep}
          isEs={isEs}
        />

        {/* Ingredient palette */}
        <IngredientGrid
          steps={pairedSteps}
          currentStepIndex={currentStepIndex}
          isEs={isEs}
          onSelect={handleSelect}
          errorIndices={errorIndices}
        />
      </div>
    );
  }

  // ── Vista: Resultados ─────────────────────────────────────────────────────
  if (view === "results" && selectedItem) {
    return (
      <div className="flex flex-col" style={{ background: "#0a0a0a", minHeight: "100%" }}>
        <ResultsScreen
          item={selectedItem}
          errors={errors}
          isEs={isEs}
          onRetry={handleRetry}
          onBack={() => setView("items")}
        />
      </div>
    );
  }

  return null;
}
