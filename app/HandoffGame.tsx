"use client";

/**
 * HandoffGame.tsx
 * Kitchen-POV drag-and-drop simulation of McDonald's shift handoff process.
 * Same mechanic as MenuBuildGame: drag task tiles from "Pending" counter to
 * the Handoff Clipboard (drop zone) in the correct priority order.
 *
 * 3 missions — one per shift transition:
 *   🌅 Opening → Morning
 *   🌆 Morning → Afternoon
 *   🌙 Afternoon → Closing
 */

import { useState, useMemo, useRef } from "react";
import type { Lang } from "@/lib/locales";

// ─── Mission Data ──────────────────────────────────────────────────────────────

interface HandoffStep {
  id: string;
  emoji: string;
  areaEs: string;       // short tile label (≤12 chars)
  areaEn: string;
  taskEs: string;       // full task shown in clipboard row
  taskEn: string;
  critical: boolean;
  tipEs: string;        // shown on result screen
  tipEn: string;
}

interface HandoffMission {
  id: string;
  emoji: string;
  nameEs: string;
  nameEn: string;
  fromEs: string;
  fromEn: string;
  toEs: string;
  toEn: string;
  descEs: string;
  descEn: string;
  steps: HandoffStep[];  // correct order
}

const MISSIONS: HandoffMission[] = [
  // ── Mission 1: Apertura → Mañana ──────────────────────────────────────────
  {
    id: "open_morning",
    emoji: "🌅",
    nameEs: "Apertura → Mañana",
    nameEn: "Opening → Morning",
    fromEs: "Turno de Apertura",
    fromEn: "Opening Shift",
    toEs: "Turno de Mañana",
    toEn: "Morning Shift",
    descEs: "Garantiza que el turno de mañana reciba todo listo antes del rush.",
    descEn: "Ensure the morning shift receives everything ready before the rush.",
    steps: [
      {
        id: "s1", emoji: "🌡️", areaEs: "Walk-In", areaEn: "Walk-In",
        taskEs: "Verificar temperatura del Walk-In Freezer y Cooler",
        taskEn: "Verify Walk-In Freezer and Cooler temperature",
        critical: true,
        tipEs: "La temperatura del freezer debe estar ≤ 0°F / -18°C. Si hay desviación, actúa antes de continuar el handoff.",
        tipEn: "Freezer temp must be ≤ 0°F / -18°C. If there's a deviation, act before continuing the handoff.",
      },
      {
        id: "s2", emoji: "🍔", areaEs: "UHC", areaEn: "UHC",
        taskEs: "Verificar y comunicar niveles de producto en todos los UHC",
        taskEn: "Verify and report product levels in all UHCs",
        critical: true,
        tipEs: "Sin producto en UHC = tiempo de espera alto desde el primer cliente. Verifica antes de que empiece el flujo.",
        tipEn: "No product in UHC = high wait time from the first customer. Verify before flow starts.",
      },
      {
        id: "s3", emoji: "⏱️", areaEs: "SOS", areaEn: "SOS",
        taskEs: "Comunicar el SOS actual del turno saliente (DT y FC)",
        taskEn: "Report current shift SOS (DT and FC)",
        critical: true,
        tipEs: "El SOS de apertura suele ser bajo. Si ya está alto, el turno entrante necesita saber la causa inmediatamente.",
        tipEn: "Opening SOS is usually low. If it's already high, the incoming shift needs to know the cause immediately.",
      },
      {
        id: "s4", emoji: "🖥️", areaEs: "KVS", areaEn: "KVS",
        taskEs: "Revisar que no haya órdenes pendientes en el KVS > 4 min",
        taskEn: "Check no pending orders on KVS > 4 min",
        critical: true,
        tipEs: "Nunca traspases órdenes 'colgadas'. Resuélvelas antes o escalalas al gerente para cierre.",
        tipEn: "Never hand over 'hanging' orders. Resolve them first or escalate to manager for closure.",
      },
      {
        id: "s5", emoji: "👥", areaEs: "Posiciones", areaEn: "Positions",
        taskEs: "Entregar el board de posiciones actualizado con los Ases en sus Places",
        taskEn: "Hand over updated positions board with Aces in their Places",
        critical: true,
        tipEs: "Entrega el board con nombres, no solo posiciones. El turno entrante necesita saber quién es quién desde el minuto 1.",
        tipEn: "Hand over the board with names, not just positions. The incoming shift needs to know who's who from minute 1.",
      },
      {
        id: "s6", emoji: "🔧", areaEs: "Equipos", areaEn: "Equipment",
        taskEs: "Reportar cualquier equipo fuera de servicio o en alerta de mantenimiento",
        taskEn: "Report any equipment out of service or on maintenance alert",
        critical: false,
        tipEs: "Incluye el tiempo que lleva fuera y si ya se abrió un ticket de mantenimiento.",
        tipEn: "Include how long it's been out and whether a maintenance ticket has been opened.",
      },
      {
        id: "s7", emoji: "📋", areaEs: "Bitácora", areaEn: "Log Book",
        taskEs: "Registrar todas las novedades del turno de apertura en la bitácora",
        taskEn: "Log all opening shift developments in the log book",
        critical: false,
        tipEs: "La bitácora es la memoria del restaurante. Si no está escrito, no ocurrió.",
        tipEn: "The log book is the restaurant's memory. If it's not written, it didn't happen.",
      },
    ],
  },

  // ── Mission 2: Mañana → Tarde ─────────────────────────────────────────────
  {
    id: "morning_afternoon",
    emoji: "🌆",
    nameEs: "Mañana → Tarde",
    nameEn: "Morning → Afternoon",
    fromEs: "Turno de Mañana",
    fromEn: "Morning Shift",
    toEs: "Turno de Tarde",
    toEn: "Afternoon Shift",
    descEs: "El turno más crítico: tarde recibe el pico de almuerzo y necesita información precisa.",
    descEn: "The most critical shift: afternoon takes the lunch rush and needs precise information.",
    steps: [
      {
        id: "m1", emoji: "⏱️", areaEs: "SOS Pico", areaEn: "Peak SOS",
        taskEs: "Reportar el SOS promedio durante el rush de almuerzo (DT y FC)",
        taskEn: "Report average SOS during lunch rush (DT and FC)",
        critical: true,
        tipEs: "El turno de tarde necesita saber si el rush ya pasó o si está a punto de llegar. Incluye el peor momento del día.",
        tipEn: "The afternoon shift needs to know if the rush has passed or is about to arrive. Include the worst moment of the day.",
      },
      {
        id: "m2", emoji: "🍔", areaEs: "UHC", areaEn: "UHC",
        taskEs: "Comunicar niveles de producto en todos los UHC antes de cambio de turno",
        taskEn: "Report product levels in all UHCs before shift change",
        critical: true,
        tipEs: "Después del rush de almuerzo los UHC suelen estar bajos. El turno de tarde necesita saber el punto de partida.",
        tipEn: "After the lunch rush, UHCs are often low. The afternoon shift needs to know the starting point.",
      },
      {
        id: "m3", emoji: "👥", areaEs: "Board", areaEn: "Board",
        taskEs: "Entregar board de posiciones actualizado con Aces in their Places",
        taskEn: "Hand over updated positions board with Aces in their Places",
        critical: true,
        tipEs: "El turno de tarde puede tener crew distinto. Asegúrate que el board refleje quién está realmente en la tarde.",
        tipEn: "The afternoon shift may have different crew. Ensure the board reflects who's actually in the afternoon.",
      },
      {
        id: "m4", emoji: "😟", areaEs: "Incidentes", areaEn: "Incidents",
        taskEs: "Reportar incidentes de crew: conflicto, estrés o rendimiento bajo",
        taskEn: "Report crew incidents: conflict, stress or low performance",
        critical: true,
        tipEs: "No ocultes problemas. Un crew con conflicto sin resolver afecta el siguiente turno también.",
        tipEn: "Don't hide problems. Unresolved crew conflict affects the next shift too.",
      },
      {
        id: "m5", emoji: "🧊", areaEs: "Freezer", areaEn: "Freezer",
        taskEs: "Verificar temperatura del Walk-In Freezer y Cooler al cierre de mañana",
        taskEn: "Verify Walk-In Freezer and Cooler temperature at morning close",
        critical: true,
        tipEs: "Aplica la regla: si la temperatura está fuera de rango por más de 2 horas, escala inmediatamente.",
        tipEn: "Apply the rule: if the temperature is out of range for more than 2 hours, escalate immediately.",
      },
      {
        id: "m6", emoji: "☕", areaEs: "Breaks", areaEn: "Breaks",
        taskEs: "Comunicar quién tiene pendiente su break y tiempo restante",
        taskEn: "Report who has a pending break and remaining time",
        critical: false,
        tipEs: "Un crew sin break es un crew con menos energía para el rush de tarde. Priorízalo desde el inicio.",
        tipEn: "Crew without a break is crew with less energy for the afternoon rush. Prioritize it from the start.",
      },
      {
        id: "m7", emoji: "💰", areaEs: "Caja", areaEn: "Cash",
        taskEs: "Cuadrar caja y comunicar cualquier diferencia al turno entrante",
        taskEn: "Balance cash register and report any discrepancy to incoming shift",
        critical: true,
        tipEs: "Toda diferencia mayor a $5 debe ser documentada con causa. No heredes diferencias sin explicación.",
        tipEn: "Any discrepancy over $5 must be documented with cause. Don't inherit unexplained differences.",
      },
      {
        id: "m8", emoji: "📋", areaEs: "Bitácora", areaEn: "Log Book",
        taskEs: "Registrar novedades del turno de mañana en la bitácora del GM",
        taskEn: "Log morning shift developments in the GM log book",
        critical: false,
        tipEs: "El turno de tarde revisa la bitácora antes de iniciar. Sé claro y específico: hora, qué pasó, quién.",
        tipEn: "The afternoon shift reviews the log before starting. Be clear and specific: time, what happened, who.",
      },
    ],
  },

  // ── Mission 3: Tarde → Cierre ─────────────────────────────────────────────
  {
    id: "afternoon_closing",
    emoji: "🌙",
    nameEs: "Tarde → Cierre",
    nameEn: "Afternoon → Closing",
    fromEs: "Turno de Tarde",
    fromEn: "Afternoon Shift",
    toEs: "Turno de Cierre",
    toEn: "Closing Shift",
    descEs: "El cierre es el más exigente. Cada dato mal comunicado puede demorar la apertura del día siguiente.",
    descEn: "Closing is the most demanding. Every miscommunicated detail can delay the next day's opening.",
    steps: [
      {
        id: "c1", emoji: "🚨", areaEs: "Quejas", areaEn: "Complaints",
        taskEs: "Documentar y comunicar quejas de clientes no resueltas o VOG activo",
        taskEn: "Document and communicate unresolved customer complaints or active VOG",
        critical: true,
        tipEs: "Un VOG activo es urgente. El turno de cierre necesita saber si hay un cliente esperando respuesta.",
        tipEn: "An active VOG is urgent. The closing shift needs to know if there's a customer waiting for a response.",
      },
      {
        id: "c2", emoji: "🦠", areaEs: "Food Safety", areaEn: "Food Safety",
        taskEs: "Reportar cualquier incidente de Food Safety ocurrido en el turno",
        taskEn: "Report any Food Safety incident that occurred during the shift",
        critical: true,
        tipEs: "Los incidentes de Food Safety nunca se ocultan. Incluye hora exacta, producto y crew involucrado.",
        tipEn: "Food Safety incidents are never hidden. Include exact time, product, and crew involved.",
      },
      {
        id: "c3", emoji: "💰", areaEs: "Caja", areaEn: "Cash",
        taskEs: "Cuadrar la caja y comunicar cualquier diferencia al turno de cierre",
        taskEn: "Balance cash register and report any discrepancy to closing shift",
        critical: true,
        tipEs: "El cierre hace el conteo final del día. Cualquier diferencia de tarde sin documentar complica ese proceso.",
        tipEn: "Closing does the final day count. Any undocumented afternoon difference complicates that process.",
      },
      {
        id: "c4", emoji: "🛢️", areaEs: "Aceite", areaEn: "Fryer Oil",
        taskEs: "Reportar estado del aceite (T-Stick) y si necesita cambio en cierre",
        taskEn: "Report oil status (T-Stick) and if it needs changing at close",
        critical: false,
        tipEs: "Si el T-Stick indica aceite degradado, el turno de cierre debe programar el cambio antes del apagado.",
        tipEn: "If the T-Stick indicates degraded oil, the closing shift must schedule the change before shutdown.",
      },
      {
        id: "c5", emoji: "📦", areaEs: "Inventario", areaEn: "Inventory",
        taskEs: "Comunicar productos con stock bajo que requieren pedido o acción en cierre",
        taskEn: "Report low-stock products requiring order or action at closing",
        critical: false,
        tipEs: "El cierre hace el conteo final. Con tu lista de bajo stock, tienen contexto de qué vigilar antes del conteo.",
        tipEn: "Closing does the final count. With your low-stock list, they have context for what to watch before counting.",
      },
      {
        id: "c6", emoji: "🧹", areaEs: "Limpieza", areaEn: "Cleaning",
        taskEs: "Comunicar estado de limpieza de todas las áreas y tareas pendientes",
        taskEn: "Report cleaning status of all areas and pending tasks",
        critical: false,
        tipEs: "El cierre hereda las tareas pendientes de limpieza. Sé honesto sobre lo que no alcanzaste a hacer.",
        tipEn: "Closing inherits pending cleaning tasks. Be honest about what you didn't get to do.",
      },
      {
        id: "c7", emoji: "🔧", areaEs: "Equipos", areaEn: "Equipment",
        taskEs: "Listar equipos fuera de servicio o con alerta de mantenimiento pendiente",
        taskEn: "List equipment out of service or with pending maintenance alert",
        critical: true,
        tipEs: "El cierre necesita saber qué no funciona antes de iniciar los procedimientos de apagado.",
        tipEn: "Closing needs to know what doesn't work before starting shutdown procedures.",
      },
      {
        id: "c8", emoji: "📋", areaEs: "Bitácora", areaEn: "Log Book",
        taskEs: "Completar la entrada en la bitácora del GM con todas las novedades del turno",
        taskEn: "Complete the GM log book entry with all shift developments",
        critical: false,
        tipEs: "La bitácora del cierre es la más importante: el GM la lee antes de la apertura del día siguiente.",
        tipEn: "The closing log is the most important: the GM reads it before the next day's opening.",
      },
    ],
  },
];

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

function loadHandoffMastery(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("pace_handoff_mastery") ?? "{}"); }
  catch { return {}; }
}

function saveHandoffMastery(id: string, stars: number) {
  try {
    const m = loadHandoffMastery();
    if (!m[id] || m[id] < stars) m[id] = stars;
    localStorage.setItem("pace_handoff_mastery", JSON.stringify(m));
  } catch { /* noop */ }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GameView = "missions" | "playing" | "result";

interface ShuffledStep {
  step: HandoffStep;
  originalIndex: number;
}

// ─── Clipboard POV: Handoff Play Screen ───────────────────────────────────────
//
//  Layout:
//  ┌──────────────────────────────┐
//  │  Header (mission name)       │  ~54px
//  ├──────────────────────────────┤
//  │  📋 HANDOFF CLIPBOARD        │  flex-1
//  │  [✓ Row 1 — Critical 🔴]    │
//  │  [✓ Row 2]                  │
//  │  [── ? next step ──] ← drop │
//  ├──────────────────────────────┤
//  │  ─── TAREAS PENDIENTES ───   │  divider
//  ├──────────────────────────────┤
//  │  [🌡️][🍔][⏱️][🖥️]          │  3-col task tiles
//  │  [👥][🔧][📋]               │
//  └──────────────────────────────┘

function ClipboardPlayScreen({
  mission,
  shuffledSteps,
  currentStep,
  doneSet,
  mistakes,
  wrongFlashIdx,
  isEs,
  onBack,
  onDrop,
}: {
  mission: HandoffMission;
  shuffledSteps: ShuffledStep[];
  currentStep: number;
  doneSet: Set<number>;
  mistakes: number;
  wrongFlashIdx: number | null;
  isEs: boolean;
  onBack: () => void;
  onDrop: (shuffledIdx: number) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const [isOverDrop, setIsOverDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const clipboardScrollRef = useRef<HTMLDivElement>(null);

  const totalSteps = mission.steps.length;
  const ghostStep = dragIdx !== null ? shuffledSteps[dragIdx] : null;

  // Completed rows in correct sequence order
  const completedRows = [];
  for (let i = 0; i < currentStep; i++) {
    const found = shuffledSteps.find((s) => s.originalIndex === i);
    if (found) completedRows.push({ step: found.step, seq: i + 1 });
  }

  function checkOverDrop(x: number, y: number): boolean {
    const rect = dropRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function scrollClipboardBottom() {
    setTimeout(() => {
      clipboardScrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
    }, 80);
  }

  return (
    <div className={`flex flex-col h-full select-none overflow-hidden${dragIdx !== null ? " touch-none" : ""}`}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 shrink-0">
        <button onClick={onBack} className="text-[11px] font-bold text-white/40 shrink-0">
          ← {isEs ? "Misiones" : "Missions"}
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-lg leading-none shrink-0">{mission.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-cream truncate">
              {isEs ? mission.nameEs : mission.nameEn}
            </p>
            <p className="text-[9px] text-white/30 truncate">
              {isEs ? `${mission.fromEs} → ${mission.toEs}` : `${mission.fromEn} → ${mission.toEn}`}
            </p>
          </div>
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
          className="h-full rounded-full transition-all duration-400"
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
            background: "linear-gradient(90deg, #f5c518, #ff9500)",
          }}
        />
      </div>

      {/* ── Handoff Clipboard (drop zone) ──────────────────────────── */}
      <div className="flex-1 min-h-0 mx-3 mb-2 flex flex-col overflow-hidden">

        {/* Clipboard header label */}
        <div className="flex items-center gap-2 mb-1.5 px-1 shrink-0">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
            {isEs ? "📋 Reporte de Handoff" : "📋 Handoff Report"}
          </span>
          <div className="flex-1 h-px bg-white/6" />
          {/* From → To badge */}
          <span className="text-[8px] font-black text-white/20 bg-white/5 rounded-full px-2 py-0.5">
            {isEs ? `${mission.fromEs}` : `${mission.fromEn}`}
          </span>
        </div>

        {/* Clipboard surface (drop zone) */}
        <div
          ref={dropRef}
          className={`flex-1 rounded-2xl overflow-hidden flex flex-col transition-all duration-150
            ${isOverDrop
              ? "ring-2 ring-amber-400/70 shadow-[inset_0_0_30px_rgba(245,197,24,0.06),0_0_20px_rgba(245,197,24,0.12)]"
              : "ring-1 ring-white/6"
            }`}
          style={{ background: "rgba(26,24,20,0.97)" }}
        >
          <div ref={clipboardScrollRef} className="flex-1 overflow-y-auto px-3 pt-2 pb-1">

            {/* Empty state */}
            {completedRows.length === 0 && !isOverDrop && (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
                <span className="text-3xl opacity-20">📋</span>
                <p className="text-[10px] text-white/15 italic text-center px-4">
                  {isEs
                    ? "Arrastra la primera tarea del handoff aquí"
                    : "Drag the first handoff task here"}
                </p>
              </div>
            )}

            {/* Completed task rows */}
            {completedRows.map((row, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-3 py-2.5 mb-1 rounded-xl border border-white/[0.05]"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                {/* Step number */}
                <span className="text-[9px] font-black text-white/20 mt-0.5 w-3 shrink-0 text-right">{row.seq}</span>
                {/* Emoji */}
                <span className="text-lg leading-none shrink-0 mt-0.5">{row.step.emoji}</span>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black text-white/70">
                      {isEs ? row.step.areaEs : row.step.areaEn}
                    </span>
                    {row.step.critical && (
                      <span className="text-[7px] font-black text-red-400 bg-red-400/10 rounded-full px-1.5 py-0.5 uppercase tracking-wide">
                        {isEs ? "crítico" : "critical"}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-white/35 leading-snug">
                    {isEs ? row.step.taskEs : row.step.taskEn}
                  </p>
                </div>
                {/* Check */}
                <span className="text-emerald-400/60 text-xs mt-0.5 shrink-0">✓</span>
              </div>
            ))}

            {/* Next drop slot */}
            {currentStep < totalSteps && (
              <div
                className={`flex items-center gap-2.5 px-3 py-2.5 mb-2 rounded-xl border-2 border-dashed transition-all duration-150
                  ${isOverDrop && ghostStep
                    ? "border-amber-400/70 bg-amber-400/8 scale-[1.015]"
                    : "border-white/10 bg-white/[0.015]"
                  }`}
              >
                <span className="text-[9px] font-black text-white/20 w-3 text-right shrink-0">
                  {currentStep + 1}
                </span>
                {isOverDrop && ghostStep ? (
                  <>
                    <span className="text-lg leading-none shrink-0">{ghostStep.step.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black text-amber-400/90">
                        {isEs ? ghostStep.step.areaEs : ghostStep.step.areaEn}
                      </span>
                      {ghostStep.step.critical && (
                        <span className="ml-1.5 text-[7px] font-black text-red-400 bg-red-400/10 rounded-full px-1.5 py-0.5 uppercase tracking-wide">
                          {isEs ? "crítico" : "critical"}
                        </span>
                      )}
                    </div>
                    <span className="text-amber-400 text-xs shrink-0">↓</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl text-white/10 shrink-0 animate-pulse">?</span>
                    <span className="text-[10px] text-white/15 italic flex-1">
                      {isEs ? "Siguiente tarea del handoff…" : "Next handoff task…"}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pending Tasks divider ────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 mb-2 shrink-0">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
          {isEs ? "📌 Tareas Pendientes" : "📌 Pending Tasks"}
        </span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* ── Task tiles (3-col draggable counter) ─────────────────────── */}
      <div className="px-3 pb-4 shrink-0">
        <div className="grid grid-cols-4 gap-2">
          {shuffledSteps.map((ss, i) => {
            const isDone = doneSet.has(i);
            const isWrong = wrongFlashIdx === i;
            const isDragging = dragIdx === i;
            const areaLabel = isEs ? ss.step.areaEs : ss.step.areaEn;

            if (isDone) {
              return (
                <div key={i} className="aspect-square rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-emerald-500/30 text-base">✓</span>
                </div>
              );
            }

            return (
              <div
                key={i}
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
                    scrollClipboardBottom();
                  }
                  setDragIdx(null);
                  setIsOverDrop(false);
                }}
                onPointerCancel={() => {
                  setDragIdx(null);
                  setIsOverDrop(false);
                }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-grab touch-none select-none transition-all duration-100
                  ${isDragging ? "opacity-15 scale-90" : isWrong ? "scale-95" : "active:scale-95"}`}
                style={{
                  background: isDragging
                    ? "rgba(255,255,255,0.03)"
                    : isWrong
                    ? "rgba(220,38,38,0.15)"
                    : "rgba(44,44,46,1)",
                  boxShadow: isDragging || isWrong
                    ? "none"
                    : "0 4px 0 rgba(0,0,0,0.45), 0 6px 16px rgba(0,0,0,0.3)",
                  border: isWrong
                    ? "1px solid rgba(239,68,68,0.4)"
                    : "1px solid rgba(255,255,255,0.09)",
                }}
              >
                {/* Critical red dot */}
                {ss.step.critical && !isDragging && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
                )}
                <span className={`text-2xl leading-none transition-transform ${isWrong ? "scale-75" : ""}`}>
                  {ss.step.emoji}
                </span>
                <span className="text-[7px] font-bold text-white/40 text-center leading-tight px-1 line-clamp-2 mt-0.5">
                  {areaLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Ghost: floating card ─────────────────────────────────────── */}
      {dragIdx !== null && ghostStep && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center justify-center gap-1 rounded-2xl"
          style={{
            left: ghostPos.x - 40,
            top: ghostPos.y - 52,
            width: 80,
            height: 80,
            background: "rgba(44,44,46,0.98)",
            border: `2px solid ${isOverDrop ? "rgba(245,197,24,0.9)" : "rgba(255,255,255,0.15)"}`,
            boxShadow: isOverDrop
              ? "0 16px 40px rgba(0,0,0,0.8), 0 0 24px rgba(245,197,24,0.3)"
              : "0 20px 50px rgba(0,0,0,0.75), 0 8px 20px rgba(0,0,0,0.5)",
            transform: `scale(1.18) rotate(${isOverDrop ? "0deg" : "-4deg"})`,
            transition: "transform 0.1s ease, border-color 0.1s ease, box-shadow 0.1s ease",
          }}
        >
          {ghostStep.step.critical && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
          )}
          <span className="text-2xl leading-none">{ghostStep.step.emoji}</span>
          <span className="text-[7px] font-bold text-white/80 text-center leading-tight px-1.5 line-clamp-2">
            {isEs ? ghostStep.step.areaEs : ghostStep.step.areaEn}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HandoffGame({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose: () => void;
}) {
  const isEs = lang === "es";
  const [mastery, setMastery] = useState<Record<string, number>>(loadHandoffMastery);
  const [view, setView] = useState<GameView>("missions");
  const [mission, setMission] = useState<HandoffMission | null>(null);

  const [shuffledSteps, setShuffledSteps] = useState<ShuffledStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlashIdx, setWrongFlashIdx] = useState<number | null>(null);
  const [resultStars, setResultStars] = useState<1 | 2 | 3 | null>(null);
  const [resultMistakes, setResultMistakes] = useState(0);

  function startMission(m: HandoffMission) {
    const shuffled = shuffle(
      m.steps.map((step, originalIndex) => ({ step, originalIndex }))
    );
    setMission(m);
    setShuffledSteps(shuffled);
    setCurrentStep(0);
    setDoneSet(new Set());
    setMistakes(0);
    setWrongFlashIdx(null);
    setResultStars(null);
    setView("playing");
  }

  function handleDrop(shuffledIdx: number) {
    if (!mission || doneSet.has(shuffledIdx)) return;
    const dropped = shuffledSteps[shuffledIdx];

    if (dropped.originalIndex === currentStep) {
      const newDone = new Set(doneSet);
      newDone.add(shuffledIdx);
      setDoneSet(newDone);
      const next = currentStep + 1;
      setCurrentStep(next);

      if (next === mission.steps.length) {
        const stars = getStars(mistakes);
        saveHandoffMastery(mission.id, stars);
        setMastery(loadHandoffMastery());
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

  // ── 1. Mission Selection ──────────────────────────────────────────────────
  if (view === "missions") {
    return (
      <div className="flex flex-col gap-4 p-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-gold uppercase tracking-widest">
              {isEs ? "Misiones de Handoff" : "Handoff Missions"}
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              {isEs ? "Simula el traspaso entre turnos" : "Simulate shift-to-shift handoff"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[13px] font-bold text-white/30 w-8 h-8 rounded-full bg-white/8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Explanation card */}
        <div className="bg-card rounded-2xl p-4 border border-white/8">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">
            {isEs ? "Cómo funciona" : "How it works"}
          </p>
          <p className="text-xs text-white/50 leading-relaxed">
            {isEs
              ? "Arrastra cada tarea del handoff al reporte en el orden correcto de prioridad. Los puntos rojos indican tareas críticas que nunca se pueden omitir."
              : "Drag each handoff task to the report in the correct priority order. Red dots indicate critical tasks that can never be skipped."}
          </p>
        </div>

        {/* Mission cards */}
        <div className="flex flex-col gap-3">
          {MISSIONS.map((m) => {
            const stars = mastery[m.id] ?? 0;
            return (
              <button
                key={m.id}
                onClick={() => startMission(m)}
                className="bg-card rounded-2xl p-4 flex items-start gap-4 active:scale-[0.98] transition-transform text-left"
              >
                <span className="text-4xl leading-none shrink-0 mt-0.5">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-black text-cream">
                      {isEs ? m.nameEs : m.nameEn}
                    </p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <span key={s} className={`text-xs leading-none ${stars >= s ? "text-gold" : "text-white/12"}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 leading-snug mb-1">
                    {isEs ? m.descEs : m.descEn}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-white/20 bg-white/5 rounded-full px-2 py-0.5">
                      {m.steps.length} {isEs ? "pasos" : "steps"}
                    </span>
                    <span className="text-[9px] font-black text-red-400/60 bg-red-400/8 rounded-full px-2 py-0.5">
                      {m.steps.filter(s => s.critical).length} {isEs ? "críticos" : "critical"}
                    </span>
                  </div>
                </div>
                <span className="text-white/30 text-lg shrink-0 mt-1">›</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 2. Playing ────────────────────────────────────────────────────────────
  if (view === "playing" && mission) {
    return (
      <ClipboardPlayScreen
        mission={mission}
        shuffledSteps={shuffledSteps}
        currentStep={currentStep}
        doneSet={doneSet}
        mistakes={mistakes}
        wrongFlashIdx={wrongFlashIdx}
        isEs={isEs}
        onBack={() => setView("missions")}
        onDrop={handleDrop}
      />
    );
  }

  // ── 3. Result ─────────────────────────────────────────────────────────────
  if (view === "result" && mission && resultStars !== null) {
    const headline = isEs
      ? (resultStars === 3 ? "¡Handoff Perfecto!" : resultStars === 2 ? "¡Buen Handoff!" : "¡Practica más!")
      : (resultStars === 3 ? "Perfect Handoff!" : resultStars === 2 ? "Good Handoff!" : "Keep Practicing!");

    const nextMissionIdx = (MISSIONS.findIndex(m => m.id === mission.id) + 1) % MISSIONS.length;
    const nextMission = MISSIONS[nextMissionIdx];

    return (
      <div className="flex flex-col items-center gap-5 p-6 text-center pb-10">
        <span className="text-6xl mt-2">{mission.emoji}</span>
        <div>
          <p className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-2">
            {isEs ? mission.nameEs : mission.nameEn}
          </p>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`text-4xl leading-none ${resultStars >= s ? "text-gold" : "text-white/12"}`}>★</span>
            ))}
          </div>
          <p className="text-lg font-black text-cream">{headline}</p>
          {resultMistakes > 0 && (
            <p className="text-[11px] text-white/35 mt-1">
              {resultMistakes} {isEs ? "error(es) de secuencia" : "sequence mistake(s)"}
            </p>
          )}
        </div>

        {/* Full handoff sequence review */}
        <div className="bg-card rounded-2xl w-full overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-white/6">
            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">
              {isEs ? "Secuencia correcta del handoff" : "Correct handoff sequence"}
            </p>
          </div>
          <div className="px-3 py-2">
            {mission.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5 px-2 py-1.5">
                <span className="text-[9px] text-white/20 font-black w-3 text-right shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-base leading-none shrink-0">{step.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-white/60">
                      {isEs ? step.areaEs : step.areaEn}
                    </span>
                    {step.critical && (
                      <span className="text-[7px] font-black text-red-400/70">●</span>
                    )}
                  </div>
                  <p className="text-[8px] text-white/25 leading-snug mt-0.5">
                    {isEs ? step.tipEs : step.tipEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => startMission(mission)}
            className="w-full py-3.5 rounded-2xl bg-white/8 text-white/60 font-black text-sm"
          >
            {isEs ? "Repetir misión" : "Repeat mission"}
          </button>
          <button
            onClick={() => startMission(nextMission)}
            className="w-full py-3.5 rounded-2xl bg-gold text-black font-black text-sm"
          >
            {nextMission.emoji} {isEs ? nextMission.nameEs : nextMission.nameEn} →
          </button>
          <button
            onClick={() => setView("missions")}
            className="w-full py-3 rounded-2xl bg-card text-white/40 font-bold text-sm"
          >
            {isEs ? "Ver misiones" : "View missions"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
