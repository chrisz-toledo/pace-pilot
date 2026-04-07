/**
 * lib/training-data.ts
 * All interactive training content ported from McMiT (mcd_mit_app).
 * Flashcards, scenario simulations, travel path — bilingual ES/EN.
 */

// ─── FLASHCARDS ───────────────────────────────────────────────────────────────

export interface Flashcard {
  type: string;
  question: string;
  answer: string;
}

export interface FlashcardStation {
  id: string;
  nameEs: string;
  nameEn: string;
  emoji: string;
  cards: Flashcard[];
}

export const FLASHCARD_STATIONS: FlashcardStation[] = [
  {
    id: "grill",
    nameEs: "Grill & Freidoras",
    nameEn: "Grill & Fryer",
    emoji: "🔥",
    cards: [
      { type: "Temperatura", question: "¿Temperatura de la Freidora de Papas?", answer: "168 °C / 335 °F" },
      { type: "Tiempo", question: "¿Tiempo máx. de retención de Carne 10:1 en UHC?", answer: "15 minutos" },
      { type: "Temp. Crítica", question: "¿Temperatura interna segura para Res en parrilla?", answer: "Mínimo 68 °C / 155 °F" },
      { type: "Tiempo", question: "¿Tiempo de cocción de Quarter Pounder (4:1)?", answer: "105 – 115 segundos" },
      { type: "Tiempo", question: "¿Tiempo máximo de cocción de papas regulares?", answer: "3 min 10 seg" },
      { type: "Calidad", question: "¿Vida útil primaria del aceite de freidoras?", answer: "Aprox. 2–3 semanas filtrando diario (medir con T-Stick)" },
      { type: "Seguridad", question: "Si un Patty 4:1 NO alcanza 155 °F pre-asignados, ¿qué hacer?", answer: "Aumentar tiempo +1 seg hasta pasar calibración. Descartar la muestra." },
    ],
  },
  {
    id: "prep",
    nameEs: "Mesa de Ensamble",
    nameEn: "Prep & Assembly",
    emoji: "🥗",
    cards: [
      { type: "Calidad", question: "¿Vida de ingredientes secundarios (lechuga/tomate) a temperatura ambiente?", answer: "4 horas máximo" },
      { type: "Tiempo", question: "¿Tiempo objetivo del Maker para reaccionar a una orden?", answer: "10–15 segundos" },
      { type: "Dispensador", question: "¿Gramaje del dispensador de Ketchup por shot?", answer: "1/2 oz / 14 g" },
      { type: "Calidad", question: "¿Tiempo de retención en UHC para McNuggets de Pollo?", answer: "20 minutos" },
      { type: "Seguridad", question: "¿Color de guantes EXCLUSIVOS para carnes crudas?", answer: "Azul (Blue Gloves)" },
      { type: "Armado", question: "¿Orden base de condimento para hamburguesa clásica?", answer: "Mostaza → Ketchup → Cebolla Deshidratada → Pepinillo" },
    ],
  },
  {
    id: "service",
    nameEs: "Servicio & Drive-Thru",
    nameEn: "Service & Drive-Thru",
    emoji: "🚗",
    cards: [
      { type: "Calidad", question: "¿Cuánto tiempo duran las papas fritas en la estación de empaque?", answer: "7 minutos máximo" },
      { type: "Objetivo", question: "¿Meta SOS total en Drive-Thru?", answer: "120 segundos (2 min)" },
      { type: "Hospitalidad", question: "¿Qué dicta el estándar 'Garantía CERO Puntos Ciegos' en Lobby?", answer: "Contacto visual, sonrisa, saludos o despedidas genuinas a todos los clientes." },
      { type: "Higiene", question: "¿Concentración correcta de agua sanitizante (Quat) para toallas?", answer: "200 ppm" },
      { type: "Rapidez", question: "¿Máximo de autos en Hold/Bays simultáneamente?", answer: "No más de 2 por orden pesada o espera de parrilla" },
      { type: "Servicio", question: "¿Paso crítico final antes de entregar la orden al auto?", answer: "Double Check vs Ticket + entregar servilletas/salsas" },
    ],
  },
  {
    id: "mccafe",
    nameEs: "McCafé & Postres",
    nameEn: "McCafé & Desserts",
    emoji: "☕",
    cards: [
      { type: "Temperatura", question: "¿Temperatura correcta de leche texturizada (Steamed Milk)?", answer: "140–160 °F / 60–71 °C" },
      { type: "Dispensador", question: "¿Temperatura de almacenamiento de la mezcla de Helado Sundae?", answer: "Por debajo de 41 °F (5 °C)" },
      { type: "Limpieza", question: "¿Frecuencia de desinfección del vaporizador de leche?", answer: "Con toalla estéril después de CADA ciclo" },
      { type: "Armado", question: "¿Cuántas vueltas tiene un cono de Vainilla corporativo?", answer: "2.5 vueltas más la base" },
      { type: "Calidad", question: "¿Temperatura de servicio de bebidas calientes McCafé (latté, cappuccino)?", answer: "160–165 °F / 71–74 °C" },
    ],
  },
];

// ─── SCENARIO SIMULATOR ───────────────────────────────────────────────────────

export interface ScenarioOption {
  text: string;
  consequence: string;
  isCorrect: boolean;
}

export interface Scenario {
  id: number;
  title: string;
  context: string;
  metric?: string;
  options: ScenarioOption[];
  psychNote?: string;  // psychological insight for the coach
}

export interface ScenarioStation {
  id: string;
  nameEs: string;
  nameEn: string;
  emoji: string;
  scenarios: Scenario[];
}

export const SCENARIO_STATIONS: ScenarioStation[] = [
  {
    id: "drivethru",
    nameEs: "Drive-Thru / Servicio",
    nameEn: "Drive-Thru / Service",
    emoji: "🚗",
    scenarios: [
      {
        id: 1,
        title: "Cuello de Botella en Drive-Thru",
        context: "Rush de almuerzo. 8 autos en línea, SOS actual = 240s (target 120s). La caja de Ventana 1 se apaga en pleno cobro.",
        metric: "SOS en DANGER ZONE — 240s vs 120s target",
        psychNote: "Evaluates cognitive load management and delegation under stress",
        options: [
          {
            text: "Interceder directamente: Revisar cables, reiniciar fusibles yo mismo. Dejar la línea esperando.",
            consequence: "Creo un cuello secundario. Un SM que 'se mete al pozo' técnico pierde el Observation Post — la cocina colapsa en 3 minutos.",
            isCorrect: false,
          },
          {
            text: "Aces in their Places: Reubicar cajera a Ventana 2 para cobros móviles y entregas simultáneas. Abrir ticket de IT urgente.",
            consequence: "Liderazgo excelente. Priorizaste flujo continuo sobre perfección técnica. Reubicar tus 'Ases' evita un estancamiento de $500/hr.",
            isCorrect: true,
          },
        ],
      },
      {
        id: 2,
        title: "Queja de Nivel 3 — Alto Estrés",
        context: "Un cliente entra agresivo al Lobby con una hamburguesa con carne cruda y fría. Hay 10 personas observándote.",
        metric: "Food Safety + VOG (Voice of Guest) en riesgo crítico",
        psychNote: "Tests emotional regulation and empathy under social pressure",
        options: [
          {
            text: "Postura defensiva: 'Es imposible, las parrillas tienen temporizador. Pídala de nuevo sin gritar.'",
            consequence: "Invalidaste su realidad. Un cliente alterado busca empatía, no correcciones técnicas. Esto genera un video viral negativo.",
            isCorrect: false,
          },
          {
            text: "Método L.A.S.T: Escuchar sin interrumpir → Apologize incondicional → Satisfacer (reemplazar + cupón) → Thank el aviso.",
            consequence: "Des-escalamiento del 100%. Redujiste el cortisol del cliente, salvaguardaste la imagen frente a los 10 testigos y cortaste un riesgo de Food Safety.",
            isCorrect: true,
          },
        ],
      },
    ],
  },
  {
    id: "grill",
    nameEs: "Parrilla y Alimentos",
    nameEn: "Grill & Food Safety",
    emoji: "🔥",
    scenarios: [
      {
        id: 3,
        title: "Contaminación Cruzada Visualizada",
        context: "En tu Travel Path ves a un empleado: carne congelada cae al drenaje de aceite → la recoge → la tira al Grill → toma bandejas limpias con guantes azules ensangrentados.",
        metric: "FOOD SAFETY — E. coli / Contaminación cruzada nivel crítico",
        psychNote: "Tests moral courage — doing the right thing vs. operational pressure",
        options: [
          {
            text: "Protocolo de Destrucción: Frenar esa parrilla. Descartar carne tocada. Bandejas a lavar. Cambio de guantes frente a ti.",
            consequence: "Zero Tolerance con Salud Pública. Interrumpiste una métrica trivial (tiempo) para defender vidas humanas. Acción gerencial impecable.",
            isCorrect: true,
          },
          {
            text: "Coaching Diferido: 'Lávate cuando baje el Rush, andamos atorados.' Dejas que se sirva la comida.",
            consequence: "Violación extrema a normativas globales y a la doctrina McDonald's. Esta decisión puede llevar al cierre sanitario de la franquicia y causar enfermedades graves.",
            isCorrect: false,
          },
        ],
      },
      {
        id: 4,
        title: "Colapso de Gabinete UHC",
        context: "Rush. El monitor arroja: cero McChicken y cero Nuggets en UHC. Todo el equipo grita 'Esperando Nuggets'.",
        metric: "UHC VACÍO — Colapso de producto en peak hour",
        psychNote: "Tests leadership composure and delegation vs. firefighting",
        options: [
          {
            text: "Asumir estación: Gritar '¡Falta pollo!' y meterte a las freidoras directamente.",
            consequence: "Aceleras la histeria colectiva. Pierdes visión periférica del restaurante — todas las demás áreas colapsan sin director.",
            isCorrect: false,
          },
          {
            text: "Control Central Delegado: Pones Aces in Places — pides a Parrilla 2 que apoye a Freidora 1 por 2 min. Ordenas calmar voces.",
            consequence: "Balanceaste la producción estancada dirigiendo el tráfico. Flujo continuo garantizado sin perder tu Observation Post.",
            isCorrect: true,
          },
        ],
      },
    ],
  },
  {
    id: "hr",
    nameEs: "Recursos Humanos / Crew",
    nameEn: "HR / People Management",
    emoji: "👥",
    scenarios: [
      {
        id: 5,
        title: "Llanto y Estrés Extremo de un Crew",
        context: "Un cliente fue extremadamente agresivo en Auto-Mac. Tu empleada de cobro (17 años) rompe a llorar incontrolablemente en la caja, bloqueando la fila.",
        metric: "VOG crítico + salud mental del equipo en riesgo",
        psychNote: "Direct test of Emotional Intelligence and servant leadership",
        options: [
          {
            text: "'Aguanta la presión: sécate y cobra el siguiente auto. Así es el servicio.'",
            consequence: "Causas un trauma psicológico en tu Crew. Rotación inminente (renuncia), el cliente verá a la chica llorando → métricas VOG desastrosas.",
            isCorrect: false,
          },
          {
            text: "Relevo Táctico: Pides a su 'As' que la cubra. La escoltas al área de Crew, ofreces agua y 5 minutos para respirar.",
            consequence: "Inteligencia Emocional Aplicada. Cuidas la salud mental de tu equipo y la tienda no se atora operativamente. Demuestras que las personas son primero.",
            isCorrect: true,
          },
        ],
      },
      {
        id: 6,
        title: "Conflicto Interpersonal Entre Crew",
        context: "Dos empleados tienen un altercado verbal visible frente a clientes en el Lobby. La tensión escala y uno amenaza con 'dejar el turno' en plena hora pico.",
        metric: "Ambiente laboral tóxico visible — riesgo de cierre de turno",
        psychNote: "Tests mediation skills, de-escalation and boundary-setting",
        options: [
          {
            text: "Ignorarlo momentáneamente: 'Después lo hablo con los dos, ahorita es Rush.'",
            consequence: "Los clientes son testigos directos del conflicto. Daño irreparable a la imagen de marca. La tensión escalará y puedes perder a ambos empleados del turno.",
            isCorrect: false,
          },
          {
            text: "Separación inmediata + mediación post-turno: Separarlos en distintas estaciones ahora. Garantizar confidencialidad y citar a ambos al final del turno con HR.",
            consequence: "Contuviste el incidente sin escalarlo públicamente. Demostraste madurez emocional y profesionalismo. La mediación post-turno resuelve la causa raíz.",
            isCorrect: true,
          },
        ],
      },
    ],
  },
  {
    id: "foodsafety",
    nameEs: "Food Safety Crítico",
    nameEn: "Critical Food Safety",
    emoji: "🛡️",
    scenarios: [
      {
        id: 7,
        title: "Temperatura de Walk-In Freezer Fuera de Rango",
        context: "Al inicio del turno notas que el termómetro del Walk-In Freezer marca -10°C (target -18°C). Hay inventario de carne de toda la semana adentro.",
        metric: "TEMPERATURA FREEZER: -10°C vs. -18°C objetivo — $3,000+ en inventario en riesgo",
        psychNote: "Tests risk assessment and escalation judgment",
        options: [
          {
            text: "Documentar en el cuaderno de incidencias y esperar a ver si se normaliza sola.",
            consequence: "La temperatura seguirá subiendo. En 2-3 horas el inventario entra en zona de peligro microbiano. Pérdida económica y riesgo legal de food safety.",
            isCorrect: false,
          },
          {
            text: "Escalar inmediatamente: Llamar a mantenimiento de urgencia, notificar al GM/Owner, verificar viabilidad del inventario con termómetro manual y documentar.",
            consequence: "Actuaste dentro de los primeros 30 minutos críticos. Potencialmente salvaste el inventario y cumpliste con el protocolo de documentación de incidencias. Auditoría-proof.",
            isCorrect: true,
          },
        ],
      },
    ],
  },
];

// ─── TRAVEL PATH ──────────────────────────────────────────────────────────────

export interface TravelSituation {
  text: string;
  isDanger: boolean;
}

export interface TravelArea {
  id: string;
  nameEs: string;
  nameEn: string;
  emoji: string;
  situations: TravelSituation[];
}

export const TRAVEL_PATH_AREAS: TravelArea[] = [
  {
    id: "exterior",
    nameEs: "Exteriores y Corral de Basura",
    nameEn: "Exterior & Dumpster",
    emoji: "🏪",
    situations: [
      { text: "Basurero exterior rebosado y moscas revoloteando cerca del acrílico del Auto-Mac.", isDanger: true },
      { text: "El letrero luminoso iluminando perfectamente 'Abierto 24 Horas'.", isDanger: false },
      { text: "Empaques encerados tirados en el estacionamiento para discapacitados.", isDanger: true },
    ],
  },
  {
    id: "lobby",
    nameEs: "Lobby Principal y SS.HH",
    nameEn: "Lobby & Restrooms",
    emoji: "🏠",
    situations: [
      { text: "Una familia consumiendo cajita feliz con la mesa perfectamente limpia.", isDanger: false },
      { text: "Kiosko inteligente emitiendo pitido 'Fuera de Servicio — Sin Rollos de Recibo'.", isDanger: true },
      { text: "Piso de entrada visiblemente mojado y resbaladizo, cono 'Wet Floor' guardado en un closet.", isDanger: true },
    ],
  },
  {
    id: "service",
    nameEs: "Servicio Contado",
    nameEn: "Front Counter",
    emoji: "🛎️",
    situations: [
      { text: "Empleada empaquetando papas fritas con red, cofia y sonrisa.", isDanger: false },
      { text: "Cliente esperando 60+ segundos por un vaso de agua sin contacto visual de ningún crew.", isDanger: true },
      { text: "Nuevos empaques de promociones apilados correctamente bajo la mesa.", isDanger: false },
    ],
  },
  {
    id: "kitchen",
    nameEs: "Cocina de Alta Velocidad",
    nameEn: "High-Speed Kitchen",
    emoji: "👨‍🍳",
    situations: [
      { text: "Monitor KVS con 9 órdenes en rojo parpadeando con más de 300 segundos de atraso.", isDanger: true },
      { text: "Crew de ensamble usando pinzas para tocino y lavando la pala en la bacha.", isDanger: false },
      { text: "Balde rojo de agua sanitizante para toallas con agua turbia y grasa color gris.", isDanger: true },
      { text: "Bandeja de gabinete UHC de pollo marcando LED Verde fijo.", isDanger: false },
    ],
  },
  {
    id: "walkin",
    nameEs: "Bodegas y Walk-In Freezer",
    nameEn: "Storage & Walk-In Freezer",
    emoji: "❄️",
    situations: [
      { text: "Cajas de carne 4:1 apiladas directamente en el suelo sin tarima distanciadora.", isDanger: true },
      { text: "Puerta trasera abierta con una piedra mientras llega el proveedor de vegetales.", isDanger: true },
      { text: "Termómetro interno del congelador lee -18°C.", isDanger: false },
    ],
  },
];
