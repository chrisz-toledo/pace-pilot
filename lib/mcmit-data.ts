/**
 * lib/mcmit-data.ts
 * Source of truth: real McMiT data from mcd_mit_app/src/data/
 * This is the TRAINING BRIDGE — maps friction events to the actual
 * PQRG standards and station SOPs the employee should know.
 */

import type { FrictionType, Station } from "./types";

// ─── PQRG Data (from mcd_mit_app/src/data/pqrg.json) ────────────────────────

export const UHC_STANDARDS = [
  { item: "10:1 BEEF",    holding_time: 15, temp: 155, cabinet: "UHC_GRID_A" },
  { item: "4:1 BEEF",     holding_time: 20, temp: 165, cabinet: "UHC_GRID_B" },
  { item: "MCCHICKEN",    holding_time: 30, temp: 165, cabinet: "UHC_GRID_C" },
  { item: "NUGGETS",      holding_time: 20, temp: 165, cabinet: "UHC_GRID_C" },
  { item: "ROUND_EGG",    holding_time: 20, temp: 155, cabinet: "UHC_GRID_D" },
  { item: "FOLDED_EGG",   holding_time: 20, temp: 155, cabinet: "UHC_GRID_D" },
] as const;

export const SAFETY_PROTOCOLS = {
  INTERNAL_COOK_TEMP_BEEF:    "155°F (69°C)",
  INTERNAL_COOK_TEMP_POULTRY: "165°F (74°C)",
  STORAGE_COOLER:             "34°F – 40°F (1°C – 4°C)",
  STORAGE_FREEZER:            "0°F (-18°C) o menos",
} as const;

export const SHELF_LIFE_INDEX = [
  { item: "SHREDDED LETTUCE", secondary_life: 120, condition: "REFRIGERADO" },
  { item: "SLIVERED ONIONS",  secondary_life: 120, condition: "REFRIGERADO" },
  { item: "CHEDDAR CHEESE",   secondary_life: 240, condition: "TEMP. AMBIENTE" },
  { item: "BIG MAC SAUCE",    secondary_life: 720, condition: "TEMP. AMBIENTE" },
] as const;

export const GOLD_STANDARD_BUILDS = [
  {
    name: "QUARTER POUNDER WITH CHEESE",
    sequence: [
      "CROWN", "KETCHUP (1/3 oz)", "MUSTARD (1/10 oz)",
      "SLIVERED ONIONS (1/4 oz)", "PICKLES (2)", "CHEDDAR CHEESE",
      "4:1 BEEF PATTY", "CHEDDAR CHEESE", "HEEL",
    ],
  },
  {
    name: "BIG MAC",
    sequence: [
      "HEEL + CLUB", "BIG MAC SAUCE (1/3 oz)", "DEHYDRATED ONIONS (1/8 oz)",
      "SHREDDED LETTUCE (1/4 oz)", "CHEDDAR CHEESE (HEEL ONLY)", "10:1 PATTY (HEEL)",
      "CLUB", "BIG MAC SAUCE (1/3 oz)", "DEHYDRATED ONIONS (1/8 oz)",
      "SHREDDED LETTUCE (1/4 oz)", "PICKLES (2)", "10:1 PATTY (CLUB)", "CROWN",
    ],
  },
  {
    name: "EGG McMUFFIN",
    sequence: [
      "HEEL", "CHEDDAR CHEESE", "CANADIAN BACON", "ROUND EGG", "CROWN (MANTEQUILLADO)",
    ],
  },
] as const;

// ─── Stations Data (from mcd_mit_app/src/data/stations.json) ─────────────────

export const STATION_RECIPES = [
  {
    id: "line",
    name: "The Line (Producción)",
    recipes: [
      {
        name: "Quarter Pounder with Cheese",
        sequence: [
          "Crown (Top Bun)", "Ketchup", "Mustard", "Slivered Onions",
          "Pickles (x2)", "Cheddar Cheese", "4:1 Beef Patty", "Cheddar Cheese", "Heel (Bottom Bun)",
        ],
      },
      {
        name: "Big Mac",
        sequence: [
          "Heel and Club", "Big Mac Sauce", "Dehydrated Onions", "Shredded Lettuce",
          "Cheddar Cheese (Heel Only)", "10:1 Patty (Both)", "Pickles (Club Only)", "Crown",
        ],
      },
    ],
  },
  {
    id: "breakfast",
    name: "Breakfast Station",
    recipes: [
      {
        name: "Egg McMuffin",
        sequence: ["Heel (Bottom)", "Cheddar Cheese", "Canadian Bacon", "Round Egg", "Crown (Top)"],
      },
    ],
  },
] as const;

// ─── Service Time Targets ─────────────────────────────────────────────────────

export const SERVICE_TARGETS = {
  DT_WINDOW:     { target_seconds: 180, label: "SOS Drive-Through" },
  FRONT_COUNTER: { target_seconds: 90,  label: "SOS Mostrador" },
} as const;

// ─── PQRG Reference: maps friction event → relevant McMiT training content ────

export interface PQRGReference {
  title: string;
  type: "uhc_standards" | "gold_standard" | "safety" | "shelf_life" | "service_target" | "sop";
  items: { label: string; value: string }[];
}

export function getPQRGReference(station: Station, frictionType: FrictionType): PQRGReference | null {
  // UHC stock-out → show holding times per cabinet
  if (station === "UHC" && frictionType === "STOCK_OUT") {
    return {
      title: "PQRG — Estándares UHC (Holding Times)",
      type: "uhc_standards",
      items: UHC_STANDARDS.map((s) => ({
        label: `${s.item} · ${s.cabinet}`,
        value: `Máx. ${s.holding_time} min · ${s.temp}°F`,
      })),
    };
  }

  // Kitchen stock-out → shelf life
  if (station === "KITCHEN" && frictionType === "STOCK_OUT") {
    return {
      title: "PQRG — Vida Secundaria de Insumos",
      type: "shelf_life",
      items: SHELF_LIFE_INDEX.map((s) => ({
        label: s.item,
        value: `${s.secondary_life} min · ${s.condition}`,
      })),
    };
  }

  // Procedure deviation → Gold Standard Builds
  if (frictionType === "PROCEDURE_DEVIATION") {
    return {
      title: "PQRG — Gold Standard Builds",
      type: "gold_standard",
      items: GOLD_STANDARD_BUILDS.map((b) => ({
        label: b.name,
        value: b.sequence.join(" → "),
      })),
    };
  }

  // Equipment failure in kitchen → safety protocols
  if ((station === "KITCHEN" || station === "GRILL") && frictionType === "EQUIPMENT_FAILURE") {
    return {
      title: "PQRG — Protocolos de Seguridad",
      type: "safety",
      items: [
        { label: "Temp. interna Res",    value: SAFETY_PROTOCOLS.INTERNAL_COOK_TEMP_BEEF },
        { label: "Temp. interna Pollo",  value: SAFETY_PROTOCOLS.INTERNAL_COOK_TEMP_POULTRY },
        { label: "Almacenamiento frío",  value: SAFETY_PROTOCOLS.STORAGE_COOLER },
        { label: "Congelador",           value: SAFETY_PROTOCOLS.STORAGE_FREEZER },
      ],
    };
  }

  // Wait time at DT or FC → service time target
  if (frictionType === "WAIT_TIME" && (station === "DT_WINDOW" || station === "FRONT_COUNTER")) {
    const target = SERVICE_TARGETS[station as keyof typeof SERVICE_TARGETS];
    const mins = Math.floor(target.target_seconds / 60);
    const secs = target.target_seconds % 60;
    return {
      title: "PQRG — Estándar de Velocidad de Servicio",
      type: "service_target",
      items: [
        { label: target.label,        value: `≤ ${mins}:${String(secs).padStart(2, "0")} min` },
        { label: "Desde pedido hasta entrega", value: `Objetivo: ${target.target_seconds} seg` },
      ],
    };
  }

  // Disorder in BOC → show line recipes as reference
  if ((station === "BOC" || station === "KITCHEN") && frictionType === "DISORDER") {
    const lineStation = STATION_RECIPES[0];
    return {
      title: "McMiT — Secuencias de Ensamblaje (The Line)",
      type: "sop",
      items: lineStation.recipes.map((r) => ({
        label: r.name,
        value: r.sequence.slice(0, 4).join(" → ") + " →…",
      })),
    };
  }

  return null;
}
