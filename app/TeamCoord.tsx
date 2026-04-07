"use client";

/**
 * TeamCoord.tsx
 * Team coordination training module for McDonald's MI/MiT development.
 * Teaches shift handoff, peer coordination, communication protocols and role clarity.
 */

import { useState, useEffect } from "react";
import {
  HANDOFF_SECTIONS,
  TEAM_SCENARIOS,
  COMMUNICATION_PROTOCOLS,
  ROLES_MATRIX,
  type HandoffItem,
  type TeamScenario,
  type Protocol,
  type RoleCard,
} from "@/lib/team-data";

type View = "menu" | "handoff" | "scenarios" | "protocols" | "roles" | "roster";
type ScenarioPhase = "list" | "playing" | "result";
type RosterView = "list" | "add" | "edit" | "aces";

// ─── Roster types ─────────────────────────────────────────────────────────────

const SKILL_AREAS = [
  { id: "dt",       emoji: "🚗", es: "DT Cobros",       en: "DT Payments"     },
  { id: "grill",    emoji: "🥩", es: "Parrilla",         en: "Grill"           },
  { id: "assembly", emoji: "🍔", es: "Ensamble",         en: "Assembly"        },
  { id: "fc",       emoji: "🧾", es: "Mostrador FC",     en: "Front Counter"   },
  { id: "mccafe",   emoji: "☕", es: "McCafé",           en: "McCafé"          },
  { id: "lobby",    emoji: "🧹", es: "Lobby/Limpieza",   en: "Lobby/Cleaning"  },
  { id: "safety",   emoji: "🛡️", es: "Food Safety",     en: "Food Safety"     },
  { id: "speed",    emoji: "⚡", es: "Velocidad Gral.",  en: "Overall Speed"   },
] as const;

type SkillId = typeof SKILL_AREAS[number]["id"];

interface CrewMember {
  id: string;
  name: string;
  position: string; // e.g. "Crew", "MiT", "MI"
  ratings: Partial<Record<SkillId, number>>; // 1–5
}

const ROSTER_KEY = "pace_crew_roster";

function loadRoster(): CrewMember[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ROSTER_KEY) ?? "[]"); } catch { return []; }
}
function saveRoster(r: CrewMember[]) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(r));
}

interface TeamCoordProps {
  lang: "es" | "en";
  onClose: () => void;
}

export default function TeamCoord({ lang, onClose }: TeamCoordProps) {
  const isEs = lang === "es";
  const [view, setView] = useState<View>("menu");

  // ── Handoff state ───────────────────────────────────────────────────────────
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // ── Scenarios state ─────────────────────────────────────────────────────────
  const [scenPhase, setScenPhase] = useState<ScenarioPhase>("list");
  const [scenIdx, setScenIdx] = useState(0);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [scenResults, setScenResults] = useState<{ scenario: TeamScenario; chosen: number }[]>([]);

  // ── Protocols state ─────────────────────────────────────────────────────────
  const [expandedProto, setExpandedProto] = useState<string | null>(null);

  // ── Roles state ─────────────────────────────────────────────────────────────
  const [expandedRole, setExpandedRole] = useState<number | null>(null);

  // ── Roster state ─────────────────────────────────────────────────────────────
  const [roster, setRoster] = useState<CrewMember[]>([]);
  const [rosterView, setRosterView] = useState<RosterView>("list");
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftPosition, setDraftPosition] = useState("Crew");
  const [draftRatings, setDraftRatings] = useState<Partial<Record<SkillId, number>>>({});

  useEffect(() => { setRoster(loadRoster()); }, []);

  function saveAndSetRoster(r: CrewMember[]) {
    saveRoster(r);
    setRoster(r);
  }

  function openAdd() {
    setEditingMember(null);
    setDraftName("");
    setDraftPosition("Crew");
    setDraftRatings({});
    setRosterView("add");
  }

  function openEdit(member: CrewMember) {
    setEditingMember(member);
    setDraftName(member.name);
    setDraftPosition(member.position);
    setDraftRatings({ ...member.ratings });
    setRosterView("edit");
  }

  function saveDraft() {
    if (!draftName.trim()) return;
    if (editingMember) {
      const updated = roster.map((m) =>
        m.id === editingMember.id
          ? { ...m, name: draftName.trim(), position: draftPosition, ratings: draftRatings }
          : m
      );
      saveAndSetRoster(updated);
    } else {
      const newMember: CrewMember = {
        id: crypto.randomUUID(),
        name: draftName.trim(),
        position: draftPosition,
        ratings: draftRatings,
      };
      saveAndSetRoster([...roster, newMember]);
    }
    setRosterView("list");
  }

  function deleteMember(id: string) {
    saveAndSetRoster(roster.filter((m) => m.id !== id));
    setRosterView("list");
  }

  function avgRating(member: CrewMember): number {
    const vals = Object.values(member.ratings).filter((v) => v !== undefined) as number[];
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  // For each skill, find the member(s) with the highest rating
  function getAces(): Record<SkillId, CrewMember[]> {
    const result = {} as Record<SkillId, CrewMember[]>;
    for (const skill of SKILL_AREAS) {
      const rated = roster.filter((m) => (m.ratings[skill.id] ?? 0) >= 3);
      if (!rated.length) { result[skill.id] = []; continue; }
      const maxScore = Math.max(...rated.map((m) => m.ratings[skill.id] ?? 0));
      result[skill.id] = rated.filter((m) => m.ratings[skill.id] === maxScore);
    }
    return result;
  }

  // ─── Handoff helpers ────────────────────────────────────────────────────────
  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalHandoff = HANDOFF_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
  const criticalHandoff = HANDOFF_SECTIONS.reduce((s, sec) => s + sec.items.filter((i) => i.critical).length, 0);
  const checkedCritical = HANDOFF_SECTIONS.reduce(
    (s, sec) => s + sec.items.filter((i) => i.critical && checked.has(i.id)).length,
    0
  );

  // ─── Scenario helpers ───────────────────────────────────────────────────────
  const currentScen = TEAM_SCENARIOS[scenIdx];

  function chooseOption(idx: number) {
    if (chosenIdx !== null) return;
    setChosenIdx(idx);
    if (currentScen.options[idx].isCorrect) setCorrect((c) => c + 1);
    setScenResults((prev) => [...prev, { scenario: currentScen, chosen: idx }]);
  }

  function nextScenario() {
    if (scenIdx + 1 < TEAM_SCENARIOS.length) {
      setScenIdx(scenIdx + 1);
      setChosenIdx(null);
    } else {
      setScenPhase("result");
    }
  }

  function resetScenarios() {
    setScenPhase("list");
    setScenIdx(0);
    setChosenIdx(null);
    setCorrect(0);
    setScenResults([]);
  }

  // ─── Sub-views ───────────────────────────────────────────────────────────────

  if (view === "handoff") {
    return (
      <div className="flex flex-col h-full">
        <TopBar
          title={isEs ? "Checklist de Handoff" : "Handoff Checklist"}
          onBack={() => { setView("menu"); setChecked(new Set()); }}
          onClose={onClose}
        />

        {/* Progress bar */}
        <div className="px-3 py-2 bg-surface shrink-0">
          <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase mb-1">
            <span>{isEs ? "Críticos completados" : "Critical completed"}</span>
            <span className={checkedCritical === criticalHandoff ? "text-emerald-400" : "text-gold"}>
              {checkedCritical}/{criticalHandoff}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-300"
              style={{ width: `${(checked.size / totalHandoff) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-8">
          {HANDOFF_SECTIONS.map((section) => (
            <div key={section.id}>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5 px-1 pb-2">
                <span>{section.emoji}</span>
                <span>{isEs ? section.titleEs : section.titleEn}</span>
              </p>
              <div className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <HandoffRow
                    key={item.id}
                    item={item}
                    isEs={isEs}
                    checked={checked.has(item.id)}
                    onToggle={() => toggleCheck(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* All critical done message */}
          {checkedCritical === criticalHandoff && checkedCritical > 0 && (
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">✅</p>
              <p className="text-sm font-black text-emerald-400">
                {isEs ? "Todos los puntos críticos cubiertos" : "All critical items covered"}
              </p>
              <p className="text-[11px] text-white/40 mt-1">
                {isEs ? "El handoff está listo para entregarse." : "The handoff is ready to be handed over."}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "scenarios") {
    if (scenPhase === "list") {
      return (
        <div className="flex flex-col h-full">
          <TopBar
            title={isEs ? "Escenarios de Equipo" : "Team Scenarios"}
            onBack={() => setView("menu")}
            onClose={onClose}
          />
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-8">
            <div className="bg-card rounded-2xl p-4 border border-gold/20">
              <p className="text-gold font-black text-base mb-1">
                {isEs ? "5 Situaciones Reales de Coordinación" : "5 Real Coordination Situations"}
              </p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {isEs
                  ? "Cada escenario enseña una competencia clave de liderazgo de turno y trabajo en equipo. Aprende de las consecuencias de cada decisión."
                  : "Each scenario teaches a key shift leadership and teamwork competency. Learn from the consequences of each decision."}
              </p>
            </div>
            {TEAM_SCENARIOS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setScenIdx(i); setChosenIdx(null); setScenPhase("playing"); }}
                className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
              >
                <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-black text-sm shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-cream leading-tight">
                    {isEs ? s.titleEs : s.titleEn}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {s.rolesInvolved.join(" · ")}
                  </p>
                </div>
                <span className="text-white/30 text-lg shrink-0">›</span>
              </button>
            ))}

            <button
              onClick={() => { resetScenarios(); setScenPhase("playing"); }}
              className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx tracking-wide active:opacity-80"
            >
              {isEs ? "▶  Modo Secuencial — Los 5 Escenarios" : "▶  Sequential Mode — All 5 Scenarios"}
            </button>
          </div>
        </div>
      );
    }

    if (scenPhase === "playing") {
      const opts = currentScen.options;
      return (
        <div className="flex flex-col h-full">
          <TopBar
            title={`${isEs ? "Escenario" : "Scenario"} ${scenIdx + 1}/${TEAM_SCENARIOS.length}`}
            onBack={() => { setScenPhase("list"); setChosenIdx(null); }}
            onClose={onClose}
          />
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-8">
            {/* Scenario header */}
            <div className="bg-card rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] font-black text-gold/70 uppercase tracking-widest mb-1">
                {isEs ? currentScen.titleEs : currentScen.titleEn}
              </p>
              <p className="text-xs text-white/70 leading-relaxed">
                {isEs ? currentScen.contextEs : currentScen.contextEn}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {currentScen.rolesInvolved.map((r) => (
                  <span key={r} className="text-[9px] font-bold bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Options */}
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">
              {isEs ? "¿Cuál es tu decisión?" : "What is your decision?"}
            </p>
            {opts.map((opt, i) => {
              const chosen = chosenIdx === i;
              const revealed = chosenIdx !== null;
              const correct = opt.isCorrect;
              const bg = !revealed
                ? "bg-card active:scale-[0.98]"
                : chosen && correct
                ? "bg-emerald-950/40 border border-emerald-500/30"
                : chosen && !correct
                ? "bg-red-950/40 border border-red-500/30"
                : correct
                ? "bg-emerald-950/20 border border-emerald-500/20"
                : "bg-card opacity-50";

              return (
                <button
                  key={i}
                  onClick={() => chooseOption(i)}
                  className={`rounded-2xl p-4 text-left transition-all ${bg}`}
                >
                  <p className="text-xs text-cream leading-relaxed">
                    {isEs ? opt.text : opt.textEn}
                  </p>
                  {revealed && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className={`text-[10px] font-bold leading-relaxed ${correct ? "text-emerald-400" : "text-red-400"}`}>
                        {chosen ? (correct ? (isEs ? "✅ Decisión correcta" : "✅ Correct decision") : (isEs ? "❌ Decisión incorrecta" : "❌ Wrong decision")) : ""}
                      </p>
                      <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                        {isEs ? opt.consequence : opt.consequenceEn}
                      </p>
                      {opt.roleImpact && (
                        <span className="inline-block mt-2 text-[9px] font-black bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                          {opt.roleImpact}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Key Learning */}
            {chosenIdx !== null && (
              <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4">
                <p className="text-[10px] font-black text-gold/70 uppercase tracking-widest mb-1">
                  {isEs ? "Aprendizaje Clave" : "Key Learning"}
                </p>
                <p className="text-xs text-white/70 leading-relaxed">
                  {isEs ? currentScen.keyLearningEs : currentScen.keyLearningEn}
                </p>
              </div>
            )}

            {chosenIdx !== null && (
              <button
                onClick={nextScenario}
                className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx tracking-wide active:opacity-80 mt-1"
              >
                {scenIdx + 1 < TEAM_SCENARIOS.length
                  ? (isEs ? "Siguiente Escenario ›" : "Next Scenario ›")
                  : (isEs ? "Ver Resultados" : "See Results")}
              </button>
            )}
          </div>
        </div>
      );
    }

    // result phase
    const pct = Math.round((correct / TEAM_SCENARIOS.length) * 100);
    return (
      <div className="flex flex-col h-full">
        <TopBar
          title={isEs ? "Resultados del Equipo" : "Team Results"}
          onBack={() => { resetScenarios(); setView("menu"); }}
          onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-8">
          <div className="bg-card rounded-2xl p-5 text-center border border-gold/20">
            <p className="text-5xl font-black text-gold">{pct}%</p>
            <p className="text-sm font-black text-cream mt-1">
              {correct}/{TEAM_SCENARIOS.length} {isEs ? "correctas" : "correct"}
            </p>
            <p className="text-[11px] text-white/40 mt-2">
              {pct >= 80
                ? (isEs ? "Excelente coordinación — estás listo para liderar turnos complejos." : "Excellent coordination — you're ready to lead complex shifts.")
                : pct >= 60
                ? (isEs ? "Buen nivel — revisa los escenarios fallidos para consolidar tu liderazgo." : "Good level — review failed scenarios to consolidate your leadership.")
                : (isEs ? "Continúa practicando — la coordinación se entrena con repetición." : "Keep practicing — coordination is trained through repetition.")}
            </p>
          </div>

          {scenResults.map(({ scenario, chosen }, i) => {
            const opt = scenario.options[chosen];
            return (
              <div key={i} className={`rounded-2xl p-4 border ${opt.isCorrect ? "bg-emerald-950/20 border-emerald-500/20" : "bg-red-950/20 border-red-500/20"}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/50">
                  {opt.isCorrect ? "✅" : "❌"} {isEs ? scenario.titleEs : scenario.titleEn}
                </p>
                <p className="text-[11px] text-white/60 leading-snug">
                  {isEs ? scenario.keyLearningEs : scenario.keyLearningEn}
                </p>
              </div>
            );
          })}

          <button
            onClick={resetScenarios}
            className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx tracking-wide active:opacity-80"
          >
            {isEs ? "Volver a Intentar" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "protocols") {
    return (
      <div className="flex flex-col h-full">
        <TopBar
          title={isEs ? "Protocolos de Comunicación" : "Communication Protocols"}
          onBack={() => setView("menu")}
          onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-8">
          <p className="text-[11px] text-white/40 leading-relaxed px-1">
            {isEs
              ? "Los 4 protocolos que todo MI/MiT debe dominar para coordinar su equipo eficazmente."
              : "The 4 protocols every MI/MiT must master to coordinate their team effectively."}
          </p>
          {COMMUNICATION_PROTOCOLS.map((proto) => (
            <ProtocolCard
              key={proto.id}
              proto={proto}
              isEs={isEs}
              expanded={expandedProto === proto.id}
              onToggle={() => setExpandedProto(expandedProto === proto.id ? null : proto.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (view === "roles") {
    return (
      <div className="flex flex-col h-full">
        <TopBar
          title={isEs ? "Matriz de Roles" : "Roles Matrix"}
          onBack={() => setView("menu")}
          onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-8">
          <p className="text-[11px] text-white/40 leading-relaxed px-1">
            {isEs
              ? "Claridad de roles = menos conflicto + mejor coordinación. Cada rol tiene responsabilidades exclusivas."
              : "Role clarity = less conflict + better coordination. Each role has exclusive responsibilities."}
          </p>
          {ROLES_MATRIX.map((role, i) => (
            <RoleCardView
              key={role.role}
              role={role}
              isEs={isEs}
              expanded={expandedRole === i}
              onToggle={() => setExpandedRole(expandedRole === i ? null : i)}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Roster view ─────────────────────────────────────────────────────────────

  if (view === "roster") {
    const aces = getAces();

    // ── Add / Edit form ────────────────────────────────────────────────────────
    if (rosterView === "add" || rosterView === "edit") {
      return (
        <div className="flex flex-col h-full">
          <TopBar
            title={rosterView === "add"
              ? (isEs ? "Agregar Crew" : "Add Crew Member")
              : (isEs ? "Editar Perfil" : "Edit Profile")}
            onBack={() => setRosterView("list")}
            onClose={onClose}
          />
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-8">
            {/* Name */}
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5 px-1">
                {isEs ? "Nombre" : "Name"}
              </p>
              <input
                className="w-full bg-card rounded-xl px-4 py-3 text-sm text-cream placeholder-white/20 border border-white/10 focus:outline-none focus:border-gold/40"
                placeholder={isEs ? "Nombre del crew..." : "Crew name..."}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                maxLength={30}
              />
            </div>

            {/* Position */}
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5 px-1">
                {isEs ? "Posición" : "Position"}
              </p>
              <div className="flex gap-2 flex-wrap">
                {["Crew", "MiT", "MI"].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setDraftPosition(pos)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                      draftPosition === pos
                        ? "bg-gold text-onyx"
                        : "bg-card text-white/50"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Ratings */}
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 px-1">
                {isEs ? "Calificación por Área (1–5 ★)" : "Rating by Area (1–5 ★)"}
              </p>
              <div className="flex flex-col gap-2">
                {SKILL_AREAS.map((skill) => (
                  <div key={skill.id} className="bg-card rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl shrink-0">{skill.emoji}</span>
                    <span className="flex-1 text-xs font-bold text-cream">
                      {isEs ? skill.es : skill.en}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setDraftRatings((prev) => ({
                              ...prev,
                              [skill.id]: prev[skill.id] === star ? undefined : star,
                            }))
                          }
                          className={`text-lg leading-none transition-opacity ${
                            (draftRatings[skill.id] ?? 0) >= star
                              ? "text-gold"
                              : "text-white/20"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={saveDraft}
              disabled={!draftName.trim()}
              className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx tracking-wide active:opacity-80 disabled:opacity-30"
            >
              {isEs ? "Guardar" : "Save"}
            </button>

            {rosterView === "edit" && editingMember && (
              <button
                onClick={() => deleteMember(editingMember.id)}
                className="rounded-2xl py-3 text-sm font-black text-red-400 border border-red-500/20 active:opacity-80"
              >
                {isEs ? "Eliminar del Roster" : "Remove from Roster"}
              </button>
            )}
          </div>
        </div>
      );
    }

    // ── Aces board ─────────────────────────────────────────────────────────────
    if (rosterView === "aces") {
      return (
        <div className="flex flex-col h-full">
          <TopBar
            title={isEs ? "Tablero de Aces" : "Aces Board"}
            onBack={() => setRosterView("list")}
            onClose={onClose}
          />
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 pb-8">
            <p className="text-[11px] text-white/40 leading-relaxed px-1 mb-1">
              {isEs
                ? "Los mejores calificados por área. Úsalo para armar las posiciones del turno."
                : "Top-rated crew per area. Use this to build your shift positions board."}
            </p>
            {SKILL_AREAS.map((skill) => {
              const topCrew = aces[skill.id];
              return (
                <div key={skill.id} className="bg-card rounded-2xl p-3 flex items-center gap-3">
                  <span className="text-2xl shrink-0">{skill.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                      {isEs ? skill.es : skill.en}
                    </p>
                    {topCrew.length === 0 ? (
                      <p className="text-xs text-white/25 italic mt-0.5">
                        {isEs ? "Sin asignar" : "Unassigned"}
                      </p>
                    ) : (
                      <p className="text-sm font-black text-cream mt-0.5">
                        {topCrew.map((m) => m.name).join(" · ")}
                        <span className="text-gold ml-1.5">
                          {"★".repeat(topCrew[0].ratings[skill.id] ?? 0)}
                        </span>
                      </p>
                    )}
                  </div>
                  {topCrew.length > 0 && (
                    <span className="text-[9px] font-black bg-gold/20 text-gold px-2 py-0.5 rounded-full shrink-0">
                      ACE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── Roster list ────────────────────────────────────────────────────────────
    return (
      <div className="flex flex-col h-full">
        <TopBar
          title={isEs ? "Roster del Equipo" : "Team Roster"}
          onBack={() => setView("menu")}
          onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 pb-8">
          {roster.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/30">
              <span className="text-5xl">👥</span>
              <p className="text-sm font-bold text-center">
                {isEs ? "Agrega tu primer crew\npara comenzar." : "Add your first crew\nmember to start."}
              </p>
            </div>
          ) : (
            <>
              {/* Aces button */}
              <button
                onClick={() => setRosterView("aces")}
                className="bg-gold/10 border border-gold/20 rounded-2xl p-3 flex items-center gap-3 active:opacity-80"
              >
                <span className="text-2xl">♠️</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-black text-gold">
                    {isEs ? "Ver Tablero de Aces" : "View Aces Board"}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {isEs ? "Quién es mejor en qué área del restaurante" : "Who's best at which area of the restaurant"}
                  </p>
                </div>
                <span className="text-white/30 text-lg shrink-0">›</span>
              </button>

              {/* Crew list */}
              {roster.map((member) => {
                const avg = avgRating(member);
                const strengths = SKILL_AREAS.filter((s) => (member.ratings[s.id] ?? 0) >= 4);
                const weaknesses = SKILL_AREAS.filter((s) => {
                  const r = member.ratings[s.id];
                  return r !== undefined && r <= 2;
                });
                return (
                  <button
                    key={member.id}
                    onClick={() => openEdit(member)}
                    className="bg-card rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-white/70 shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-cream truncate">{member.name}</p>
                          <span className="text-[9px] font-black bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full shrink-0">
                            {member.position}
                          </span>
                        </div>
                        {avg > 0 && (
                          <p className="text-[10px] text-gold mt-0.5">
                            {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}
                            <span className="text-white/30 ml-1">{avg.toFixed(1)}</span>
                          </p>
                        )}
                      </div>
                      <span className="text-white/30 text-lg shrink-0">›</span>
                    </div>
                    {strengths.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {strengths.map((s) => (
                          <span key={s.id} className="text-[9px] font-bold bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded-full">
                            {s.emoji} {isEs ? s.es : s.en}
                          </span>
                        ))}
                        {weaknesses.map((s) => (
                          <span key={s.id} className="text-[9px] font-bold bg-red-950/30 text-red-400/70 px-1.5 py-0.5 rounded-full">
                            {s.emoji} {isEs ? s.es : s.en}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}

          <button
            onClick={openAdd}
            className="bg-gold rounded-2xl py-3 text-sm font-black text-onyx tracking-wide active:opacity-80 mt-1"
          >
            + {isEs ? "Agregar Crew al Roster" : "Add Crew to Roster"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Menu ───────────────────────────────────────────────────────────────
  const menuItems = [
    {
      view: "handoff" as View,
      emoji: "🔄",
      labelEs: "Handoff de Turno",
      labelEn: "Shift Handoff",
      descEs: "Checklist completo para un traspaso de turno perfecto — con puntos críticos marcados.",
      descEn: "Complete checklist for a perfect shift handover — with critical items marked.",
    },
    {
      view: "scenarios" as View,
      emoji: "🤝",
      labelEs: "Escenarios de Coordinación",
      labelEn: "Coordination Scenarios",
      descEs: "5 situaciones reales donde aprendes a tomar decisiones en equipo bajo presión.",
      descEn: "5 real situations where you learn to make team decisions under pressure.",
    },
    {
      view: "protocols" as View,
      emoji: "📡",
      labelEs: "Protocolos de Comunicación",
      labelEn: "Communication Protocols",
      descEs: "Aces in Places, L.A.S.T., Observation Post y Delegación Efectiva.",
      descEn: "Aces in Places, L.A.S.T., Observation Post and Effective Delegation.",
    },
    {
      view: "roles" as View,
      emoji: "🎯",
      labelEs: "Matriz de Roles",
      labelEn: "Roles Matrix",
      descEs: "Qué hace — y qué nunca hace — cada rol del equipo MI/MIT.",
      descEn: "What each MI/MIT team role does — and never does.",
    },
    {
      view: "roster" as View,
      emoji: "👥",
      labelEs: "Roster del Equipo",
      labelEn: "Team Roster",
      descEs: `Califica a tu crew por área y descubre quiénes son los Aces de tu turno.${roster.length > 0 ? ` · ${roster.length} crew` : ""}`,
      descEn: `Rate your crew by area and discover who your shift Aces are.${roster.length > 0 ? ` · ${roster.length} crew` : ""}`,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={isEs ? "Coordinación de Equipo" : "Team Coordination"}
        onBack={null}
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-8">
        {/* Hero */}
        <div className="bg-card rounded-2xl p-4 border border-gold/20">
          <p className="text-[10px] font-black text-gold/60 uppercase tracking-widest mb-1">
            {isEs ? "Trabajo en Equipo MI / MiT" : "MI / MiT Teamwork"}
          </p>
          <p className="text-xl font-black text-gold">
            {isEs ? "Coordinación & Liderazgo" : "Coordination & Leadership"}
          </p>
          <p className="text-xs text-white/50 mt-2 leading-relaxed">
            {isEs
              ? "Un turno exitoso depende de que cada MI y MiT sepa cómo coordinarse, comunicarse y apoyarse mutuamente. Aquí aprendes exactamente eso."
              : "A successful shift depends on every MI and MiT knowing how to coordinate, communicate and support each other. Here you learn exactly that."}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { n: "17", label: isEs ? "Handoff" : "Handoff" },
            { n: "5", label: isEs ? "Escenarios" : "Scenarios" },
            { n: "4", label: isEs ? "Protocolos" : "Protocols" },
            { n: "4", label: isEs ? "Roles" : "Roles" },
            { n: String(roster.length || "—"), label: isEs ? "Mi Crew" : "My Crew" },
          ].map((s) => (
            <div key={s.n} className="bg-card rounded-xl p-2 text-center">
              <p className="text-lg font-black text-gold">{s.n}</p>
              <p className="text-[8px] font-bold text-white/40 uppercase leading-tight mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Module cards */}
        <div className="flex flex-col gap-2">
          {menuItems.map((m) => (
            <button
              key={m.view}
              onClick={() => setView(m.view)}
              className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
            >
              <span className="text-3xl leading-none shrink-0">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-cream">{isEs ? m.labelEs : m.labelEn}</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-snug">{isEs ? m.descEs : m.descEn}</p>
              </div>
              <span className="text-white/30 text-lg shrink-0">›</span>
            </button>
          ))}
        </div>

        {/* Tip */}
        <div className="bg-white/5 rounded-2xl p-4">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
            {isEs ? "Consejo del Coach" : "Coach Tip"}
          </p>
          <p className="text-xs text-white/50 leading-relaxed italic">
            {isEs
              ? '"El equipo que se comunica bien en la calma, se coordina bien en la crisis. Practica los protocolos cuando no los necesitas para dominarlos cuando más importan."'
              : '"The team that communicates well in calm times, coordinates well in crisis. Practice the protocols when you don\'t need them to master them when they matter most."'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function TopBar({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack: (() => void) | null;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-white/10 shrink-0">
      {onBack && (
        <button onClick={onBack} className="text-white/60 text-xl leading-none active:opacity-60 shrink-0">
          ‹
        </button>
      )}
      <p className="flex-1 text-sm font-black text-cream truncate">{title}</p>
      <button onClick={onClose} className="text-white/40 text-xl leading-none active:opacity-60 shrink-0">
        ✕
      </button>
    </div>
  );
}

function HandoffRow({
  item,
  isEs,
  checked,
  onToggle,
}: {
  item: HandoffItem;
  isEs: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-2xl p-3 flex items-start gap-3 text-left transition-all ${
        checked ? "bg-emerald-950/30 border border-emerald-500/20" : "bg-card"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
          checked ? "bg-emerald-500 border-emerald-500" : "border-white/30"
        }`}
      >
        {checked && <span className="text-[10px] text-white font-black">✓</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] font-black bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full uppercase">
            {isEs ? item.area : item.areaEn}
          </span>
          {item.critical && (
            <span className="text-[9px] font-black bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full uppercase">
              {isEs ? "Crítico" : "Critical"}
            </span>
          )}
        </div>
        <p className={`text-xs leading-snug ${checked ? "text-white/50 line-through" : "text-cream"}`}>
          {isEs ? item.taskEs : item.taskEn}
        </p>
      </div>
    </button>
  );
}

function ProtocolCard({
  proto,
  isEs,
  expanded,
  onToggle,
}: {
  proto: Protocol;
  isEs: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left active:opacity-80"
      >
        <span className="text-2xl shrink-0">{proto.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-cream">{isEs ? proto.titleEs : proto.titleEn}</p>
          <p className="text-[10px] text-white/40 mt-0.5 leading-snug line-clamp-2">
            {isEs ? proto.summaryEs : proto.summaryEn}
          </p>
        </div>
        <span className={`text-white/30 text-lg shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}>›</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/10 pt-3">
          {/* Steps */}
          <div className="flex flex-col gap-2">
            {proto.steps.map((step, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[11px] font-black text-cream">{isEs ? step.labelEs : step.labelEn}</p>
                  <p className="text-[10px] text-white/40 leading-snug mt-0.5">{isEs ? step.descEs : step.descEn}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Example */}
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-[9px] font-black text-gold/60 uppercase tracking-widest mb-1">
              {isEs ? "Ejemplo" : "Example"}
            </p>
            <p className="text-[10px] text-white/60 leading-relaxed italic">
              {isEs ? proto.exampleEs : proto.exampleEn}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleCardView({
  role,
  isEs,
  expanded,
  onToggle,
}: {
  role: RoleCard;
  isEs: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left active:opacity-80"
      >
        <span className="text-2xl shrink-0">{role.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-cream">{role.role}</p>
          <p className="text-[10px] text-white/40 mt-0.5 leading-snug line-clamp-2">
            {isEs ? role.primaryEs : role.primaryEn}
          </p>
        </div>
        <span className={`text-white/30 text-lg shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}>›</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/10 pt-3">
          {/* Owns */}
          <div>
            <p className="text-[9px] font-black text-emerald-400/70 uppercase tracking-widest mb-1.5">
              {isEs ? "✅ Dueño de" : "✅ Owns"}
            </p>
            <div className="flex flex-col gap-1">
              {(isEs ? role.ownsEs : role.ownsEn).map((item, i) => (
                <p key={i} className="text-[10px] text-white/60 leading-snug">
                  · {item}
                </p>
              ))}
            </div>
          </div>
          {/* Never */}
          <div className="bg-red-950/20 border border-red-500/10 rounded-xl p-3">
            <p className="text-[9px] font-black text-red-400/70 uppercase tracking-widest mb-1.5">
              {isEs ? "🚫 Nunca hace" : "🚫 Never does"}
            </p>
            <div className="flex flex-col gap-1">
              {(isEs ? role.neverEs : role.neverEn).map((item, i) => (
                <p key={i} className="text-[10px] text-red-300/60 leading-snug">
                  · {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
