"use client";

/**
 * StaffManager.tsx
 * Multi-perspective crew evaluation system.
 * GM builds shift rosters and rates employees. MI/MiT also rate independently.
 * Composite profiles reveal how each crew member performs from every perspective,
 * and contrast GM-observed vs. MI/MiT-observed performance.
 */

import { useState, useEffect } from "react";

// ─── Skill areas ──────────────────────────────────────────────────────────────

const SKILL_AREAS = [
  { id: "dt",       emoji: "🚗", es: "DT Cobros",      en: "DT Payments"    },
  { id: "grill",    emoji: "🥩", es: "Parrilla",        en: "Grill"          },
  { id: "assembly", emoji: "🍔", es: "Ensamble",        en: "Assembly"       },
  { id: "fc",       emoji: "🧾", es: "Mostrador FC",    en: "Front Counter"  },
  { id: "mccafe",   emoji: "☕", es: "McCafé",          en: "McCafé"         },
  { id: "lobby",    emoji: "🧹", es: "Lobby/Limpieza",  en: "Lobby/Cleaning" },
  { id: "safety",   emoji: "🛡️", es: "Food Safety",    en: "Food Safety"    },
  { id: "speed",    emoji: "⚡", es: "Velocidad Gral.", en: "Overall Speed"  },
] as const;

type SkillId = typeof SKILL_AREAS[number]["id"];
type RaterRole = "GM" | "MI" | "MiT";

// ─── Data types ───────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string;
  position: string; // Crew | MiT | MI
}

interface ShiftRoster {
  id: string;
  nameEs: string;
  nameEn: string;
  emoji: string;
  employeeIds: string[];
}

interface RatingEntry {
  id: string;
  employeeId: string;
  raterRole: RaterRole;
  ratings: Partial<Record<SkillId, number>>;
  timestamp: string;
}

// ─── Defaults & storage ───────────────────────────────────────────────────────

const DEFAULT_SHIFTS: ShiftRoster[] = [
  { id: "morning",   nameEs: "Turno Mañana", nameEn: "Morning Shift",   emoji: "🌅", employeeIds: [] },
  { id: "afternoon", nameEs: "Turno Tarde",  nameEn: "Afternoon Shift", emoji: "☀️", employeeIds: [] },
  { id: "closing",   nameEs: "Turno Cierre", nameEn: "Closing Shift",   emoji: "🌙", employeeIds: [] },
];

const EMPL_KEY    = "pace_staff_empl";
const SHIFTS_KEY  = "pace_staff_shifts";
const RATINGS_KEY = "pace_staff_ratings";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}
function persist(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ─── View types ───────────────────────────────────────────────────────────────

type View =
  | "menu"
  | "employees"
  | "add_employee"
  | "shifts"
  | "shift_detail"
  | "rate_who"
  | "rate_select"
  | "rate_form"
  | "profiles"
  | "profile_detail"
  | "aces";

// ─── Component ────────────────────────────────────────────────────────────────

export default function StaffManager({ lang, onClose }: { lang: "es" | "en"; onClose: () => void }) {
  const isEs = lang === "es";

  // ── Core state ───────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>("menu");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<ShiftRoster[]>(DEFAULT_SHIFTS);
  const [ratings, setRatings] = useState<RatingEntry[]>([]);

  // ── Employee form state ───────────────────────────────────────────────────────
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftPos, setDraftPos] = useState("Crew");

  // ── Shift state ──────────────────────────────────────────────────────────────
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);

  // ── Rating state ─────────────────────────────────────────────────────────────
  const [raterRole, setRaterRole] = useState<RaterRole>("MI");
  const [ratingEmpId, setRatingEmpId] = useState<string | null>(null);
  const [draftRatings, setDraftRatings] = useState<Partial<Record<SkillId, number>>>({});

  // ── Profile state ────────────────────────────────────────────────────────────
  const [profileEmpId, setProfileEmpId] = useState<string | null>(null);

  useEffect(() => {
    setEmployees(load(EMPL_KEY, []));
    setShifts(load(SHIFTS_KEY, DEFAULT_SHIFTS));
    setRatings(load(RATINGS_KEY, []));
  }, []);

  function saveEmpl(e: Employee[])     { persist(EMPL_KEY, e);    setEmployees(e); }
  function saveShifts(s: ShiftRoster[]){ persist(SHIFTS_KEY, s);  setShifts(s); }
  function saveRatings(r: RatingEntry[]){ persist(RATINGS_KEY, r); setRatings(r); }

  // ── Employee CRUD ─────────────────────────────────────────────────────────────
  function openAdd() {
    setEditingEmp(null); setDraftName(""); setDraftPos("Crew"); setView("add_employee");
  }
  function openEdit(emp: Employee) {
    setEditingEmp(emp); setDraftName(emp.name); setDraftPos(emp.position); setView("add_employee");
  }
  function saveEmp() {
    if (!draftName.trim()) return;
    if (editingEmp) {
      saveEmpl(employees.map((e) => e.id === editingEmp.id ? { ...e, name: draftName.trim(), position: draftPos } : e));
    } else {
      saveEmpl([...employees, { id: crypto.randomUUID(), name: draftName.trim(), position: draftPos }]);
    }
    setView("employees");
  }
  function deleteEmp(id: string) {
    saveEmpl(employees.filter((e) => e.id !== id));
    saveShifts(shifts.map((s) => ({ ...s, employeeIds: s.employeeIds.filter((eid) => eid !== id) })));
    saveRatings(ratings.filter((r) => r.employeeId !== id));
    setView("employees");
  }

  // ── Shift assignment ──────────────────────────────────────────────────────────
  function toggleInShift(shiftId: string, empId: string) {
    saveShifts(shifts.map((s) => {
      if (s.id !== shiftId) return s;
      return { ...s, employeeIds: s.employeeIds.includes(empId) ? s.employeeIds.filter((id) => id !== empId) : [...s.employeeIds, empId] };
    }));
  }

  // ── Rating ────────────────────────────────────────────────────────────────────
  function submitRating() {
    if (!ratingEmpId || !Object.keys(draftRatings).length) return;
    const entry: RatingEntry = {
      id: crypto.randomUUID(),
      employeeId: ratingEmpId,
      raterRole,
      ratings: { ...draftRatings },
      timestamp: new Date().toISOString(),
    };
    saveRatings([...ratings, entry]);
    setDraftRatings({});
    setRatingEmpId(null);
    setView("rate_select");
  }

  // ── Analytics ─────────────────────────────────────────────────────────────────
  function empRatings(empId: string) { return ratings.filter((r) => r.employeeId === empId); }

  function skillAvg(entries: RatingEntry[], skillId: SkillId): number | null {
    const vals = entries.map((e) => e.ratings[skillId]).filter((v): v is number => v !== undefined);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  function compositeAvg(entries: RatingEntry[]): number {
    const all = entries.flatMap((e) => Object.values(e.ratings).filter((v): v is number => v !== undefined));
    return all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;
  }

  function getAces() {
    const result = {} as Record<SkillId, { emp: Employee; avg: number } | null>;
    for (const skill of SKILL_AREAS) {
      let best: { emp: Employee; avg: number } | null = null;
      for (const emp of employees) {
        const avg = skillAvg(empRatings(emp.id), skill.id);
        if (avg !== null && (best === null || avg > best.avg)) best = { emp, avg };
      }
      result[skill.id] = best;
    }
    return result;
  }

  // ─── VIEWS ────────────────────────────────────────────────────────────────────

  // ── Add / Edit Employee ───────────────────────────────────────────────────────
  if (view === "add_employee") {
    return (
      <div className="flex flex-col h-full">
        <STopBar
          title={editingEmp ? (isEs ? "Editar Empleado" : "Edit Employee") : (isEs ? "Nuevo Empleado" : "New Employee")}
          onBack={() => setView("employees")} onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-8">
          <div>
            <Label>{isEs ? "Nombre" : "Name"}</Label>
            <input
              className="w-full bg-card rounded-xl px-4 py-3 text-sm text-cream placeholder-white/20 border border-white/10 focus:outline-none focus:border-gold/40"
              placeholder={isEs ? "Nombre del empleado..." : "Employee name..."}
              value={draftName} onChange={(e) => setDraftName(e.target.value)} maxLength={30}
            />
          </div>
          <div>
            <Label>{isEs ? "Posición" : "Position"}</Label>
            <div className="flex gap-2">
              {["Crew", "MiT", "MI"].map((p) => (
                <button key={p} onClick={() => setDraftPos(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${draftPos === p ? "bg-gold text-onyx" : "bg-card text-white/50"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button onClick={saveEmp} disabled={!draftName.trim()}
            className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx tracking-wide active:opacity-80 disabled:opacity-30">
            {isEs ? "Guardar" : "Save"}
          </button>
          {editingEmp && (
            <button onClick={() => deleteEmp(editingEmp.id)}
              className="rounded-2xl py-3 text-sm font-black text-red-400 border border-red-500/20 active:opacity-80">
              {isEs ? "Eliminar Empleado" : "Delete Employee"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Employee list ─────────────────────────────────────────────────────────────
  if (view === "employees") {
    return (
      <div className="flex flex-col h-full">
        <STopBar title={isEs ? "Empleados" : "Employees"} onBack={() => setView("menu")} onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 pb-8">
          {employees.length === 0 && (
            <Empty emoji="👤" text={isEs ? "Agrega el primer empleado." : "Add the first employee."} />
          )}
          {employees.map((emp) => {
            const rs = empRatings(emp.id);
            const avg = compositeAvg(rs);
            return (
              <button key={emp.id} onClick={() => openEdit(emp)}
                className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left">
                <Avatar name={emp.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-cream truncate">{emp.name}</p>
                    <Pill>{emp.position}</Pill>
                  </div>
                  {avg > 0 ? (
                    <p className="text-[10px] text-gold mt-0.5">
                      {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}
                      <span className="text-white/30 ml-1">{avg.toFixed(1)} · {rs.length} eval{rs.length !== 1 ? "s" : ""}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-white/25 mt-0.5">{isEs ? "Sin calificaciones aún" : "No ratings yet"}</p>
                  )}
                </div>
                <span className="text-white/30 text-lg shrink-0">›</span>
              </button>
            );
          })}
          <button onClick={openAdd}
            className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx tracking-wide active:opacity-80 mt-1">
            + {isEs ? "Agregar Empleado" : "Add Employee"}
          </button>
        </div>
      </div>
    );
  }

  // ── Shifts ────────────────────────────────────────────────────────────────────
  if (view === "shifts") {
    return (
      <div className="flex flex-col h-full">
        <STopBar title={isEs ? "Turnos" : "Shifts"} onBack={() => setView("menu")} onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-8">
          <p className="text-[11px] text-white/40 leading-relaxed px-1">
            {isEs ? "Asigna empleados a cada turno para armar el roster completo." : "Assign employees to each shift to build the complete roster."}
          </p>
          {employees.length === 0 && (
            <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 text-center">
              <p className="text-xs text-gold/80">{isEs ? "Primero agrega empleados en la sección Empleados." : "First add employees in the Employees section."}</p>
            </div>
          )}
          {shifts.map((shift) => (
            <button key={shift.id}
              onClick={() => { setActiveShiftId(shift.id); setView("shift_detail"); }}
              className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left">
              <span className="text-2xl shrink-0">{shift.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-cream">{isEs ? shift.nameEs : shift.nameEn}</p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  {shift.employeeIds.length === 0
                    ? (isEs ? "Sin empleados asignados" : "No employees assigned")
                    : `${shift.employeeIds.length} ${isEs ? "empleado(s)" : "employee(s)"}: ${shift.employeeIds.map((id) => employees.find((e) => e.id === id)?.name ?? "").filter(Boolean).join(", ")}`}
                </p>
              </div>
              <span className="text-white/30 text-lg shrink-0">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Shift detail ──────────────────────────────────────────────────────────────
  if (view === "shift_detail") {
    const shift = shifts.find((s) => s.id === activeShiftId);
    if (!shift) { setView("shifts"); return null; }
    return (
      <div className="flex flex-col h-full">
        <STopBar
          title={`${shift.emoji} ${isEs ? shift.nameEs : shift.nameEn}`}
          onBack={() => setView("shifts")} onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 pb-8">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1 mb-1">
            {isEs ? "Toca para agregar / quitar del turno" : "Tap to add / remove from shift"}
          </p>
          {employees.length === 0 && (
            <Empty emoji="👤" text={isEs ? "Agrega empleados primero." : "Add employees first."} />
          )}
          {employees.map((emp) => {
            const inShift = shift.employeeIds.includes(emp.id);
            return (
              <button key={emp.id} onClick={() => toggleInShift(shift.id, emp.id)}
                className={`rounded-2xl p-3 flex items-center gap-3 transition-all ${inShift ? "bg-emerald-950/30 border border-emerald-500/20" : "bg-card"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${inShift ? "bg-emerald-500 border-emerald-500" : "border-white/30"}`}>
                  {inShift && <span className="text-[10px] text-white font-black">✓</span>}
                </div>
                <Avatar name={emp.name} small />
                <div className="flex-1">
                  <p className="text-sm font-bold text-cream">{emp.name}</p>
                </div>
                <Pill>{emp.position}</Pill>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Rate: who are you? ────────────────────────────────────────────────────────
  if (view === "rate_who") {
    return (
      <div className="flex flex-col h-full">
        <STopBar title={isEs ? "¿Quién eres?" : "Who are you?"} onBack={() => setView("menu")} onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-8">
          <div className="bg-card rounded-2xl p-4 border border-gold/20">
            <p className="text-sm font-black text-gold mb-1">{isEs ? "Identifica tu rol" : "Identify your role"}</p>
            <p className="text-[11px] text-white/50 leading-relaxed">
              {isEs
                ? "Tu perspectiva como calificador es clave. El sistema contrasta cómo percibe el equipo cada empleado desde distintos roles."
                : "Your perspective as a rater is key. The system contrasts how the team perceives each employee from different roles."}
            </p>
          </div>
          {(["GM", "MI", "MiT"] as RaterRole[]).map((role) => (
            <button key={role}
              onClick={() => { setRaterRole(role); setView("rate_select"); }}
              className={`rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform ${raterRole === role ? "bg-gold/10 border border-gold/30" : "bg-card"}`}>
              <span className="text-3xl">{role === "GM" ? "🏆" : role === "MI" ? "🎯" : "📋"}</span>
              <div className="text-left">
                <p className="text-base font-black text-cream">{role}</p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  {role === "GM"
                    ? (isEs ? "General Manager — visión global del restaurante" : "General Manager — full restaurant oversight")
                    : role === "MI"
                    ? (isEs ? "Manager in Training — nivel avanzado" : "Manager in Training — advanced level")
                    : (isEs ? "MiT en formación — perspectiva de turno" : "MiT in training — shift perspective")}
                </p>
              </div>
              <span className="text-white/30 text-lg ml-auto shrink-0">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Rate: select employee ─────────────────────────────────────────────────────
  if (view === "rate_select") {
    return (
      <div className="flex flex-col h-full">
        <STopBar
          title={isEs ? `Calificar — como ${raterRole}` : `Rate — as ${raterRole}`}
          onBack={() => setView("rate_who")} onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 pb-8">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1 mb-1">
            {isEs ? "Selecciona al empleado a calificar" : "Select the employee to rate"}
          </p>
          {employees.length === 0 && (
            <Empty emoji="👤" text={isEs ? "Agrega empleados primero." : "Add employees first."} />
          )}
          {employees.map((emp) => {
            const myPreviousRatings = ratings.filter((r) => r.employeeId === emp.id && r.raterRole === raterRole);
            return (
              <button key={emp.id}
                onClick={() => { setRatingEmpId(emp.id); setDraftRatings({}); setView("rate_form"); }}
                className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left">
                <Avatar name={emp.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-cream truncate">{emp.name}</p>
                    <Pill>{emp.position}</Pill>
                  </div>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {myPreviousRatings.length > 0
                      ? (isEs ? `${myPreviousRatings.length} calificación(es) tuyas` : `${myPreviousRatings.length} rating(s) from you`)
                      : (isEs ? "Sin calificar por ti aún" : "Not rated by you yet")}
                  </p>
                </div>
                <span className="text-white/30 text-lg shrink-0">›</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Rate: form ────────────────────────────────────────────────────────────────
  if (view === "rate_form") {
    const ratingEmp = employees.find((e) => e.id === ratingEmpId);
    if (!ratingEmp) { setView("rate_select"); return null; }
    return (
      <div className="flex flex-col h-full">
        <STopBar
          title={`${ratingEmp.name} — ${raterRole}`}
          onBack={() => setView("rate_select")} onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-8">
          <div className="bg-card rounded-2xl p-3 border border-white/10">
            <p className="text-[10px] text-white/40 leading-relaxed">
              {isEs
                ? "Califica solo las áreas donde has podido observar a este empleado. Deja en blanco las que no has visto."
                : "Rate only areas where you've been able to observe this employee. Leave blank those you haven't seen."}
            </p>
          </div>
          {SKILL_AREAS.map((skill) => (
            <div key={skill.id} className="bg-card rounded-xl p-3 flex items-center gap-3">
              <span className="text-xl shrink-0">{skill.emoji}</span>
              <span className="flex-1 text-xs font-bold text-cream">{isEs ? skill.es : skill.en}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star}
                    onClick={() => setDraftRatings((prev) => ({ ...prev, [skill.id]: prev[skill.id] === star ? undefined : star }))}
                    className={`text-lg leading-none transition-opacity ${(draftRatings[skill.id] ?? 0) >= star ? "text-gold" : "text-white/20"}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={submitRating}
            disabled={Object.keys(draftRatings).length === 0}
            className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx tracking-wide active:opacity-80 disabled:opacity-30 mt-1">
            {isEs ? "Guardar Evaluación" : "Save Evaluation"}
          </button>
        </div>
      </div>
    );
  }

  // ── Profiles list ─────────────────────────────────────────────────────────────
  if (view === "profiles") {
    const rated = employees.filter((e) => empRatings(e.id).length > 0);
    const unrated = employees.filter((e) => empRatings(e.id).length === 0);
    return (
      <div className="flex flex-col h-full">
        <STopBar title={isEs ? "Perfiles" : "Profiles"} onBack={() => setView("menu")} onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 pb-8">
          {employees.length === 0 && <Empty emoji="📊" text={isEs ? "Sin empleados aún." : "No employees yet."} />}
          {rated.map((emp) => {
            const rs = empRatings(emp.id);
            const avg = compositeAvg(rs);
            const gmRs = rs.filter((r) => r.raterRole === "GM");
            const peerRs = rs.filter((r) => r.raterRole !== "GM");
            const gmAvg = compositeAvg(gmRs);
            const peerAvg = compositeAvg(peerRs);
            const hasBoth = gmRs.length > 0 && peerRs.length > 0;
            const delta = hasBoth ? peerAvg - gmAvg : 0;
            return (
              <button key={emp.id}
                onClick={() => { setProfileEmpId(emp.id); setView("profile_detail"); }}
                className="bg-card rounded-2xl p-4 text-left active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar name={emp.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-cream truncate">{emp.name}</p>
                      <Pill>{emp.position}</Pill>
                    </div>
                    <p className="text-[10px] text-gold mt-0.5">
                      {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}
                      <span className="text-white/30 ml-1">{avg.toFixed(1)} · {rs.length} eval{rs.length !== 1 ? "s" : ""}</span>
                    </p>
                  </div>
                  {hasBoth && (
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full shrink-0 ${
                      Math.abs(delta) < 0.3 ? "bg-white/10 text-white/50"
                      : delta > 0 ? "bg-amber-950/40 text-amber-400"
                      : "bg-blue-950/40 text-blue-400"
                    }`}>
                      {Math.abs(delta) < 0.3 ? (isEs ? "Consistente" : "Consistent")
                        : delta > 0 ? (isEs ? "↑ sin GM" : "↑ w/o GM")
                        : (isEs ? "↑ con GM" : "↑ w/ GM")}
                    </span>
                  )}
                </div>
                <div className="flex gap-4">
                  {gmRs.length > 0 && (
                    <span className="text-[9px] text-white/40">🏆 GM: <span className="text-gold">{gmAvg.toFixed(1)}★</span></span>
                  )}
                  {peerRs.length > 0 && (
                    <span className="text-[9px] text-white/40">{isEs ? "Pares" : "Peers"}: <span className="text-blue-400">{peerAvg.toFixed(1)}★</span></span>
                  )}
                </div>
              </button>
            );
          })}
          {unrated.length > 0 && (
            <>
              <p className="text-[10px] font-black text-white/25 uppercase tracking-widest px-1 pt-2">
                {isEs ? "Sin calificaciones" : "No ratings"}
              </p>
              {unrated.map((emp) => (
                <div key={emp.id} className="bg-card rounded-2xl p-3 flex items-center gap-3 opacity-40">
                  <Avatar name={emp.name} small />
                  <p className="text-sm font-bold text-cream">{emp.name}</p>
                  <Pill>{emp.position}</Pill>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Profile detail ────────────────────────────────────────────────────────────
  if (view === "profile_detail") {
    const emp = employees.find((e) => e.id === profileEmpId);
    if (!emp) { setView("profiles"); return null; }
    const rs = empRatings(emp.id);
    const gmRs = rs.filter((r) => r.raterRole === "GM");
    const peerRs = rs.filter((r) => r.raterRole !== "GM");
    const hasBoth = gmRs.length > 0 && peerRs.length > 0;
    const overallAvg = compositeAvg(rs);
    const gmOverall = compositeAvg(gmRs);
    const peerOverall = compositeAvg(peerRs);

    return (
      <div className="flex flex-col h-full">
        <STopBar title={emp.name} onBack={() => setView("profiles")} onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-8">
          {/* Summary card */}
          <div className="bg-card rounded-2xl p-4 border border-gold/20">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={emp.name} />
              <div>
                <p className="text-base font-black text-cream">{emp.name}</p>
                <Pill>{emp.position}</Pill>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-black text-gold">{overallAvg.toFixed(1)}★</p>
                <p className="text-[9px] text-white/30">{rs.length} {isEs ? "evaluaciones" : "evaluations"}</p>
              </div>
            </div>

            {/* Contrast row */}
            {hasBoth && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                <div className="text-center">
                  <p className="text-[9px] font-black text-white/40 uppercase mb-1">🏆 GM ({gmRs.length})</p>
                  <p className="text-lg font-black text-gold">{gmOverall.toFixed(1)}★</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-white/40 uppercase mb-1">MI/MiT ({peerRs.length})</p>
                  <p className="text-lg font-black text-blue-400">{peerOverall.toFixed(1)}★</p>
                </div>
                <div className="col-span-2 bg-white/5 rounded-xl p-2 text-center">
                  {Math.abs(peerOverall - gmOverall) < 0.3 ? (
                    <p className="text-[10px] text-emerald-400/80">
                      ✓ {isEs ? "Rendimiento consistente — trabaja igual con o sin el GM." : "Consistent performance — works the same with or without the GM."}
                    </p>
                  ) : peerOverall > gmOverall ? (
                    <p className="text-[10px] text-amber-400/80">
                      ↑ {isEs ? `Rinde +${(peerOverall - gmOverall).toFixed(1)}★ cuando el GM NO está. Puede ser más cómodo o autónomo sin supervisión.` : `Performs +${(peerOverall - gmOverall).toFixed(1)}★ when GM is NOT present. May be more comfortable or autonomous without supervision.`}
                    </p>
                  ) : (
                    <p className="text-[10px] text-blue-400/80">
                      ↑ {isEs ? `Rinde +${(gmOverall - peerOverall).toFixed(1)}★ cuando el GM está presente. Responde bien a la supervisión directa.` : `Performs +${(gmOverall - peerOverall).toFixed(1)}★ when GM is present. Responds well to direct supervision.`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Per-skill breakdown */}
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">
            {isEs ? "Desglose por Área" : "Breakdown by Area"}
          </p>
          {SKILL_AREAS.map((skill) => {
            const overall = skillAvg(rs, skill.id);
            const gm = skillAvg(gmRs, skill.id);
            const peer = skillAvg(peerRs, skill.id);
            if (overall === null) return null;
            return (
              <div key={skill.id} className="bg-card rounded-2xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{skill.emoji}</span>
                  <span className="flex-1 text-xs font-bold text-cream">{isEs ? skill.es : skill.en}</span>
                  <span className="text-sm font-black text-gold">{overall.toFixed(1)}★</span>
                </div>
                {/* Bar */}
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1.5">
                  <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${(overall / 5) * 100}%` }} />
                </div>
                {hasBoth && gm !== null && peer !== null && (
                  <div className="flex gap-3">
                    <span className="text-[9px] text-white/40">🏆 <span className="text-gold">{gm.toFixed(1)}★</span></span>
                    <span className="text-[9px] text-white/40">MI/MiT <span className="text-blue-400">{peer.toFixed(1)}★</span></span>
                    {Math.abs(peer - gm) >= 0.5 && (
                      <span className={`text-[9px] font-black ${peer > gm ? "text-amber-400" : "text-blue-400"}`}>
                        {peer > gm ? `↑${(peer - gm).toFixed(1)} sin GM` : `↑${(gm - peer).toFixed(1)} con GM`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {rs.length === 0 && (
            <Empty emoji="⭐" text={isEs ? "Sin evaluaciones aún para este empleado." : "No evaluations yet for this employee."} />
          )}

          <button
            onClick={() => { setRatingEmpId(emp.id); setDraftRatings({}); setView("rate_form"); }}
            className="bg-gold/10 border border-gold/20 rounded-2xl py-3 text-sm font-black text-gold active:opacity-80 mt-1">
            + {isEs ? "Agregar Evaluación" : "Add Evaluation"}
          </button>
        </div>
      </div>
    );
  }

  // ── Global Aces board ─────────────────────────────────────────────────────────
  if (view === "aces") {
    const aces = getAces();
    const hasAny = Object.values(aces).some((a) => a !== null);
    return (
      <div className="flex flex-col h-full">
        <STopBar title={isEs ? "Aces Global" : "Global Aces"} onBack={() => setView("menu")} onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 pb-8">
          <div className="bg-card rounded-2xl p-3 border border-gold/20 mb-1">
            <p className="text-[11px] text-white/50 leading-relaxed">
              {isEs
                ? "Mejor calificado por área, según el promedio compuesto de todas las evaluaciones (GM + MI + MiT combinadas)."
                : "Top-rated per area, based on the composite average of all evaluations (GM + MI + MiT combined)."}
            </p>
          </div>
          {!hasAny && <Empty emoji="♠️" text={isEs ? "Agrega evaluaciones para ver los Aces." : "Add evaluations to see the Aces."} />}
          {SKILL_AREAS.map((skill) => {
            const ace = aces[skill.id];
            return (
              <div key={skill.id} className={`rounded-2xl p-3 flex items-center gap-3 ${ace ? "bg-card" : "bg-card opacity-40"}`}>
                <span className="text-2xl shrink-0">{skill.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isEs ? skill.es : skill.en}</p>
                  {ace ? (
                    <p className="text-sm font-black text-cream mt-0.5">
                      {ace.emp.name}
                      <span className="text-gold ml-1.5">{"★".repeat(Math.round(ace.avg))}</span>
                      <span className="text-white/30 ml-1 text-[10px]">{ace.avg.toFixed(1)}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-white/25 mt-0.5 italic">{isEs ? "Sin datos" : "No data"}</p>
                  )}
                </div>
                {ace && (
                  <span className="text-[9px] font-black bg-gold/20 text-gold px-2 py-0.5 rounded-full shrink-0">ACE</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── MAIN MENU ────────────────────────────────────────────────────────────────

  const totalEvals = ratings.length;
  const ratedEmpl = new Set(ratings.map((r) => r.employeeId)).size;

  const menuItems = [
    {
      view: "employees" as View, emoji: "👤",
      labelEs: "Empleados", labelEn: "Employees",
      descEs: `Gestiona el roster completo. ${employees.length} empleado(s) registrado(s).`,
      descEn: `Manage the full roster. ${employees.length} employee(s) registered.`,
    },
    {
      view: "shifts" as View, emoji: "📅",
      labelEs: "Turnos", labelEn: "Shifts",
      descEs: "Asigna quién trabaja en cada turno: Mañana, Tarde, Cierre.",
      descEn: "Assign who works each shift: Morning, Afternoon, Closing.",
    },
    {
      view: "rate_who" as View, emoji: "⭐",
      labelEs: "Calificar Empleado", labelEn: "Rate Employee",
      descEs: "GM, MI o MiT califican a cualquier empleado por área (1–5★).",
      descEn: "GM, MI or MiT rate any employee by area (1–5★).",
    },
    {
      view: "profiles" as View, emoji: "📊",
      labelEs: "Perfiles & Contraste", labelEn: "Profiles & Contrast",
      descEs: `Ve el perfil compuesto + contraste GM vs. MI/MiT por empleado. ${ratedEmpl} con datos.`,
      descEn: `View composite profile + GM vs. MI/MiT contrast per employee. ${ratedEmpl} with data.`,
    },
    {
      view: "aces" as View, emoji: "♠️",
      labelEs: "Aces Global", labelEn: "Global Aces",
      descEs: "Quién es el mejor por área según todas las evaluaciones combinadas.",
      descEn: "Who's best per area based on all combined evaluations.",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <STopBar title={isEs ? "Gestión de Equipo" : "Staff Management"} onBack={null} onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-8">
        {/* Hero */}
        <div className="bg-card rounded-2xl p-4 border border-gold/20">
          <p className="text-[10px] font-black text-gold/60 uppercase tracking-widest mb-1">
            {isEs ? "Multi-perspectiva" : "Multi-perspective"}
          </p>
          <p className="text-xl font-black text-gold">
            {isEs ? "Evaluación 360° del Equipo" : "360° Team Evaluation"}
          </p>
          <p className="text-xs text-white/50 mt-2 leading-relaxed">
            {isEs
              ? "El GM organiza los turnos y califica al equipo. El MI y MiT también califican desde su perspectiva. El sistema revela cómo rinde cada empleado desde múltiples puntos de vista — incluyendo cómo trabaja cuando el GM está o no está presente."
              : "The GM organizes shifts and rates the team. The MI and MiT also rate from their perspective. The system reveals how each employee performs from multiple viewpoints — including how they work when the GM is or isn't present."}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { n: String(employees.length), label: isEs ? "Empleados" : "Employees" },
            { n: String(totalEvals), label: isEs ? "Evaluaciones" : "Evaluations" },
            { n: String(ratedEmpl), label: isEs ? "Con perfil" : "Profiled" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl p-3 text-center">
              <p className="text-xl font-black text-gold">{s.n || "—"}</p>
              <p className="text-[9px] font-bold text-white/40 uppercase leading-tight mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Module cards */}
        <div className="flex flex-col gap-2">
          {menuItems.map((m) => (
            <button key={m.view} onClick={() => setView(m.view)}
              className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left">
              <span className="text-3xl leading-none shrink-0">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-cream">{isEs ? m.labelEs : m.labelEn}</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-snug">{isEs ? m.descEs : m.descEn}</p>
              </div>
              <span className="text-white/30 text-lg shrink-0">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared micro-components ──────────────────────────────────────────────────

function STopBar({ title, onBack, onClose }: { title: string; onBack: (() => void) | null; onClose: () => void }) {
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

function Avatar({ name, small }: { name: string; small?: boolean }) {
  return (
    <div className={`rounded-full bg-white/10 flex items-center justify-center font-black text-white/70 shrink-0 ${small ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-black bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full shrink-0">{children}</span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5 px-1">{children}</p>;
}

function Empty({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/30">
      <span className="text-5xl">{emoji}</span>
      <p className="text-sm font-bold text-center">{text}</p>
    </div>
  );
}
