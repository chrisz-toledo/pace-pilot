"use client";
import type { FrictionEvent } from "./types";
import { ruleBasedDiagnosis } from "./offline";

const KEY = "pace_pilot_events_v1";

export function loadEvents(): FrictionEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveEvents(events: FrictionEvent[]): void {
  localStorage.setItem(KEY, JSON.stringify(events));
}

export function appendEvent(event: FrictionEvent): void {
  saveEvents([...loadEvents(), event]);
}

export function updateEvent(updated: FrictionEvent): void {
  saveEvents(loadEvents().map((e) => (e.id === updated.id ? updated : e)));
}

export function markResolved(id: string): void {
  saveEvents(loadEvents().map((e) => (e.id === id ? { ...e, resolved: true } : e)));
}

export function clearEvents(): void {
  localStorage.removeItem(KEY);
}

// ─── Seed with hardcoded test data ───────────────────────────────────────────

function makeTs(hour: number, min = 0): string {
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

const SEED: FrictionEvent[] = [
  {
    id: "seed-001",
    timestamp: makeTs(11, 5),
    station: "UHC",
    event_type: "STOCK_OUT",
    description: "Falta de patties 4:1 en UHC — gaveta UHC_GRID_B vacía durante peak hour",
    severity: 4,
    reporter_role: "GM_FACILITY",
    service_impact_minutes: 3.5,
    resolved: false,
    five_s_diagnosis: ruleBasedDiagnosis({ event_type: "STOCK_OUT", station: "UHC" }),
  },
  {
    id: "seed-002",
    timestamp: makeTs(11, 28),
    station: "BOC",
    event_type: "DISORDER",
    description: "Desorden en estación BOC_1 — ingredientes de distintas categorías mezclados",
    severity: 3,
    reporter_role: "AREA_SUPERVISOR",
    service_impact_minutes: 1.5,
    resolved: false,
    five_s_diagnosis: ruleBasedDiagnosis({ event_type: "DISORDER", station: "BOC" }),
  },
  {
    id: "seed-003",
    timestamp: makeTs(12, 10),
    station: "DT_WINDOW",
    event_type: "WAIT_TIME",
    description: "SOS en Drive-Through supera 4 min durante pico de almuerzo — 6 autos en cola",
    severity: 5,
    reporter_role: "GM_FACILITY",
    service_impact_minutes: 4.2,
    resolved: false,
    five_s_diagnosis: ruleBasedDiagnosis({ event_type: "WAIT_TIME", station: "DT_WINDOW" }),
  },
  {
    id: "seed-004",
    timestamp: makeTs(12, 35),
    station: "KITCHEN",
    event_type: "EQUIPMENT_FAILURE",
    description: "Freidora #2 sin mantenimiento — tiempo de recuperación extendido, nuggets afectados",
    severity: 3,
    reporter_role: "CREW_OPERATOR",
    service_impact_minutes: 2.0,
    resolved: false,
    five_s_diagnosis: ruleBasedDiagnosis({ event_type: "EQUIPMENT_FAILURE", station: "KITCHEN" }),
  },
  {
    id: "seed-005",
    timestamp: makeTs(12, 52),
    station: "FRONT_COUNTER",
    event_type: "PROCEDURE_DEVIATION",
    description: "Falta de uniformidad en presentación — 2 pedidos devueltos por build incorrecto",
    severity: 2,
    reporter_role: "AREA_SUPERVISOR",
    service_impact_minutes: 0.8,
    resolved: false,
    five_s_diagnosis: ruleBasedDiagnosis({ event_type: "PROCEDURE_DEVIATION", station: "FRONT_COUNTER" }),
  },
];

export function seedIfEmpty(): void {
  if (loadEvents().length === 0) {
    saveEvents(SEED);
  }
}
