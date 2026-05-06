// ─── Required CSV columns ────────────────────────────────────────────────────
export const REQUIRED_FIELDS = [
  "lead_id",
  "lead_name",
  "source",
  "timestamp",
  "form_completion_time_sec",
  "state",
  "pincode",
  "phone_number",
  "carrier_acceptance_status",
];

// Fields used only in the lead search table (displayed as-is)
export const SEARCH_FIELDS = [
  "lead_id",
  "lead_name",
  "form_completion_time_sec",
  "state",
  "pincode",
  "phone_number",
  "carrier_acceptance_status",
];

// ─── Colour palette (cycled per source) ──────────────────────────────────────
export const PALETTE = [
  "#2563eb", "#16a34a", "#dc2626", "#7c3aed",
  "#d97706", "#0891b2", "#db2777", "#65a30d",
  "#ea580c", "#0d9488",
];

// ─── Verdict config ───────────────────────────────────────────────────────────
export const VERDICTS = {
  scale: { label: "Scale ↑", bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  grow:  { label: "Grow →",  bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
  watch: { label: "Watch ⚠", bg: "#fef3c7", text: "#b45309", border: "#fcd34d" },
  cut:   { label: "Cut ✕",   bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
};

// ─── Default cutoff thresholds ────────────────────────────────────────────────
export const DEFAULT_CUTOFFS = {
  scaleMin: 55,   // acceptance rate >= this → scale
  growMin: 40,    // acceptance rate >= this → grow (if not scale)
  trendCutoff: 0, // trend >= this → positive momentum
};
