"use client";

/**
 * ServSafeModule.tsx
 * Weekly mandatory food safety training based on ServSafe 7th Edition (2025-2026).
 * 6 modules covering the full ServSafe Manager certification content.
 * Tracks completion per calendar week — shows OBLIGATORIO badge if not done.
 */

import { useState, useEffect } from "react";

// ─── Weekly tracking ──────────────────────────────────────────────────────────

function getWeekKey(): string {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

const SS_KEY = "pace_servsafe_done";

function loadDone(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(SS_KEY) ?? "{}"); } catch { return {}; }
}

function markModuleDone(moduleId: string) {
  const done = loadDone();
  const wk = getWeekKey();
  const existing = done[wk] ?? [];
  if (!existing.includes(moduleId)) done[wk] = [...existing, moduleId];
  localStorage.setItem(SS_KEY, JSON.stringify(done));
}

function getDoneThisWeek(): string[] {
  return loadDone()[getWeekKey()] ?? [];
}

// ─── Content types ────────────────────────────────────────────────────────────

interface ContentCard {
  emoji: string;
  headEs: string;
  headEn: string;
  bodyEs: string;
  bodyEn: string;
  warn?: boolean;   // red warning style
  gold?: boolean;   // gold highlight for key numbers
  mc?: boolean;     // McDonald's specific context
}

interface QuizQ {
  qEs: string;
  qEn: string;
  opts: { es: string; en: string; correct: boolean }[];
  explEs: string;
  explEn: string;
}

interface SSModule {
  id: string;
  emoji: string;
  titleEs: string;
  titleEn: string;
  subtitleEs: string;
  subtitleEn: string;
  cards: ContentCard[];
  quiz: QuizQ[];
}

// ─── Module data — ServSafe 7th Edition 2025-2026 ────────────────────────────

const MODULES: SSModule[] = [
  // ── MODULE 1: Big 6 Pathogens ─────────────────────────────────────────────
  {
    id: "big6",
    emoji: "🦠",
    titleEs: "Los 6 Patógenos Críticos",
    titleEn: "The Big 6 Pathogens",
    subtitleEs: "Enfermedades que pueden cerrar un restaurante",
    subtitleEn: "Illnesses that can shut down a restaurant",
    cards: [
      {
        emoji: "⚠️",
        headEs: "¿Por qué el Big 6?",
        headEn: "Why the Big 6?",
        bodyEs: "Estos 6 patógenos son los más peligrosos en Food Service porque son altamente contagiosos, causan enfermedades graves, y pueden propagarse a través de empleados infectados que tocan alimentos. En McDonald's, UNO de estos casos puede generar un cierre regulatorio inmediato.",
        bodyEn: "These 6 pathogens are the most dangerous in food service because they are highly contagious, cause serious illness, and can spread through infected employees who touch food. In McDonald's, ONE of these cases can trigger immediate regulatory shutdown.",
        warn: true,
      },
      {
        emoji: "🤢",
        headEs: "Norovirus — El más contagioso",
        headEn: "Norovirus — The most contagious",
        bodyEs: "Causa: Vómito, diarrea intensa, fiebre. Transmisión: Empleado infectado toca comida sin lavar manos. UNA partícula de Norovirus en 18 gramos de comida puede infectar a 20 personas. El empleado debe ser EXCLUIDO 48 horas después de que terminen los síntomas. NO puede volver antes.",
        bodyEn: "Causes: Vomiting, intense diarrhea, fever. Transmission: Infected employee touches food without washing hands. ONE Norovirus particle in 18g of food can infect 20 people. Employee must be EXCLUDED 48 hours after symptoms end. Cannot return before that.",
        warn: true,
      },
      {
        emoji: "🟡",
        headEs: "Hepatitis A — El silencioso",
        headEn: "Hepatitis A — The silent one",
        bodyEs: "Causa: Daño hepático grave, ictericia (piel amarilla), fatiga extrema, fiebre. Incubación: 15-50 días (puedes infectar a clientes semanas antes de sentirte mal). Transmisión: Ruta fecal-oral — no lavarse manos después del baño. En McDonald's: exclusión inmediata si hay ictericia visible.",
        bodyEn: "Causes: Serious liver damage, jaundice (yellow skin), extreme fatigue, fever. Incubation: 15-50 days (you can infect customers weeks before feeling sick). Transmission: Fecal-oral route — not washing hands after restroom. At McDonald's: immediate exclusion if jaundice is visible.",
        warn: true,
      },
      {
        emoji: "🌡️",
        headEs: "E. coli O157:H7 — La razón por la que McDonald's cocina a 160°F",
        headEn: "E. coli O157:H7 — Why McDonald's cooks to 160°F",
        bodyEs: "Causa: Diarrea sanguinolenta severa, daño renal (HUS), puede ser fatal en niños. Fuente: Carne molida cruda mal cocida. McDonald's establece 160°F/71°C para las patties (por encima del mínimo de 155°F/68°C del FDA) precisamente por este patógeno. Exclusión inmediata si diagnosticado.",
        bodyEn: "Causes: Severe bloody diarrhea, kidney damage (HUS), can be fatal in children. Source: Undercooked ground beef. McDonald's sets 160°F/71°C for patties (above FDA's 155°F/68°C minimum) specifically because of this pathogen. Immediate exclusion if diagnosed.",
        mc: true,
        gold: true,
      },
      {
        emoji: "💧",
        headEs: "Salmonella & Shigella — El dúo de la contaminación cruzada",
        headEn: "Salmonella & Shigella — The cross-contamination duo",
        bodyEs: "Salmonella Typhi: Fiebre tifoidea, vive solo en humanos, ruta fecal-oral. Nontyphoidal Salmonella: Huevos, carne, aves sin cocinar bien. Shigella: Extremadamente contagiosa, puede propagarse a través de moscas. Los tres requieren exclusión inmediata con diagnóstico confirmado.",
        bodyEn: "Salmonella Typhi: Typhoid fever, lives only in humans, fecal-oral route. Nontyphoidal Salmonella: Undercooked eggs, meat, poultry. Shigella: Extremely contagious, can spread through flies. All three require immediate exclusion with confirmed diagnosis.",
        warn: true,
      },
      {
        emoji: "🚿",
        headEs: "Exclusión vs. Restricción — La regla que no se negocia",
        headEn: "Exclusion vs. Restriction — The non-negotiable rule",
        bodyEs: "EXCLUSIÓN (no entra al restaurante): Vómito o diarrea activos, diagnóstico de Big 6, ictericia visible. Retorno: mínimo 24-48 horas después de fin de síntomas con autorización médica. RESTRICCIÓN (trabaja sin tocar alimentos): Llaga infectada en mano cubierta con guante, síntomas leves sin diagnóstico confirmado.",
        bodyEn: "EXCLUSION (cannot enter restaurant): Active vomiting or diarrhea, Big 6 diagnosis, visible jaundice. Return: minimum 24-48 hours after symptoms end with medical authorization. RESTRICTION (works without touching food): Infected wound on hand covered with glove, mild symptoms without confirmed diagnosis.",
        gold: true,
      },
    ],
    quiz: [
      {
        qEs: "Un empleado de cocina llega con diarrea activa. ¿Cuál es la acción correcta?",
        qEn: "A kitchen employee arrives with active diarrhea. What is the correct action?",
        opts: [
          { es: "Dejarlo trabajar pero alejado de la parrilla", en: "Let them work but away from the grill", correct: false },
          { es: "Excluirlo inmediatamente — no puede entrar al restaurante", en: "Exclude immediately — they cannot enter the restaurant", correct: true },
          { es: "Pedirle que use guantes durante su turno", en: "Ask them to use gloves during their shift", correct: false },
        ],
        explEs: "La diarrea activa es causa de EXCLUSIÓN inmediata, no de restricción. El empleado debe irse del restaurante y no puede regresar hasta 24 horas después de que los síntomas terminen completamente.",
        explEn: "Active diarrhea is grounds for IMMEDIATE EXCLUSION, not restriction. The employee must leave the restaurant and cannot return until 24 hours after symptoms completely end.",
      },
      {
        qEs: "McDonald's cocina sus patties de carne a 160°F/71°C. ¿Por qué está por encima del mínimo federal de 155°F?",
        qEn: "McDonald's cooks beef patties to 160°F/71°C. Why is this above the federal minimum of 155°F?",
        opts: [
          { es: "Para mejorar el sabor de la carne", en: "To improve the flavor of the meat", correct: false },
          { es: "Para protección adicional contra E. coli O157:H7 en carne molida", en: "For additional protection against E. coli O157:H7 in ground beef", correct: true },
          { es: "Porque los termómetros de parrilla tienen error de ±5°F", en: "Because grill thermometers have ±5°F error", correct: false },
        ],
        explEs: "E. coli O157:H7 es un patógeno crítico que se encuentra en carne molida y puede causar daño renal fatal (HUS) especialmente en niños. McDonald's eleva la temperatura de cocción como medida adicional de seguridad.",
        explEn: "E. coli O157:H7 is a critical pathogen found in ground beef that can cause fatal kidney damage (HUS) especially in children. McDonald's raises the cooking temperature as an additional safety measure.",
      },
      {
        qEs: "¿Cuál de los Big 6 tiene el período de incubación más largo (hasta 50 días)?",
        qEn: "Which of the Big 6 has the longest incubation period (up to 50 days)?",
        opts: [
          { es: "Norovirus", en: "Norovirus", correct: false },
          { es: "E. coli O157:H7", en: "E. coli O157:H7", correct: false },
          { es: "Hepatitis A", en: "Hepatitis A", correct: true },
        ],
        explEs: "Hepatitis A tiene un período de incubación de 15-50 días, lo que significa que un empleado puede infectar a clientes durante semanas antes de mostrar síntomas. Por eso la higiene personal siempre activa es la única defensa real.",
        explEn: "Hepatitis A has an incubation period of 15-50 days, meaning an employee can infect customers for weeks before showing symptoms. That's why always-on personal hygiene is the only real defense.",
      },
    ],
  },

  // ── MODULE 2: Temperature Danger Zone ────────────────────────────────────────
  {
    id: "temps",
    emoji: "🌡️",
    titleEs: "La Zona de Peligro de Temperatura",
    titleEn: "The Temperature Danger Zone",
    subtitleEs: "41°F – 135°F (5°C – 57°C): donde las bacterias crecen",
    subtitleEn: "41°F – 135°F (5°C – 57°C): where bacteria thrive",
    cards: [
      {
        emoji: "⚡",
        headEs: "La Zona de Peligro — 41°F a 135°F (5°C a 57°C)",
        headEn: "The Danger Zone — 41°F to 135°F (5°C to 57°C)",
        bodyEs: "En esta zona, las bacterias se duplican cada 20 minutos. A 70°F-125°F (21°C-52°C) crecen al máximo. Regla de las 4 horas: si un alimento pasa MÁS de 4 horas acumuladas en esta zona, DEBE descartarse — no se puede salvar recalentando.",
        bodyEn: "In this zone, bacteria double every 20 minutes. At 70°F-125°F (21°C-52°C) they grow fastest. The 4-hour rule: if food spends MORE than 4 total hours in this zone, it MUST be discarded — it cannot be saved by reheating.",
        warn: true,
        gold: true,
      },
      {
        emoji: "🥩",
        headEs: "Temperaturas mínimas de cocción — Tabla ServSafe 2026",
        headEn: "Minimum cooking temperatures — ServSafe 2026 Table",
        bodyEs: "165°F/74°C (<1 seg): Aves (pollo, pavo), rellenos con carne. 155°F/68°C (15 seg): Carne molida, cerdo molido. 145°F/63°C (15 seg): Cortes enteros de res/cerdo/cordero, pescado, mariscos. 145°F/63°C (4 min): Asados y rostizados.",
        bodyEn: "165°F/74°C (<1 sec): Poultry (chicken, turkey), stuffings with meat. 155°F/68°C (15 sec): Ground beef, ground pork. 145°F/63°C (15 sec): Whole cuts of beef/pork/lamb, fish, shellfish. 145°F/63°C (4 min): Roasts.",
        gold: true,
      },
      {
        emoji: "🍔",
        headEs: "McDonald's y la Zona de Peligro — Conexión directa",
        headEn: "McDonald's and the Danger Zone — Direct connection",
        bodyEs: "UHC debe mantener productos a 140°F+ (por encima de la zona). Si el UHC falla: el producto entra en la Zona de Peligro. Walk-In Cooler: 35°F-38°F (debajo de la zona). Walk-In Freezer: 0°F/-18°C (muy por debajo). Los tiempos de descarte de productos en UHC existen exactamente por esta razón.",
        bodyEn: "UHC must hold products at 140°F+ (above the zone). If UHC fails: product enters the Danger Zone. Walk-In Cooler: 35°F-38°F (below the zone). Walk-In Freezer: 0°F/-18°C (far below). Product discard times in UHC exist exactly for this reason.",
        mc: true,
      },
      {
        emoji: "❄️",
        headEs: "Enfriamiento de 2 etapas — Procedimiento crítico",
        headEn: "2-Stage Cooling — Critical procedure",
        bodyEs: "Si preparas comida caliente que luego refrigerarás: Etapa 1: de 135°F a 70°F en máximo 2 horas. Etapa 2: de 70°F a 41°F en las próximas 4 horas. Total: 6 horas máximo. Si no llega a 70°F en 2 horas → recalentar a 165°F y empezar de nuevo, o descartar.",
        bodyEn: "If you prepare hot food to then refrigerate: Stage 1: from 135°F to 70°F in max 2 hours. Stage 2: from 70°F to 41°F in next 4 hours. Total: 6 hours maximum. If it doesn't reach 70°F in 2 hours → reheat to 165°F and start over, or discard.",
        gold: true,
      },
      {
        emoji: "🧊",
        headEs: "Los 4 métodos seguros de descongelamiento",
        headEn: "The 4 safe thawing methods",
        bodyEs: "1. Refrigeración (41°F o menos) — el más seguro. 2. Agua corriente fría (70°F o menos, envasado herméticamente). 3. Microondas — cocinar INMEDIATAMENTE después. 4. Cocinar desde estado congelado (tiempo adicional de cocción). NUNCA descongelar a temperatura ambiente — crea la Zona de Peligro en la superficie mientras el interior sigue congelado.",
        bodyEn: "1. Refrigeration (41°F or below) — safest. 2. Running cold water (70°F or below, hermetically packaged). 3. Microwave — cook IMMEDIATELY after. 4. Cook from frozen (additional cooking time). NEVER thaw at room temperature — creates the Danger Zone on the surface while the interior stays frozen.",
        warn: true,
      },
      {
        emoji: "📦",
        headEs: "Temperaturas de recepción de productos",
        headEn: "Product receiving temperatures",
        bodyEs: "Carnes frías / TCS fríos: 41°F/5°C o menos. Huevos en cáscara: 45°F/7°C o menos. Productos TCS calientes: 135°F/57°C o más. Mariscos vivos: temperatura interna máx. 50°F/10°C. Si un proveedor entrega por encima de estos límites → RECHAZAR el producto y documentar.",
        bodyEn: "Cold meats / cold TCS: 41°F/5°C or below. Shell eggs: 45°F/7°C or below. Hot TCS products: 135°F/57°C or above. Live shellfish: internal temp max 50°F/10°C. If a supplier delivers above these limits → REJECT the product and document.",
        gold: true,
      },
    ],
    quiz: [
      {
        qEs: "Un producto en el UHC lleva 3 horas a 130°F (cayó debajo del límite). ¿Qué debes hacer?",
        qEn: "A UHC product has been at 130°F for 3 hours (fell below the limit). What should you do?",
        opts: [
          { es: "Servirlo si se ve y huele bien", en: "Serve it if it looks and smells fine", correct: false },
          { es: "Recalentarlo a 165°F/74°C y reiniciar el tiempo de descarte", en: "Reheat to 165°F/74°C and restart the discard timer", correct: true },
          { es: "Descartarlo si pasó más de 4 horas totales en la Zona de Peligro; si no, recalentar", en: "Discard if over 4 total hours in Danger Zone; if not, reheat", correct: false },
        ],
        explEs: "La respuesta correcta en el contexto de McDonald's es recalentar a 165°F (la temperatura de aves/rellenos como estándar de recalentamiento) y reiniciar el tiempo. Sin embargo, si ya sumó más de 4 horas en la zona de peligro TOTAL, descarta. Nunca servir por apariencia.",
        explEn: "In McDonald's context the correct action is to reheat to 165°F and restart the timer. However, if it has already accumulated more than 4 total hours in the danger zone, discard. Never serve based on appearance.",
      },
      {
        qEs: "¿Cuál es la temperatura mínima para cocinar pollo entero según ServSafe 2026?",
        qEn: "What is the minimum cooking temperature for whole poultry according to ServSafe 2026?",
        opts: [
          { es: "145°F/63°C por 15 segundos", en: "145°F/63°C for 15 seconds", correct: false },
          { es: "155°F/68°C por 17 segundos", en: "155°F/68°C for 17 seconds", correct: false },
          { es: "165°F/74°C instantáneo (<1 segundo)", en: "165°F/74°C instantaneous (<1 second)", correct: true },
        ],
        explEs: "Las aves (pollo, pavo, pato) requieren 165°F/74°C instantáneo — la temperatura más alta de todas — porque Salmonella y Campylobacter son más resistentes al calor que otros patógenos y requieren esta temperatura para destruirse.",
        explEn: "Poultry (chicken, turkey, duck) requires 165°F/74°C instantaneous — the highest temperature of all — because Salmonella and Campylobacter are more heat-resistant than other pathogens and require this temperature to be destroyed.",
      },
      {
        qEs: "¿Cuánto tiempo TOTAL máximo puede un alimento estar en la Zona de Peligro antes de tener que descartarse?",
        qEn: "What is the TOTAL maximum time food can be in the Danger Zone before it must be discarded?",
        opts: [
          { es: "2 horas", en: "2 hours", correct: false },
          { es: "4 horas", en: "4 hours", correct: true },
          { es: "6 horas", en: "6 hours", correct: false },
        ],
        explEs: "La regla de las 4 horas es absoluta: más de 4 horas acumuladas en la Zona de Peligro (41°F-135°F) = descarte obligatorio. Las 6 horas aplican al enfriamiento en dos etapas, no a la regla general de tiempo en la zona de peligro.",
        explEn: "The 4-hour rule is absolute: more than 4 accumulated hours in the Danger Zone (41°F-135°F) = mandatory discard. The 6 hours apply to two-stage cooling, not the general danger zone time rule.",
      },
    ],
  },

  // ── MODULE 3: FAT TOM ─────────────────────────────────────────────────────────
  {
    id: "fattom",
    emoji: "🧫",
    titleEs: "FAT TOM — Condiciones de Crecimiento Bacteriano",
    titleEn: "FAT TOM — Bacterial Growth Conditions",
    subtitleEs: "Las 6 condiciones que los patógenos necesitan para multiplicarse",
    subtitleEn: "The 6 conditions pathogens need to multiply",
    cards: [
      {
        emoji: "🍗",
        headEs: "F — Food (Alimento): qué comen las bacterias",
        headEn: "F — Food: what bacteria eat",
        bodyEs: "Los patógenos prosperan en proteínas (carne, pollo, huevos, lácteos, legumbres) y carbohidratos ricos en humedad (arroz cocido, papas, cortes de melón). En McDonald's: las patties crudas, el pollo, los huevos para el desayuno y los postres lácteos son los alimentos de más alto riesgo.",
        bodyEn: "Pathogens thrive in proteins (meat, poultry, eggs, dairy, legumes) and moisture-rich carbohydrates (cooked rice, potatoes, melon slices). At McDonald's: raw patties, chicken, breakfast eggs and dairy desserts are the highest-risk foods.",
        mc: true,
      },
      {
        emoji: "⚗️",
        headEs: "A — Acidity (pH): por qué el vinagre y el limón protegen",
        headEn: "A — Acidity (pH): why vinegar and lemon protect",
        bodyEs: "Los patógenos crecen mejor en pH neutro (6.6-7.5). Los alimentos ácidos (limón pH 2, vinagre pH 2.5, tomate pH 4) inhiben su crecimiento. Los aliños ácidos en ensaladas tienen función de seguridad alimentaria, no solo sabor. Los alimentos sin acidez (carne, leche, pollo) son los más vulnerables.",
        bodyEn: "Pathogens grow best at neutral pH (6.6-7.5). Acidic foods (lemon pH 2, vinegar pH 2.5, tomato pH 4) inhibit growth. Acidic dressings in salads have a food safety function, not just flavor. Non-acidic foods (meat, milk, chicken) are the most vulnerable.",
        gold: true,
      },
      {
        emoji: "🕐",
        headEs: "T — Time (Tiempo): las bacterias no necesitan mucho",
        headEn: "T — Time: bacteria don't need much",
        bodyEs: "Una sola bacteria en condiciones óptimas se duplica cada 20 minutos. En 4 horas: 1 bacteria → 4,096 bacterias. En 7 horas: 1 bacteria → 2,097,152 bacterias. Esto es exactamente por qué los tiempos de descarte existen y no son negociables.",
        bodyEn: "A single bacterium in optimal conditions doubles every 20 minutes. In 4 hours: 1 bacterium → 4,096 bacteria. In 7 hours: 1 bacterium → 2,097,152 bacteria. This is exactly why discard times exist and are non-negotiable.",
        warn: true,
        gold: true,
      },
      {
        emoji: "🌡️",
        headEs: "T — Temperature (Temperatura): la variable que más controlas",
        headEn: "T — Temperature: the variable you control most",
        bodyEs: "41°F-135°F (5°C-57°C) = Zona de Peligro. El crecimiento es MÁS rápido entre 70°F-125°F (21°C-52°C). Tu mayor herramienta de control: termómetros calibrados, UHC funcionando, Walk-In a temperatura, y descarte de producto en tiempo. En McDonald's, la temperatura es la primera línea de defensa.",
        bodyEn: "41°F-135°F (5°C-57°C) = Danger Zone. Growth is FASTEST between 70°F-125°F (21°C-52°C). Your greatest control tool: calibrated thermometers, functioning UHC, Walk-In at temperature, and timely product discard. At McDonald's, temperature is the first line of defense.",
        mc: true,
      },
      {
        emoji: "💨",
        headEs: "O — Oxygen (Oxígeno): bacterias aerobias vs. anaerobias",
        headEn: "O — Oxygen: aerobic vs. anaerobic bacteria",
        bodyEs: "Aerobias (necesitan O2): Salmonella, E. coli, Listeria — crecen en superficies expuestas. Anaerobias (sin O2): Clostridium botulinum — crece en alimentos envasados al vacío. Por eso los alimentos envasados al vacío o en atmósfera modificada necesitan refrigeración incluso en envase cerrado.",
        bodyEn: "Aerobic (need O2): Salmonella, E. coli, Listeria — grow on exposed surfaces. Anaerobic (no O2): Clostridium botulinum — grows in vacuum-packed foods. That's why vacuum-packed or modified atmosphere foods need refrigeration even when sealed.",
        gold: true,
      },
      {
        emoji: "💧",
        headEs: "M — Moisture (Humedad): por qué los alimentos secos son seguros",
        headEn: "M — Moisture: why dry foods are safe",
        bodyEs: "Los patógenos necesitan agua libre (Aw) para multiplicarse. Alimentos de alta Aw (>0.85): carne, pollo, lácteos, frutas cortadas — ALTO riesgo. Alimentos de baja Aw (<0.85): cereales secos, galletas, azúcar, harina — BAJO riesgo. Las especias secas de McDonald's son seguras por su baja Aw; el producto preparado húmedo no lo es.",
        bodyEn: "Pathogens need free water (Aw) to multiply. High Aw foods (>0.85): meat, poultry, dairy, cut fruits — HIGH risk. Low Aw foods (<0.85): dry cereals, crackers, sugar, flour — LOW risk. McDonald's dry spices are safe due to low Aw; moist prepared product is not.",
        mc: true,
      },
    ],
    quiz: [
      {
        qEs: "En condiciones óptimas, ¿cada cuánto tiempo se duplica una bacteria?",
        qEn: "In optimal conditions, how often does a bacterium double?",
        opts: [
          { es: "Cada hora", en: "Every hour", correct: false },
          { es: "Cada 20 minutos", en: "Every 20 minutes", correct: true },
          { es: "Cada 4 horas", en: "Every 4 hours", correct: false },
        ],
        explEs: "Cada 20 minutos en condiciones óptimas (Zona de Peligro + proteínas + humedad). Esto significa que en solo 4 horas una bacteria puede convertirse en más de 4,000. Por eso los tiempos de descarte no son negociables.",
        explEn: "Every 20 minutes in optimal conditions (Danger Zone + proteins + moisture). This means in just 4 hours one bacterium can become over 4,000. That's why discard times are non-negotiable.",
      },
      {
        qEs: "¿Cuál de los alimentos de McDonald's representa el MAYOR riesgo FAT TOM?",
        qEn: "Which McDonald's food represents the HIGHEST FAT TOM risk?",
        opts: [
          { es: "Papas a la francesa recién fritas", en: "Freshly fried french fries", correct: false },
          { es: "Patty de carne cruda en el área de cocina", en: "Raw beef patty in the kitchen area", correct: true },
          { es: "Bollos de pan empacados", en: "Packaged buns", correct: false },
        ],
        explEs: "La patty cruda tiene proteína alta, pH neutro, tiempo potencial de exposición, temperatura ambiente si no está en refrigeración, y alta humedad. Es el perfecto escenario FAT TOM. Las papas recién fritas están a 350°F+ y los bollos tienen baja Aw.",
        explEn: "Raw patty has high protein, neutral pH, potential exposure time, ambient temperature if not refrigerated, and high moisture. It's the perfect FAT TOM scenario. Freshly fried fries are at 350°F+ and buns have low Aw.",
      },
      {
        qEs: "¿Por qué Clostridium botulinum es peligroso incluso en envases sellados?",
        qEn: "Why is Clostridium botulinum dangerous even in sealed packages?",
        opts: [
          { es: "Porque resiste temperaturas de congelación", en: "Because it resists freezing temperatures", correct: false },
          { es: "Porque es una bacteria anaerobia — crece SIN oxígeno", en: "Because it's an anaerobic bacterium — grows WITHOUT oxygen", correct: true },
          { es: "Porque es resistente al ácido", en: "Because it's acid-resistant", correct: false },
        ],
        explEs: "Clostridium botulinum produce la toxina botulínica (uno de los venenos más potentes conocidos) en ausencia de oxígeno. Por eso los alimentos envasados al vacío o en conserva no son automáticamente seguros sin refrigeración adecuada.",
        explEn: "Clostridium botulinum produces botulinum toxin (one of the most potent known poisons) in the absence of oxygen. That's why vacuum-packed or canned foods are not automatically safe without proper refrigeration.",
      },
    ],
  },

  // ── MODULE 4: Personal Hygiene ────────────────────────────────────────────────
  {
    id: "hygiene",
    emoji: "🤲",
    titleEs: "Higiene Personal y Salud del Empleado",
    titleEn: "Personal Hygiene and Employee Health",
    subtitleEs: "El empleado enfermo es el mayor vector de contaminación",
    subtitleEn: "The sick employee is the greatest contamination vector",
    cards: [
      {
        emoji: "🚿",
        headEs: "Procedimiento de lavado de manos — 20 segundos que salvan vidas",
        headEn: "Handwashing procedure — 20 seconds that save lives",
        bodyEs: "1. Mojar manos con agua caliente corriente. 2. Aplicar jabón y frotar manos, entre dedos y bajo uñas por 10-15 segundos. 3. Enjuagar bajo agua caliente. 4. Secar con toalla desechable. Total: mínimo 20 segundos. Usar la toalla para cerrar el grifo — no tocar el grifo con manos limpias.",
        bodyEn: "1. Wet hands with running hot water. 2. Apply soap and scrub hands, between fingers and under nails for 10-15 seconds. 3. Rinse under hot water. 4. Dry with disposable paper towel. Total: minimum 20 seconds. Use the towel to turn off the faucet — don't touch it with clean hands.",
        gold: true,
      },
      {
        emoji: "📋",
        headEs: "Cuándo DEBES lavarte las manos — Lista completa",
        headEn: "When you MUST wash your hands — Complete list",
        bodyEs: "• Antes de preparar o tocar alimentos. • Antes de ponerte guantes. • Después de usar el baño. • Después de tocar cabello, cara o ropa. • Después de tocar alimentos crudos antes de RTE. • Después de comer, beber, fumar, mascar chicle. • Después de sacar basura. • Después de limpiar mesas o utensilios sucios. • Después de tocar teléfono o dinero.",
        bodyEn: "• Before preparing or touching food. • Before putting on gloves. • After using the restroom. • After touching hair, face or clothing. • After touching raw foods before RTE. • After eating, drinking, smoking, chewing gum. • After taking out trash. • After cleaning dirty tables or utensils. • After touching phone or money.",
        gold: true,
      },
      {
        emoji: "🧤",
        headEs: "Guantes de un solo uso — No son un sustituto del lavado",
        headEn: "Single-use gloves — Not a substitute for handwashing",
        bodyEs: "Los guantes protegen los alimentos de las manos, PERO: 1. Debes lavarte las manos ANTES de ponerte guantes. 2. Los guantes deben cambiarse: al cambiar de tarea, después de tocar superficies no sanitizadas, al romperlos, después de 4 horas de uso continuo. 3. Los guantes contaminados transfieren patógenos igual que las manos sucias.",
        bodyEn: "Gloves protect food from hands, BUT: 1. You must wash hands BEFORE putting on gloves. 2. Gloves must be changed: when switching tasks, after touching unsanitized surfaces, when torn, after 4 hours of continuous use. 3. Contaminated gloves transfer pathogens the same as dirty hands.",
        warn: true,
      },
      {
        emoji: "💇",
        headEs: "Higiene adicional — Ropa, cabello y joyería",
        headEn: "Additional hygiene — Clothing, hair and jewelry",
        bodyEs: "Cabello: siempre cubierto con gorra o red. Ropa: limpia al inicio de turno, nunca limpiar manos en el delantal. Joyería: no anillos (excepto alianza lisa), no pulseras, no aretes grandes — acumulan bacterias y pueden caer en la comida. Uñas: cortas, sin esmalte, sin postizas.",
        bodyEn: "Hair: always covered with cap or net. Clothing: clean at shift start, never wipe hands on apron. Jewelry: no rings (except plain band), no bracelets, no large earrings — they accumulate bacteria and can fall in food. Nails: short, no polish, no artificial nails.",
        mc: true,
      },
      {
        emoji: "🤧",
        headEs: "Síntomas que DEBES reportar al SM antes de empezar el turno",
        headEn: "Symptoms you MUST report to SM before starting your shift",
        bodyEs: "REPORTAR SIEMPRE: vómito o diarrea, ictericia (piel/ojos amarillos), dolor de garganta con fiebre, llaga infectada en mano o muñeca. Consecuencia de NO reportar: si un cliente se enferma, el empleado y el restaurante son responsables legalmente. La honestidad protege al equipo, al restaurante y a los clientes.",
        bodyEn: "ALWAYS REPORT: vomiting or diarrhea, jaundice (yellow skin/eyes), sore throat with fever, infected sore on hand or wrist. Consequence of NOT reporting: if a customer gets sick, the employee and restaurant are legally liable. Honesty protects the team, restaurant and customers.",
        warn: true,
      },
      {
        emoji: "🍽️",
        headEs: "Comer y beber en el área de trabajo — La regla",
        headEn: "Eating and drinking in the work area — The rule",
        bodyEs: "NUNCA: comer, beber, mascar chicle o fumar mientras preparas o sirves comida, en áreas de preparación, o donde se lavan utensilios. EXCEPTO: bebidas en vasos con tapa y popote en el área designada de descanso. Una sola pieza de cabello o saliva en la comida puede resultar en queja, cierre sanitario o demanda.",
        bodyEn: "NEVER: eat, drink, chew gum or smoke while preparing or serving food, in prep areas, or where utensils are washed. EXCEPT: drinks in covered cups with straws in the designated break area. A single hair or saliva in food can result in complaints, health department closure or lawsuit.",
        warn: true,
      },
    ],
    quiz: [
      {
        qEs: "Un empleado termina de manejar patties crudas y va a armar ensaladas. ¿Cuál es el procedimiento correcto?",
        qEn: "An employee finishes handling raw patties and goes to assemble salads. What is the correct procedure?",
        opts: [
          { es: "Cambiar guantes solamente", en: "Change gloves only", correct: false },
          { es: "Lavarse las manos Y luego ponerse guantes nuevos", en: "Wash hands AND then put on new gloves", correct: true },
          { es: "Sanitizar los guantes actuales con solución de cloro", en: "Sanitize current gloves with chlorine solution", correct: false },
        ],
        explEs: "Los guantes no sustituyen el lavado de manos. Al cambiar de carne cruda a RTE (ready-to-eat) como ensaladas, SIEMPRE: quitar guantes → lavar manos 20 segundos → nuevos guantes. Esta es la transición de mayor riesgo de contaminación cruzada en McDonald's.",
        explEn: "Gloves don't substitute handwashing. When switching from raw meat to RTE (ready-to-eat) like salads, ALWAYS: remove gloves → wash hands 20 seconds → new gloves. This is the highest-risk cross-contamination transition at McDonald's.",
      },
      {
        qEs: "¿Cuál de estos síntomas requiere EXCLUSIÓN (no puede venir a trabajar)?",
        qEn: "Which of these symptoms requires EXCLUSION (cannot come to work)?",
        opts: [
          { es: "Leve dolor de cabeza sin fiebre", en: "Mild headache without fever", correct: false },
          { es: "Diarrea activa desde ayer", en: "Active diarrhea since yesterday", correct: true },
          { es: "Tos sin fiebre ni dolor de garganta", en: "Cough without fever or sore throat", correct: false },
        ],
        explEs: "La diarrea activa es causa de EXCLUSIÓN inmediata — no puede entrar al restaurante. Debe esperar 24 horas después de que los síntomas cesen completamente antes de regresar. La tos sin fiebre no es causa de exclusión pero sí se debe usar mascarilla en área de alimentos.",
        explEn: "Active diarrhea is grounds for IMMEDIATE EXCLUSION — cannot enter the restaurant. Must wait 24 hours after symptoms completely end before returning. Cough without fever isn't grounds for exclusion but a mask should be worn in food areas.",
      },
      {
        qEs: "¿Cuánto tiempo mínimo debe durar el procedimiento completo de lavado de manos?",
        qEn: "What is the minimum duration of the complete handwashing procedure?",
        opts: [
          { es: "10 segundos", en: "10 seconds", correct: false },
          { es: "20 segundos", en: "20 seconds", correct: true },
          { es: "45 segundos", en: "45 seconds", correct: false },
        ],
        explEs: "20 segundos es el estándar ServSafe: 10-15 segundos de frotado activo con jabón + tiempo de mojado y enjuague. Una forma de medir: cantando 'Happy Birthday' dos veces mientras te frotas las manos. Los 20 segundos destruyen la mayoría de los patógenos transitorios en la piel.",
        explEn: "20 seconds is the ServSafe standard: 10-15 seconds of active scrubbing with soap + wetting and rinsing time. A way to measure: singing 'Happy Birthday' twice while scrubbing. The 20 seconds destroy most transient pathogens on the skin.",
      },
    ],
  },

  // ── MODULE 5: Cross-contamination & Storage ───────────────────────────────────
  {
    id: "crosscontam",
    emoji: "🔄",
    titleEs: "Contaminación Cruzada y Almacenamiento Seguro",
    titleEn: "Cross-Contamination and Safe Storage",
    subtitleEs: "Cómo los patógenos viajan de un alimento a otro",
    subtitleEn: "How pathogens travel from one food to another",
    cards: [
      {
        emoji: "🔴",
        headEs: "¿Qué es la contaminación cruzada?",
        headEn: "What is cross-contamination?",
        bodyEs: "La transferencia de patógenos de un alimento, superficie, utensilio o persona a otro alimento seguro. Puede ocurrir: persona → alimento (manos sucias), alimento → alimento (jugo de pollo crudo toca lechuga), superficie → alimento (tabla de corte sin sanitizar), equipamiento → alimento (utensilios sin lavar entre usos).",
        bodyEn: "The transfer of pathogens from a food, surface, utensil or person to another safe food. Can occur: person → food (dirty hands), food → food (raw chicken juice contacts lettuce), surface → food (unsanitized cutting board), equipment → food (utensils not washed between uses).",
        warn: true,
      },
      {
        emoji: "🗄️",
        headEs: "Orden de almacenamiento en el Walk-In — De arriba abajo",
        headEn: "Walk-In storage order — Top to bottom",
        bodyEs: "SIEMPRE de mayor a menor temperatura de cocción requerida: 1° (arriba) RTE y productos ya cocidos. 2° Pescado entero. 3° Cortes enteros de res, cerdo, cordero. 4° Carnes molidas. 5° (abajo) Aves — pollos, pavos. Razón: si hay goteo hacia abajo, el alimento de abajo requiere mayor temperatura de cocción — lo neutraliza.",
        bodyEn: "ALWAYS from highest to lowest required cooking temperature: 1st (top) RTE and already-cooked products. 2nd Whole fish. 3rd Whole cuts of beef, pork, lamb. 4th Ground meats. 5th (bottom) Poultry — chicken, turkey. Reason: if there's drip downward, the food below requires higher cooking temperature — it neutralizes it.",
        gold: true,
        mc: true,
      },
      {
        emoji: "📅",
        headEs: "FIFO — First In, First Out",
        headEn: "FIFO — First In, First Out",
        bodyEs: "Los productos con fecha de caducidad más cercana VAN AL FRENTE. Los nuevos van atrás. Los del frente se usan primero. Pasos: 1. Revisa la fecha de todos los productos. 2. Mueve los más viejos al frente. 3. Coloca los nuevos atrás. 4. Descarta todo producto vencido inmediatamente. En McDonald's: aplica a ingredientes del Walk-In, los de la línea y los insumos de almacén.",
        bodyEn: "Products with the nearest expiration date GO IN FRONT. New ones go in the back. Front ones are used first. Steps: 1. Check dates on all products. 2. Move older ones to front. 3. Place new ones in back. 4. Immediately discard all expired products. At McDonald's: applies to Walk-In ingredients, line ingredients, and warehouse supplies.",
        mc: true,
      },
      {
        emoji: "📏",
        headEs: "Reglas de almacenamiento físico",
        headEn: "Physical storage rules",
        bodyEs: "Todo producto almacenado debe estar: Mínimo 6 pulgadas (15 cm) del piso — evita humedad y acceso de plagas. Separado de paredes — permite circulación de aire y visibilidad de plagas. En envases originales o en contenedores etiquetados con nombre y fecha. Nunca almacenar químicos con alimentos — contaminación cruzada química.",
        bodyEn: "All stored products must be: Minimum 6 inches (15 cm) from the floor — avoids moisture and pest access. Separated from walls — allows air circulation and pest visibility. In original containers or labeled containers with name and date. Never store chemicals with food — chemical cross-contamination.",
        gold: true,
      },
      {
        emoji: "🍗",
        headEs: "Contaminación cruzada en McDonald's — Los puntos críticos",
        headEn: "Cross-contamination at McDonald's — Critical points",
        bodyEs: "1. Patty cruda → superficies de ensamble (limpiar y sanitizar entre usos). 2. Pollo crudo → áreas compartidas con beef crudo (equipos separados). 3. Manos de producción de carnes → área de McCafé o ensaladas. 4. Pinzas de carne cocida usadas en carne cruda. 5. Tabla de corte sin sanitizar entre vegetales y proteínas.",
        bodyEn: "1. Raw patty → assembly surfaces (clean and sanitize between uses). 2. Raw chicken → areas shared with raw beef (separate equipment). 3. Meat production hands → McCafé or salad area. 4. Cooked meat tongs used on raw meat. 5. Cutting board not sanitized between vegetables and proteins.",
        mc: true,
        warn: true,
      },
      {
        emoji: "🏷️",
        headEs: "Etiquetado de alimentos preparados",
        headEn: "Labeling prepared foods",
        bodyEs: "Todo alimento preparado y almacenado debe etiquetarse con: Nombre del producto, Fecha de preparación, Fecha de caducidad (máximo 7 días desde preparación si se mantiene a 41°F o menos). Si no tiene etiqueta → se considera contaminado y debe descartarse. En McDonald's: aplica a salsas hechas en casa, productos marinados y mezclas preparadas.",
        bodyEn: "All prepared and stored food must be labeled with: Product name, Preparation date, Expiration date (maximum 7 days from preparation if kept at 41°F or below). If no label → considered contaminated and must be discarded. At McDonald's: applies to house-made sauces, marinated products and prepared mixes.",
        gold: true,
      },
    ],
    quiz: [
      {
        qEs: "En el Walk-In, ¿qué producto debe almacenarse en el nivel MÁS BAJO?",
        qEn: "In the Walk-In, which product must be stored at the LOWEST level?",
        opts: [
          { es: "Ensaladas y vegetales listos para servir", en: "Ready-to-serve salads and vegetables", correct: false },
          { es: "Pollos y aves enteras crudas", en: "Whole raw chickens and poultry", correct: true },
          { es: "Patties de carne molida crudas", en: "Raw ground beef patties", correct: false },
        ],
        explEs: "Las aves crudas van en el nivel más bajo porque requieren la mayor temperatura de cocción (165°F). Si hay goteo, cae hacia productos que también necesitan alta temperatura de cocción, reduciendo el riesgo. Los RTE siempre van arriba — cualquier contaminación los destruye.",
        explEn: "Raw poultry goes on the lowest level because it requires the highest cooking temperature (165°F). If there's drip, it falls toward products that also need high cooking temperature, reducing risk. RTE foods always go on top — any contamination destroys them.",
      },
      {
        qEs: "Encuentras ingredientes en el Walk-In sin etiqueta de fecha. ¿Qué haces?",
        qEn: "You find ingredients in the Walk-In without a date label. What do you do?",
        opts: [
          { es: "Usarlos — si tienen buen aspecto y olor están bien", en: "Use them — if they look and smell good they're fine", correct: false },
          { es: "Descartarlos — sin etiqueta se consideran contaminados o de fecha desconocida", en: "Discard them — without a label they're considered contaminated or of unknown date", correct: true },
          { es: "Ponerles la fecha de hoy y continuar usándolos", en: "Put today's date on them and continue using them", correct: false },
        ],
        explEs: "Los alimentos preparados sin etiqueta se descartan — no hay forma de saber cuánto tiempo llevan ahí. Ponerles la fecha de hoy sería falsificar el registro de seguridad alimentaria. La apariencia y el olor NO son indicadores confiables de seguridad — muchos patógenos no cambian apariencia ni olor del alimento.",
        explEn: "Unlabeled prepared foods are discarded — there's no way to know how long they've been there. Putting today's date on them would be falsifying food safety records. Appearance and smell are NOT reliable safety indicators — many pathogens don't change food appearance or smell.",
      },
      {
        qEs: "¿Cuál es la distancia mínima del piso para almacenar productos en el Walk-In?",
        qEn: "What is the minimum distance from the floor to store products in the Walk-In?",
        opts: [
          { es: "3 pulgadas (8 cm)", en: "3 inches (8 cm)", correct: false },
          { es: "6 pulgadas (15 cm)", en: "6 inches (15 cm)", correct: true },
          { es: "12 pulgadas (30 cm)", en: "12 inches (30 cm)", correct: false },
        ],
        explEs: "6 pulgadas (15 cm) del piso es el estándar ServSafe y FDA. Esto previene: contacto con agua de limpieza del piso, acceso de plagas a los productos, y acumulación de humedad. También facilita la limpieza del piso y la inspección visual de plagas.",
        explEn: "6 inches (15 cm) from the floor is the ServSafe and FDA standard. This prevents: contact with floor cleaning water, pest access to products, and moisture buildup. It also facilitates floor cleaning and pest visual inspection.",
      },
    ],
  },

  // ── MODULE 6: Cleaning, Sanitizing & Pests ────────────────────────────────────
  {
    id: "cleansan",
    emoji: "🧹",
    titleEs: "Limpieza, Sanitización y Control de Plagas",
    titleEn: "Cleaning, Sanitizing and Pest Control",
    subtitleEs: "Dos procesos distintos — ambos obligatorios",
    subtitleEn: "Two distinct processes — both mandatory",
    cards: [
      {
        emoji: "🆚",
        headEs: "Limpiar vs. Sanitizar — NO son lo mismo",
        headEn: "Cleaning vs. Sanitizing — NOT the same thing",
        bodyEs: "LIMPIAR: elimina suciedad visible, grasa y restos de alimento. Superficie queda visualmente limpia pero AÚN puede tener patógenos. SANITIZAR: reduce los patógenos en una superficie limpia a niveles seguros. Una superficie NO puede sanitizarse sin limpiarse primero — la suciedad bloquea el sanitizante. Orden OBLIGATORIO: Limpiar → Enjuagar → Sanitizar → Dejar secar al aire.",
        bodyEn: "CLEANING: removes visible dirt, grease and food residue. Surface looks visually clean but CAN STILL have pathogens. SANITIZING: reduces pathogens on a clean surface to safe levels. A surface CANNOT be sanitized without cleaning first — dirt blocks the sanitizer. MANDATORY order: Clean → Rinse → Sanitize → Air dry.",
        warn: true,
        gold: true,
      },
      {
        emoji: "🧪",
        headEs: "Sanitizantes químicos — Los 3 principales",
        headEn: "Chemical sanitizers — The 3 main types",
        bodyEs: "Cloro (hipoclorito): 50-100 ppm, más común y económico, efectivo en agua fría. Yodo: 12.5-25 ppm, cambia de color cuando se agota (ya no sanitiza si es incoloro). Compuestos de amonio cuaternario (Quats): 200-400 ppm, sin olor, usado en muchas superficies de MC. SIEMPRE verificar concentración con tiras reactivas antes de usar.",
        bodyEn: "Chlorine (hypochlorite): 50-100 ppm, most common and economical, effective in cold water. Iodine: 12.5-25 ppm, changes color when depleted (no longer sanitizes if colorless). Quaternary ammonium (Quats): 200-400 ppm, odorless, used on many MC surfaces. ALWAYS verify concentration with test strips before use.",
        gold: true,
        mc: true,
      },
      {
        emoji: "♨️",
        headEs: "Sanitización por calor — Agua caliente",
        headEn: "Heat sanitizing — Hot water",
        bodyEs: "El agua caliente puede sanitizar solo si alcanza 171°F/77°C mínimo. A esta temperatura, los patógenos mueren en segundos. Se usa en lavaplatos de alta temperatura. Requiere termómetro para verificar. En McDonald's: el lavaplatos industrial debe alcanzar 180°F/82°C en el ciclo de enjuague final para sanitización efectiva.",
        bodyEn: "Hot water can sanitize only if it reaches a minimum of 171°F/77°C. At this temperature, pathogens die within seconds. Used in high-temperature dishwashers. Requires thermometer to verify. At McDonald's: the industrial dishwasher must reach 180°F/82°C in the final rinse cycle for effective sanitization.",
        mc: true,
        gold: true,
      },
      {
        emoji: "📋",
        headEs: "Frecuencia de limpieza y sanitización en McDonald's",
        headEn: "Cleaning and sanitizing frequency at McDonald's",
        bodyEs: "CADA 4 HORAS: superficies de contacto con alimentos en uso continuo (tablas, utensilios, superficies de ensamble). ENTRE USOS: al cambiar de tarea o alimento diferente. AL FINAL DE TURNO: todas las superficies de contacto con alimentos. DIARIO: equipos que no se usan continuamente (rebanadoras, mezcladoras). SEMANAL: superficies de no-contacto (exterior de equipos).",
        bodyEn: "EVERY 4 HOURS: food contact surfaces in continuous use (boards, utensils, assembly surfaces). BETWEEN USES: when switching tasks or different foods. END OF SHIFT: all food contact surfaces. DAILY: equipment not in continuous use (slicers, mixers). WEEKLY: non-contact surfaces (equipment exteriors).",
        mc: true,
        gold: true,
      },
      {
        emoji: "🐀",
        headEs: "Control de plagas — Señales de alerta",
        headEn: "Pest control — Warning signs",
        bodyEs: "SEÑALES DE PLAGAS a reportar INMEDIATAMENTE al SM: Excrementos (puntos oscuros pequeños), huellas en superficies polvorientas, signos de roedura en envases o paredes, nidos de papel o fibra, insectos vivos o muertos, huevos de insectos. NO intentar manejar la plaga por tu cuenta — reportar inmediatamente. Una plaga confirmada puede resultar en cierre por la autoridad sanitaria.",
        bodyEn: "PEST SIGNS to IMMEDIATELY report to SM: Droppings (small dark dots), tracks in dusty surfaces, gnaw marks on containers or walls, paper or fiber nests, live or dead insects, insect eggs. DO NOT try to handle the pest yourself — report immediately. A confirmed pest can result in closure by health authorities.",
        warn: true,
      },
      {
        emoji: "🗑️",
        headEs: "Manejo de basura — Parte del control de plagas",
        headEn: "Trash management — Part of pest control",
        bodyEs: "Sacar la basura tan pronto como sea posible — no esperar a que se llene. NUNCA limpiar botes de basura en áreas de preparación de alimentos. Mantener tapas de basureros en su lugar. Los botes deben tener bolsa plástica. Las áreas externas de basura deben estar limpias y cerradas. La basura mal manejada es el principal atraedor de plagas en restaurantes.",
        bodyEn: "Take trash out as soon as possible — don't wait for it to fill up. NEVER clean trash cans in food prep areas. Keep lids on garbage cans. Cans must have plastic liners. External trash areas must be clean and closed. Improperly managed trash is the primary pest attractor in restaurants.",
        mc: true,
      },
    ],
    quiz: [
      {
        qEs: "¿Cuál es el orden correcto del proceso de limpieza y sanitización de una superficie?",
        qEn: "What is the correct order for cleaning and sanitizing a surface?",
        opts: [
          { es: "Sanitizar → Limpiar → Enjuagar → Secar", en: "Sanitize → Clean → Rinse → Dry", correct: false },
          { es: "Limpiar → Enjuagar → Sanitizar → Secar al aire", en: "Clean → Rinse → Sanitize → Air dry", correct: true },
          { es: "Limpiar → Sanitizar → Enjuagar → Secar", en: "Clean → Sanitize → Rinse → Dry", correct: false },
        ],
        explEs: "El orden es fijo e inamovible: 1. Limpiar (quitar suciedad). 2. Enjuagar (quitar el jabón/detergente). 3. Sanitizar (reducir patógenos). 4. Secar al aire — nunca con trapo. Invertir este orden invalida la sanitización. Secar con trapo recontamina la superficie.",
        explEn: "The order is fixed and immovable: 1. Clean (remove dirt). 2. Rinse (remove soap/detergent). 3. Sanitize (reduce pathogens). 4. Air dry — never with a cloth. Reversing this order invalidates sanitization. Drying with a cloth recontaminates the surface.",
      },
      {
        qEs: "¿Cada cuánto tiempo deben sanitizarse las superficies de contacto con alimentos en uso continuo?",
        qEn: "How often must food contact surfaces in continuous use be sanitized?",
        opts: [
          { es: "Cada 2 horas", en: "Every 2 hours", correct: false },
          { es: "Cada 4 horas", en: "Every 4 hours", correct: true },
          { es: "Solo al final del turno", en: "Only at end of shift", correct: false },
        ],
        explEs: "Cada 4 horas es el estándar ServSafe para superficies en uso continuo. Esto se alinea con la regla de las 4 horas de la Zona de Peligro — después de 4 horas los patógenos acumulados podrían estar en niveles de riesgo. El final del turno NO es suficiente para superficies de alta actividad.",
        explEn: "Every 4 hours is the ServSafe standard for surfaces in continuous use. This aligns with the 4-hour Danger Zone rule — after 4 hours accumulated pathogens could be at risk levels. End of shift is NOT sufficient for high-activity surfaces.",
      },
      {
        qEs: "Encuentras excrementos de roedor debajo de una estantería del Walk-In. ¿Cuál es la acción correcta?",
        qEn: "You find rodent droppings under a Walk-In shelf. What is the correct action?",
        opts: [
          { es: "Limpiarlos y colocar una trampa de pegamento", en: "Clean them up and place a glue trap", correct: false },
          { es: "Reportarlo inmediatamente al SM/GM y no limpiar hasta que llegue el SM", en: "Immediately report to SM/GM and don't clean until SM arrives", correct: true },
          { es: "Limpiar el área con desinfectante y no mencionarlo", en: "Clean the area with disinfectant and not mention it", correct: false },
        ],
        explEs: "Las plagas deben reportarse INMEDIATAMENTE — no manejar por cuenta propia. El SM/GM documenta el hallazgo y contacta al pest control certificado. No limpiar antes de que el SM vea la evidencia — es necesario para documentación. Ocultar una plaga viola las regulaciones sanitarias y puede resultar en pérdida de licencia.",
        explEn: "Pests must be reported IMMEDIATELY — don't handle on your own. The SM/GM documents the finding and contacts certified pest control. Don't clean before the SM sees the evidence — it's needed for documentation. Hiding a pest violates health regulations and can result in license revocation.",
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

type MainView = "home" | "learn" | "quiz" | "score";

export default function ServSafeModule({ lang, onClose }: { lang: "es" | "en"; onClose: () => void }) {
  const isEs = lang === "es";

  const [view, setView] = useState<MainView>("home");
  const [activeModId, setActiveModId] = useState<string | null>(null);
  const [doneThisWeek, setDoneThisWeek] = useState<string[]>([]);

  // quiz state
  const [cardIdx, setCardIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [learnDone, setLearnDone] = useState(false);

  useEffect(() => { setDoneThisWeek(getDoneThisWeek()); }, []);

  const activeMod = MODULES.find((m) => m.id === activeModId) ?? null;
  const allDone = doneThisWeek.length >= MODULES.length;
  const pendingCount = MODULES.length - doneThisWeek.length;

  function startModule(mod: SSModule) {
    setActiveModId(mod.id);
    setCardIdx(0);
    setQuizIdx(0);
    setChosen(null);
    setQuizCorrect(0);
    setQuizResults([]);
    setLearnDone(false);
    setView("learn");
  }

  function finishLearn() {
    setLearnDone(true);
    setView("quiz");
  }

  function pickAnswer(idx: number) {
    if (!activeMod || chosen !== null) return;
    const isCorrect = activeMod.quiz[quizIdx].opts[idx].correct;
    setChosen(idx);
    if (isCorrect) setQuizCorrect((c) => c + 1);
    setQuizResults((prev) => [...prev, isCorrect]);
  }

  function nextQuestion() {
    if (!activeMod) return;
    if (quizIdx + 1 < activeMod.quiz.length) {
      setQuizIdx((i) => i + 1);
      setChosen(null);
    } else {
      // Mark done
      markModuleDone(activeMod.id);
      setDoneThisWeek(getDoneThisWeek());
      setView("score");
    }
  }

  function goHome() {
    setView("home");
    setActiveModId(null);
  }

  // ── Learn view ────────────────────────────────────────────────────────────────
  if (view === "learn" && activeMod) {
    const card = activeMod.cards[cardIdx];
    const isLast = cardIdx === activeMod.cards.length - 1;
    return (
      <div className="flex flex-col h-full">
        <SSTopBar title={isEs ? activeMod.titleEs : activeMod.titleEn} onBack={goHome} onClose={onClose} />

        {/* Progress bar */}
        <div className="px-3 pt-2 pb-1 bg-surface shrink-0">
          <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1">
            <span>{isEs ? "Contenido" : "Content"} {cardIdx + 1}/{activeMod.cards.length}</span>
            <span className="text-gold">{isEs ? "Quiz a continuación" : "Quiz follows"}</span>
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${((cardIdx + 1) / activeMod.cards.length) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-4">
          {/* Card */}
          <div className={`rounded-2xl p-4 border ${
            card.warn ? "bg-red-950/30 border-red-500/20" :
            card.mc ? "bg-gold/5 border-gold/20" :
            card.gold ? "bg-surface border-white/10" :
            "bg-card border-white/5"
          }`}>
            <p className="text-3xl mb-2">{card.emoji}</p>
            <p className={`text-sm font-black mb-2 ${card.warn ? "text-red-400" : card.gold || card.mc ? "text-gold" : "text-cream"}`}>
              {isEs ? card.headEs : card.headEn}
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              {isEs ? card.bodyEs : card.bodyEn}
            </p>
            {card.mc && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-[9px] font-black bg-gold/20 text-gold px-2 py-0.5 rounded-full">McDonald&apos;s</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="flex gap-2 mt-1">
            {cardIdx > 0 && (
              <button onClick={() => setCardIdx((i) => i - 1)}
                className="flex-1 bg-card rounded-2xl py-3 text-sm font-black text-white/50 active:opacity-80">
                ‹ {isEs ? "Anterior" : "Previous"}
              </button>
            )}
            {!isLast ? (
              <button onClick={() => setCardIdx((i) => i + 1)}
                className="flex-1 bg-gold rounded-2xl py-3 text-sm font-black text-onyx active:opacity-80">
                {isEs ? "Siguiente" : "Next"} ›
              </button>
            ) : (
              <button onClick={finishLearn}
                className="flex-1 bg-gold rounded-2xl py-3 text-sm font-black text-onyx active:opacity-80">
                {isEs ? "Ir al Quiz ›" : "Go to Quiz ›"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz view ─────────────────────────────────────────────────────────────────
  if (view === "quiz" && activeMod) {
    const q = activeMod.quiz[quizIdx];
    return (
      <div className="flex flex-col h-full">
        <SSTopBar title={`Quiz — ${isEs ? activeMod.titleEs : activeMod.titleEn}`} onBack={goHome} onClose={onClose} />

        <div className="px-3 pt-2 pb-1 bg-surface shrink-0">
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${((quizIdx) / activeMod.quiz.length) * 100}%` }} />
          </div>
          <p className="text-[10px] text-white/40 mt-1">{quizIdx + 1}/{activeMod.quiz.length}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-8">
          <div className="bg-card rounded-2xl p-4 border border-white/10">
            <p className="text-sm font-black text-cream leading-snug">{isEs ? q.qEs : q.qEn}</p>
          </div>

          {q.opts.map((opt, i) => {
            const isChosen = chosen === i;
            const revealed = chosen !== null;
            const correct = opt.correct;
            const bg = !revealed
              ? "bg-card active:scale-[0.98]"
              : isChosen && correct ? "bg-emerald-950/40 border border-emerald-500/30"
              : isChosen && !correct ? "bg-red-950/40 border border-red-500/30"
              : correct ? "bg-emerald-950/20 border border-emerald-500/20"
              : "bg-card opacity-40";
            return (
              <button key={i} onClick={() => pickAnswer(i)}
                className={`rounded-2xl p-4 text-left transition-all ${bg}`}>
                <p className="text-xs text-cream leading-relaxed">{isEs ? opt.es : opt.en}</p>
                {revealed && isChosen && (
                  <p className={`text-[10px] font-bold mt-2 ${correct ? "text-emerald-400" : "text-red-400"}`}>
                    {correct ? "✅ " : "❌ "}{isEs ? q.explEs : q.explEn}
                  </p>
                )}
              </button>
            );
          })}

          {/* Show explanation for correct answer if wrong */}
          {chosen !== null && !q.opts[chosen].correct && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-3">
              <p className="text-[10px] font-black text-emerald-400 mb-1">{isEs ? "Respuesta correcta:" : "Correct answer:"}</p>
              <p className="text-[10px] text-white/60 leading-relaxed">{isEs ? q.explEs : q.explEn}</p>
            </div>
          )}

          {chosen !== null && (
            <button onClick={nextQuestion}
              className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx active:opacity-80">
              {quizIdx + 1 < activeMod.quiz.length ? (isEs ? "Siguiente Pregunta ›" : "Next Question ›") : (isEs ? "Ver Resultado" : "See Result")}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Score view ────────────────────────────────────────────────────────────────
  if (view === "score" && activeMod) {
    const pct = Math.round((quizCorrect / activeMod.quiz.length) * 100);
    const passed = pct >= 67;
    return (
      <div className="flex flex-col h-full">
        <SSTopBar title={isEs ? "Módulo Completado" : "Module Completed"} onBack={null} onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-8">
          <div className={`rounded-2xl p-5 text-center border ${passed ? "bg-emerald-950/20 border-emerald-500/20" : "bg-amber-950/20 border-amber-500/20"}`}>
            <p className="text-5xl mb-2">{passed ? "✅" : "📚"}</p>
            <p className={`text-4xl font-black ${passed ? "text-emerald-400" : "text-amber-400"}`}>{pct}%</p>
            <p className="text-sm font-black text-cream mt-1">
              {quizCorrect}/{activeMod.quiz.length} {isEs ? "correctas" : "correct"}
            </p>
            <p className="text-[11px] text-white/40 mt-2">
              {passed
                ? (isEs ? "Módulo acreditado para esta semana." : "Module credited for this week.")
                : (isEs ? "Buen intento. Revisa el contenido y refuerza estos conceptos." : "Good attempt. Review the content and reinforce these concepts.")}
            </p>
          </div>

          <div className="bg-card rounded-2xl p-4">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
              {isEs ? "Tu progreso semanal" : "Your weekly progress"}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {MODULES.map((m) => (
                <div key={m.id} className={`rounded-xl p-2 text-center ${doneThisWeek.includes(m.id) ? "bg-emerald-950/30 border border-emerald-500/20" : "bg-white/5"}`}>
                  <p className="text-lg">{m.emoji}</p>
                  <p className={`text-[8px] font-bold leading-tight mt-0.5 ${doneThisWeek.includes(m.id) ? "text-emerald-400" : "text-white/30"}`}>
                    {doneThisWeek.includes(m.id) ? "✓" : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={goHome}
            className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx active:opacity-80">
            {isEs ? "Volver al Menú ServSafe" : "Back to ServSafe Menu"}
          </button>
        </div>
      </div>
    );
  }

  // ── Home view ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <SSTopBar title="ServSafe 2026" onBack={null} onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-8">

        {/* Weekly status banner */}
        <div className={`rounded-2xl p-4 border ${allDone ? "bg-emerald-950/20 border-emerald-500/20" : "bg-red-950/30 border-red-500/30"}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{allDone ? "✅" : "🔴"}</span>
            <div className="flex-1">
              <p className={`text-sm font-black ${allDone ? "text-emerald-400" : "text-red-400"}`}>
                {allDone
                  ? (isEs ? "Semana completada — ¡Bien hecho!" : "Week completed — Well done!")
                  : (isEs ? `OBLIGATORIO — ${pendingCount} módulo(s) pendiente(s) esta semana` : `MANDATORY — ${pendingCount} module(s) pending this week`)}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                {isEs
                  ? "Retroalimentación semanal obligatoria ServSafe 7ª Ed. (2025-2026). Semana: " + getWeekKey()
                  : "Mandatory weekly ServSafe refresher 7th Ed. (2025-2026). Week: " + getWeekKey()}
              </p>
            </div>
          </div>
          {/* Progress dots */}
          <div className="flex gap-2 mt-3">
            {MODULES.map((m) => (
              <div key={m.id} className={`flex-1 h-1.5 rounded-full ${doneThisWeek.includes(m.id) ? "bg-emerald-500" : "bg-white/20"}`} />
            ))}
          </div>
          <p className="text-[10px] text-white/30 mt-1">{doneThisWeek.length}/{MODULES.length} {isEs ? "completados" : "completed"}</p>
        </div>

        {/* Context card */}
        <div className="bg-card rounded-2xl p-4 border border-gold/20">
          <p className="text-[10px] font-black text-gold/60 uppercase tracking-widest mb-1">
            {isEs ? "¿Por qué importa?" : "Why does it matter?"}
          </p>
          <p className="text-xs text-white/60 leading-relaxed">
            {isEs
              ? "En 2024, los brotes de enfermedades transmitidas por alimentos causaron más de 48 millones de casos en EE.UU. La mayoría son prevenibles con práctica correcta. En McDonald's, una sola queja de enfermedad alimentaria activa una auditoría regulatoria inmediata. El conocimiento ServSafe es tu herramienta de protección — y la de tus clientes."
              : "In 2024, foodborne illness outbreaks caused over 48 million cases in the U.S. Most are preventable with correct practice. At McDonald's, a single foodborne illness complaint triggers an immediate regulatory audit. ServSafe knowledge is your protection tool — and your customers'."}
          </p>
        </div>

        {/* Modules */}
        <div className="flex flex-col gap-2">
          {MODULES.map((mod) => {
            const done = doneThisWeek.includes(mod.id);
            return (
              <button key={mod.id} onClick={() => startModule(mod)}
                className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left">
                <span className="text-3xl leading-none shrink-0">{mod.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-cream truncate">{isEs ? mod.titleEs : mod.titleEn}</p>
                    {done ? (
                      <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full shrink-0">✓ {isEs ? "Listo" : "Done"}</span>
                    ) : (
                      <span className="text-[9px] font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full shrink-0">{isEs ? "Pendiente" : "Pending"}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 mt-0.5 leading-snug">{isEs ? mod.subtitleEs : mod.subtitleEn}</p>
                  <p className="text-[9px] text-white/25 mt-1">{mod.cards.length} {isEs ? "conceptos" : "concepts"} · {mod.quiz.length} {isEs ? "preguntas" : "questions"}</p>
                </div>
                <span className="text-white/30 text-lg shrink-0">›</span>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-white/30 leading-relaxed">
            {isEs
              ? "Basado en ServSafe Manager 7ª Edición (2025-2026) · ANSI/CFP certificado · NRA Educational Foundation"
              : "Based on ServSafe Manager 7th Edition (2025-2026) · ANSI/CFP certified · NRA Educational Foundation"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SSTopBar({ title, onBack, onClose }: { title: string; onBack: (() => void) | null; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-white/10 shrink-0">
      {onBack && (
        <button onClick={onBack} className="text-white/60 text-xl leading-none active:opacity-60 shrink-0">‹</button>
      )}
      <p className="flex-1 text-sm font-black text-cream truncate">{title}</p>
      <button onClick={onClose} className="text-white/40 text-xl leading-none active:opacity-60 shrink-0">✕</button>
    </div>
  );
}
