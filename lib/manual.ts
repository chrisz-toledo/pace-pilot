// lib/manual.ts — PACE-Pilot Station Manual Bridge (server-side)
// Provides per-station 5S procedure lines to inject into LLM prompts.
// Mirrors manual_manager.py from the Python CLI.

import type { Lang } from "./locales";
import type { FrictionType, Station } from "./types";

type ManualIndex = Record<string, Record<string, string[]>>;

const BUILTIN: Record<Lang, ManualIndex> = {
  es: {
    UHC: {
      Seiri: [
        "Retira del UHC cualquier producto cuyo tiempo de mantenimiento haya expirado.",
        "Solo debe estar en el UHC el producto que será despachado en el próximo ciclo.",
      ],
      Seiton: [
        "Carne 10:1: gabinete UHC_GRID_A, máx. 15 min a 155 °F.",
        "Carne 4:1: gabinete UHC_GRID_B, máx. 20 min a 165 °F.",
        "Nuggets y McChicken: UHC_GRID_C, máx. 20 min a 165 °F.",
        "Etiqueta cada bandeja con hora de cocción; reemplaza inmediatamente al vencer.",
      ],
      Seiso: [
        "Limpia los rieles del UHC con paño húmedo al inicio y al final de cada turno.",
        "Inspecciona la tira calefactora: si hay residuos carbonizados, reporta para mantenimiento.",
      ],
      Seiketsu: [
        "Usa el mapa visual de slots para que cualquier tripulante identifique la posición correcta.",
        "Coloca el Gold Standard Build visible en la estación como referencia de ensamblaje.",
      ],
      Shitsuke: [
        "Durante el rush, el MIT asigna a un tripulante exclusivo al monitoreo del UHC.",
        "Si el holding time es crítico, descarta inmediatamente aunque el producto 'se vea bien'.",
      ],
    },
    BOC: {
      Seiri: [
        "Clasifica las envolturas por categoría (burgers, wraps, desayuno).",
        "Solo los insumos del turno activo deben estar en el área de ensamblaje.",
      ],
      Seiton: [
        "Envolturas de hamburguesas: compartimento izquierdo, apertura hacia el ensamblador.",
        "Salsas en contenedores sellados: zona central, ordenados por tipo.",
        "Bandejas y cajas de nuggets: compartimento derecho, altura de fácil acceso.",
      ],
      Seiso: [
        "Limpia la superficie de ensamblaje con solución sanitizante cada hora.",
        "Los dispensadores de salsa deben limpiarse al final de cada daypart.",
      ],
      Seiketsu: [
        "Sigue la secuencia PQRG sin variaciones: Crown → ingredientes → Heel.",
        "Ketchup 1/3 oz, Mostaza 1/10 oz, Big Mac Sauce 1/3 oz — pesos estándar.",
      ],
      Shitsuke: [
        "En rush, el ensamblador no debe abandonar el BOC; otro tripulante repone insumos.",
        "El supervisor valida aleatoriamente 3 builds por hora durante peak.",
      ],
    },
    DT_WINDOW: {
      Seiri: [
        "Retira bolsas de pedidos anteriores, recibos impresos y materiales obsoletos de la ventana.",
      ],
      Seiton: [
        "Bolsas DT organizadas por tamaño (S/M/L) a la izquierda de la ventana.",
        "Terminal POS y headset: cargados y en posición antes del inicio del turno.",
      ],
      Seiso: [
        "Limpia el vidrio de la ventana DT al inicio del turno y en cada cambio de daypart.",
      ],
      Seiketsu: [
        "SOS objetivo: ≤ 180 segundos desde pedido hasta entrega.",
        "Si el SOS supera 90 seg en cocina, el MIT activa protocolo de refuerzo de línea.",
      ],
      Shitsuke: [
        "Durante rush, el MIT monitorea el timer SOS cada 5 minutos.",
        "Si la fila DT supera 4 autos, activa el segundo carril o refuerza el mostrador.",
      ],
    },
    KITCHEN: {
      Seiri: [
        "Solo la carne y el aceite del ciclo activo deben estar en la freidora/plancha.",
        "Retira utensilios quemados, espátulas deformadas o pinzas dañadas.",
      ],
      Seiton: [
        "Plancha: carnes 4:1 en sección izquierda, 10:1 en sección derecha.",
        "Termómetro y Waste Log siempre en el gancho designado junto a la plancha.",
      ],
      Seiso: [
        "Raspa la plancha cada 30 minutos durante operación activa.",
        "Filtra el aceite de freidora según el ciclo de calidad (mínimo cada turno de 8 h).",
        "Temperatura interna: Res 155 °F (69 °C), Pollo 165 °F (74 °C).",
      ],
      Seiketsu: [
        "No improvises tiempos de fritura; sigue el temporizador de freidora.",
        "Si el equipo no alcanza temperatura en 10 min, reporta falla y activa protocolo de respaldo.",
      ],
      Shitsuke: [
        "El MIT verifica la temperatura del aceite antes del rush de mediodía.",
        "La plancha debe rasparse aunque haya fila — la limpieza es no negociable.",
      ],
    },
    FRONT_COUNTER: {
      Seiri: [
        "Retira del mostrador materiales de promociones pasadas y menús desactualizados.",
      ],
      Seiton: [
        "Vasos alineados por tamaño de izquierda a derecha: Small → Medium → Large → XL.",
        "Cajita Feliz y cajas de nuggets en compartimento derecho del mostrador.",
      ],
      Seiso: [
        "Limpia la superficie del mostrador con solución sanitizante cada 20 minutos.",
        "Revisa el kiosco: pantalla limpia, sin huellas, recibos descartados.",
      ],
      Seiketsu: [
        "FC objetivo: ≤ 90 segundos desde pedido hasta entrega.",
        "Presentación de bandeja sigue el Gold Standard: bebida, papas, burger, postre.",
      ],
      Shitsuke: [
        "En rush, el MIT asigna roles fijos: 1 en caja, 1 en bebidas, 1 en entrega.",
        "Si hay fila de más de 5 clientes, activa caja adicional inmediatamente.",
      ],
    },
  },
  en: {
    UHC: {
      Seiri: [
        "Remove any product from the UHC whose holding time has expired.",
        "Only the product to be dispatched in the next cycle should be in the UHC.",
      ],
      Seiton: [
        "10:1 Beef: UHC_GRID_A, max 15 min at 155°F.",
        "4:1 Beef: UHC_GRID_B, max 20 min at 165°F.",
        "Nuggets and McChicken: UHC_GRID_C, max 20 min at 165°F.",
        "Label each tray with cook time; replace immediately upon expiry.",
      ],
      Seiso: [
        "Wipe UHC rails with damp cloth at start and end of each shift.",
        "Inspect heating element: if there is carbonized residue, report for maintenance.",
      ],
      Seiketsu: [
        "Use the visual slot map so any crew member can identify the correct position.",
        "Display the Gold Standard Build visibly at the station.",
      ],
      Shitsuke: [
        "During rush, the MIT assigns a dedicated crew member to UHC monitoring.",
        "If holding time is critical, discard immediately even if product 'looks fine'.",
      ],
    },
    BOC: {
      Seiri: [
        "Sort product wrappers by category (burgers, wraps, breakfast).",
        "Only current-shift supplies should be at the assembly area.",
      ],
      Seiton: [
        "Burger wrappers: left compartment, opening facing the assembler.",
        "Sauces in sealed containers: center zone, sorted by type.",
      ],
      Seiso: [
        "Clean the assembly surface with sanitizer solution every hour.",
        "Sauce dispensers must be cleaned at the end of each daypart.",
      ],
      Seiketsu: [
        "Follow the PQRG build sequence: Crown → ingredients → Heel.",
        "Ketchup 1/3 oz, Mustard 1/10 oz, Big Mac Sauce 1/3 oz — standard weights.",
      ],
      Shitsuke: [
        "During rush, the assembler must not leave the BOC; another crew member restocks.",
        "The area supervisor randomly validates 3 builds per hour during peak.",
      ],
    },
    DT_WINDOW: {
      Seiri: [
        "Remove previous-order bags, printed receipts, and obsolete materials from the window.",
      ],
      Seiton: [
        "DT bags: organized by size (S/M/L) to the left of the window.",
        "POS terminal and headset: charged and positioned before shift start.",
      ],
      Seiso: [
        "Clean the DT window glass at shift start and at each daypart change.",
      ],
      Seiketsu: [
        "SOS target: ≤ 180 seconds from order to delivery.",
        "If SOS exceeds 90 sec in kitchen, MIT activates line reinforcement protocol.",
      ],
      Shitsuke: [
        "During rush, the MIT monitors the SOS timer every 5 minutes.",
        "If the DT queue exceeds 4 cars, activate the second lane or reinforce the counter.",
      ],
    },
    KITCHEN: {
      Seiri: [
        "Only the meat and oil for the active cycle should be at the fryer/grill.",
        "Remove burned utensils, deformed spatulas, or damaged tongs.",
      ],
      Seiton: [
        "Grill: 4:1 patties on left section, 10:1 patties on right section.",
        "Thermometer and Waste Log always hung on designated hook next to the grill.",
      ],
      Seiso: [
        "Scrape the grill every 30 minutes during active operation.",
        "Filter fryer oil per quality cycle (minimum each 8-hour shift).",
        "Internal cook temp: Beef 155°F (69°C), Chicken 165°F (74°C).",
      ],
      Seiketsu: [
        "Do not improvise fry times; follow the fryer timer.",
        "If equipment does not reach temperature within 10 min, report failure and activate backup protocol.",
      ],
      Shitsuke: [
        "The MIT checks oil temperature before the lunch rush.",
        "The grill must be scraped even when there is a queue — cleaning is non-negotiable.",
      ],
    },
    FRONT_COUNTER: {
      Seiri: [
        "Remove past-promotion materials and outdated menus from the counter.",
      ],
      Seiton: [
        "Cups aligned by size left to right: Small → Medium → Large → XL.",
        "Happy Meal boxes and nugget boxes in right counter compartment.",
      ],
      Seiso: [
        "Clean the counter surface with sanitizer solution every 20 minutes.",
        "Check the kiosk: clean screen, no fingerprints, receipts discarded.",
      ],
      Seiketsu: [
        "FC target: ≤ 90 seconds from order to delivery.",
        "Tray presentation follows Gold Standard: drink, fries, burger, dessert.",
      ],
      Shitsuke: [
        "During rush, the MIT assigns fixed roles: 1 on register, 1 on drinks, 1 on delivery.",
        "If there are more than 5 customers in line, activate an additional register immediately.",
      ],
    },
  },
};

const FRICTION_TO_STEP: Record<FrictionType, string> = {
  STOCK_OUT: "Seiton",
  DISORDER: "Seiri",
  WAIT_TIME: "Shitsuke",
  EQUIPMENT_FAILURE: "Seiso",
  PROCEDURE_DEVIATION: "Seiketsu",
};

const FIVE_S_DEFS_ES: Record<string, string> = {
  Seiri: "Seiri (Clasificar): retirar todo elemento innecesario de la estación",
  Seiton: "Seiton (Ordenar): cada item en su lugar designado con gestión visual activa",
  Seiso: "Seiso (Limpiar): la limpieza es inspección; equipo limpio revela fallas antes de que sean crisis",
  Seiketsu: "Seiketsu (Estandarizar): procedimientos visuales consistentes; Gold Standard visible y seguido",
  Shitsuke: "Shitsuke (Sostener): disciplina bajo presión; los estándares existen pero no se mantienen en peak hour",
};

const FIVE_S_DEFS_EN: Record<string, string> = {
  Seiri: "Seiri (Sort): remove all unnecessary items from the station",
  Seiton: "Seiton (Set in Order): every item in its designated place with active visual management",
  Seiso: "Seiso (Shine): cleaning is inspection; clean equipment reveals faults before they become crises",
  Seiketsu: "Seiketsu (Standardize): consistent visual procedures; Gold Standard visible and followed",
  Shitsuke: "Shitsuke (Sustain): discipline under pressure; standards exist but are not maintained during peak hour",
};

export function buildFullContext(
  station: Station,
  frictionType: FrictionType,
  lang: Lang = "es",
  maxLines = 4
): string {
  const step = FRICTION_TO_STEP[frictionType] ?? "Shitsuke";
  const index = BUILTIN[lang];
  const lines = (index[station]?.[step] ?? []).slice(0, maxLines);
  const defs = lang === "es" ? FIVE_S_DEFS_ES : FIVE_S_DEFS_EN;
  const stepDef = defs[step] ?? step;

  const manualBlock =
    lines.length > 0
      ? lines.map((l) => `  • ${l}`).join("\n")
      : lang === "es"
      ? "  (sin procedimiento específico registrado)"
      : "  (no specific procedure on record)";

  const header = lang === "es"
    ? `[Manual — Estación ${station} | ${step}]\n${manualBlock}\n\nDefinición aplicable: ${stepDef}`
    : `[Manual — Station ${station} | ${step}]\n${manualBlock}\n\nApplicable definition: ${stepDef}`;

  return header;
}

export function getFiveSDefsBlock(lang: Lang): string {
  const defs = lang === "es" ? FIVE_S_DEFS_ES : FIVE_S_DEFS_EN;
  return Object.values(defs).map((d) => `  - ${d}`).join("\n");
}
