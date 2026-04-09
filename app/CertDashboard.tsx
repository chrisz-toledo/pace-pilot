"use client";

import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ModuleProgress {
  id: string;
  labelEs: string;
  labelEn: string;
  icon: string;
  category: "game" | "knowledge" | "compliance" | "leadership";
  storageKey: string;
  // how to compute completion 0–100 from stored value
  computePct: (raw: string | null) => number;
}

// ─── Module definitions ───────────────────────────────────────────────────────
const MODULES: ModuleProgress[] = [
  {
    id: "menu_game",
    labelEs: "Menú — Modo Juego",
    labelEn: "Menu Game",
    icon: "🎮",
    category: "game",
    storageKey: "pace_mastery",
    computePct: (raw) => {
      if (!raw) return 0;
      try {
        const data = JSON.parse(raw) as Record<string, { correct: number; total: number }>;
        const entries = Object.values(data);
        if (!entries.length) return 0;
        const total = entries.reduce((s, e) => s + e.total, 0);
        const correct = entries.reduce((s, e) => s + e.correct, 0);
        return total > 0 ? Math.round((correct / total) * 100) : 0;
      } catch { return 0; }
    },
  },
  {
    id: "handoff",
    labelEs: "Misiones de Handoff",
    labelEn: "Handoff Missions",
    icon: "🔄",
    category: "game",
    storageKey: "pace_handoff_mastery",
    computePct: (raw) => {
      if (!raw) return 0;
      try {
        const data = JSON.parse(raw) as Record<string, boolean>;
        const missions = ["open_morning", "morning_afternoon", "afternoon_closing"];
        const done = missions.filter((m) => data[m]).length;
        return Math.round((done / missions.length) * 100);
      } catch { return 0; }
    },
  },
  {
    id: "servsafe",
    labelEs: "ServSafe Food Safety",
    labelEn: "ServSafe Food Safety",
    icon: "🛡️",
    category: "compliance",
    storageKey: "pace_servsafe_done",
    computePct: (raw) => {
      if (!raw) return 0;
      try {
        const data = JSON.parse(raw) as Record<string, boolean>;
        const modules = ["big6", "temps", "fattom", "hygiene", "xcontam", "sanitize"];
        const done = modules.filter((m) => data[m]).length;
        return Math.round((done / modules.length) * 100);
      } catch { return 0; }
    },
  },
  {
    id: "crew",
    labelEs: "Evaluación 360° Equipo",
    labelEn: "360° Team Evaluation",
    icon: "📊",
    category: "leadership",
    storageKey: "pace_crew_roster",
    computePct: (raw) => {
      if (!raw) return 0;
      try {
        const roster = JSON.parse(raw) as Array<{ ratings?: Record<string, number> }>;
        if (!roster.length) return 0;
        const rated = roster.filter((m) => m.ratings && Object.keys(m.ratings).length > 0).length;
        return Math.round((rated / roster.length) * 100);
      } catch { return 0; }
    },
  },
];

// ─── Badge definitions ────────────────────────────────────────────────────────
interface Badge {
  id: string;
  icon: string;
  labelEs: string;
  labelEn: string;
  condition: (scores: Record<string, number>) => boolean;
  color: string;
}

const BADGES: Badge[] = [
  {
    id: "gold_standard",
    icon: "⭐",
    labelEs: "Gold Standard",
    labelEn: "Gold Standard",
    condition: (s) => (s.menu_game ?? 0) >= 80,
    color: "#FFBC0D",
  },
  {
    id: "servsafe_cert",
    icon: "🛡️",
    labelEs: "ServSafe Cert.",
    labelEn: "ServSafe Cert.",
    condition: (s) => (s.servsafe ?? 0) >= 100,
    color: "#22c55e",
  },
  {
    id: "handoff_master",
    icon: "🔄",
    labelEs: "Handoff Master",
    labelEn: "Handoff Master",
    condition: (s) => (s.handoff ?? 0) >= 100,
    color: "#3b82f6",
  },
  {
    id: "mit_ready",
    icon: "🏅",
    labelEs: "MiT Ready",
    labelEn: "MiT Ready",
    condition: (s) => {
      const vals = Object.values(s);
      return vals.length >= 3 && vals.filter((v) => v >= 70).length >= 3;
    },
    color: "#DA291C",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CertDashboard({ lang }: { lang: "es" | "en" }) {
  const isEs = lang === "es";
  const [scores, setScores] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const computed: Record<string, number> = {};
    for (const m of MODULES) {
      const raw = localStorage.getItem(m.storageKey);
      computed[m.id] = m.computePct(raw);
    }
    setScores(computed);
    setReady(true);
  }, []);

  const overall = MODULES.length
    ? Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / MODULES.length)
    : 0;

  const earnedBadges = BADGES.filter((b) => b.condition(scores));

  if (!ready) return null;

  return (
    <div className="flex flex-col gap-3 fade-in">
      {/* Overall progress card */}
      <div
        style={{
          background: "linear-gradient(135deg, #DA291C 0%, #9B1C14 100%)",
          borderRadius: 20,
          padding: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative arc */}
        <div style={{
          position: "absolute", right: -24, top: -24,
          width: 100, height: 100, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", right: 8, bottom: -32,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />

        <p style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
          {isEs ? "Progreso General MiT" : "Overall MiT Progress"}
        </p>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#FFBC0D", lineHeight: 1 }}>{overall}%</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
            {isEs ? "dominio promedio" : "avg mastery"}
          </span>
        </div>

        {/* Overall bar */}
        <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
          <div
            className="progress-bar"
            style={{
              height: "100%", borderRadius: 3,
              background: overall >= 80 ? "#FFBC0D" : overall >= 50 ? "#FFD45E" : "rgba(255,255,255,0.5)",
              width: `${overall}%`,
            }}
          />
        </div>
      </div>

      {/* Badges row */}
      {earnedBadges.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, paddingLeft: 2 }}>
            {isEs ? "Insignias obtenidas" : "Earned badges"}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {earnedBadges.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: `${b.color}22`,
                  border: `1px solid ${b.color}55`,
                  borderRadius: 20, padding: "5px 10px",
                }}
              >
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: b.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {isEs ? b.labelEs : b.labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module list */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, paddingLeft: 2 }}>
          {isEs ? "Módulos" : "Modules"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MODULES.map((m) => {
            const pct = scores[m.id] ?? 0;
            const barColor = pct >= 80 ? "#FFBC0D" : pct >= 50 ? "#f97316" : "#DA291C";
            return (
              <div
                key={m.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{m.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                      {isEs ? m.labelEs : m.labelEn}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: pct > 0 ? barColor : "rgba(255,255,255,0.2)" }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                  <div
                    className="progress-bar"
                    style={{ height: "100%", borderRadius: 2, background: barColor, width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
