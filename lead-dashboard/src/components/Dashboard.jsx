import { useState } from "react";
import { DashboardProvider, useDashboard } from "../context/DashboardContext";
import KpiBar        from "./KpiBar";
import SourceCards   from "./SourceCards";
import ChartsPanel   from "./ChartsPanel";
import LeadSearchTable from "./LeadSearchTable";
import InsightStrip  from "./InsightStrip";
import CutoffPanel   from "./CutoffPanel";

function DashboardContent() {
  const { filename, onReset, cutoffs } = useDashboard();
  const [selected, setSelected]       = useState(null);
  const [showCutoff, setShowCutoff]   = useState(false);
  const [activeSection, setActiveSection] = useState("overview"); // "overview" | "search"

  return (
    <div style={s.root}>
      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <div style={s.titleRow}>
            <div style={s.logoMark}>
              <svg width="28" height="28" viewBox="0 0 40 40">
                <rect width="40" height="40" rx="8" fill="#0f172a" />
                <rect x="8"  y="22" width="5" height="10" rx="1.5" fill="#2563eb" />
                <rect x="16" y="16" width="5" height="16" rx="1.5" fill="#7c3aed" />
                <rect x="24" y="10" width="5" height="22" rx="1.5" fill="#16a34a" />
              </svg>
            </div>
            <h1 style={s.title}>Lead Source Intelligence</h1>
            <span style={s.liveBadge}>LIVE</span>
          </div>
          <p style={s.subtitle}>{filename} · click a source card to filter charts</p>
        </div>

        <div style={s.headerBtns}>
          {/* Cutoff indicator */}
          <div style={s.cutoffIndicator} onClick={() => setShowCutoff(true)}>
            <span style={s.cutoffDot} />
            Scale ≥{cutoffs.scaleMin}% · Grow ≥{cutoffs.growMin}% · Trend ≥{cutoffs.trendCutoff}pp
          </div>
          <button style={s.settingsBtn} onClick={() => setShowCutoff(true)}>⚙️ Cutoffs</button>
          <button style={s.resetBtn}    onClick={onReset}>↩ New file</button>
        </div>
      </div>

      {/* ── Section toggle ── */}
      <div style={s.sectionTabs}>
        {[
          { id: "overview", label: "📊 Dashboard" },
          { id: "search",   label: "🔍 Lead Search" },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveSection(t.id)} style={{
            ...s.sectionTab,
            background: activeSection === t.id ? "#0f172a" : "#fff",
            color:      activeSection === t.id ? "#fff"    : "#64748b",
            border:     activeSection === t.id ? "1.5px solid #0f172a" : "1px solid #e5e7eb",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeSection === "overview" && (
        <>
          <KpiBar />
          <SourceCards selected={selected} onSelect={setSelected} />
          <ChartsPanel selected={selected} onSelect={setSelected} />
          <InsightStrip />
        </>
      )}

      {/* ── Lead Search ── */}
      {activeSection === "search" && <LeadSearchSection />}

      {/* ── Cutoff panel ── */}
      {showCutoff && <CutoffPanel onClose={() => setShowCutoff(false)} />}
    </div>
  );
}

function LeadSearchSection() {
  const { rows } = useDashboard();
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Lead Search</div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 18 }}>
        Search across lead ID, name, form time, state, pincode, phone, and acceptance status.
      </div>
      <LeadSearchTable rows={rows} />
    </div>
  );
}

export default function Dashboard({ sourceMap, rows, filename, onReset }) {
  return (
    <DashboardProvider sourceMap={sourceMap} rows={rows} filename={filename} onReset={onReset}>
      <DashboardContent />
    </DashboardProvider>
  );
}

const s = {
  root: {
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
    padding: "24px 20px",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 20, flexWrap: "wrap", gap: 12,
  },
  titleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  logoMark: { display: "flex", alignItems: "center" },
  title: { fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.3px" },
  liveBadge: {
    fontSize: 10, fontWeight: 700, background: "#0f172a", color: "#fff",
    padding: "2px 10px", borderRadius: 20, letterSpacing: "0.08em",
  },
  subtitle: { fontSize: 12, color: "#64748b", margin: 0 },
  headerBtns: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  cutoffIndicator: {
    fontSize: 11, color: "#64748b", background: "#f1f5f9",
    border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px",
    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    transition: "background .15s",
  },
  cutoffDot: { width: 6, height: 6, borderRadius: "50%", background: "#2563eb", display: "inline-block" },
  settingsBtn: {
    fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8,
    border: "1px solid #e5e7eb", background: "#fff", color: "#374151",
    cursor: "pointer", transition: "all .15s",
  },
  resetBtn: {
    fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8,
    border: "1px solid #e5e7eb", background: "#fff", color: "#64748b", cursor: "pointer",
  },
  sectionTabs: { display: "flex", gap: 6, marginBottom: 20 },
  sectionTab: {
    fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 10,
    cursor: "pointer", transition: "all .15s",
  },
};
