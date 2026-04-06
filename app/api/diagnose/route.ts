import { NextRequest, NextResponse } from "next/server";
import { ruleBasedDiagnosis } from "@/lib/offline";
import type { FrictionType, Station } from "@/lib/types";

export const runtime = "nodejs";

const FIVE_S_DEFS = `
- Seiri (Clasificar): retirar todo elemento innecesario de la estación
- Seiton (Ordenar): cada item en su lugar designado con gestión visual activa
- Seiso (Limpiar): la limpieza es inspección; equipo limpio revela fallas antes de que sean crisis
- Seiketsu (Estandarizar): procedimientos visuales consistentes; Gold Standard visible y seguido
- Shitsuke (Sostener): disciplina bajo presión; los estándares existen pero no se mantienen en peak hour
`;

function buildPrompt(event: { station: string; event_type: string; description: string; severity: number; reporter_role: string; service_impact_minutes: number }) {
  return `Eres Gemstone-Core, el motor de diagnóstico 5S del sistema PACE-Pilot para McDonald's.

Metodología 5S:
${FIVE_S_DEFS}

Evento de fricción:
- Estación: ${event.station}
- Tipo: ${event.event_type}
- Descripción: ${event.description}
- Severidad: ${event.severity}/5
- Reportado por: ${event.reporter_role}
- Impacto: ${event.service_impact_minutes} minutos

Responde ÚNICAMENTE con este JSON exacto (sin texto adicional):
{
  "failing_step": "<Seiri|Seiton|Seiso|Seiketsu|Shitsuke>",
  "rationale": "<2-3 oraciones explicando por qué ESTE paso 5S está fallando>",
  "recommended_action": "<acción correctiva específica para el próximo turno>",
  "urgency": "<IMMEDIATE|NEXT_SHIFT|SCHEDULED>",
  "confidence": <número 0.0-1.0>
}`;
}

export async function POST(req: NextRequest) {
  const event = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      ruleBasedDiagnosis({ event_type: event.event_type as FrictionType, station: event.station as Station })
    );
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(buildPrompt(event));
    const text = result.response.text().trim();
    const parsed = JSON.parse(text);

    // Validate required fields
    const VALID_STEPS = ["Seiri", "Seiton", "Seiso", "Seiketsu", "Shitsuke"];
    const VALID_URGENCY = ["IMMEDIATE", "NEXT_SHIFT", "SCHEDULED"];
    if (!VALID_STEPS.includes(parsed.failing_step) || !VALID_URGENCY.includes(parsed.urgency)) {
      throw new Error("Invalid LLM response shape");
    }

    return NextResponse.json(parsed);
  } catch {
    // Fallback to rule-based on any error
    return NextResponse.json(
      ruleBasedDiagnosis({ event_type: event.event_type as FrictionType, station: event.station as Station })
    );
  }
}
