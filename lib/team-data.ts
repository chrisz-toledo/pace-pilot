/**
 * lib/team-data.ts
 * Team coordination content for McDonald's MI/MiT development.
 * Shift handoff checklists, coordination scenarios, communication protocols,
 * and role responsibility matrix — all bilingual ES/EN.
 */

// ─── SHIFT HANDOFF CHECKLIST ──────────────────────────────────────────────────

export interface HandoffItem {
  id: string;
  area: string;
  areaEn: string;
  taskEs: string;
  taskEn: string;
  critical: boolean;
}

export interface HandoffSection {
  id: string;
  titleEs: string;
  titleEn: string;
  emoji: string;
  items: HandoffItem[];
}

export const HANDOFF_SECTIONS: HandoffSection[] = [
  {
    id: "operations",
    titleEs: "Estado Operacional",
    titleEn: "Operational Status",
    emoji: "🏪",
    items: [
      { id: "h1", area: "SOS", areaEn: "SOS", taskEs: "Comunicar el SOS actual del turno saliente (DT y FC)", taskEn: "Report current shift SOS (DT and FC)", critical: true },
      { id: "h2", area: "UHC", areaEn: "UHC", taskEs: "Verificar y comunicar niveles de producto en todos los UHC", taskEn: "Verify and report product levels in all UHCs", critical: true },
      { id: "h3", area: "KVS", areaEn: "KVS", taskEs: "Revisar que no haya órdenes pendientes en el KVS > 4 min", taskEn: "Check no pending orders on KVS > 4 min", critical: true },
      { id: "h4", area: "Freidoras", areaEn: "Fryers", taskEs: "Informar estado del aceite (T-Stick) y programar cambio si necesario", taskEn: "Report oil status (T-Stick) and schedule change if needed", critical: false },
      { id: "h5", area: "Inventario", areaEn: "Inventory", taskEs: "Comunicar productos con stock bajo que requieren pedido o acción", taskEn: "Report low-stock products requiring order or action", critical: false },
    ],
  },
  {
    id: "team",
    titleEs: "Estado del Equipo",
    titleEn: "Team Status",
    emoji: "👥",
    items: [
      { id: "t1", area: "Posiciones", areaEn: "Positions", taskEs: "Entregar el board de posiciones actualizado con los Ases en sus Places", taskEn: "Hand over updated positions board with Aces in their Places", critical: true },
      { id: "t2", area: "Crew", areaEn: "Crew", taskEs: "Informar de cualquier incidente de crew (estrés, conflicto, rendimiento bajo)", taskEn: "Report any crew incidents (stress, conflict, low performance)", critical: true },
      { id: "t3", area: "Breaks", areaEn: "Breaks", taskEs: "Comunicar quién tiene pendiente su break y tiempo restante", taskEn: "Report who has a pending break and remaining time", critical: false },
      { id: "t4", area: "Capacitación", areaEn: "Training", taskEs: "Indicar si hay crew en período de entrenamiento y su nivel actual", taskEn: "Indicate if there is crew in training period and their current level", critical: false },
    ],
  },
  {
    id: "facility",
    titleEs: "Instalaciones y Equipos",
    titleEn: "Facilities and Equipment",
    emoji: "🔧",
    items: [
      { id: "f1", area: "Limpieza", areaEn: "Cleaning", taskEs: "Comunicar el estado de limpieza de todas las áreas y tareas pendientes", taskEn: "Report cleaning status of all areas and pending tasks", critical: false },
      { id: "f2", area: "Equipos", areaEn: "Equipment", taskEs: "Reportar cualquier equipo fuera de servicio o en alerta de mantenimiento", taskEn: "Report any equipment out of service or on maintenance alert", critical: true },
      { id: "f3", area: "Freezer", areaEn: "Freezer", taskEs: "Verificar y comunicar temperatura del Walk-In Freezer y Cooler", taskEn: "Verify and report Walk-In Freezer and Cooler temperature", critical: true },
      { id: "f4", area: "Lobby", areaEn: "Lobby", taskEs: "Estado del Lobby, SS.HH y zona exterior al momento del handoff", taskEn: "Lobby, restrooms and exterior zone status at time of handoff", critical: false },
    ],
  },
  {
    id: "incidents",
    titleEs: "Incidentes y Pendientes",
    titleEn: "Incidents and Pending Items",
    emoji: "📋",
    items: [
      { id: "i1", area: "Quejas", areaEn: "Complaints", taskEs: "Documentar y comunicar quejas de clientes no resueltas o VOG activo", taskEn: "Document and communicate unresolved customer complaints or active VOG", critical: true },
      { id: "i2", area: "Food Safety", areaEn: "Food Safety", taskEs: "Reportar cualquier incidente de Food Safety ocurrido en el turno", taskEn: "Report any Food Safety incident that occurred during the shift", critical: true },
      { id: "i3", area: "Bitácora", areaEn: "Log Book", taskEs: "Registrar todas las novedades del turno en la bitácora del GM", taskEn: "Log all shift developments in the GM log book", critical: false },
      { id: "i4", area: "Caja", areaEn: "Cash", taskEs: "Cuadrar la caja y comunicar cualquier diferencia al turno entrante", taskEn: "Balance the cash register and report any discrepancy to incoming shift", critical: true },
    ],
  },
];

// ─── TEAM COORDINATION SCENARIOS ──────────────────────────────────────────────

export interface TeamOption {
  text: string;
  textEn: string;
  consequence: string;
  consequenceEn: string;
  isCorrect: boolean;
  roleImpact: string;  // which role/area benefits or suffers
}

export interface TeamScenario {
  id: number;
  titleEs: string;
  titleEn: string;
  contextEs: string;
  contextEn: string;
  rolesInvolved: string[];
  psychNote: string;
  options: TeamOption[];
  keyLearningEs: string;
  keyLearningEn: string;
}

export const TEAM_SCENARIOS: TeamScenario[] = [
  {
    id: 1,
    titleEs: "Rush de Almuerzo — Coordinación Total",
    titleEn: "Lunch Rush — Full Coordination",
    contextEs: "Son las 12:15. El DT tiene 7 autos, el FC tiene 4 clientes esperando, la parrilla está corta de carne 4:1 en UHC, y tu MIT junior está en Drive-Thru sin experiencia en cobro rápido. Tienes a tu disposición: 1 MIT experimentado, 2 Crew de ensamble y 1 Crew de servicio.",
    contextEn: "It's 12:15. DT has 7 cars, FC has 4 customers waiting, the grill is short on 4:1 beef in UHC, and your junior MIT is at Drive-Thru without fast payment experience. You have available: 1 experienced MIT, 2 assembly Crew and 1 service Crew.",
    rolesInvolved: ["MIT Director", "MIT Senior", "MIT Junior", "Crew Ensamble", "Crew Servicio"],
    psychNote: "Tests resource allocation under competing pressures — a core leadership skill",
    options: [
      {
        text: "Mueves al MIT experimentado al Drive-Thru para agilizar cobros, pides al MIT junior que supervise la parrilla, y mantienes a los Crew en ensamble. Tú te posicionas en Lobby como Observation Post.",
        textEn: "Move the experienced MIT to Drive-Thru to speed up payments, ask the junior MIT to supervise the grill, and keep the Crew at assembly. You position yourself in Lobby as Observation Post.",
        consequence: "Distribución inteligente de talento. El MIT experimentado protege el punto más crítico (DT), el junior crece bajo supervisión en un rol nuevo pero de menor riesgo, y tú mantienes visión periférica del restaurante completo.",
        consequenceEn: "Smart talent distribution. Experienced MIT protects the most critical point (DT), junior grows under supervision in a new but lower-risk role, and you maintain peripheral vision of the entire restaurant.",
        isCorrect: true,
        roleImpact: "DT protegido + crecimiento del MIT junior",
      },
      {
        text: "Te metes tú mismo al DT para asegurar la velocidad, dejas al MIT experimentado manejando el FC, y el MIT junior en la parrilla solo.",
        textEn: "You go into DT yourself to ensure speed, leave the experienced MIT handling FC, and the junior MIT alone at the grill.",
        consequence: "Abandonas tu Observation Post. Sin visión del restaurante, los problemas de FC, Lobby y parrilla escalarán sin que te enteres. Un Shift Manager que 'se mete al pozo' pierde la orquesta completa.",
        consequenceEn: "You abandon your Observation Post. Without restaurant visibility, FC, Lobby and grill problems will escalate without your knowledge. A Shift Manager who 'dives in' loses the entire orchestra.",
        isCorrect: false,
        roleImpact: "Pérdida del Observation Post",
      },
      {
        text: "Gritas instrucciones en voz alta a todos simultáneamente y esperas que cada quien sepa qué hacer.",
        textEn: "Shout instructions to everyone simultaneously and expect each person to know what to do.",
        consequence: "La comunicación no dirigida genera confusión. En un Rush, las instrucciones simultáneas sin nombre de destinatario crean 'difusión de responsabilidad' — todos asumen que alguien más actúa.",
        consequenceEn: "Undirected communication creates confusion. In a Rush, simultaneous instructions without named recipients create 'diffusion of responsibility' — everyone assumes someone else will act.",
        isCorrect: false,
        roleImpact: "Confusión generalizada",
      },
    ],
    keyLearningEs: "En coordinación de equipo, la regla de oro es: asigna por nombre + rol + tarea específica. 'Juan, DT ventana 1, cobros rápidos ahora.' No: 'Alguien vaya al DT.'",
    keyLearningEn: "In team coordination, the golden rule is: assign by name + role + specific task. 'Juan, DT window 1, fast payments now.' Not: 'Someone go to DT.'",
  },
  {
    id: 2,
    titleEs: "Handoff de Turno — El MIT Saliente No Actualizó la Bitácora",
    titleEn: "Shift Handoff — Outgoing MIT Didn't Update the Log",
    contextEs: "Llegas a tu turno y el MIT saliente te hace un handoff verbal rápido: 'Todo bien, suerte.' Pero al revisar el restaurante notas: el Walk-In está a -10°C, hay una queja de cliente sin resolver documentada en el sistema, y la freidora 2 tiene un error de temperatura activo.",
    contextEn: "You arrive at your shift and the outgoing MIT gives you a quick verbal handoff: 'All good, good luck.' But upon reviewing the restaurant you notice: the Walk-In is at -10°C, there's an unresolved customer complaint documented in the system, and Fryer 2 has an active temperature error.",
    rolesInvolved: ["MIT Saliente", "MIT Entrante", "GM en turno"],
    psychNote: "Tests professional accountability, assertiveness and protocol adherence without confrontation",
    options: [
      {
        text: "Dejas ir al MIT saliente sin decirle nada, manejas todo tú solo para no crear conflicto.",
        textEn: "Let the outgoing MIT leave without saying anything, handle everything yourself to avoid conflict.",
        consequence: "Proteges la relación a corto plazo pero permites que el MIT saliente repita el patrón. Además, ahora eres responsable de 3 problemas sin documentación de origen — complicado si hay consecuencias.",
        consequenceEn: "Protect the relationship short-term but allow the outgoing MIT to repeat the pattern. Also, you are now responsible for 3 problems without documentation of origin — complicated if there are consequences.",
        isCorrect: false,
        roleImpact: "Patrón de handoff incompleto se perpetúa",
      },
      {
        text: "Pides al MIT saliente que regrese 5 minutos: documentas juntos los 3 hallazgos en la bitácora, defines quién escala el freezer al GM, y acuerdan que el handoff estándar incluirá estos puntos en adelante.",
        textEn: "Ask the outgoing MIT to return 5 minutes: document the 3 findings together in the log, define who escalates the freezer to the GM, and agree that the standard handoff will include these points going forward.",
        consequence: "Accountability con empatía. No culpas — creas un estándar compartido. La documentación conjunta protege a ambos MIT y al restaurante. El freezer se escala por protocolo, no por pánico.",
        consequenceEn: "Accountability with empathy. No blaming — you create a shared standard. Joint documentation protects both MITs and the restaurant. The freezer is escalated by protocol, not panic.",
        isCorrect: true,
        roleImpact: "Estándar de handoff mejorado + responsabilidad compartida",
      },
      {
        text: "Reportas al MIT saliente directamente con el GM sin hablarle primero.",
        textEn: "Report the outgoing MIT directly to the GM without speaking to them first.",
        consequence: "Escalas sin dar la oportunidad de corrección. Esto genera un ambiente de desconfianza y política interna. El resultado es un equipo que oculta problemas en lugar de resolverlos juntos.",
        consequenceEn: "Escalate without giving the opportunity for correction. This creates an environment of mistrust and internal politics. The result is a team that hides problems instead of solving them together.",
        isCorrect: false,
        roleImpact: "Erosión de confianza en el equipo",
      },
    ],
    keyLearningEs: "El handoff de turno no es una formalidad — es el contrato de responsabilidad entre dos líderes. Un handoff incompleto es un riesgo compartido. Estandardiza el proceso y hazlo no negociable.",
    keyLearningEn: "The shift handoff is not a formality — it is the responsibility contract between two leaders. An incomplete handoff is a shared risk. Standardize the process and make it non-negotiable.",
  },
  {
    id: 3,
    titleEs: "Conflicto de Criterio Entre MITs",
    titleEn: "Criteria Conflict Between MITs",
    contextEs: "Tú y otro MIT tienen visiones distintas sobre cómo manejar una fila de 6 clientes en el FC durante un período sin Crew de servicio disponible. Tu colega MIT quiere que ambos se pongan a atender directamente. Tú sabes que hay un pedido de catering para 25 personas llegando en 10 minutos.",
    contextEn: "You and another MIT have different views on how to handle a line of 6 customers at FC during a period with no service Crew available. Your MIT colleague wants both of you to go serve directly. You know there's a catering order for 25 people arriving in 10 minutes.",
    rolesInvolved: ["MIT A", "MIT B", "Cliente"],
    psychNote: "Tests collaborative decision-making, assertive communication and big-picture thinking",
    options: [
      {
        text: "Cedes al criterio de tu colega por no generar conflicto. Ambos se ponen a atender el FC y el pedido de catering llega sin coordinación.",
        textEn: "Yield to your colleague's judgment to avoid conflict. Both go to serve FC and the catering order arrives uncoordinated.",
        consequence: "El catering para 25 personas sin preparación previa puede generar un colapso operacional de 20+ minutos. Evitaste el conflicto a corto plazo pero creaste una crisis mayor.",
        consequenceEn: "A catering order for 25 people without prior preparation can generate a 20+ minute operational collapse. You avoided short-term conflict but created a bigger crisis.",
        isCorrect: false,
        roleImpact: "Crisis de catering no gestionada",
      },
      {
        text: "Explicas la situación del catering a tu colega con datos: 'En 10 min llega pedido de 25. Propongo: tú atiendes FC ahora, yo preparo la logística del catering. En 5 min te reemplazo.' Acuerdan en 30 segundos.",
        textEn: "Explain the catering situation to your colleague with data: 'Catering order for 25 arrives in 10 min. Proposal: you handle FC now, I prep the catering logistics. In 5 min I replace you.' Agree in 30 seconds.",
        consequence: "Comunicación asertiva con datos, no con autoridad. Propones una solución concreta, distribuyes el trabajo, y ambos tienen un rol claro. El cliente del FC y el catering quedan cubiertos.",
        consequenceEn: "Assertive communication with data, not authority. You propose a concrete solution, distribute the work, and both have a clear role. FC customer and catering are both covered.",
        isCorrect: true,
        roleImpact: "FC + catering manejados + equipo alineado",
      },
      {
        text: "Ignoras a tu colega, vas directamente a preparar el catering sin explicarle nada.",
        textEn: "Ignore your colleague, go directly to prepare the catering without explaining anything.",
        consequence: "Tu colega queda solo frente a 6 clientes sin contexto. La descoordinación genera resentimiento y fractura la dinámica del equipo. Además, el cliente de FC percibe un ambiente tenso.",
        consequenceEn: "Your colleague is left alone facing 6 customers without context. Lack of coordination breeds resentment and fractures team dynamics. Also, FC customers perceive a tense atmosphere.",
        isCorrect: false,
        roleImpact: "Fractura de dinámica de equipo",
      },
    ],
    keyLearningEs: "Los conflictos de criterio entre MITs se resuelven con datos + propuesta + acuerdo rápido. La clave es comunicación asertiva: 'Tengo esta información, propongo esto, ¿acordamos?' — no debate ni jerarquía.",
    keyLearningEn: "Criteria conflicts between MITs are resolved with data + proposal + quick agreement. The key is assertive communication: 'I have this information, I propose this, do we agree?' — not debate or hierarchy.",
  },
  {
    id: 4,
    titleEs: "Mentoring — MIT Experimentado + MIT Nuevo",
    titleEn: "Mentoring — Experienced MIT + New MIT",
    contextEs: "Eres el MIT más senior del turno. Tu colega MIT nuevo comete un error grave: olvidó verificar las temperaturas del Walk-In al inicio del turno y el freezer lleva 2 horas a -10°C. El error fue detectado por el GM. El MIT nuevo está visiblemente avergonzado y ansioso.",
    contextEn: "You are the most senior MIT on the shift. Your new MIT colleague makes a serious mistake: they forgot to check Walk-In temperatures at the start of the shift and the freezer has been at -10°C for 2 hours. The error was detected by the GM. The new MIT is visibly embarrassed and anxious.",
    rolesInvolved: ["MIT Senior", "MIT Junior", "GM"],
    psychNote: "Tests servant leadership, psychological safety creation and mentoring under pressure",
    options: [
      {
        text: "Le dices en voz baja frente al equipo: 'Esto no puede pasar. Aprende el checklist.'",
        textEn: "Tell them quietly in front of the team: 'This cannot happen. Learn the checklist.'",
        consequence: "La corrección pública, aunque en tono bajo, aumenta la ansiedad y reduce la confianza del MIT junior. El efecto es el opuesto al deseado: mayor probabilidad de nuevos errores por tensión.",
        consequenceEn: "Public correction, even in a low tone, increases anxiety and reduces confidence of the junior MIT. The effect is opposite to desired: higher probability of new errors due to tension.",
        isCorrect: false,
        roleImpact: "Reducción de confianza del MIT junior",
      },
      {
        text: "Después de resolver el problema con el GM, en privado le dices: '¿Qué pasó con el checklist? Te ayudo a integrarlo en tu rutina.' — y juntos crean una rutina de inicio de turno que va a seguir.",
        textEn: "After resolving the issue with the GM, privately say: 'What happened with the checklist? Let me help you build it into your routine.' — and together create a shift-start routine they'll follow.",
        consequence: "Psicología del crecimiento aplicada. El error se convierte en sistema. La privacidad protege la dignidad del MIT junior, el análisis conjunto activa el aprendizaje, y la rutina previene la recurrencia.",
        consequenceEn: "Growth psychology applied. The error becomes a system. Privacy protects the junior MIT's dignity, joint analysis activates learning, and the routine prevents recurrence.",
        isCorrect: true,
        roleImpact: "Sistema de prevención + confianza preservada",
      },
      {
        text: "Defiendes al MIT junior ante el GM diciendo que fue un error de todos y que el checklist no estaba claro.",
        textEn: "Defend the junior MIT to the GM saying it was everyone's mistake and the checklist wasn't clear.",
        consequence: "Proteges en el corto plazo pero no creas aprendizaje. El MIT junior no recibe feedback real y el GM pierde confianza en ti por falta de honestidad. El error se repetirá.",
        consequenceEn: "Protect short-term but don't create learning. The junior MIT doesn't receive real feedback and the GM loses confidence in you for lack of honesty. The error will repeat.",
        isCorrect: false,
        roleImpact: "Patrón sin corrección — riesgo futuro",
      },
    ],
    keyLearningEs: "El mentoring efectivo sigue la regla: Elogio en público — Corrección en privado — Sistema como solución. Un MIT senior que convierte errores en sistemas es un líder multiplicador.",
    keyLearningEn: "Effective mentoring follows the rule: Praise in public — Correct in private — System as solution. A senior MIT who turns errors into systems is a multiplying leader.",
  },
  {
    id: 5,
    titleEs: "Comunicación en Crisis — Equipo en Pánico",
    titleEn: "Crisis Communication — Team in Panic",
    contextEs: "Una freidora presenta un amago de incendio pequeño (grasa encendida). Se apagó con el extinguidor de tipo K correctamente. Pero el equipo está en pánico: 3 Crew están temblando, los clientes del Lobby vieron el humo, y tu MIT junior dice en voz alta '¿Qué hacemos, llamamos a los bomberos?'",
    contextEn: "A fryer has a small grease fire (ignited grease). It was extinguished with a Class K extinguisher correctly. But the team is in panic: 3 Crew are shaking, Lobby customers saw the smoke, and your junior MIT says out loud 'What do we do, do we call the firefighters?'",
    rolesInvolved: ["MIT Director", "MIT Junior", "Crew", "Clientes"],
    psychNote: "Tests crisis communication, calm under pressure and ability to stabilize others",
    options: [
      {
        text: "Gritas '¡Todos tranquilos!' en voz alta y empiezas a dar instrucciones rápidas y simultáneas a todos.",
        textEn: "Shout 'Everyone calm down!' loudly and start giving rapid simultaneous instructions to everyone.",
        consequence: "Un líder gritando 'tranquilos' es la señal más potente de que la situación NO está bajo control. Los clientes en Lobby lo interpretarán como confirmación de crisis. El equipo se desestabiliza más.",
        consequenceEn: "A leader shouting 'calm down' is the most powerful signal that the situation is NOT under control. Lobby customers will interpret it as confirmation of crisis. The team destabilizes further.",
        isCorrect: false,
        roleImpact: "Amplificación del pánico",
      },
      {
        text: "Con voz firme y calmada: al MIT junior 'Tú, conmigo.' — Al Crew '3 minutos de pausa en sus estaciones.' — A los clientes del Lobby una disculpa tranquila y breve. En privado, verificas el estado del equipo y la freidora antes de reiniciar operaciones.",
        textEn: "With a firm, calm voice: to the junior MIT 'You, with me.' — To the Crew '3-minute pause at your stations.' — To Lobby customers a calm, brief apology. In private, you verify team status and the fryer before resuming operations.",
        consequence: "Tu calma es la estabilizadora del equipo entero. La voz firme comunica control. La pausa de 3 minutos permite que el cortisol del equipo baje. La comunicación segmentada (cada grupo recibe lo que necesita) evita el caos.",
        consequenceEn: "Your calm stabilizes the entire team. The firm voice communicates control. The 3-minute pause allows team cortisol to drop. Segmented communication (each group receives what they need) prevents chaos.",
        isCorrect: true,
        roleImpact: "Equipo estabilizado + clientes tranquilos",
      },
      {
        text: "Evacúas el restaurante preventivamente para 'estar seguros' aunque el fuego ya estaba extinguido.",
        textEn: "Evacuate the restaurant preventively to 'be safe' even though the fire was already extinguished.",
        consequence: "Una evacuación innecesaria causa pánico masivo, afecta las ventas del día, puede requerir intervención de bomberos (costo operacional), y daña la reputación del restaurante. Siempre evalúa el riesgo real antes de escalar.",
        consequenceEn: "An unnecessary evacuation causes mass panic, affects daily sales, may require fire department intervention (operational cost), and damages the restaurant's reputation. Always assess the real risk before escalating.",
        isCorrect: false,
        roleImpact: "Pánico masivo innecesario",
      },
    ],
    keyLearningEs: "En crisis, el líder es el espejo del equipo. Si el líder proyecta calma, el equipo la absorbe. La fórmula: Voz firme + Instrucción específica por persona + Tiempo para estabilizar = Control de la situación.",
    keyLearningEn: "In a crisis, the leader is the team's mirror. If the leader projects calm, the team absorbs it. The formula: Firm voice + Specific instruction per person + Time to stabilize = Situation control.",
  },
];

// ─── COMMUNICATION PROTOCOLS ──────────────────────────────────────────────────

export interface Protocol {
  id: string;
  titleEs: string;
  titleEn: string;
  emoji: string;
  summaryEs: string;
  summaryEn: string;
  steps: { labelEs: string; labelEn: string; descEs: string; descEn: string }[];
  exampleEs: string;
  exampleEn: string;
}

export const COMMUNICATION_PROTOCOLS: Protocol[] = [
  {
    id: "aces",
    titleEs: "Aces in their Places",
    titleEn: "Aces in their Places",
    emoji: "♠️",
    summaryEs: "Cada persona en la posición donde maximiza su impacto según su fortaleza. El objetivo es cubrir los puntos críticos con el talento más adecuado, no con quien esté disponible.",
    summaryEn: "Each person in the position where they maximize their impact based on their strength. The goal is to cover critical points with the most suitable talent, not with whoever is available.",
    steps: [
      { labelEs: "Mapea las fortalezas", labelEn: "Map strengths", descEs: "Conoce qué hace bien cada miembro del equipo: velocidad, precisión, calma bajo presión, comunicación con clientes.", descEn: "Know what each team member does well: speed, accuracy, calm under pressure, customer communication." },
      { labelEs: "Identifica los puntos críticos del turno", labelEn: "Identify the shift's critical points", descEs: "¿Dónde está el mayor riesgo hoy? DT, parrilla, drive-thru, cliente difícil en Lobby.", descEn: "Where is the highest risk today? DT, grill, drive-thru, difficult customer in Lobby." },
      { labelEs: "Asigna el As al punto crítico", labelEn: "Assign the Ace to the critical point", descEs: "Tu mejor operador va al punto de mayor riesgo. No al lugar más cómodo.", descEn: "Your best operator goes to the highest risk point. Not the most comfortable place." },
      { labelEs: "Comunica la razón", labelEn: "Communicate the reason", descEs: "'Juan, te pongo en DT porque eres el más rápido en cobros y hoy tenemos Rush doble.' La gente trabaja mejor cuando sabe por qué.", descEn: "'Juan, I'm putting you at DT because you're the fastest at payments and today we have double Rush.' People work better when they know why." },
    ],
    exampleEs: "Rush de mediodía: MIT experimentado → DT. Crew más preciso → ensamble de QPC. Crew con mejor servicio al cliente → FC. MIT junior → apoyo en cocina bajo supervisión.",
    exampleEn: "Midday rush: Experienced MIT → DT. Most precise Crew → QPC assembly. Best customer service Crew → FC. Junior MIT → kitchen support under supervision.",
  },
  {
    id: "last",
    titleEs: "Método L.A.S.T. — Resolución de Quejas",
    titleEn: "L.A.S.T. Method — Complaint Resolution",
    emoji: "🤝",
    summaryEs: "Framework de 4 pasos para resolver quejas de clientes y transformar experiencias negativas en lealtad. Fundamental para todos los MIs/MITs en interacción con clientes.",
    summaryEn: "4-step framework for resolving customer complaints and transforming negative experiences into loyalty. Fundamental for all MIs/MITs in customer interaction.",
    steps: [
      { labelEs: "L — Listen (Escuchar)", labelEn: "L — Listen", descEs: "Escucha sin interrumpir. Contacto visual. No defensivo. Dejar que el cliente complete su queja completamente.", descEn: "Listen without interrupting. Eye contact. Non-defensive. Let the customer fully complete their complaint." },
      { labelEs: "A — Apologize (Disculparse)", labelEn: "A — Apologize", descEs: "Disculpa incondicional y específica: 'Lamento mucho que su experiencia haya sido así.' Sin 'pero', sin excusas, sin justificaciones técnicas.", descEn: "Unconditional and specific apology: 'I'm very sorry your experience was like this.' No 'but', no excuses, no technical justifications." },
      { labelEs: "S — Solve (Solucionar)", labelEn: "S — Solve", descEs: "Ofrece una solución real e inmediata. Siempre más de lo esperado: reemplazar + cortesía. Nunca 'habla con mi supervisor' sin haber intentado resolver primero.", descEn: "Offer a real and immediate solution. Always more than expected: replace + courtesy. Never 'talk to my supervisor' without having tried to resolve first." },
      { labelEs: "T — Thank (Agradecer)", labelEn: "T — Thank", descEs: "'Gracias por decirme esto — nos ayuda a mejorar.' Transforma al cliente de crítico a colaborador. Cierra el ciclo emocionalmente.", descEn: "'Thank you for telling me this — it helps us improve.' Transforms the customer from critic to collaborator. Closes the emotional cycle." },
    ],
    exampleEs: "Cliente furioso por orden incorrecta: L: escuchar sin interrumpir → A: 'Lamento mucho esto, no debió ocurrir' → S: nueva orden + papas gratis → T: 'Gracias por avisarnos, aseguro que no se repita.'",
    exampleEn: "Furious customer about wrong order: L: listen without interrupting → A: 'I'm very sorry, this shouldn't have happened' → S: new order + free fries → T: 'Thank you for telling us, I'll make sure it doesn't happen again.'",
  },
  {
    id: "observation-post",
    titleEs: "Observation Post — Postura del SM",
    titleEn: "Observation Post — SM Posture",
    emoji: "👁️",
    summaryEs: "El Shift Manager es el director de orquesta, no el primer violín. Su posición correcta le permite tener visión total del restaurante y actuar preventivamente, no reactivamente.",
    summaryEn: "The Shift Manager is the orchestra conductor, not the first violin. Their correct position allows total restaurant visibility and proactive action, not reactive.",
    steps: [
      { labelEs: "Posición física correcta", labelEn: "Correct physical position", descEs: "Punto central desde el cual puedes ver simultáneamente: DT, FC, parrilla y lobby. Normalmente entre la cocina y el área de servicio.", descEn: "Central point from which you can simultaneously see: DT, FC, grill and lobby. Usually between the kitchen and service area." },
      { labelEs: "Nunca sustituyas a un Crew", labelEn: "Never substitute for a Crew", descEs: "Si te metes a una estación, pierdes el Observation Post. Delega siempre. Solo en emergencias absolutas y por máximo 2 minutos.", descEn: "If you step into a station, you lose the Observation Post. Always delegate. Only in absolute emergencies and for a maximum of 2 minutes." },
      { labelEs: "Ciclo de inspección visual", labelEn: "Visual inspection cycle", descEs: "Cada 3-5 minutos: DT → Parrilla → FC → Lobby → DT. Identifica anomalías antes de que sean crisis.", descEn: "Every 3-5 minutes: DT → Grill → FC → Lobby → DT. Identify anomalies before they become crises." },
      { labelEs: "Intervención dirigida", labelEn: "Directed intervention", descEs: "Cuando detectas un problema: comunica a la persona responsable de esa área, no actúes tú. 'María, UHC de nuggets está bajo — réllena en 2 min.'", descEn: "When you detect a problem: communicate to the person responsible for that area, don't act yourself. 'Maria, nugget UHC is low — refill in 2 min.'" },
    ],
    exampleEs: "SM parado entre cocina y servicio → ve que DT se retrasa → dice al MIT de DT 'Acelera cobros, hay 4 autos' → regresa a su Observation Post. Nunca fue al DT él mismo.",
    exampleEn: "SM standing between kitchen and service → sees DT slowing down → tells DT MIT 'Speed up payments, there are 4 cars' → returns to their Observation Post. Never went to DT themselves.",
  },
  {
    id: "delegation",
    titleEs: "Delegación Efectiva",
    titleEn: "Effective Delegation",
    emoji: "🎯",
    summaryEs: "Delegar no es mandar — es transferir la responsabilidad con los recursos y el contexto necesarios para que la persona tenga éxito. Un MIT que no delega se convierte en un cuello de botella.",
    summaryEn: "Delegating is not ordering — it's transferring responsibility with the resources and context needed for the person to succeed. An MIT who doesn't delegate becomes a bottleneck.",
    steps: [
      { labelEs: "Nombre específico", labelEn: "Specific name", descEs: "Nunca 'alguien haga X'. Siempre 'Carlos, haz X'. La difusión de responsabilidad mata la ejecución.", descEn: "Never 'someone do X'. Always 'Carlos, do X'. Diffusion of responsibility kills execution." },
      { labelEs: "Tarea específica y medible", labelEn: "Specific and measurable task", descEs: "'Rellena el UHC de nuggets' — no 'ocúpate de la cocina'. La especificidad elimina la ambigüedad y asegura el resultado.", descEn: "'Refill the nugget UHC' — not 'take care of the kitchen'. Specificity eliminates ambiguity and ensures the result." },
      { labelEs: "Tiempo de ejecución", labelEn: "Execution time", descEs: "'En 3 minutos' — no 'cuando puedas'. El tiempo crea urgencia y permite verificación.", descEn: "'In 3 minutes' — not 'when you can'. Time creates urgency and enables verification." },
      { labelEs: "Verificación y reconocimiento", labelEn: "Verification and recognition", descEs: "A los 3 minutos: verificas que se hizo. Si se hizo bien: 'Bien hecho, Carlos.' — El reconocimiento inmediato refuerza el comportamiento.", descEn: "At 3 minutes: verify it was done. If done well: 'Well done, Carlos.' — Immediate recognition reinforces the behavior." },
    ],
    exampleEs: "Delegación completa: 'Carlos (nombre), rellena el UHC de nuggets (tarea específica) en los próximos 3 minutos (tiempo). Avísame cuando esté listo (verificación).'",
    exampleEn: "Complete delegation: 'Carlos (name), refill the nugget UHC (specific task) in the next 3 minutes (time). Let me know when it's done (verification).'",
  },
];

// ─── ROLES MATRIX ────────────────────────────────────────────────────────────

export interface RoleCard {
  role: string;
  emoji: string;
  primaryEs: string;
  primaryEn: string;
  ownsEs: string[];
  ownsEn: string[];
  neverEs: string[];
  neverEn: string[];
}

export const ROLES_MATRIX: RoleCard[] = [
  {
    role: "MIT Director",
    emoji: "🎯",
    primaryEs: "Dirección estratégica del turno y desarrollo del equipo MIT",
    primaryEn: "Strategic shift direction and MIT team development",
    ownsEs: ["Observation Post y visión total del restaurante", "Decisiones de personal críticas (despidos temporales, crisis)", "Comunicación con el GM y Area Supervisor", "Mentoring activo del MIT en formación"],
    ownsEn: ["Observation Post and total restaurant vision", "Critical personnel decisions (temporary relief, crises)", "Communication with GM and Area Supervisor", "Active mentoring of MIT in training"],
    neverEs: ["Meterse a una estación (salvo emergencia máx. 2 min)", "Hacer el trabajo del Crew cuando hay Crew disponible", "Tomar decisiones sin contexto completo"],
    neverEn: ["Stepping into a station (except emergency max. 2 min)", "Doing Crew work when Crew is available", "Making decisions without complete context"],
  },
  {
    role: "GM Facility",
    emoji: "🏆",
    primaryEs: "P&L, estándares globales, relación con franquiciante y desarrollo del MIT Director",
    primaryEn: "P&L, global standards, franchisee relationship and MIT Director development",
    ownsEs: ["Aprobaciones de gasto y compras de emergencia", "Decisiones de Food Safety críticas (cierre de línea, descarte masivo)", "Evaluaciones de desempeño y planes de desarrollo del equipo MIT", "Relación con proveedores y cadena de suministro"],
    ownsEn: ["Expenditure approvals and emergency purchases", "Critical Food Safety decisions (line shutdown, mass discard)", "Performance evaluations and MIT team development plans", "Supplier relationships and supply chain"],
    neverEs: ["Microgestionar las posiciones del turno si hay un SM competente", "Tomar decisiones de turno sin informar al SM en turno"],
    neverEn: ["Micromanaging shift positions if there's a competent SM", "Making shift decisions without informing the on-shift SM"],
  },
  {
    role: "Area Supervisor",
    emoji: "📊",
    primaryEs: "Supervisión multi-restaurante, benchmarking y escalación de decisiones de franquicia",
    primaryEn: "Multi-restaurant supervision, benchmarking and franchise decision escalation",
    ownsEs: ["Comparación de métricas entre restaurantes de la zona", "Aprobación de inversiones en equipamiento y mejoras", "Resolución de conflictos escalados entre GMs", "Inspecciones de Gold Standard y auditorías operacionales"],
    ownsEn: ["Metrics comparison between zone restaurants", "Equipment investment and improvement approvals", "Escalated conflict resolution between GMs", "Gold Standard inspections and operational audits"],
    neverEs: ["Intervenir en operaciones diarias sin hablar primero con el GM", "Comunicar cambios de política directamente al crew sin pasar por el GM"],
    neverEn: ["Intervening in daily operations without speaking to the GM first", "Communicating policy changes directly to crew without going through the GM"],
  },
  {
    role: "Crew Operator",
    emoji: "⚡",
    primaryEs: "Excelencia en la ejecución de su estación y comunicación activa de problemas",
    primaryEn: "Excellence in station execution and active problem communication",
    ownsEs: ["Gold Standard en su estación asignada", "Comunicar al SM cualquier problema de calidad, equipo o safety", "Mantener limpieza y orden 5S en su área", "Contribuir al ambiente de equipo positivo"],
    ownsEn: ["Gold Standard at their assigned station", "Communicate to SM any quality, equipment or safety issue", "Maintain 5S cleanliness and order in their area", "Contribute to a positive team environment"],
    neverEs: ["Tomar decisiones de área sin comunicar al SM", "Ignorar problemas de Food Safety por no querer 'molestar'"],
    neverEn: ["Making area decisions without communicating to SM", "Ignoring Food Safety issues to avoid 'bothering' anyone"],
  },
];
