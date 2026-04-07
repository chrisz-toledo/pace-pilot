/**
 * lib/equipment-manuals.ts
 * McDonald's equipment troubleshooting & SOP quick reference.
 * Based on standard McDonald's kitchen equipment procedures.
 */

export interface TroubleshootStep {
  step: string;
  detail: string;
}

export interface EquipmentIssue {
  id: string;
  symptom: string;
  symptomEn: string;
  severity: "low" | "medium" | "high" | "critical";
  cause: string;
  causeEn: string;
  steps: TroubleshootStep[];
  stepsEn: TroubleshootStep[];
  escalate: string;
  escalateEn: string;
}

export interface ManualSection {
  titleEs: string;
  titleEn: string;
  items: { labelEs: string; labelEn: string; valueEs: string; valueEn: string }[];
}

export interface DailyTask {
  timeEs: string;
  timeEn: string;
  taskEs: string;
  taskEn: string;
}

export interface EquipmentRef {
  overviewEs: string;
  overviewEn: string;
  specs: ManualSection;
  dailyMaintenance: DailyTask[];
  preventiveMaintenance: ManualSection;
  safetyWarnings: { es: string; en: string }[];
}

export interface EquipmentManual {
  id: string;
  nameEs: string;
  nameEn: string;
  emoji: string;
  model?: string;
  ref?: EquipmentRef;
  issues: EquipmentIssue[];
}

export const EQUIPMENT_MANUALS: EquipmentManual[] = [
  {
    id: "freidora",
    nameEs: "Freidora de Papas",
    nameEn: "French Fry Fryer",
    emoji: "🍟",
    model: "Henny Penny / Pitco Frialator",
    ref: {
      overviewEs: "La freidora de papas es uno de los equipos más críticos de la cocina McDonald's. Utiliza aceite vegetal de canola a temperatura controlada para producir papas fritas con el crujido y color característico del Gold Standard. Un manejo correcto del aceite impacta directamente el P&L mensual de la tienda.",
      overviewEn: "The french fry fryer is one of the most critical pieces of equipment in a McDonald's kitchen. It uses canola vegetable oil at a controlled temperature to produce fries with the characteristic Gold Standard crunch and color. Proper oil management directly impacts the store's monthly P&L.",
      specs: {
        titleEs: "Especificaciones Operacionales",
        titleEn: "Operational Specifications",
        items: [
          { labelEs: "Temperatura de operación", labelEn: "Operating temperature", valueEs: "168 °C / 335 °F", valueEn: "168 °C / 335 °F" },
          { labelEs: "Tiempo de cocción — Papas Regulares", labelEn: "Cook time — Regular Fries", valueEs: "3 min 10 seg", valueEn: "3 min 10 sec" },
          { labelEs: "Tiempo de cocción — Papas Grandes", labelEn: "Cook time — Large Fries", valueEs: "3 min 10 seg", valueEn: "3 min 10 sec" },
          { labelEs: "Tiempo de retención en estación", labelEn: "Hold time at station", valueEs: "7 minutos máximo", valueEn: "7 minutes maximum" },
          { labelEs: "Capacidad de aceite por canasta", labelEn: "Oil capacity per basket", valueEs: "Aprox. 3.6 kg de aceite", valueEn: "Approx. 3.6 kg of oil" },
          { labelEs: "Herramienta de medición de aceite", labelEn: "Oil quality measurement tool", valueEs: "T-Stick (Test de polaridad)", valueEn: "T-Stick (Polarity test)" },
        ],
      },
      dailyMaintenance: [
        { timeEs: "Al inicio del turno", timeEn: "At shift start", taskEs: "Verificar nivel y color del aceite. Completar si es necesario. Encender y esperar que alcance 168 °C antes de iniciar producción.", taskEn: "Check oil level and color. Top up if needed. Turn on and wait for 168 °C before starting production." },
        { timeEs: "Cada 2 horas en operación", timeEn: "Every 2 hours during operation", taskEs: "Filtrar el aceite usando el ciclo de filtrado automático. Retirar sedimentos del fondo con el utensilio aprobado.", taskEn: "Filter oil using the automatic filtering cycle. Remove sediment from the bottom with the approved utensil." },
        { timeEs: "Al final de cada turno", timeEn: "At end of each shift", taskEs: "Limpiar el exterior de la freidora con paño húmedo. Cubrir las canastas. No apagar si hay otro turno continuo.", taskEn: "Clean the exterior with a damp cloth. Cover baskets. Do not turn off if there is a continuous next shift." },
        { timeEs: "Al cierre de operaciones", timeEn: "At close of operations", taskEs: "Apagar la freidora. Dejar enfriar 30 min. Limpiar el recipiente interno con el utensilio de limpieza aprobado. Nunca usar agua en aceite caliente.", taskEn: "Turn off fryer. Allow 30 min to cool. Clean internal vessel with approved cleaning utensil. Never use water on hot oil." },
      ],
      preventiveMaintenance: {
        titleEs: "Mantenimiento Preventivo Programado",
        titleEn: "Scheduled Preventive Maintenance",
        items: [
          { labelEs: "Cambio completo de aceite", labelEn: "Complete oil change", valueEs: "Cada 2–3 días (según resultado del T-Stick)", valueEn: "Every 2–3 days (based on T-Stick result)" },
          { labelEs: "Limpieza profunda del recipiente (Boil-Out)", labelEn: "Deep vessel cleaning (Boil-Out)", valueEs: "Semanal — usar compuesto de limpieza aprobado", valueEn: "Weekly — use approved cleaning compound" },
          { labelEs: "Inspección de la sonda de temperatura", labelEn: "Temperature probe inspection", valueEs: "Mensual por técnico autorizado", valueEn: "Monthly by authorized technician" },
          { labelEs: "Revisión del filtro de aceite y bomba", labelEn: "Oil filter and pump inspection", valueEs: "Mensual — reemplazar si hay bloqueo", valueEn: "Monthly — replace if blocked" },
          { labelEs: "Inspección general de resistencias y termostato", labelEn: "Heating elements and thermostat inspection", valueEs: "Trimestral por técnico certificado", valueEn: "Quarterly by certified technician" },
        ],
      },
      safetyWarnings: [
        { es: "NUNCA agregar agua a aceite caliente — puede causar una explosión de vapor y quemaduras graves.", en: "NEVER add water to hot oil — it can cause a steam explosion and severe burns." },
        { es: "Usar SIEMPRE guantes de protección térmica al manipular canastas o aceite.", en: "ALWAYS use thermal protection gloves when handling baskets or oil." },
        { es: "Si el aceite empieza a humear excesivamente (>185 °C), apagar la freidora inmediatamente.", en: "If oil starts smoking excessively (>185 °C), turn off the fryer immediately." },
        { es: "El extintor de incendios de tipo K debe estar accesible a menos de 3 metros de la freidora.", en: "Class K fire extinguisher must be accessible within 3 meters of the fryer." },
      ],
    },
    issues: [
      {
        id: "f1",
        symptom: "Aceite humeante excesivamente o olor quemado",
        symptomEn: "Excessive smoking oil or burnt smell",
        severity: "high",
        cause: "Aceite degradado o temperatura > 180°C. Probable fallo en el sensor de temperatura.",
        causeEn: "Degraded oil or temperature > 180°C. Probable temperature sensor failure.",
        steps: [
          { step: "Apagar la freidora inmediatamente", detail: "Usar el interruptor principal (OFF). No tocar el aceite caliente." },
          { step: "Medir temperatura con termómetro de sonda", detail: "Si supera 190°C, hay fallo del termostato. Evacuar la estación." },
          { step: "Verificar color del aceite", detail: "Aceite negro u oscuro = cambiar inmediatamente. Usar T-Stick para medir calidad." },
          { step: "Revisar filtro de aceite", detail: "Si el filtro está bloqueado, el aceite no circula. Limpiar o reemplazar el filtro." },
          { step: "Enfriar 30 min antes de cualquier mantenimiento", detail: "Nunca manipular aceite con temperatura > 60°C." },
        ],
        stepsEn: [
          { step: "Turn off fryer immediately", detail: "Use main switch (OFF). Do not touch hot oil." },
          { step: "Measure temperature with probe thermometer", detail: "If above 190°C, thermostat failure. Evacuate station." },
          { step: "Check oil color", detail: "Black or very dark oil = change immediately. Use T-Stick to measure quality." },
          { step: "Check oil filter", detail: "If filter is blocked, oil does not circulate. Clean or replace filter." },
          { step: "Cool for 30 min before any maintenance", detail: "Never handle oil above 60°C." },
        ],
        escalate: "Si temperatura no baja después de apagar, o hay olor a quemado eléctrico: llamar a mantenimiento de urgencia y sacar el equipo de servicio.",
        escalateEn: "If temperature doesn't drop after shutdown, or there is electrical burning smell: call emergency maintenance and remove unit from service.",
      },
      {
        id: "f2",
        symptom: "Error de temperatura — pantalla muestra 'TEMP FAULT' o parpadea",
        symptomEn: "Temperature error — screen shows 'TEMP FAULT' or flashes",
        severity: "medium",
        cause: "Sonda de temperatura sucia, desconectada o dañada.",
        causeEn: "Temperature probe dirty, disconnected, or damaged.",
        steps: [
          { step: "Apagar y dejar enfriar 15 min", detail: "No operar con error de temperatura activo." },
          { step: "Limpiar la sonda de temperatura", detail: "Con un paño limpio y seco, limpiar la sonda en la parte inferior del recipiente de aceite." },
          { step: "Verificar conexiones de la sonda", detail: "Buscar el cable de la sonda en la parte posterior del equipo. Debe estar firmemente conectado." },
          { step: "Reset del equipo", detail: "Apagar completamente → esperar 30 seg → encender. Si el error persiste, sacar de servicio." },
        ],
        stepsEn: [
          { step: "Turn off and cool for 15 min", detail: "Do not operate with active temperature error." },
          { step: "Clean the temperature probe", detail: "With a clean dry cloth, clean the probe at the bottom of the oil vessel." },
          { step: "Verify probe connections", detail: "Locate probe cable at rear of unit. Must be firmly connected." },
          { step: "Equipment reset", detail: "Full power off → wait 30 sec → power on. If error persists, remove from service." },
        ],
        escalate: "Si el error regresa después del reset: sacar de servicio y escalar a mantenimiento. No forzar la operación.",
        escalateEn: "If error returns after reset: remove from service and escalate to maintenance. Do not force operation.",
      },
    ],
  },
  {
    id: "uhc",
    nameEs: "Gabinete UHC (Universal Holding Cabinet)",
    nameEn: "UHC (Universal Holding Cabinet)",
    emoji: "🌡️",
    model: "Duke / Carter Hoffmann",
    ref: {
      overviewEs: "El UHC (Universal Holding Cabinet) es el gabinete de retención caliente que mantiene el producto cocinado a temperatura segura hasta que se ensambla la orden. Es el corazón de la operación: un UHC mal configurado provoca producto fuera de temperatura, lo que representa un riesgo de Food Safety y pérdida de calidad.",
      overviewEn: "The UHC (Universal Holding Cabinet) is the hot holding cabinet that keeps cooked product at a safe temperature until the order is assembled. It is the heart of the operation: a poorly configured UHC causes product out of temperature, representing a Food Safety risk and quality loss.",
      specs: {
        titleEs: "Especificaciones y Tiempos de Retención",
        titleEn: "Specifications and Holding Times",
        items: [
          { labelEs: "Temperatura de operación", labelEn: "Operating temperature", valueEs: "72–77 °C / 162–170 °F", valueEn: "72–77 °C / 162–170 °F" },
          { labelEs: "Tiempo de retención — Carne 10:1", labelEn: "Hold time — 10:1 Beef", valueEs: "15 minutos máx.", valueEn: "15 minutes max." },
          { labelEs: "Tiempo de retención — Carne 4:1 (QPC)", labelEn: "Hold time — 4:1 Beef (QPC)", valueEs: "20 minutos máx.", valueEn: "20 minutes max." },
          { labelEs: "Tiempo de retención — Nuggets de Pollo", labelEn: "Hold time — Chicken McNuggets", valueEs: "20 minutos máx.", valueEn: "20 minutes max." },
          { labelEs: "Tiempo de retención — Filete de Pollo", labelEn: "Hold time — Chicken Filet", valueEs: "30 minutos máx.", valueEn: "30 minutes max." },
          { labelEs: "Tiempo de retención — Huevo Round/Folded", labelEn: "Hold time — Round/Folded Egg", valueEs: "15 minutos máx.", valueEn: "15 minutes max." },
          { labelEs: "Indicador de temperatura correcta", labelEn: "Correct temperature indicator", valueEs: "LED Verde fijo en cada bandeja", valueEn: "Solid Green LED on each tray" },
        ],
      },
      dailyMaintenance: [
        { timeEs: "Al encender", timeEn: "At startup", taskEs: "Encender el UHC 15 min antes de iniciar producción para que alcance la temperatura programada. Verificar que todos los LEDs estén en verde.", taskEn: "Turn on UHC 15 min before starting production to reach programmed temperature. Verify all LEDs are green." },
        { timeEs: "Cada hora", timeEn: "Every hour", taskEs: "Verificar visualmente que los timers de cada bandeja estén activos. Descartar cualquier producto que haya superado su tiempo de retención.", taskEn: "Visually verify that timers on each tray are active. Discard any product that has exceeded its holding time." },
        { timeEs: "Al cambio de producto", timeEn: "At product change", taskEs: "Limpiar la bandeja con paño húmedo antes de colocar nuevo producto. No mezclar productos en la misma bandeja.", taskEn: "Clean tray with damp cloth before placing new product. Do not mix products in the same tray." },
        { timeEs: "Al cierre", timeEn: "At close", taskEs: "Apagar el UHC. Retirar todas las bandejas. Lavar con agua tibia y detergente aprobado. Secar completamente antes de volver a instalar.", taskEn: "Turn off UHC. Remove all trays. Wash with warm water and approved detergent. Dry completely before reinstalling." },
      ],
      preventiveMaintenance: {
        titleEs: "Mantenimiento Preventivo",
        titleEn: "Preventive Maintenance",
        items: [
          { labelEs: "Limpieza profunda de bandejas y guías", labelEn: "Deep cleaning of trays and guides", valueEs: "Semanal", valueEn: "Weekly" },
          { labelEs: "Revisión de los sensores de temperatura por bandeja", labelEn: "Temperature sensor check per tray", valueEs: "Mensual", valueEn: "Monthly" },
          { labelEs: "Actualización de firmware del panel de control", labelEn: "Control panel firmware update", valueEs: "Según notificación del fabricante", valueEn: "Per manufacturer notification" },
          { labelEs: "Inspección del elemento calefactor", labelEn: "Heating element inspection", valueEs: "Trimestral por técnico autorizado", valueEn: "Quarterly by authorized technician" },
        ],
      },
      safetyWarnings: [
        { es: "Nunca colocar producto por debajo de 60 °C (140 °F) de vuelta al UHC — es una violación de Food Safety.", en: "Never place product below 60 °C (140 °F) back in the UHC — this is a Food Safety violation." },
        { es: "Si el gabinete pierde temperatura y el producto estuvo < 60 °C por más de 15 min, el producto se descarta SIEMPRE.", en: "If the cabinet loses temperature and product was < 60 °C for more than 15 min, product is ALWAYS discarded." },
        { es: "No limpiar el UHC con agua mientras está encendido — desconectar primero.", en: "Do not clean the UHC with water while it is on — disconnect first." },
      ],
    },
    issues: [
      {
        id: "uhc1",
        symptom: "LED de temperatura parpadea en rojo / alarma sonora",
        symptomEn: "Temperature LED flashing red / audible alarm",
        severity: "high",
        cause: "Temperatura cayó fuera del rango programado. El producto puede estar comprometido.",
        causeEn: "Temperature dropped outside programmed range. Product may be compromised.",
        steps: [
          { step: "Verificar temperatura real con termómetro de sonda", detail: "Insertar la sonda en el producto más grueso. Si < 60°C (140°F), el producto es descarte." },
          { step: "Revisar si el gabinete está correctamente cerrado", detail: "Las puertas mal cerradas causan pérdida de calor en minutos." },
          { step: "Verificar ventilación del gabinete", detail: "Los orificios de ventilación deben estar libres de bloqueos (paños, cajas)." },
          { step: "Revisar el elemento calefactor", detail: "Abrir el panel trasero con la unidad fría — verificar que el calefactor esté encendido." },
          { step: "Descartar producto comprometido", detail: "Todo producto que estuvo por debajo de 60°C por > 15 min se descarta. Documentar en bitácora." },
        ],
        stepsEn: [
          { step: "Verify real temperature with probe thermometer", detail: "Insert probe in thickest product. If < 60°C (140°F), product is discard." },
          { step: "Check if cabinet is properly closed", detail: "Poorly closed doors cause heat loss within minutes." },
          { step: "Check cabinet ventilation", detail: "Ventilation holes must be free from blockages (cloths, boxes)." },
          { step: "Check heating element", detail: "Open rear panel with unit cold — verify heater is on." },
          { step: "Discard compromised product", detail: "All product below 60°C for > 15 min is discarded. Document in log." },
        ],
        escalate: "Si el UHC no mantiene temperatura después de revisión: sacar de servicio, notificar al GM, llamar a mantenimiento.",
        escalateEn: "If UHC doesn't hold temperature after review: remove from service, notify GM, call maintenance.",
      },
      {
        id: "uhc2",
        symptom: "Timer de producto no funciona o no registra automáticamente",
        symptomEn: "Product timer not working or not registering automatically",
        severity: "medium",
        cause: "Fallo de software del panel de control o sensor de bandeja.",
        causeEn: "Control panel software failure or tray sensor fault.",
        steps: [
          { step: "Reset del panel de control", detail: "Mantener presionado el botón de reset del panel por 5 seg. Soltar y esperar reinicio." },
          { step: "Limpiar los sensores de bandeja", detail: "Con paño seco, limpiar los contactos metálicos en la base de cada ranura de bandeja." },
          { step: "Usar timers manuales como respaldo", detail: "Mientras se resuelve el fallo, usar el timer físico de cocina para controlar tiempos de retención. Documentar en bitácora." },
          { step: "Verificar la versión del firmware", detail: "En el menú de configuración → 'System Info'. Si hay actualización pendiente, aplicarla." },
        ],
        stepsEn: [
          { step: "Reset control panel", detail: "Hold reset button on panel for 5 sec. Release and wait for reboot." },
          { step: "Clean tray sensors", detail: "With dry cloth, clean metallic contacts at base of each tray slot." },
          { step: "Use manual timers as backup", detail: "While fault is resolved, use physical kitchen timer to control holding times. Document in log." },
          { step: "Check firmware version", detail: "In settings menu → 'System Info'. If update pending, apply it." },
        ],
        escalate: "Si el timer no funciona después del reset y el firmware está actualizado: escalar a soporte técnico de Duke/Carter.",
        escalateEn: "If timer doesn't work after reset and firmware is updated: escalate to Duke/Carter technical support.",
      },
    ],
  },
  {
    id: "parrilla",
    nameEs: "Parrilla / Grill",
    nameEn: "Grill / Clamshell",
    emoji: "🍖",
    model: "Garland Clamshell / Taylor",
    ref: {
      overviewEs: "La parrilla de contacto (Clamshell) cocina la carne simultáneamente por arriba y por abajo, garantizando una cocción uniforme y tiempos de ciclo precisos. Es la base del Gold Standard de las hamburguesas McDonald's. Una parrilla mal calibrada es la causa más común de carnes fuera de temperatura interna.",
      overviewEn: "The contact grill (Clamshell) cooks meat simultaneously from top and bottom, ensuring uniform cooking and precise cycle times. It is the foundation of McDonald's burger Gold Standard. A poorly calibrated grill is the most common cause of meat below safe internal temperature.",
      specs: {
        titleEs: "Especificaciones de Cocción",
        titleEn: "Cooking Specifications",
        items: [
          { labelEs: "Temperatura de planchas (zona de cocción)", labelEn: "Plate temperature (cooking zone)", valueEs: "215–230 °C / 420–446 °F", valueEn: "215–230 °C / 420–446 °F" },
          { labelEs: "Temperatura interna mínima — Res", labelEn: "Minimum internal temperature — Beef", valueEs: "68 °C / 155 °F", valueEn: "68 °C / 155 °F" },
          { labelEs: "Tiempo de cocción — Carne 10:1", labelEn: "Cook time — 10:1 Beef", valueEs: "38–40 segundos", valueEn: "38–40 seconds" },
          { labelEs: "Tiempo de cocción — Carne 4:1 (QPC)", labelEn: "Cook time — 4:1 Beef (QPC)", valueEs: "105–115 segundos", valueEn: "105–115 seconds" },
          { labelEs: "Tiempo de cocción — Carne de Desayuno", labelEn: "Cook time — Breakfast Sausage", valueEs: "75–90 segundos", valueEn: "75–90 seconds" },
          { labelEs: "Verificación de temperatura", labelEn: "Temperature verification", valueEs: "Termómetro de sonda al inicio de cada turno", valueEn: "Probe thermometer at start of each shift" },
        ],
      },
      dailyMaintenance: [
        { timeEs: "Al inicio del turno", timeEn: "At shift start", taskEs: "Encender la parrilla y esperar 5–8 min para que alcance temperatura. Verificar con termómetro de superficie. Aplicar agente desmoldante aprobado en la plancha superior.", taskEn: "Turn on grill and wait 5–8 min to reach temperature. Verify with surface thermometer. Apply approved release agent to top plate." },
        { timeEs: "Cada 30 min durante operación", timeEn: "Every 30 min during operation", taskEs: "Raspar los residuos de carne de las planchas con el raspador metálico aprobado. Los residuos quemados afectan la transferencia de calor.", taskEn: "Scrape meat residue from plates with approved metal scraper. Burnt residue affects heat transfer." },
        { timeEs: "Al cambio de producto (carne → pollo)", timeEn: "At product change (beef → chicken)", taskEs: "Limpiar completamente las planchas antes de cambiar a otro tipo de proteína. Protocolo de prevención de contaminación cruzada.", taskEn: "Fully clean plates before switching to another protein type. Cross-contamination prevention protocol." },
        { timeEs: "Al cierre", timeEn: "At close", taskEs: "Apagar la parrilla. Cuando esté tibia (no fría), raspar residuos. Aplicar el compuesto de limpieza de grasa aprobado. Limpiar con paño limpio. No usar agua directa.", taskEn: "Turn off grill. When warm (not cold), scrape residue. Apply approved degreaser compound. Clean with clean cloth. Do not use direct water." },
      ],
      preventiveMaintenance: {
        titleEs: "Mantenimiento Preventivo",
        titleEn: "Preventive Maintenance",
        items: [
          { labelEs: "Calibración de temperatura de planchas", labelEn: "Plate temperature calibration", valueEs: "Semanal — registrar en bitácora", valueEn: "Weekly — log in maintenance record" },
          { labelEs: "Limpieza profunda de planchas (ácido neutralizante)", labelEn: "Deep plate cleaning (neutralizing acid)", valueEs: "Semanal", valueEn: "Weekly" },
          { labelEs: "Inspección de bisagras y resortes del Clamshell", labelEn: "Clamshell hinges and springs inspection", valueEs: "Mensual", valueEn: "Monthly" },
          { labelEs: "Revisión de resistencias calefactoras", labelEn: "Heating element inspection", valueEs: "Trimestral por técnico certificado", valueEn: "Quarterly by certified technician" },
        ],
      },
      safetyWarnings: [
        { es: "NUNCA tocar las planchas con las manos — temperatura de operación puede causar quemaduras de tercer grado en menos de 1 segundo.", en: "NEVER touch the plates with bare hands — operating temperature can cause third-degree burns in less than 1 second." },
        { es: "Si la parrilla huele a quemado eléctrico (diferente al olor de carne), apagar inmediatamente y reportar.", en: "If the grill smells of electrical burning (different from meat smell), turn off immediately and report." },
        { es: "Usar SIEMPRE guantes de protección al raspar o limpiar la parrilla, aunque esté tibia.", en: "ALWAYS use protection gloves when scraping or cleaning the grill, even when warm." },
      ],
    },
    issues: [
      {
        id: "g1",
        symptom: "Parrilla no calienta uniformemente — manchas frías visibles",
        symptomEn: "Grill not heating evenly — visible cold spots",
        severity: "high",
        cause: "Elemento calefactor dañado o planchas con carbonización excesiva.",
        causeEn: "Damaged heating element or excessively carbonized plates.",
        steps: [
          { step: "Realizar prueba de temperatura con termómetro de superficie", detail: "Puntos fríos < 165°C en zona de cocción son inaceptables. Tomar temperatura en al menos 5 puntos." },
          { step: "Limpiar las planchas completamente", detail: "Con el raspador aprobado, remover toda la carbonización. Las manchas negras gruesas bloquean la transferencia de calor." },
          { step: "Verificar presión del gas (si aplica)", detail: "Presión baja de gas causa calentamiento irregular. Verificar manómetro de conexión." },
          { step: "Calibración de temperatura", detail: "Acceder al menú de calibración del panel → ajustar temperatura target → guardar configuración." },
        ],
        stepsEn: [
          { step: "Temperature test with surface thermometer", detail: "Cold spots < 165°C in cooking zone are unacceptable. Take temperature at 5+ points." },
          { step: "Fully clean the plates", detail: "With approved scraper, remove all carbonization. Thick black spots block heat transfer." },
          { step: "Check gas pressure (if applicable)", detail: "Low gas pressure causes uneven heating. Check connection pressure gauge." },
          { step: "Temperature calibration", detail: "Access panel calibration menu → adjust target temperature → save configuration." },
        ],
        escalate: "Si la parrilla tiene manchas frías después de limpieza y calibración: sacar de servicio. Un patty cocinado en zona fría puede tener temperatura interna < 155°F — riesgo de intoxicación.",
        escalateEn: "If grill has cold spots after cleaning and calibration: remove from service. A patty cooked in a cold zone may have internal temperature < 155°F — intoxication risk.",
      },
    ],
  },
  {
    id: "maquina-helado",
    nameEs: "Máquina de Helado / McFlurry",
    nameEn: "Ice Cream / McFlurry Machine",
    emoji: "🍦",
    model: "Taylor C602 / Taylor 8756",
    ref: {
      overviewEs: "La máquina Taylor es el equipo más complejo de la cocina McDonald's. Combina refrigeración mecánica, pasteurización automática y dispensación de mix congelado. Su ciclo de limpieza automática (Heat Treatment) es obligatorio por normas sanitarias y no puede omitirse. La correcta operación de esta máquina impacta directamente las ventas de McCafé y postres.",
      overviewEn: "The Taylor machine is the most complex piece of equipment in a McDonald's kitchen. It combines mechanical refrigeration, automatic pasteurization and frozen mix dispensing. Its automatic cleaning cycle (Heat Treatment) is mandatory by sanitary regulations and cannot be skipped. Correct operation directly impacts McCafé and dessert sales.",
      specs: {
        titleEs: "Especificaciones Operacionales",
        titleEn: "Operational Specifications",
        items: [
          { labelEs: "Temperatura del cilindro de congelación", labelEn: "Freezing cylinder temperature", valueEs: "-3 °C a -5 °C (26–23 °F)", valueEn: "-3 °C to -5 °C (26–23 °F)" },
          { labelEs: "Temperatura de almacenamiento del mix en hopper", labelEn: "Mix storage temperature in hopper", valueEs: "< 5 °C / 41 °F", valueEn: "< 5 °C / 41 °F" },
          { labelEs: "Ciclo de limpieza automática (Heat Treatment)", labelEn: "Automatic cleaning cycle (Heat Treatment)", valueEs: "Cada 4 horas — dura ~30 min", valueEn: "Every 4 hours — lasts ~30 min" },
          { labelEs: "Temperatura del ciclo Heat Treatment", labelEn: "Heat Treatment cycle temperature", valueEs: "71 °C / 160 °F por 25 min (pasteurización)", valueEn: "71 °C / 160 °F for 25 min (pasteurization)" },
          { labelEs: "Vueltas del cono de Vainilla estándar", labelEn: "Standard Vanilla cone turns", valueEs: "2.5 vueltas + base", valueEn: "2.5 turns + base" },
          { labelEs: "Modo de operación normal", labelEn: "Normal operating mode", valueEs: "AUTO (el compresor actúa automáticamente)", valueEn: "AUTO (compressor acts automatically)" },
        ],
      },
      dailyMaintenance: [
        { timeEs: "Al inicio del turno", timeEn: "At shift start", taskEs: "Verificar la pantalla: debe mostrar 'READY' o 'STANDBY'. Verificar nivel del mix en el hopper. Realizar una prueba de dispensación para verificar textura (ni muy líquida ni muy dura).", taskEn: "Check screen: must show 'READY' or 'STANDBY'. Verify mix level in hopper. Perform a dispensing test to verify texture (not too liquid or too hard)." },
        { timeEs: "Cada 4 horas (automático)", timeEn: "Every 4 hours (automatic)", taskEs: "La máquina ejecuta el Heat Treatment automáticamente. Durante este ciclo (~30 min) NO se puede dispensar producto. Planificar stock de postres alternativos.", taskEn: "The machine runs Heat Treatment automatically. During this cycle (~30 min) product CANNOT be dispensed. Plan alternative dessert stock." },
        { timeEs: "Al reabastecer el mix", timeEn: "When restocking mix", taskEs: "Usar SIEMPRE mix del mismo lote o una marca aprobada por McDonald's. Nunca diluir con agua. Agregar el mix frío directamente desde el envase refrigerado.", taskEn: "ALWAYS use mix from the same batch or a McDonald's-approved brand. Never dilute with water. Add cold mix directly from the refrigerated container." },
        { timeEs: "Al cierre de operaciones", timeEn: "At close of operations", taskEs: "Iniciar el ciclo de limpieza manual completo desde el menú de mantenimiento. Desmontar y lavar por separado: válvula dispensadora, sellos y canales de mix. Secar completamente.", taskEn: "Start the full manual cleaning cycle from the maintenance menu. Disassemble and wash separately: dispensing valve, seals and mix channels. Dry completely." },
      ],
      preventiveMaintenance: {
        titleEs: "Mantenimiento Preventivo",
        titleEn: "Preventive Maintenance",
        items: [
          { labelEs: "Cambio de sellos y O-rings de la válvula", labelEn: "Valve seals and O-rings replacement", valueEs: "Cada 2 semanas", valueEn: "Every 2 weeks" },
          { labelEs: "Lubricación de componentes internos (lubricante aprobado)", labelEn: "Internal component lubrication (approved lubricant)", valueEs: "Semanal durante limpieza profunda", valueEn: "Weekly during deep cleaning" },
          { labelEs: "Inspección del compresor y sistema de refrigeración", labelEn: "Compressor and refrigeration system inspection", valueEs: "Mensual por técnico Taylor certificado", valueEn: "Monthly by certified Taylor technician" },
          { labelEs: "Calibración del ciclo Heat Treatment", labelEn: "Heat Treatment cycle calibration", valueEs: "Trimestral — registrar en bitácora sanitaria", valueEn: "Quarterly — log in sanitary record" },
        ],
      },
      safetyWarnings: [
        { es: "El ciclo Heat Treatment NO es opcional — omitirlo puede resultar en contaminación bacteriana del mix (Listeria, Salmonella) y cierre sanitario.", en: "The Heat Treatment cycle is NOT optional — skipping it can result in bacterial contamination of the mix (Listeria, Salmonella) and health closure." },
        { es: "El mix de helado fuera de temperatura (> 5 °C en hopper) debe descartarse — no reutilizar.", en: "Ice cream mix out of temperature (> 5 °C in hopper) must be discarded — do not reuse." },
        { es: "Nunca intentar reparar internamente la máquina sin certificación Taylor — los componentes de refrigeración contienen gas refrigerante presurizado.", en: "Never attempt to internally repair the machine without Taylor certification — refrigeration components contain pressurized refrigerant gas." },
      ],
    },
    issues: [
      {
        id: "h1",
        symptom: "Pantalla muestra 'CLEANING' o 'IN WASH' — no sirve producto",
        symptomEn: "Screen shows 'CLEANING' or 'IN WASH' — not dispensing",
        severity: "medium",
        cause: "La máquina está en ciclo de limpieza automática programada.",
        causeEn: "Machine is in scheduled automatic cleaning cycle.",
        steps: [
          { step: "Verificar la hora del ciclo de limpieza programado", detail: "El ciclo automático tarda 4 horas. No se puede interrumpir a mitad. Revisar el horario en el menú de configuración." },
          { step: "Verificar si hay mezcla suficiente en el hopper", detail: "Niveles bajos de mezcla también pueden disparar el ciclo. Revisar el nivel y agregar mezcla si es necesario." },
          { step: "Esperar finalización del ciclo", detail: "Una vez completado, la pantalla mostrará 'READY' o 'STANDBY'. Puede tomar hasta 4 horas." },
          { step: "Si el ciclo está bloqueado (> 4 horas)", detail: "Apagar la máquina completamente → esperar 5 min → encender. Iniciar ciclo de limpieza manual desde el menú." },
        ],
        stepsEn: [
          { step: "Check scheduled cleaning cycle time", detail: "Automatic cycle takes 4 hours. Cannot be interrupted mid-cycle. Check schedule in settings menu." },
          { step: "Check if there is enough mix in hopper", detail: "Low mix levels can also trigger cycle. Check level and add mix if needed." },
          { step: "Wait for cycle completion", detail: "Once complete, screen will show 'READY' or 'STANDBY'. Can take up to 4 hours." },
          { step: "If cycle is stuck (> 4 hours)", detail: "Full power off → wait 5 min → power on. Start manual cleaning cycle from menu." },
        ],
        escalate: "Si el ciclo no finaliza después de 6 horas o hay código de error en pantalla: llamar a soporte técnico Taylor y sacar de servicio.",
        escalateEn: "If cycle doesn't finish after 6 hours or there's an error code on screen: call Taylor technical support and remove from service.",
      },
      {
        id: "h2",
        symptom: "Helado sale líquido o con textura inadecuada",
        symptomEn: "Ice cream comes out liquid or with inadequate texture",
        severity: "medium",
        cause: "Temperatura de refrigeración insuficiente o mezcla incorrectamente diluida.",
        causeEn: "Insufficient refrigeration temperature or improperly diluted mix.",
        steps: [
          { step: "Verificar temperatura del cilindro de refrigeración", detail: "Target: -3°C a -5°C en el cilindro. Consultar panel de control." },
          { step: "Verificar concentración de la mezcla", detail: "La mezcla no debe diluirse con agua. Usar la mezcla líquida directamente del envase." },
          { step: "Verificar que la máquina está en modo 'AUTO' y no en 'MANUAL'", detail: "En modo manual, el compresor no actúa automáticamente." },
          { step: "Esperar 30 min para que el cilindro alcance temperatura", detail: "Si la máquina se encendió recientemente, necesita tiempo para enfriar el producto." },
        ],
        stepsEn: [
          { step: "Check refrigeration cylinder temperature", detail: "Target: -3°C to -5°C in cylinder. Check control panel." },
          { step: "Check mix concentration", detail: "Mix must not be diluted with water. Use liquid mix directly from container." },
          { step: "Check that machine is in 'AUTO' mode, not 'MANUAL'", detail: "In manual mode, the compressor does not operate automatically." },
          { step: "Wait 30 min for cylinder to reach temperature", detail: "If machine was recently turned on, it needs time to cool the product." },
        ],
        escalate: "Si la máquina no enfría después de 30 min en modo AUTO: escalar a mantenimiento. Problema de compresor.",
        escalateEn: "If machine doesn't cool after 30 min in AUTO mode: escalate to maintenance. Compressor issue.",
      },
    ],
  },
  {
    id: "mccafe-machine",
    nameEs: "Máquina de Café McCafé",
    nameEn: "McCafé Coffee Machine",
    emoji: "☕",
    model: "Jura Giga / Franke A800",
    ref: {
      overviewEs: "La máquina de espresso McCafé produce todas las bebidas calientes y frías de la línea McCafé: lattes, cappuccinos, mochas y americanos. Combina una unidad de molienda (grinder), bomba de agua a alta presión y vaporizador de leche. La calidad constante del espresso depende directamente de la limpieza diaria y la calibración del grinder.",
      overviewEn: "The McCafé espresso machine produces all hot and cold beverages in the McCafé line: lattes, cappuccinos, mochas and americanos. It combines a grinder unit, high-pressure water pump and milk steamer. Consistent espresso quality directly depends on daily cleaning and grinder calibration.",
      specs: {
        titleEs: "Especificaciones de Bebidas",
        titleEn: "Beverage Specifications",
        items: [
          { labelEs: "Temperatura del espresso en taza", labelEn: "Espresso temperature in cup", valueEs: "88–93 °C / 190–200 °F", valueEn: "88–93 °C / 190–200 °F" },
          { labelEs: "Temperatura de leche texturizada", labelEn: "Steamed milk temperature", valueEs: "60–71 °C / 140–160 °F", valueEn: "60–71 °C / 140–160 °F" },
          { labelEs: "Presión de la bomba de agua", labelEn: "Water pump pressure", valueEs: "9 bares (estándar espresso)", valueEn: "9 bars (espresso standard)" },
          { labelEs: "Dosis de café por shot doble", labelEn: "Coffee dose per double shot", valueEs: "14–18 g (según calibración)", valueEn: "14–18 g (per calibration)" },
          { labelEs: "Tiempo de extracción del espresso", labelEn: "Espresso extraction time", valueEs: "25–30 segundos por shot doble", valueEn: "25–30 seconds per double shot" },
          { labelEs: "Temperatura de bebidas frías (Frappé/Smoothie)", labelEn: "Cold beverage temperature (Frappé/Smoothie)", valueEs: "Servir < 5 °C / 41 °F", valueEn: "Serve < 5 °C / 41 °F" },
        ],
      },
      dailyMaintenance: [
        { timeEs: "Al inicio del turno", timeEn: "At shift start", taskEs: "Purgar la sonda de vapor 3 veces hacia el balde de limpieza. Verificar el nivel del depósito de agua. Hacer 1 shot de espresso de prueba y descartar (para limpiar el portafiltro).", taskEn: "Purge the steam wand 3 times into the cleaning bucket. Check the water reservoir level. Make 1 test espresso shot and discard (to clean the portafilter)." },
        { timeEs: "Después de CADA bebida con leche", timeEn: "After EACH milk-based beverage", taskEs: "Limpiar inmediatamente la sonda de vapor con un paño húmedo estéril. La leche se coagula en segundos y bloquea la sonda.", taskEn: "Immediately clean the steam wand with a sterile damp cloth. Milk coagulates in seconds and blocks the wand." },
        { timeEs: "Cada 2 horas", timeEn: "Every 2 hours", taskEs: "Ejecutar el ciclo de limpieza de leche (milk clean) desde el menú de la máquina. Este ciclo desbloquea residuos del circuito de leche.", taskEn: "Run the milk cleaning cycle from the machine menu. This cycle unblocks residue from the milk circuit." },
        { timeEs: "Al cierre", timeEn: "At close", taskEs: "Ejecutar el ciclo de limpieza completo (Full Clean) usando la pastilla limpiadora aprobada. Retirar y lavar por separado: bandeja, recipientes de leche y depósito de agua.", taskEn: "Run the full cleaning cycle (Full Clean) using the approved cleaning tablet. Remove and wash separately: tray, milk containers and water reservoir." },
      ],
      preventiveMaintenance: {
        titleEs: "Mantenimiento Preventivo",
        titleEn: "Preventive Maintenance",
        items: [
          { labelEs: "Ciclo de descalcificación", labelEn: "Descaling cycle", valueEs: "Cada 2–3 semanas (según dureza del agua)", valueEn: "Every 2–3 weeks (per water hardness)" },
          { labelEs: "Calibración del grinder (dosis y molienda)", labelEn: "Grinder calibration (dose and grind)", valueEs: "Semanal o cuando el espresso cambia de sabor", valueEn: "Weekly or when espresso flavor changes" },
          { labelEs: "Reemplazo de filtros de agua", labelEn: "Water filter replacement", valueEs: "Mensual", valueEn: "Monthly" },
          { labelEs: "Servicio completo del grinder y bomba", labelEn: "Full grinder and pump service", valueEs: "Semestral por técnico Jura/Franke certificado", valueEn: "Semi-annual by certified Jura/Franke technician" },
        ],
      },
      safetyWarnings: [
        { es: "La sonda de vapor opera a > 120 °C — nunca tocarla durante el purgado o inmediatamente después.", en: "The steam wand operates at > 120 °C — never touch it during purging or immediately after." },
        { es: "No usar leche vencida o a temperatura ambiente en la máquina — contamina todo el circuito de leche.", en: "Do not use expired or room-temperature milk in the machine — it contaminates the entire milk circuit." },
        { es: "El agua del depósito debe reemplazarse diariamente — agua estancada favorece el crecimiento bacteriano.", en: "Reservoir water must be replaced daily — stagnant water promotes bacterial growth." },
      ],
    },
    issues: [
      {
        id: "mc1",
        symptom: "La máquina no produce vapor / leche no texturiza",
        symptomEn: "Machine does not produce steam / milk doesn't steam",
        severity: "medium",
        cause: "Sonda de vapor bloqueada por residuos de leche o cal.",
        causeEn: "Steam probe blocked by milk residue or limescale.",
        steps: [
          { step: "Purgar la sonda de vapor", detail: "Dirigir la sonda hacia el balde de limpieza → abrir vapor por 5 seg. Repetir 3 veces." },
          { step: "Limpiar la sonda de vapor manualmente", detail: "Con paño húmedo en agua caliente, limpiar la sonda inmediatamente después de cada uso." },
          { step: "Verificar nivel de agua de la máquina", detail: "Nivel bajo de agua impide la generación de vapor. Rellenar el depósito." },
          { step: "Ciclo de descalcificación", detail: "Si el problema es persistente → menú de mantenimiento → 'Descalcificación'. Usar tableta descalcificadora aprobada por McDonald's." },
        ],
        stepsEn: [
          { step: "Purge the steam probe", detail: "Direct probe toward cleaning bucket → open steam for 5 sec. Repeat 3 times." },
          { step: "Manually clean the steam probe", detail: "With cloth dampened in hot water, clean probe immediately after each use." },
          { step: "Check machine water level", detail: "Low water level prevents steam generation. Refill the reservoir." },
          { step: "Descaling cycle", detail: "If issue is persistent → maintenance menu → 'Descaling'. Use McDonald's-approved descaling tablet." },
        ],
        escalate: "Si la sonda está físicamente obstruida y la purga no la limpia: reemplazar la sonda. Contactar al distribuidor autorizado Jura/Franke.",
        escalateEn: "If probe is physically obstructed and purging doesn't clear it: replace probe. Contact authorized Jura/Franke distributor.",
      },
    ],
  },
  {
    id: "pos-kiosko",
    nameEs: "POS / Kioscos de Autoservicio",
    nameEn: "POS / Self-Service Kiosks",
    emoji: "🖥️",
    ref: {
      overviewEs: "El sistema POS (Point of Sale) y los kioscos de autoservicio son la interfaz entre el cliente y la cocina. Un kiosko operacional aumenta el ticket promedio un 30% por el efecto de upselling visual. La disponibilidad del sistema POS es crítica — un fallo durante el Rush puede detener completamente las ventas.",
      overviewEn: "The POS (Point of Sale) system and self-service kiosks are the interface between the customer and the kitchen. An operational kiosk increases the average ticket by 30% due to the visual upselling effect. POS system availability is critical — a failure during Rush can completely stop sales.",
      specs: {
        titleEs: "Componentes del Sistema",
        titleEn: "System Components",
        items: [
          { labelEs: "POS Principal (Mostrador)", labelEn: "Main POS (Counter)", valueEs: "Terminal táctil con impresora de tickets y cajón de dinero", valueEn: "Touch terminal with ticket printer and cash drawer" },
          { labelEs: "Kioscos de Autoservicio", labelEn: "Self-Service Kiosks", valueEs: "Pantallas de 32\" táctiles — hasta 4 por restaurante", valueEn: "32\" touch screens — up to 4 per restaurant" },
          { labelEs: "KVS (Kitchen Video System)", labelEn: "KVS (Kitchen Video System)", valueEs: "Monitor de cocina que recibe órdenes en tiempo real", valueEn: "Kitchen monitor that receives orders in real time" },
          { labelEs: "Conectividad requerida", labelEn: "Required connectivity", valueEs: "Red LAN interna + Internet para sincronización de menú", valueEn: "Internal LAN + Internet for menu synchronization" },
          { labelEs: "Respaldo en caso de fallo de red", labelEn: "Backup in case of network failure", valueEs: "Modo offline por 2 horas (menú en caché)", valueEn: "Offline mode for 2 hours (cached menu)" },
        ],
      },
      dailyMaintenance: [
        { timeEs: "Al inicio del turno", timeEn: "At shift start", taskEs: "Verificar que todos los kioscos muestren el menú actualizado. Revisar el nivel de papel de recibo en cada kiosko. Limpiar las pantallas con el paño de microfibra aprobado.", taskEn: "Verify all kiosks show the updated menu. Check receipt paper level in each kiosk. Clean screens with the approved microfiber cloth." },
        { timeEs: "Durante operación", timeEn: "During operation", taskEs: "Si un kiosko muestra error, intentar restart desde el panel trasero. Si no se recupera en 2 min, colocar cartel de 'No Disponible' y continuar con los otros kioscos.", taskEn: "If a kiosk shows an error, attempt restart from the back panel. If it doesn't recover in 2 min, place 'Not Available' sign and continue with other kiosks." },
        { timeEs: "Cada turno", timeEn: "Each shift", taskEs: "Verificar que el KVS de cocina esté recibiendo correctamente todas las órdenes. Un KVS rezagado puede causar duplicados o pérdida de órdenes.", taskEn: "Verify that the kitchen KVS is correctly receiving all orders. A lagged KVS can cause duplicates or lost orders." },
        { timeEs: "Al cierre", timeEn: "At close", taskEs: "Limpiar las pantallas de los kioscos con paño desinfectante aprobado. Verificar que los kioscos entren en modo de suspensión programada. Imprimir reporte Z del POS.", taskEn: "Clean kiosk screens with approved disinfectant cloth. Verify kiosks enter scheduled sleep mode. Print Z report from POS." },
      ],
      preventiveMaintenance: {
        titleEs: "Mantenimiento Preventivo",
        titleEn: "Preventive Maintenance",
        items: [
          { labelEs: "Actualización de software del menú", labelEn: "Menu software update", valueEs: "Automática vía red — verificar que se aplique", valueEn: "Automatic via network — verify it is applied" },
          { labelEs: "Limpieza interna de los kioscos (ventiladores)", labelEn: "Internal kiosk cleaning (fans)", valueEs: "Mensual por técnico IT autorizado", valueEn: "Monthly by authorized IT technician" },
          { labelEs: "Revisión de conexiones LAN y router", labelEn: "LAN connections and router review", valueEs: "Mensual", valueEn: "Monthly" },
          { labelEs: "Sustitución del papel de recibo", labelEn: "Receipt paper replacement", valueEs: "Cuando el indicador de papel bajo aparezca (no esperar a que se acabe)", valueEn: "When low paper indicator appears (don't wait until it runs out)" },
        ],
      },
      safetyWarnings: [
        { es: "NUNCA abrir el panel interior del kiosko o del POS sin autorización de IT — contiene componentes eléctricos de 110V.", en: "NEVER open the interior panel of the kiosk or POS without IT authorization — it contains 110V electrical components." },
        { es: "No usar limpiadores líquidos directamente en las pantallas — pueden dañar el touchscreen o causar cortocircuito.", en: "Do not use liquid cleaners directly on screens — they can damage the touchscreen or cause a short circuit." },
        { es: "Si el cajón de dinero del POS no abre manualmente, usar la llave de emergencia ubicada en la caja fuerte del GM — nunca forzarlo.", en: "If the POS cash drawer does not open manually, use the emergency key located in the GM's safe — never force it." },
      ],
    },
    issues: [
      {
        id: "pos1",
        symptom: "Kiosko muestra 'Fuera de Servicio' o pantalla negra",
        symptomEn: "Kiosk shows 'Out of Service' or black screen",
        severity: "medium",
        cause: "Reinicio de software, pérdida de conexión de red o rollo de recibo agotado.",
        causeEn: "Software restart, network connection loss, or receipt roll exhausted.",
        steps: [
          { step: "Verificar el rollo de papel recibo", detail: "Abrir el compartimiento lateral del papel. Si está vacío o al final → reemplazar con un rollo nuevo." },
          { step: "Verificar la conexión de red", detail: "En la parte posterior del kiosko → revisar que el cable ethernet esté conectado y el LED del puerto parpadee." },
          { step: "Reinicio forzado del kiosko", detail: "Presionar y sostener el botón de power en la parte posterior por 10 seg → soltar → esperar reinicio (2–3 min)." },
          { step: "Verificar en el panel de administración", detail: "En la POS del mostrador → Gestión de Kioscos → verificar status del kiosko específico." },
        ],
        stepsEn: [
          { step: "Check receipt paper roll", detail: "Open the paper compartment on the side. If empty or at end → replace with new roll." },
          { step: "Check network connection", detail: "At the back of the kiosk → check that ethernet cable is connected and port LED is blinking." },
          { step: "Forced kiosk restart", detail: "Press and hold power button at rear for 10 sec → release → wait for restart (2–3 min)." },
          { step: "Check admin panel", detail: "At counter POS → Kiosk Management → verify status of the specific kiosk." },
        ],
        escalate: "Si el reinicio no restaura el kiosko o hay mensaje de error de software: escalar a soporte de IT McDonald's. Nunca abrir el panel interno de hardware sin autorización.",
        escalateEn: "If restart doesn't restore kiosk or there is software error message: escalate to McDonald's IT support. Never open internal hardware panel without authorization.",
      },
    ],
  },
  {
    id: "walkin-freezer",
    nameEs: "Walk-In Freezer / Cuarto Frío",
    nameEn: "Walk-In Freezer / Cold Room",
    emoji: "❄️",
    ref: {
      overviewEs: "El Walk-In Freezer es la bodega de almacenamiento a temperatura negativa donde se guardan todas las proteínas congeladas, productos de panadería y otros insumos de larga duración. Un fallo de temperatura puede comprometer inventario valorado en miles de dólares y representar un riesgo de seguridad alimentaria crítico. El protocolo FIFO (First In, First Out) es obligatorio.",
      overviewEn: "The Walk-In Freezer is the negative-temperature storage room where all frozen proteins, bakery products and other long-life supplies are stored. A temperature failure can compromise inventory worth thousands of dollars and represent a critical food safety risk. The FIFO (First In, First Out) protocol is mandatory.",
      specs: {
        titleEs: "Especificaciones y Estándares",
        titleEn: "Specifications and Standards",
        items: [
          { labelEs: "Temperatura de operación objetivo", labelEn: "Target operating temperature", valueEs: "-18 °C / 0 °F", valueEn: "-18 °C / 0 °F" },
          { labelEs: "Rango aceptable", labelEn: "Acceptable range", valueEs: "-15 °C a -21 °C", valueEn: "-15 °C to -21 °C" },
          { labelEs: "Temperatura de alerta (acción requerida)", labelEn: "Alert temperature (action required)", valueEs: "> -12 °C / > 10 °F — escalar inmediatamente", valueEn: "> -12 °C / > 10 °F — escalate immediately" },
          { labelEs: "Distancia mínima de producto a paredes", labelEn: "Minimum product-to-wall distance", valueEs: "15 cm en todos los costados", valueEn: "15 cm on all sides" },
          { labelEs: "Distancia mínima de producto al suelo", labelEn: "Minimum product-to-floor distance", valueEs: "15 cm (tarima obligatoria)", valueEn: "15 cm (pallet required)" },
          { labelEs: "Protocolo de rotación de inventario", labelEn: "Inventory rotation protocol", valueEs: "FIFO — primera entrada, primera salida", valueEn: "FIFO — First In, First Out" },
        ],
      },
      dailyMaintenance: [
        { timeEs: "Al inicio de cada turno", timeEn: "At start of each shift", taskEs: "Registrar la temperatura del termómetro interno en la bitácora de control de temperatura. Si la temperatura no está entre -15 °C y -21 °C, escalar al GM inmediatamente.", taskEn: "Record internal thermometer temperature in the temperature control log. If temperature is not between -15 °C and -21 °C, escalate to GM immediately." },
        { timeEs: "Al recibir mercancía", timeEn: "When receiving merchandise", taskEs: "Verificar que la mercancía llegue congelada (temperatura < -12 °C al recibirla). Rechazar cualquier caja con signos de descongelación y recongelación (cristales de hielo grandes, producto húmedo). Aplicar FIFO: nuevo producto al fondo.", taskEn: "Verify that merchandise arrives frozen (temperature < -12 °C upon receipt). Reject any box with signs of thawing and refreezing (large ice crystals, wet product). Apply FIFO: new product to the back." },
        { timeEs: "Diariamente", timeEn: "Daily", taskEs: "Verificar que la puerta cierre correctamente y que el sello esté intacto. Verificar que no haya producto tirado en el piso. Limpiar derrames inmediatamente para prevenir formación de hielo en el piso.", taskEn: "Verify the door closes properly and the seal is intact. Verify no product is on the floor. Clean spills immediately to prevent ice formation on the floor." },
        { timeEs: "Semanalmente", timeEn: "Weekly", taskEs: "Revisar fecha de vencimiento de todos los productos. Descartar producto vencido. Reorganizar según FIFO. Limpiar los estantes con agua tibia (sin la máquina encendida).", taskEn: "Check expiration dates on all products. Discard expired product. Reorganize per FIFO. Clean shelves with warm water (with machine off)." },
      ],
      preventiveMaintenance: {
        titleEs: "Mantenimiento Preventivo",
        titleEn: "Preventive Maintenance",
        items: [
          { labelEs: "Inspección y reemplazo del sello de la puerta", labelEn: "Door seal inspection and replacement", valueEs: "Mensual — usar la prueba del papel", valueEn: "Monthly — use the paper test" },
          { labelEs: "Limpieza del condensador externo", labelEn: "External condenser cleaning", valueEs: "Mensual — remover polvo y obstrucciones", valueEn: "Monthly — remove dust and obstructions" },
          { labelEs: "Verificación del sistema de alarma de temperatura", labelEn: "Temperature alarm system verification", valueEs: "Mensual — simular fallo y verificar alerta", valueEn: "Monthly — simulate failure and verify alert" },
          { labelEs: "Servicio del compresor y sistema de refrigeración", labelEn: "Compressor and refrigeration system service", valueEs: "Semestral por técnico certificado", valueEn: "Semi-annual by certified technician" },
        ],
      },
      safetyWarnings: [
        { es: "NUNCA entrar al Walk-In Freezer sin decirle a alguien afuera — el mecanismo de apertura interior puede fallar. Siempre verificar que la palanca interior esté operativa antes de entrar solo.", en: "NEVER enter the Walk-In Freezer without telling someone outside — the interior opening mechanism can fail. Always verify the interior lever is operational before entering alone." },
        { es: "Si quedas atrapado: usar el botón de alarma o luz de emergencia interior para alertar al personal.", en: "If you get trapped: use the interior alarm button or emergency light to alert staff." },
        { es: "No ingresar al freezer con ropa mojada — el frío extremo en ropa húmeda puede causar hipotermia en minutos.", en: "Do not enter the freezer with wet clothing — extreme cold in wet clothing can cause hypothermia in minutes." },
        { es: "El piso del freezer puede estar resbaladizo por hielo — usar calzado antideslizante obligatoriamente.", en: "The freezer floor may be slippery due to ice — non-slip footwear is mandatory." },
      ],
    },
    issues: [
      {
        id: "wf1",
        symptom: "Temperatura del freezer > -15°C (target -18°C)",
        symptomEn: "Freezer temperature > -15°C (target -18°C)",
        severity: "critical",
        cause: "Sello de puerta dañado, compresor sobrecargado, o fallo de unidad condensadora.",
        causeEn: "Damaged door seal, overloaded compressor, or condenser unit failure.",
        steps: [
          { step: "Registrar temperatura actual con termómetro calibrado", detail: "Tomar lectura en 3 puntos: cerca de la puerta, centro, y fondo. Documentar con hora exacta en bitácora." },
          { step: "Verificar el sello de la puerta", detail: "Cerrar la puerta → pasar un papel entre la puerta y el marco en todo el perímetro. Si el papel sale fácilmente, el sello está comprometido." },
          { step: "Verificar que no hay bloqueo del aire", detail: "El producto no debe estar apilado contra las paredes o bloqueando los ventiladores internos. Dejar 15 cm mínimo de espacio en todos los costados." },
          { step: "Verificar si el compresor externo está funcionando", detail: "Ir al área exterior → verificar que el compresor (caja metálica) esté encendido y que el ventilador gire." },
          { step: "Evaluar viabilidad del inventario", detail: "Si la temperatura está entre -15°C y -12°C por < 2 horas: inventario probablemente seguro. > -12°C por > 2 horas: evaluar con GM si descartar." },
        ],
        stepsEn: [
          { step: "Record current temperature with calibrated thermometer", detail: "Read at 3 points: near door, center, back. Document with exact time in log." },
          { step: "Check door seal", detail: "Close door → pass paper between door and frame around entire perimeter. If paper slides out easily, seal is compromised." },
          { step: "Check for airflow blockage", detail: "Product must not be stacked against walls or blocking internal fans. Leave 15 cm minimum space on all sides." },
          { step: "Check if external compressor is running", detail: "Go to exterior area → verify compressor (metal box) is on and fan is spinning." },
          { step: "Evaluate inventory viability", detail: "If temp is between -15°C and -12°C for < 2 hours: inventory probably safe. > -12°C for > 2 hours: evaluate with GM whether to discard." },
        ],
        escalate: "SIEMPRE escalar al GM en turno cuando el freezer tiene temperatura > -12°C. Llamar a mantenimiento de urgencia inmediatamente. No esperar — el inventario y la seguridad alimentaria están en riesgo.",
        escalateEn: "ALWAYS escalate to shift GM when freezer is above -12°C. Call emergency maintenance immediately. Do not wait — inventory and food safety are at risk.",
      },
    ],
  },
];
