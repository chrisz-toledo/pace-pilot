/**
 * offline.ts — Rule-based 5S engine + report generation
 * Works without any API key. Used as fallback when Gemini is unavailable.
 */
import type {
  FiveSDiagnosis,
  FiveSStep,
  FrictionEvent,
  FrictionType,
  PACEReport,
  BottleneckSummary,
  Station,
  Urgency,
} from "./types";

type RuleKey = `${FrictionType}:${Station}`;

const RULES: Partial<Record<RuleKey, FiveSDiagnosis>> = {
  "STOCK_OUT:UHC": {
    failing_step: "Seiton",
    rationale:
      "La gaveta UHC no tiene nivel mínimo visual ni sistema kanban. Seiton exige un lugar para cada item y un indicador de nivel crítico visible.",
    recommended_action:
      "Implementar tarjeta kanban roja para disparar reorden a 6 unidades en el gabinete afectado.",
    urgency: "IMMEDIATE",
    confidence: 0.88,
  },
  "STOCK_OUT:KITCHEN": {
    failing_step: "Seiton",
    rationale:
      "Insumos agotados en cocina indican ausencia de gestión visual de niveles mínimos.",
    recommended_action:
      "Definir nivel mínimo con etiqueta de color en cada contenedor clave; asignar responsable de reposición por turno.",
    urgency: "IMMEDIATE",
    confidence: 0.82,
  },
  "DISORDER:BOC": {
    failing_step: "Seiri",
    rationale:
      "Items innecesarios ocupan espacio activo en la línea de ensamblaje. Seiri exige que solo lo necesario esté presente.",
    recommended_action:
      "Sort de 5 min al inicio del siguiente turno; retirar todo item sin etiqueta de fecha.",
    urgency: "NEXT_SHIFT",
    confidence: 0.85,
  },
  "DISORDER:FRONT_COUNTER": {
    failing_step: "Seiri",
    rationale:
      "Desorden en front counter transmite desorganización al cliente. Seiri exige solo lo esencial visible.",
    recommended_action:
      "Clasificar y retirar items no esenciales del mostrador; checklist visual al inicio de turno.",
    urgency: "NEXT_SHIFT",
    confidence: 0.8,
  },
  "WAIT_TIME:DT_WINDOW": {
    failing_step: "Shitsuke",
    rationale:
      "SOS fuera de estándar en DT indica que los protocolos de posicionamiento no se mantienen bajo presión de peak hour. Shitsuke falla cuando la disciplina se rompe bajo carga.",
    recommended_action:
      "Briefing inmediato de posicionamiento en ventana; reforzar el rol del expedidor.",
    urgency: "IMMEDIATE",
    confidence: 0.92,
  },
  "WAIT_TIME:FRONT_COUNTER": {
    failing_step: "Shitsuke",
    rationale:
      "Tiempos elevados en FC señalan breakdown en disciplina de posicionamiento.",
    recommended_action:
      "Asignar líder de posición en FC; sprint de 15 min de SOS recovery.",
    urgency: "IMMEDIATE",
    confidence: 0.87,
  },
  "EQUIPMENT_FAILURE:KITCHEN": {
    failing_step: "Seiso",
    rationale:
      "Falla de equipo en cocina indica que la limpieza como inspección no se ejecuta. Seiso: limpiar es inspeccionar.",
    recommended_action:
      "Agregar equipo al checklist diario de Seiso; programar mantenimiento preventivo en 7 días.",
    urgency: "NEXT_SHIFT",
    confidence: 0.86,
  },
  "EQUIPMENT_FAILURE:GRILL": {
    failing_step: "Seiso",
    rationale:
      "La parrilla es crítica para producción. Una falla indica que el ciclo de Seiso no detectó el desgaste a tiempo.",
    recommended_action:
      "Inspección visual inmediata; escalar a mantenimiento. Revisar frecuencia de limpieza profunda.",
    urgency: "IMMEDIATE",
    confidence: 0.84,
  },
  "PROCEDURE_DEVIATION:FRONT_COUNTER": {
    failing_step: "Seiketsu",
    rationale:
      "Falta de uniformidad en presentación indica ausencia de estándar visual en el punto de entrega. Seiketsu requiere Gold Standard visible para todo el crew.",
    recommended_action:
      "Instalar fotografía Gold Standard build en estación FC; reforzar en pre-turno.",
    urgency: "SCHEDULED",
    confidence: 0.83,
  },
  "PROCEDURE_DEVIATION:KITCHEN": {
    failing_step: "Seiketsu",
    rationale:
      "Desviaciones de SOP en cocina indican que los estándares no están suficientemente visibles.",
    recommended_action:
      "Actualizar SOPs visuales en la estación; sesión de refresher en el próximo turno.",
    urgency: "NEXT_SHIFT",
    confidence: 0.79,
  },
};

const FALLBACK: FiveSDiagnosis = {
  failing_step: "Shitsuke",
  rationale:
    "No se encontró regla específica para este evento. La mayoría de desviaciones operativas tienen raíz en falta de disciplina.",
  recommended_action:
    "Revisar manualmente con el supervisor de turno y asignar el paso 5S correspondiente.",
  urgency: "NEXT_SHIFT",
  confidence: 0.5,
};

export function ruleBasedDiagnosis(event: {
  event_type: FrictionType;
  station: Station;
}): FiveSDiagnosis {
  const key: RuleKey = `${event.event_type}:${event.station}`;
  return RULES[key] ?? FALLBACK;
}

// ─── Report generation ────────────────────────────────────────────────────────

export function computeReport(events: FrictionEvent[]): PACEReport {
  if (!events.length) return emptyReport();

  const unresolved = events.filter((e) => !e.resolved);

  // 5S breakdown
  const five_s_breakdown: Record<FiveSStep, number> = {
    Seiri: 0, Seiton: 0, Seiso: 0, Seiketsu: 0, Shitsuke: 0,
  };
  for (const ev of events) {
    if (ev.five_s_diagnosis) {
      five_s_breakdown[ev.five_s_diagnosis.failing_step]++;
    }
  }

  const primary_5s_failure = (
    Object.entries(five_s_breakdown).sort((a, b) => b[1] - a[1])[0][0]
  ) as FiveSStep;

  // Peak window
  const hourCounts: Record<number, number> = {};
  for (const ev of events) {
    const h = new Date(ev.timestamp).getHours();
    hourCounts[h] = (hourCounts[h] ?? 0) + 1;
  }
  const peakHour = parseInt(
    Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "12"
  );
  const peak_window = `${String(peakHour).padStart(2, "0")}:00–${String((peakHour + 1) % 24).padStart(2, "0")}:00`;

  // Bottlenecks
  const byStation: Record<string, FrictionEvent[]> = {};
  for (const ev of events) {
    (byStation[ev.station] ??= []).push(ev);
  }
  const bottlenecks: BottleneckSummary[] = Object.entries(byStation)
    .map(([station, evs]) => ({
      station,
      event_count: evs.length,
      avg_severity: parseFloat((evs.reduce((s, e) => s + e.severity, 0) / evs.length).toFixed(1)),
      total_impact_minutes: parseFloat(evs.reduce((s, e) => s + e.service_impact_minutes, 0).toFixed(2)),
    }))
    .sort((a, b) => b.total_impact_minutes - a.total_impact_minutes);

  // Service time impact
  const dt_impact_minutes = parseFloat(
    events.filter((e) => e.station === "DT_WINDOW").reduce((s, e) => s + e.service_impact_minutes, 0).toFixed(2)
  );
  const fc_impact_minutes = parseFloat(
    events.filter((e) => e.station === "FRONT_COUNTER").reduce((s, e) => s + e.service_impact_minutes, 0).toFixed(2)
  );

  // Top 3 recommendations ordered by urgency + impact
  const urgencyOrder: Record<Urgency, number> = { IMMEDIATE: 0, NEXT_SHIFT: 1, SCHEDULED: 2 };
  const sorted = [...events]
    .filter((e) => e.five_s_diagnosis)
    .sort(
      (a, b) =>
        urgencyOrder[a.five_s_diagnosis!.urgency] - urgencyOrder[b.five_s_diagnosis!.urgency] ||
        b.service_impact_minutes - a.service_impact_minutes
    );
  const seen = new Set<string>();
  const recommendations: string[] = [];
  for (const ev of sorted) {
    const action = ev.five_s_diagnosis!.recommended_action;
    if (!seen.has(action)) { seen.add(action); recommendations.push(action); }
    if (recommendations.length === 3) break;
  }
  while (recommendations.length < 3) {
    recommendations.push("Mantener estándares actuales y monitorear en el próximo turno.");
  }

  const totalImpact = events.reduce((s, e) => s + e.service_impact_minutes, 0);
  const avgSev = events.reduce((s, e) => s + e.severity, 0) / events.length;
  const risk = avgSev >= 4 ? "CRÍTICO" : avgSev >= 3 ? "ALTO" : "MEDIO";
  const topStation = bottlenecks[0]?.station ?? "N/A";
  const executive_summary =
    `Se registraron ${events.length} eventos de fricción con un impacto acumulado de ${totalImpact.toFixed(1)} min. ` +
    `La estación más afectada fue ${topStation}. Falla 5S primaria: ${primary_5s_failure} ` +
    `(${five_s_breakdown[primary_5s_failure]} eventos). Riesgo operativo: ${risk}.`;

  return {
    generated_at: new Date().toISOString(),
    total_events: events.length,
    unresolved_events: unresolved.length,
    peak_window,
    primary_5s_failure,
    bottlenecks,
    five_s_breakdown,
    dt_impact_minutes,
    fc_impact_minutes,
    recommendations,
    executive_summary,
  };
}

function emptyReport(): PACEReport {
  return {
    generated_at: new Date().toISOString(),
    total_events: 0,
    unresolved_events: 0,
    peak_window: "N/A",
    primary_5s_failure: "Shitsuke",
    bottlenecks: [],
    five_s_breakdown: { Seiri: 0, Seiton: 0, Seiso: 0, Seiketsu: 0, Shitsuke: 0 },
    dt_impact_minutes: 0,
    fc_impact_minutes: 0,
    recommendations: [
      "No hay eventos registrados. Usa + para registrar el primero.",
      "Ejecuta el seed de datos de prueba desde el menú.",
      "Consulta el manual PQRG para referencia de estándares.",
    ],
    executive_summary: "No se han registrado eventos de fricción en el período analizado.",
  };
}
