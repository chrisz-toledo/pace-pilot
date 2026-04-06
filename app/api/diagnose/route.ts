import { NextRequest, NextResponse } from "next/server";
import { ruleBasedDiagnosis } from "@/lib/offline";
import { buildFullContext, getFiveSDefsBlock } from "@/lib/manual";
import { getPQRGReference } from "@/lib/mcmit-data";
import type { FrictionType, Station } from "@/lib/types";
import type { Lang } from "@/lib/locales";

export const runtime = "nodejs";

function buildPrompt(
  event: { station: string; event_type: string; description: string; severity: number; reporter_role: string; service_impact_minutes: number },
  lang: Lang
) {
  const isEs = lang === "es";
  const manualContext = buildFullContext(event.station as Station, event.event_type as FrictionType, lang);
  const fiveSBlock = getFiveSDefsBlock(lang);

  // Inject real PQRG data from McMiT as additional grounding
  const pqrgRef = getPQRGReference(event.station as Station, event.event_type as FrictionType);
  const pqrgBlock = pqrgRef
    ? `\n## ${pqrgRef.title}\n${pqrgRef.items.map((i) => `  • ${i.label}: ${i.value}`).join("\n")}`
    : "";

  if (isEs) {
    return `Eres Gemstone-Core, el motor de diagnóstico 5S del sistema PACE-Pilot para McDonald's.

Metodología 5S:
${fiveSBlock}

Procedimiento Operativo Estándar relevante:
${manualContext}${pqrgBlock}

Evento de fricción:
- Estación: ${event.station}
- Tipo: ${event.event_type}
- Descripción: ${event.description}
- Severidad: ${event.severity}/5
- Reportado por: ${event.reporter_role}
- Impacto: ${event.service_impact_minutes} minutos

Usa el Procedimiento Operativo Estándar para fundamentar tu diagnóstico.
Responde ÚNICAMENTE con este JSON exacto (sin texto adicional):
{
  "failing_step": "<Seiri|Seiton|Seiso|Seiketsu|Shitsuke>",
  "rationale": "<2-3 oraciones explicando por qué ESTE paso 5S está fallando>",
  "recommended_action": "<acción correctiva específica para el próximo turno>",
  "urgency": "<IMMEDIATE|NEXT_SHIFT|SCHEDULED>",
  "confidence": <número 0.0-1.0>
}`;
  }

  return `You are Gemstone-Core, the 5S diagnostic engine of the PACE-Pilot system for McDonald's.

5S Methodology:
${fiveSBlock}

Relevant Standard Operating Procedure:
${manualContext}${pqrgBlock}

Friction event:
- Station: ${event.station}
- Type: ${event.event_type}
- Description: ${event.description}
- Severity: ${event.severity}/5
- Reported by: ${event.reporter_role}
- Impact: ${event.service_impact_minutes} minutes

Use the Standard Operating Procedure to ground your diagnosis.
Respond ONLY with this exact JSON (no additional text):
{
  "failing_step": "<Seiri|Seiton|Seiso|Seiketsu|Shitsuke>",
  "rationale": "<2-3 sentences explaining why THIS 5S step is failing>",
  "recommended_action": "<specific corrective action for the next shift>",
  "urgency": "<IMMEDIATE|NEXT_SHIFT|SCHEDULED>",
  "confidence": <number 0.0-1.0>
}`;
}

export async function POST(req: NextRequest) {
  const event = await req.json();
  const lang: Lang = event.lang === "en" ? "en" : "es";

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

    const result = await model.generateContent(buildPrompt(event, lang));
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
