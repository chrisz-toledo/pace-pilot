export type Station =
  | "DT_WINDOW"
  | "KITCHEN"
  | "LOBBY"
  | "FRONT_COUNTER"
  | "GRILL"
  | "UHC"
  | "BOC";

export type FrictionType =
  | "WAIT_TIME"
  | "STOCK_OUT"
  | "DISORDER"
  | "EQUIPMENT_FAILURE"
  | "PROCEDURE_DEVIATION";

export type UserRole =
  | "MIT_DIRECTOR"
  | "GM_FACILITY"
  | "AREA_SUPERVISOR"
  | "CREW_OPERATOR";

export type FiveSStep = "Seiri" | "Seiton" | "Seiso" | "Seiketsu" | "Shitsuke";
export type Urgency = "IMMEDIATE" | "NEXT_SHIFT" | "SCHEDULED";

export interface FiveSDiagnosis {
  failing_step: FiveSStep;
  rationale: string;
  recommended_action: string;
  urgency: Urgency;
  confidence: number;
}

export interface FrictionEvent {
  id: string;
  timestamp: string; // ISO string
  station: Station;
  event_type: FrictionType;
  description: string;
  severity: number; // 1–5
  reporter_role: UserRole;
  service_impact_minutes: number;
  resolved: boolean;
  five_s_diagnosis?: FiveSDiagnosis;
}

export interface BottleneckSummary {
  station: string;
  event_count: number;
  avg_severity: number;
  total_impact_minutes: number;
}

export interface PACEReport {
  generated_at: string;
  total_events: number;
  unresolved_events: number;
  peak_window: string;
  primary_5s_failure: FiveSStep;
  bottlenecks: BottleneckSummary[];
  five_s_breakdown: Record<FiveSStep, number>;
  dt_impact_minutes: number;
  fc_impact_minutes: number;
  recommendations: string[];
  executive_summary: string;
}
