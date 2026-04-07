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

export interface EquipmentManual {
  id: string;
  nameEs: string;
  nameEn: string;
  emoji: string;
  model?: string;
  issues: EquipmentIssue[];
}

export const EQUIPMENT_MANUALS: EquipmentManual[] = [
  {
    id: "freidora",
    nameEs: "Freidora de Papas",
    nameEn: "French Fry Fryer",
    emoji: "🍟",
    model: "Henny Penny / Pitco Frialator",
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
