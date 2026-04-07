import { NextRequest, NextResponse } from "next/server";
import type { Lang } from "@/lib/locales";

export const runtime = "nodejs";

export interface CoachRequest {
  module: string;          // "flashcards" | "scenarios" | "travel" | "game"
  score: number;           // 0–100
  correct: number;
  total: number;
  role: string;            // "MIT_DIRECTOR" | "GM_FACILITY" | etc.
  details?: string;        // extra context (wrong answers, patterns)
  lang: Lang;
}

export interface CoachResponse {
  headline: string;
  observation: string;
  strength: string;
  growth_area: string;
  technique: string;
  action: string;
  mantra: string;
}

// ── Offline coaching fallback (no Gemini key) ───────────────────────────────

function offlineCoach(req: CoachRequest): CoachResponse {
  const isEs = req.lang === "es";
  const pct = req.total > 0 ? Math.round((req.correct / req.total) * 100) : req.score;
  const isHigh = pct >= 80;
  const isMid = pct >= 50;

  if (isEs) {
    if (isHigh) return {
      headline: "🌟 Desempeño de Alto Calibre",
      observation: "Tu consistencia en la toma de decisiones revela un esquema mental bien estructurado para manejar presión operacional.",
      strength: "Excelente capacidad de delegación y pensamiento sistémico. Mantienes el Observation Post incluso bajo estrés.",
      growth_area: "Los líderes de alto desempeño buscan el siguiente nivel: desarrollar la capacidad de anticipar crisis antes de que ocurran.",
      technique: "Visualización anticipatoria: al inicio de cada turno, dedica 2 minutos a identificar los 3 puntos de riesgo más probables del día.",
      action: "En tu próximo turno, realiza un Travel Path de 5 zonas antes de que inicie el Rush. Documenta 1 'Danger Zone' potencial.",
      mantra: "Un buen manager apaga incendios. Un gran leader evita que comiencen.",
    };
    if (isMid) return {
      headline: "📈 Progreso Real — Hay Espacio para Crecer",
      observation: "Demuestras comprensión de los conceptos básicos, pero en situaciones de alta presión, el piloto automático aún toma el control.",
      strength: "Tu disposición para intentarlo y continuar muestra resiliencia. Eso es la base del liderazgo real.",
      growth_area: "Los errores en los simuladores revelan patrones de pensamiento bajo estrés. Identifica cuáles decisiones incorrectas tomaste: ¿fueron de acción o de delegación?",
      technique: "Técnica STOP: en el próximo escenario de presión, antes de actuar — Stop (1 seg) → Think (¿cuál es mi rol aquí?) → Observe → Proceed.",
      action: "Repasa el módulo con los errores que cometiste. Escribe en papel los 3 errores y la respuesta correcta. La escritura ancla el aprendizaje.",
      mantra: "No cometo errores — colecto datos de crecimiento.",
    };
    return {
      headline: "🔄 El Punto de Quiebre es el Punto de Crecimiento",
      observation: "Una puntuación baja no define tu potencial — define tu punto de partida. Los mejores GMs de McDonald's comenzaron exactamente aquí.",
      strength: "Terminaste la sesión. Eso requiere más valentía que no intentarlo.",
      growth_area: "Los fundamentos son la base de todo. Antes de avanzar, domina los conceptos básicos de food safety y delegación táctica.",
      technique: "Espaciado de repetición: practica el mismo módulo 3 días seguidos, 10 minutos cada vez. Tu cerebro consolida el aprendizaje mientras duermes.",
      action: "Vuelve a este módulo mañana en el mismo horario. La consistencia del horario fortalece la memoria muscular.",
      mantra: "La disciplina construye libertad. El estándar de hoy es el hábito de mañana.",
    };
  }

  // English fallback
  if (isHigh) return {
    headline: "🌟 High-Caliber Performance",
    observation: "Your decision-making consistency reveals a well-structured mental model for handling operational pressure.",
    strength: "Excellent delegation capacity and systems thinking. You maintain your Observation Post even under stress.",
    growth_area: "High performers seek the next level: develop the ability to anticipate crises before they occur.",
    technique: "Anticipatory visualization: at the start of each shift, spend 2 minutes identifying the 3 most likely risk points of the day.",
    action: "On your next shift, complete a 5-zone Travel Path before Rush begins. Document 1 potential Danger Zone.",
    mantra: "A good manager puts out fires. A great leader prevents them from starting.",
  };
  if (isMid) return {
    headline: "📈 Real Progress — Room to Grow",
    observation: "You demonstrate grasp of basic concepts, but in high-pressure situations, autopilot still takes over.",
    strength: "Your willingness to try and continue shows resilience. That's the foundation of real leadership.",
    growth_area: "Errors in simulators reveal thinking patterns under stress. Identify which wrong decisions you made: were they action or delegation errors?",
    technique: "STOP technique: in the next pressure scenario, before acting — Stop (1 sec) → Think (what is my role here?) → Observe → Proceed.",
    action: "Review the module for the mistakes you made. Write down the 3 errors and the correct response. Writing anchors learning.",
    mantra: "I don't make mistakes — I collect growth data.",
  };
  return {
    headline: "🔄 The Breaking Point is the Growth Point",
    observation: "A low score doesn't define your potential — it defines your starting point. The best McDonald's GMs started exactly here.",
    strength: "You finished the session. That takes more courage than not trying.",
    growth_area: "Fundamentals are the foundation of everything. Before advancing, master the basics of food safety and tactical delegation.",
    technique: "Spaced repetition: practice the same module 3 consecutive days, 10 minutes each time. Your brain consolidates learning while you sleep.",
    action: "Return to this module tomorrow at the same time. Schedule consistency strengthens muscle memory.",
    mantra: "Discipline builds freedom. Today's standard is tomorrow's habit.",
  };
}

// ── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(req: CoachRequest): string {
  const isEs = req.lang === "es";
  const pct = req.total > 0 ? Math.round((req.correct / req.total) * 100) : req.score;

  const moduleLabel: Record<string, string> = {
    flashcards: isEs ? "Flashcards de Estándares Operacionales" : "Operational Standards Flashcards",
    scenarios: isEs ? "Sandbox Shift Manager — Simulador de Crisis" : "Shift Manager Sandbox — Crisis Simulator",
    travel: isEs ? "Simulador de Travel Path" : "Travel Path Simulator",
    game: isEs ? "Juego de Armado del Menú" : "Menu Build Game",
  };

  if (isEs) return `Eres COACH-IA, un especialista en psicología conductual y coaching organizacional integrado en PACE-Pilot, el sistema de formación MIT de McDonald's.

Tu rol: analizar datos de desempeño de entrenamiento y proveer retroalimentación de coaching personalizada para ayudar a líderes de McDonald's a crecer profesional y personalmente.

Marcos psicológicos que usas: Inteligencia Emocional (IE/EQ), Patrones Cognitivos Conductuales, Growth Mindset (Dweck), Stress Inoculation Training, Entrevista Motivacional, Psicología Positiva.

Datos de la sesión:
- Módulo: ${moduleLabel[req.module] ?? req.module}
- Puntaje: ${pct}% (${req.correct} de ${req.total} correctos)
- Rol: ${req.role}
${req.details ? `- Contexto adicional: ${req.details}` : ""}

Genera retroalimentación de coaching personalizada. Responde ÚNICAMENTE con este JSON exacto (sin texto adicional):
{
  "headline": "<título motivacional corto, 5–7 palabras>",
  "observation": "<qué revela este desempeño sobre el patrón de comportamiento de la persona — 2 oraciones, basado en psicología conductual>",
  "strength": "<qué están haciendo bien — específico y fundamentado en la sesión>",
  "growth_area": "<área específica de mejora — sin juicios, enfocado en comportamiento observable>",
  "technique": "<técnica psicológica o ejercicio concreto para mejorar — con nombre del framework>",
  "action": "<una acción específica y medible para el próximo turno>",
  "mantra": "<frase corta de 8–12 palabras para internalizar>"
}`;

  return `You are COACH-AI, a behavioral psychology and organizational coaching specialist embedded in PACE-Pilot, McDonald's MIT training system.

Your role: analyze training performance data and provide personalized coaching feedback to help McDonald's leaders grow professionally and personally.

Psychological frameworks you use: Emotional Intelligence (EQ), Cognitive Behavioral patterns, Growth Mindset (Dweck), Stress Inoculation Training, Motivational Interviewing, Positive Psychology.

Session data:
- Module: ${moduleLabel[req.module] ?? req.module}
- Score: ${pct}% (${req.correct} of ${req.total} correct)
- Role: ${req.role}
${req.details ? `- Additional context: ${req.details}` : ""}

Generate personalized coaching feedback. Respond ONLY with this exact JSON (no additional text):
{
  "headline": "<short motivational title, 5–7 words>",
  "observation": "<what this performance reveals about the person's behavioral pattern — 2 sentences, based on behavioral psychology>",
  "strength": "<what they are doing well — specific and grounded in the session>",
  "growth_area": "<specific area for improvement — no judgments, focused on observable behavior>",
  "technique": "<psychological technique or concrete exercise to improve — name the framework>",
  "action": "<one specific measurable action for the next shift>",
  "mantra": "<short phrase of 8–12 words to internalize>"
}`;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body: CoachRequest = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(offlineCoach(body));
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(buildPrompt(body));
    const text = result.response.text().trim();
    const parsed: CoachResponse = JSON.parse(text);

    const required: (keyof CoachResponse)[] = ["headline", "observation", "strength", "growth_area", "technique", "action", "mantra"];
    if (!required.every((k) => typeof parsed[k] === "string" && parsed[k].length > 0)) {
      throw new Error("Invalid coach response shape");
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(offlineCoach(body));
  }
}
